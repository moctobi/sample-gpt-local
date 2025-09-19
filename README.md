# ChatGPT Demo (Next.js)

This project is a lightweight chat interface that mimics the original single-file demo, but is now implemented with [Next.js 14](https://nextjs.org/) and Tailwind CSS. The client talks to a Next.js API route, which then forwards the request to an OpenAI-compatible server (either the official OpenAI API or a local llama.cpp server).

## Prerequisites

- [Node.js](https://nodejs.org/) 18.17 or newer
- npm 9+ (ships with Node 18)
- An OpenAI API key or a locally hosted OpenAI-compatible API (for example `llama.cpp`)

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create a `.env.local` file in the project root and add the following variables:

   ```bash
   OPENAI_API_KEY=sk-****************************************
   # Optional overrides
   # OPENAI_ENDPOINT=https://api.openai.com/v1
   # OPENAI_MODEL=gpt-4-1106-preview
   ```

   - `OPENAI_API_KEY` (required): the key used by the API route when contacting the upstream service.
   - `OPENAI_ENDPOINT` (optional): point this to another OpenAI-compatible endpoint, such as `http://localhost:8000/v1` when using `llama.cpp`.
   - `OPENAI_MODEL` (optional): default model identifier to use when requesting completions.

3. **Start the development server**

   ```bash
   npm run dev
   ```

   Visit <http://localhost:3000> in your browser to access the chat interface.

## Using a Local llama.cpp Server

1. **Download a GGUF model** and place it inside a `models` directory (for example `mistral-7b-openorca.Q4_0.gguf`).
2. **Start the llama.cpp OpenAI server**:

   ```bash
   python3 -m llama_cpp.server \
     --model "./models/mistral-7b-openorca.Q4_0.gguf" \
     --chat_format chatml \
     --n_gpu_layers 1
   ```

   The server listens on port `8000` by default.

3. **Update `.env.local`** to point to the local endpoint:

   ```bash
   OPENAI_API_KEY=sk-local-placeholder
   OPENAI_ENDPOINT=http://localhost:8000/v1
   OPENAI_MODEL=gpt-3.5-turbo
   ```

   When using a local server that ignores the API key, you can set `OPENAI_API_KEY` to any placeholder value.

4. **Restart `npm run dev`** so the environment variables are reloaded.

## Production Build

To create an optimized production build and run it locally:

```bash
npm run build
npm start
```

## Project Structure

```
app/
  api/chat/route.js   # Next.js API route that forwards chat requests
  globals.css         # Tailwind styles and global CSS
  layout.tsx           # Root layout definition
  page.tsx             # Chat interface implemented with React hooks
```

- The client keeps the system prompt (`"You're a helpful chat bot..."`) just like the original single-file implementation.
- Messages from the system are filtered out before rendering, so only user and assistant messages appear in the UI.

## Notes

- The API route logs upstream errors to the server console for easier debugging.
- This project intentionally keeps the UI simple, making it easy to extend with streaming responses, conversation history persistence, or authentication later.
