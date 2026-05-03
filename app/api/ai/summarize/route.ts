import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/lib/rate-limit';

const MAX_INPUT_LENGTH = 2000;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { allowed } = checkRateLimit(`summarize:${ip}`);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute and try again.' },
      { status: 429 }
    );
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { text } = body;

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Missing required field: text.' }, { status: 400 });
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return NextResponse.json({ error: 'Text cannot be empty.' }, { status: 400 });
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return NextResponse.json(
      { error: `Text must be ${MAX_INPUT_LENGTH} characters or fewer.` },
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

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a concise study assistant. Summarize the provided text in 2–4 clear sentences. Focus on the key ideas.',
        },
        { role: 'user', content: trimmed },
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const summary = completion.choices[0]?.message?.content?.trim() ?? '';
    return NextResponse.json({ summary });
  } catch (err: unknown) {
    console.error('OpenAI summarize error:', err);
    return NextResponse.json(
      { error: 'Failed to generate summary. Please try again.' },
      { status: 502 }
    );
  }
}
