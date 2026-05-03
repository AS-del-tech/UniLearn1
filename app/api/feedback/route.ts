import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { checkRateLimit } from '@/lib/rate-limit';

const FEEDBACK_PATH = join(process.cwd(), 'lib', 'feedback.json');
const MAX_MESSAGE = 1000;
const MAX_NAME = 100;

export interface FeedbackEntry {
  id: string;
  message: string;
  name?: string;
  timestamp: string;
}

function readFeedback(): FeedbackEntry[] {
  try {
    const raw = readFileSync(FEEDBACK_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { allowed } = checkRateLimit(`feedback:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait and try again.' }, { status: 429 });
  }

  let body: { message?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const message = body.message?.trim() ?? '';
  const name = body.name?.trim() ?? '';

  if (!message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: `Message must be ${MAX_MESSAGE} characters or fewer.` }, { status: 400 });
  }
  if (name.length > MAX_NAME) {
    return NextResponse.json({ error: `Name must be ${MAX_NAME} characters or fewer.` }, { status: 400 });
  }

  const entry: FeedbackEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    message,
    timestamp: new Date().toISOString(),
    ...(name ? { name } : {}),
  };

  try {
    const all = readFeedback();
    all.unshift(entry);
    writeFileSync(FEEDBACK_PATH, JSON.stringify(all, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save feedback.' }, { status: 500 });
  }
}
