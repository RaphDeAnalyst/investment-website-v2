// pages/_document.tsx (Create if it doesn't exist)
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress browser extension errors in development
              window.addEventListener('error', function(e) {
                if (e.message && (
                  e.message.includes('ethereum') || 
                  e.message.includes('chrome-extension') ||
                  e.message.includes('extension')
                )) {
                  e.preventDefault();
                  return false;
                }
              });
            `,
          }}
        />
      </body>
    </Html>
  )
}