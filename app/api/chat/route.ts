import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createXai } from '@ai-sdk/xai';
import { getMessages, saveMessage } from '@/lib/db';

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!process.env.XAI_API_KEY) {
    return NextResponse.json({ error: 'XAI_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const { messages, projectId } = await req.json();

    const xai = createXai({ apiKey: process.env.XAI_API_KEY });

    let history: { role: string; content: string }[] = [];
    if (projectId) {
      try {
        const dbMsgs = await getMessages(Number(projectId));
        history = dbMsgs.map((m: any) => ({ role: m.role as string, content: m.content as string }));
      } catch (e) {
        console.warn('Could not load history', e);
      }
    }

    const allMessages = [...history, ...messages];

    const system = `You are a highly capable AI assistant focused on practical software development, idea refinement, and project execution.
You follow clear reasoning, write clean code when asked, and help turn ideas into concrete plans.
Be direct, accurate, and helpful. Prefer action over vague advice.`;

    const result = await streamText({
      model: xai('grok-beta'),
      system,
      messages: allMessages,
    });

    // Save user message
    if (projectId && messages?.length) {
      const last = messages[messages.length - 1];
      if (last?.role === 'user' && last.content) {
        try {
          await saveMessage(Number(projectId), 'user', last.content);
        } catch (e) {
          console.warn('Failed to save user message', e);
        }
      }
    }

    return result.toDataStreamResponse();
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Chat failed' }, { status: 500 });
  }
}
