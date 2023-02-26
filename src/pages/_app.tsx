import { Toaster } from '@/components/ui/Toaster';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Toaster />
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
