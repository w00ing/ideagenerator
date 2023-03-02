import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { PromptType } from '@/lib/openAIStream';

export const useOpenAIStream = (): [
  string,
  boolean,
  (args: { input: string; type: PromptType }) => Promise<void>,
  boolean,
  () => void
] => {
  const [data, setData] = useState('');
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let controller: AbortController | null = null;

    return () => {
      if (controller !== null) {
        controller.abort();
      }
    };
  }, []);

  const generateStream = async ({ input, type }: { input: string; type: PromptType }) => {
    setGenerating(true);
    setData('');
    const body = { input, type };
    console.log('body', body);

    const controller = new AbortController();
    try {
      const res = await fetch(`/api/generate`, {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const stream = res.body;
      if (!stream) {
        return;
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunkValue = decoder.decode(value);
        setData((prevData) => prevData + chunkValue);
      }
      if (done) {
        setGenerating(false);
        setDone(true);
      }
    } catch (err) {
      setGenerating(false);
      setData('');
      console.error(err);
    } finally {
      controller.abort();
    }
  };

  const clearData = () => {
    setData('');
    setDone(false);
  };

  return [data, generating, generateStream, done, clearData];
};
