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
        content: `You will receive text extracted from a PDF.
Take the personality of the character that would be the most fiting to be an expert
on the material of the text. (e.g. if you get a text about chemistry, your personality
should be that of a chemistry teacher.)
Answer to the questions based on it.`
      },
      ...messages,
    ],
    stream: true,
    temperature: 1,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}