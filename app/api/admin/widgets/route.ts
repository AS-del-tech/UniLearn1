import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const WIDGETS_PATH = join(process.cwd(), 'lib', 'widgets.json');

const VALID_TYPES = ['ai', 'embed', 'utility'] as const;
const VALID_INPUT_TYPES = ['text', 'url', 'none'] as const;

function authenticate(req: NextRequest): boolean {
  const adminPass = process.env.ADMIN_PASS;
  if (!adminPass) return false;
  const provided = req.headers.get('x-admin-password');
  return provided === adminPass;
}

function readWidgets() {
  const raw = readFileSync(WIDGETS_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function GET(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = readWidgets();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to read widgets.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { widgets?: unknown[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { widgets } = body;

  if (!Array.isArray(widgets)) {
    return NextResponse.json({ error: 'widgets must be an array.' }, { status: 400 });
  }

  // Validate each widget
  for (const w of widgets) {
    if (typeof w !== 'object' || w === null) {
      return NextResponse.json({ error: 'Each widget must be an object.' }, { status: 400 });
    }
    const widget = w as Record<string, unknown>;

    if (!widget.id || typeof widget.id !== 'string' || !/^[a-z0-9-]+$/.test(widget.id)) {
      return NextResponse.json(
        { error: `Widget id must be a lowercase alphanumeric string (with dashes). Got: "${widget.id}"` },
        { status: 400 }
      );
    }
    if (!widget.name || typeof widget.name !== 'string' || widget.name.trim().length === 0) {
      return NextResponse.json({ error: `Widget name is required.` }, { status: 400 });
    }
    if (!VALID_TYPES.includes(widget.type as typeof VALID_TYPES[number])) {
      return NextResponse.json(
        { error: `Widget type must be one of: ${VALID_TYPES.join(', ')}.` },
        { status: 400 }
      );
    }
    if (!VALID_INPUT_TYPES.includes(widget.inputType as typeof VALID_INPUT_TYPES[number])) {
      return NextResponse.json(
        { error: `Widget inputType must be one of: ${VALID_INPUT_TYPES.join(', ')}.` },
        { status: 400 }
      );
    }
    if (widget.endpoint !== undefined && typeof widget.endpoint !== 'string') {
      return NextResponse.json({ error: 'Widget endpoint must be a string.' }, { status: 400 });
    }
  }

  // Check for duplicate ids
  const ids = (widgets as Record<string, unknown>[]).map((w) => w.id as string);
  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: 'Widget ids must be unique.' }, { status: 400 });
  }

  try {
    const sanitized = (widgets as Record<string, unknown>[]).map((w) => {
      const widget: Record<string, unknown> = {
        id: (w.id as string).trim(),
        name: (w.name as string).trim(),
        type: w.type,
        inputType: w.inputType,
      };
      if (w.endpoint && typeof w.endpoint === 'string' && w.endpoint.trim()) {
        widget.endpoint = w.endpoint.trim();
      }
      return widget;
    });

    writeFileSync(WIDGETS_PATH, JSON.stringify({ widgets: sanitized }, null, 2), 'utf-8');
    return NextResponse.json({ widgets: sanitized });
  } catch {
    return NextResponse.json({ error: 'Failed to save widgets.' }, { status: 500 });
  }
}
