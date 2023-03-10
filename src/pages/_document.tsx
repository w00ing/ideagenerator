import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Generate creative ideas from any keyword in seconds" />
        <meta property="og:site_name" content="ideagenerator-xyz.vercel.app/" />
        <meta property="og:description" content="Generate creative ideas from any keyword in seconds" />
        <meta property="og:title" content="Idea Generator" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Idea Generator" />
        <meta name="twitter:description" content="Generate creative ideas from any keyword in seconds" />
        <meta property="og:image" content="https://ideagenerator-xyz.vercel.app/og-image.png" />
        <meta name="twitter:image" content="https://ideagenerator-xyz.vercel.app/og-image.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
