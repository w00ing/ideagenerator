import { Configuration, OpenAIApi } from 'openai';
import { match } from 'ts-pattern';

import { locales } from '@/lib/locale';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export type PromptType = 'idea' | 'XYZ' | 'xyz';

export const createPrompt = (input: string, type: PromptType | 'XYZ' | 'xyz', locale: keyof typeof locales = 'en') => {
  return match([type, locale])
    .with(['idea', 'en'], () => process.env.PROMPT_IDEA_EN + input + ' Idea: ')
    .with(['XYZ', 'en'], () => process.env.PROMPT_XYZ_EN + input + ' XYZ Hypothesis: ')
    .with(['xyz', 'en'], () => process.env.PROMPT_xyz_EN + input + ' XYZ Hypothesis: ')
    .with(['idea', 'ko'], () => process.env.PROMPT_IDEA_KO + input + ' 아이디어: ')
    .with(['XYZ', 'ko'], () => process.env.PROMPT_XYZ_KO + input + ' XYZ 가설: ')
    .with(['xyz', 'ko'], () => process.env.PROMPT_xyz_KO + input + ' XYZ 가설: ')
    .otherwise(() => '');
};

export const createCompletionRequest = (prompt: string, maxTokens: number = 512) =>
  openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    temperature: 0,
    max_tokens: maxTokens,
  });
