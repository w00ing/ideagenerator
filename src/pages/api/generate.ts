import type { NextApiRequest } from 'next';
import { Ratelimit } from '@upstash/ratelimit';

import { locales } from '@/lib/locale';
import { OpenAIStream, PromptType, createOpenAIStreamPayload } from '@/lib/openAIStream';
import { redis } from '@/lib/redis';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing env var from OpenAI');
}

export const config = {
  runtime: 'edge',
};

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

export default async function handler(req: Request): Promise<Response> {
  // Rate Limiter Code
  // if (ratelimit) {
  //   const identifier = requestIp.getClientIp(req);
  //   const result = await ratelimit.limit(identifier!);
  //   res.setHeader('X-RateLimit-Limit', result.limit);
  //   res.setHeader('X-RateLimit-Remaining', result.remaining);

  //   if (!result.success) {
  //     res.status(429).json('Too many requests in 1 minute. Please try again in a few minutes.');
  //     return;
  //   }
  // }

  const { input, type, locale } = (await req.json()) as {
    input: string;
    type: PromptType;
    locale?: keyof typeof locales;
  };

  if (!input || !type) {
    return new Response('No input in the request', { status: 400 });
  }

  const payload = createOpenAIStreamPayload(input, type);

  const stream = await OpenAIStream(payload);
  return new Response(stream);
}
