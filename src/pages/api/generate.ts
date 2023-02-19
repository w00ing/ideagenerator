import type { NextApiRequest, NextApiResponse } from 'next';
import { Ratelimit } from '@upstash/ratelimit';

import { locales } from '@/lib/locale';
import { PromptType, createCompletionRequest, createPrompt } from '@/lib/openai';
import { redis } from '@/lib/redis';

type Data = string;
interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    input: string;
    type: PromptType;
    locale?: keyof typeof locales;
  };
}

// Create a new ratelimiter, that allows 3 requests per 60 seconds
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(3, '60 s'),
    })
  : undefined;

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse<Data>) {
  // Rate Limiter Code
  // if (ratelimit) {
  //   const identifier = requestIp.getClientIp(req);
  //   const result = await ratelimit.limit(identifier!);
  //   res.setHeader('X-RateLimit-Limit', result.limit);
  //   res.setHeader('X-RateLimit-Remaining', result.remaining);

  //   if (!result.success) {
  //     res.status(429).json('Too many uploads in 1 minute. Please try again in a few minutes.');
  //     return;
  //   }
  // }

  const { input, type, locale } = req.body;
  const prompt = createPrompt(input, type, locale);
  const completionResult = await createCompletionRequest(prompt);
  const resultText = completionResult?.data?.choices[0]?.text;

  res.status(200).json(resultText ?? 'Failed to restore image');
}
