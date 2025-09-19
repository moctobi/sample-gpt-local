import './globals.css';

export const metadata = {
  title: 'ChatGPT Demo',
  description: 'A minimal chat interface powered by the OpenAI Chat Completions API.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
