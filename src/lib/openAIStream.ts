// See: https://vercel.com/blog/gpt-3-app-next-js-vercel-edge-functions

import { ParsedEvent, ReconnectInterval, createParser } from 'eventsource-parser';
import { match } from 'ts-pattern';

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

function createOptions(type: PromptType): CompletionRequestOptions[keyof CompletionRequestOptions] {
  return {
    ...completionRequestOptions[type],
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
    max_tokens: 400,
    top_p: 0.6,
    frequency_penalty: 1.2,
    presence_penalty: 0.7,
  },

  XYZ: {
    temperature: 0.8,
    max_tokens: 200,
    top_p: 0.4,
    frequency_penalty: 1.3,
    presence_penalty: 0.7,
  },

  xyz: {
    temperature: 0.8,
    max_tokens: 90,
    top_p: 0.6,
    frequency_penalty: 1.3,
    presence_penalty: 0.7,
  },
};

const PROMPTS = {
  IDEA: `I'll give you a keyword. Generate an idea for an IT service with the keyword. Answer as if you were a highly-creative entrepreneur with lots of successful experience. First, create a highly creative name for the service. The service name could include word puns or something that would make people interested. Then describe the service. Keep the description concise, in 2-3 sentences. For example, if the keyword is 'scheduler', then the answer could be like this: 'ScheduleMe: A service that provides scheduling solutions for busy professionals. Customers can use the app to book meetings, appointments, and other events with ease. The app also offers reminders and notifications to ensure customers don't miss any important dates or deadlines. Additionally, it integrates with popular calendar apps so users can easily keep track of their schedule in one place.' Try to be diverse with the answer. Keyword: `,
  XYZ: `Create an XYZ hypothesis with the idea. An XYZ hypothesis has the following format: At least X percent of Y will Z. Here, Z should describe the customer action toward the service we are trying to ship. The service customers willing to purchase should be specific and actionable, so that we could start doing it right away. The hypothesis should focus on the problem the service could solve for potential customers. It should contain following points. 1: Target users and the propotion of it that will benefit from the service. 2: Single important benefit the customers will receive. 3: How much customers will be paying for the service, which we could use as a metric to verify our hypothesis. Avoid vague expressions, such as 'will report improved air quality'. Instead, use concrete numbers that we could use as measurements afterwards to examine the success of the service. Keep the percentage less than 40%. Keep the answer in one setence. For example, a good XYZ hypothesis is this: 'At least 10 percent of people living in cities with an air quality index of 100 or higher will purchase a portable pollution detector priced at $120.' Idea: `,
  xyz: `Narrow down given XYZ hypothesis. The scope of the hypothesis should become narrower in relation to region, population, and etc. Make sure to narrow down to specific location. For example, if an XYZ hypothesis is 'at least 10% of people in cities with an air quality index of over 100 will purchase a $120 air purifier,' a narrowed down hypothesis would be,'at least 10% of parents at Beijing Tote Academy will purchase an $80 portable pollution detector.' Keep percentage X the same, or lower. Y should become narrower. Z should become narrower. The service definition should become narrower in scope, which should be actionable right away. XYZ Hypothesis: `,
};

function createPrompt(input: string, type: PromptType) {
  return match(type)
    .with('idea', () => PROMPTS.IDEA + input + ' Idea: ')
    .with('XYZ', () => PROMPTS.XYZ + input + ' XYZ Hypothesis: ')
    .with('xyz', () => PROMPTS.xyz + input + ' XYZ Hypothesis: ')
    .otherwise(() => '');
}

export function createOpenAIStreamPayload(input: string, type: PromptType) {
  const prompt = createPrompt(input, type);
  const options = createOptions(type);
  return {
    model: 'text-davinci-003',
    prompt,
    stream: true,
    n: 1,
    ...options,
  };
}
