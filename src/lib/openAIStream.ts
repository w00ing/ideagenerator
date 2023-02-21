// See: https://vercel.com/blog/gpt-3-app-next-js-vercel-edge-functions

import { ParsedEvent, ReconnectInterval, createParser } from 'eventsource-parser';
import { match } from 'ts-pattern';

import { Locale } from '@/lib/locale';

export interface OpenAIStreamPayload {
  model: string;
  prompt: string;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

export async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch('https://api.openai.com/v1/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const stream = new ReadableStream({
    async start(controller) {
      // callback
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === 'event') {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === '[DONE]') {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].text;
            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            // maybe parse error
            controller.error(e);
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}

export type PromptType = 'idea' | 'XYZ' | 'xyz';

function createOptions(
  type: PromptType,
  locale: Locale = 'en'
): CompletionRequestOptions[keyof CompletionRequestOptions] {
  return {
    ...completionRequestOptions[type],
    // max_tokens:
    //   locale === 'en' ? completionRequestOptions[type].max_tokens : completionRequestOptions[type].max_tokens * 2.5,
    max_tokens: 250,
  };
}
type CompletionRequestOptions = {
  [key in PromptType]: Pick<
    OpenAIStreamPayload,
    'temperature' | 'top_p' | 'max_tokens' | 'frequency_penalty' | 'presence_penalty'
  >;
};
const completionRequestOptions: CompletionRequestOptions = {
  idea: {
    temperature: 0.9,
    max_tokens: 100,
    top_p: 0.6,
    frequency_penalty: 1.2,
    presence_penalty: 0.7,
  },

  XYZ: {
    temperature: 0.6,
    max_tokens: 80,
    top_p: 0.4,
    frequency_penalty: 1.3,
    presence_penalty: 0.7,
  },

  xyz: {
    temperature: 0.2,
    max_tokens: 90,
    top_p: 0.6,
    frequency_penalty: 1.3,
    presence_penalty: 0.7,
  },
};

function createPrompt(input: string, type: PromptType, locale: Locale = 'en') {
  return match([type, locale])
    .with(['idea', 'en'], () => process.env.PROMPT_IDEA_EN + input + ' Idea: ')
    .with(['XYZ', 'en'], () => process.env.PROMPT_XYZ_EN + input + ' XYZ Hypothesis: ')
    .with(['xyz', 'en'], () => process.env.PROMPT_xyz_EN + input + ' XYZ Hypothesis: ')
    .with(['idea', 'ko'], () => process.env.PROMPT_IDEA_KO + input + ' 아이디어: ')
    .with(['XYZ', 'ko'], () => process.env.PROMPT_XYZ_KO + input + ' XYZ 가설: ')
    .with(['xyz', 'ko'], () => process.env.PROMPT_xyz_KO + input + ' XYZ 가설: ')
    .otherwise(() => '');
}

export function createOpenAIStreamPayload(input: string, type: PromptType, locale: Locale = 'en') {
  const prompt = createPrompt(input, type, locale);
  const options = createOptions(type, locale);
  return {
    model: 'text-davinci-003',
    prompt,
    stream: true,
    n: 1,
    ...options,
  };
}
