'use client';

import { FormEvent, useMemo, useState } from 'react';

type Role = 'system' | 'user' | 'assistant';

interface Message {
  role: Role;
  content: string;
}

interface ChatCompletionResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
}

const SYSTEM_MESSAGE: Message = {
  role: 'system',
  content: "You're a helpful chat bot. Answer short and concise in 150 tokens only.",
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([SYSTEM_MESSAGE]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const visibleMessages = useMemo(
    () => messages.filter((message) => message.role !== 'system'),
    [messages],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userInput.trim()) {
      return;
    }

    const trimmedInput = userInput.trim();
    const nextMessages: Message[] = [
      ...messages,
      { role: 'user', content: trimmedInput },
    ];

    setMessages(nextMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = (await response.json()) as ChatCompletionResponse;
      const assistantMessage = data?.choices?.[0]?.message?.content;

      if (assistantMessage) {
        setMessages((current) => [
          ...current,
          { role: 'assistant', content: assistantMessage },
        ]);
      } else {
        setMessages((current) => [
          ...current,
          {
            role: 'assistant',
            content: 'The model returned an empty response.',
          },
        ]);
      }
    } catch (error: unknown) {
      console.error('There was an error with the API request', error);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'There was an error with the API request. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const messageAlignment = (role: Role) =>
    role === 'user' ? 'justify-end text-right' : 'justify-start text-left';

  const messageBubbleStyles = (role: Role) =>
    role === 'user'
      ? 'bg-blue-500 text-white'
      : 'bg-white text-gray-800 border border-gray-200';

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold">ChatGPT Demo</h1>
          <p className="mt-2 text-gray-600">
            A minimal interface for experimenting with the OpenAI Chat Completions API.
          </p>
        </div>

        <section className="rounded-lg bg-white p-6 shadow">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="user-message" className="sr-only">
              Message
            </label>
            <input
              id="user-message"
              type="text"
              value={userInput}
              onChange={(event) => setUserInput(event.target.value)}
              placeholder="Type your message here..."
              className="flex-1 rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-75"
              disabled={isLoading}
            >
              {isLoading && (
                <svg
                  aria-hidden="true"
                  className="-ml-1 mr-2 h-4 w-4 animate-spin fill-blue-200 text-white"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              )}
              {isLoading ? 'Sending…' : 'Send'}
            </button>
          </form>

          <ul className="mt-6 flex flex-col gap-4">
            {visibleMessages.map((message, index) => (
              <li key={`${message.role}-${index}`} className={`flex ${messageAlignment(message.role)}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-sm shadow ${messageBubbleStyles(
                    message.role,
                  )}`}
                >
                  {message.role === 'user' && (
                    <span className="mr-1 font-semibold">You:</span>
                  )}
                  <span className="whitespace-pre-line break-words">{message.content}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
