import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/lib/rate-limit';

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY = 20;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { allowed } = checkRateLimit(`chat:${ip}`);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute and try again.' },
      { status: 429 }
    );
  }

  let body: { messages?: Message[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Missing required field: messages.' }, { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage?.content || typeof lastMessage.content !== 'string') {
    return NextResponse.json({ error: 'Invalid message format.' }, { status: 400 });
  }

  const trimmedContent = lastMessage.content.trim();
  if (trimmedContent.length === 0) {
    return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
  }
  if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured.' },
      { status: 500 }
    );
  }

  // Keep conversation history bounded
  const history = messages.slice(-MAX_HISTORY).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content.trim(),
  }));

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are UniLearn AI — a friendly, knowledgeable study assistant. Help students understand concepts, answer questions, explain ideas clearly, and suggest study strategies. Keep responses concise and helpful.',
        },
        ...history,
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? '';
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    console.error('OpenAI chat error:', err);
    return NextResponse.json(
      { error: 'Failed to get a response. Please try again.' },
      { status: 502 }
    );
  }
}
