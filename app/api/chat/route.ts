import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

export async function POST(req: Request, res: Response) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: "mistralai/mixtral-8x7b-instruct-v0.1",
    messages,
    stream: true,
    max_tokens: 1024,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}