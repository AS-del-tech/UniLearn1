import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

const FEEDBACK_PATH = join(process.cwd(), 'lib', 'feedback.json');

function authenticate(req: NextRequest): boolean {
  const adminPass = process.env.ADMIN_PASS;
  if (!adminPass) return false;
  return req.headers.get('x-admin-password') === adminPass;
}

export async function GET(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const raw = readFileSync(FEEDBACK_PATH, 'utf-8');
    const feedback = JSON.parse(raw);
    return NextResponse.json({ feedback });
  } catch {
    return NextResponse.json({ feedback: [] });
  }
}
