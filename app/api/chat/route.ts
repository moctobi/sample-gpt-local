import { NextRequest } from 'next/server';

type Role = 'system' | 'user' | 'assistant';

type ChatMessage = {
  role: Role;
  content: string;
};

type ChatRequestBody = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4-1106-preview';
const DEFAULT_TEMPERATURE = 0.9;
const DEFAULT_MAX_TOKENS = 150;

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  const endpoint = process.env.OPENAI_ENDPOINT ?? 'https://api.openai.com/v1';

  if (!apiKey) {
    return Response.json(
      { error: 'Missing OPENAI_API_KEY environment variable.' },
      { status: 500 },
    );
  }

  let payload: ChatRequestBody;

  try {
    payload = (await request.json()) as ChatRequestBody;
  } catch (error) {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const {
    messages,
    model = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    maxTokens = DEFAULT_MAX_TOKENS,
  } = payload;

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: 'The request body must include an array of messages.' },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!upstreamResponse.ok) {
      const errorBody = await upstreamResponse.text();
      console.error('OpenAI API error:', upstreamResponse.status, errorBody);
      return Response.json(
        { error: 'Failed to retrieve a completion from the upstream service.' },
        { status: upstreamResponse.status },
      );
    }

    const completion = await upstreamResponse.json();
    return Response.json(completion);
  } catch (error) {
    console.error('Unexpected error while calling the OpenAI API', error);
    return Response.json(
      { error: 'An unexpected error occurred while contacting the model.' },
      { status: 500 },
    );
  }
}
