# Generative UI Form Builder

This is a Next.js App Router demo that turns a prompt into a validated form schema on the server and renders the result with React on the client.

## Prerequisites

- Node.js 20+
- An OpenAI API key

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `OPENAI_API_KEY` and `OPENAI_MODEL`.
3. Run `npm install`.
4. Run `npm run dev`.

## Notes

- The UI only renders supported field types from the shared schema contract.
- The server route lives at `/api/generate-form`.
- The model output is validated before the client renders it.
