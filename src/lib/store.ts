import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

interface ChatMessageState {
  messages: ChatMessage[];
  removeAllMessages: () => void;
  appendMessage: (message: ChatMessage) => void;
  setLastMessage: (messageText: string) => void;
}

export const SYSTEM_MESSAGE: ChatMessage = {
  role: 'system',
  content: `You are a highly-creative entrepreneur with lots of successful experience. I'll give you a keyword. Generate an idea for an IT service with the keyword. First, answer with a highly creative name for the service. The service name could include word puns or something that would make people interested. Then describe the service. Keep the description concise, in 2-3 sentences. For example, if the keyword is 'scheduler', then the answer could be like this: 'ScheduleMe: A service that provides scheduling solutions for busy professionals. Customers can use the app to book meetings, appointments, and other events with ease. The app also offers reminders and notifications to ensure customers don't miss any important dates or deadlines. Additionally, it integrates with popular calendar apps so users can easily keep track of their schedule in one place.' Try to be diverse with the answer.`,
};

const INITIAL_MESSAGES = [SYSTEM_MESSAGE];

export const useChatMessageStore = create<ChatMessageState>()(
  devtools(
    persist(
      immer((set) => ({
        messages: INITIAL_MESSAGES,
        appendMessage: (message: ChatMessage) =>
          set((state) => {
            state.messages.push(message);
          }),
        setLastMessage: (messageText: string) =>
          set((state) => {
            state.messages[state.messages.length - 1].content = messageText;
          }),
        removeAllMessages: () => set({ messages: [] }),
      })),
      {
        name: 'chat-message-store',
      }
    )
  )
);
