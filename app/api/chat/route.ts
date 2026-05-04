import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/lib/rate-limit';

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY = 20;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const TONE_STYLES: Record<string, string> = {
  friendly: 'Be warm, encouraging, and conversational. Use occasional emojis where appropriate.',
  formal: 'Be precise, professional, and structured. Avoid casual language.',
  concise: 'Be extremely brief. Give direct, short answers. No filler words.',
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { allowed } = checkRateLimit(`chat:${ip}`);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute and try again.' },
      { status: 429 }
    );
  }

  let body: {
    messages?: Message[];
    buddyName?: string;
    tone?: string;
    context?: { notes?: string };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { messages, buddyName = 'StudyBuddy', tone = 'friendly', context } = body;

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
    return NextResponse.json({ error: 'OpenAI API key is not configured.' }, { status: 500 });
  }

  // Build context section
  let contextSection = '';
  if (context?.notes?.trim()) {
    contextSection = `\n\nThe user's current notes (use as context when relevant):\n"""\n${context.notes.slice(0, 2000)}\n"""`;
  }

  const toneGuide = TONE_STYLES[tone] ?? TONE_STYLES.friendly;

  const systemPrompt = `You are ${buddyName}, a knowledgeable and helpful study assistant inside the UniLearn platform.

Your capabilities:
- Summarize text or the user's notes into clear bullet points or paragraphs
- Generate flashcards (Q&A pairs) from any topic or pasted text
- Create quiz questions (multiple choice or short answer) on any subject
- Explain concepts clearly at different levels of complexity
- Answer study-related questions across all subjects
- Provide study tips and strategies

Tone: ${toneGuide}

Formatting guidelines:
- For summaries: use short paragraphs or bullet points
- For flashcards: format as numbered Q/A pairs (Q: ... / A: ...)
- For quizzes: number each question, provide 4 options (A–D), give the correct answer at the end
- For explanations: start simple, then add detail if needed
- Keep responses focused and concise${contextSection}`;

  const history = messages.slice(-MAX_HISTORY).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content.trim(),
  }));

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...history],
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? '';
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    console.error('StudyBuddy chat error:', err);
    return NextResponse.json({ error: 'Failed to get a response. Please try again.' }, { status: 502 });
  }
}
