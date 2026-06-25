import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArchiPrompts — AI Render Prompt Builder for Architects',
  description:
    'Generate precise, zero-reprompting AI prompts for architectural 3D renderings. Works with ChatGPT/DALL·E, Midjourney, Stable Diffusion & Adobe Firefly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script src="https://js.paystack.co/v1/inline.js" async></script>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
