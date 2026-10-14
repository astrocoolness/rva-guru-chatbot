import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createXai } from '@ai-sdk/xai';
import { getMessages, saveMessage } from '@/lib/db';

const xai = createXai({
  apiKey: process.env.XAI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { messages, projectId } = await req.json();

    // Load previous messages for context if projectId provided
    let history: any[] = [];
    if (projectId) {
      const dbMsgs = await getMessages(projectId);
      history = dbMsgs.map((m: any) => ({ role: m.role, content: m.content }));
    }

    const allMessages = [...history, ...messages];

    // Strong system prompt inspired by best practices
    const system = `You are a highly capable AI assistant focused on practical software development, idea refinement, and project execution.
You follow clear reasoning, write clean code when asked, and help turn ideas into concrete plans.
Be direct, accurate, and helpful. Prefer action over vague advice.`;

    const result = await streamText({
      model: xai('grok-beta'),
      system,
      messages: allMessages,
    });

    // Save the latest user message and will save assistant after stream (simplified)
    if (projectId && messages.length) {
      const last = messages[messages.length - 1];
      if (last.role === 'user') {
        await saveMessage(projectId, 'user', last.content);
      }
    }

    return result.toDataStreamResponse();
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
