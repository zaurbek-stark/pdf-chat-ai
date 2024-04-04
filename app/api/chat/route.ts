import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request, res: Response) {
  const { apiKey, messages } = await req.json();

  const openai = new OpenAI({
    apiKey
  });
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
      {
        role: "system",
        content: `You will receive text extracted from a PDF. Answer to the questions based on it.`
      },
      ...messages,
    ],
    stream: true,
    temperature: 1,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}