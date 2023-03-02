import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { PromptType } from '@/lib/openAIStream';
import { ChatMessage, useChatMessageStore } from '@/lib/store';

export const useOpenAIStream = (): [
  string,
  boolean,
  (args: { input: string; type: PromptType }) => Promise<void>,
  boolean,
  () => void
] => {
  const [messageText, setMessageText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const messages = useChatMessageStore((state) => state.messages);
  const appendMessage = useChatMessageStore((state) => state.appendMessage);
  const setLastMessage = useChatMessageStore((state) => state.setLastMessage);
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
    setMessageText('');
    // const body = { input, type };
    const body: { messages: ChatMessage[] } = { messages: [...messages, { role: 'user', content: input }] };
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
        setMessageText((prevData) => prevData + chunkValue);
        setLastMessage;
      }
      if (done) {
        setGenerating(false);
        setDone(true);
        appendMessage({ role: 'assistant', content: messageText });
      }
    } catch (err) {
      setGenerating(false);
      setMessageText('');
      console.error(err);
    } finally {
      controller.abort();
    }
  };

  const clearData = () => {
    setMessageText('');
    setDone(false);
  };

  return [messageText, generating, generateStream, done, clearData];
};
