# UniLearn — Smart Study Dashboard

## Overview
A Next.js 13 App Router study platform with AI-powered widgets, StudyBuddy AI assistant, timer, streaks, flashcards, focus mode, export/import, and Supabase auth.

## Tech Stack
- **Framework**: Next.js 13.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend/DB**: Supabase (PostgreSQL, anon key only — delete uses SECURITY DEFINER RPC)
- **AI**: OpenAI gpt-4o-mini via `/api/chat`
- **UI Components**: Radix UI primitives + Lucide icons

## Project Structure
```
app/                  - Next.js App Router pages (layout, page, globals.css, api/)
components/           - React components
  StudyBuddy.tsx      - Floating AI chat, settings panel, flashcard save detection
  WidgetRenderer.tsx  - Renders widgets by id, supports focusMode prop
  WidgetShell.tsx     - Expandable/collapsible wrapper for all widgets
  FlashcardDeck.tsx   - Flip-card review widget reading from localStorage
  Header.tsx          - Streak badge, Focus Mode toggle, Export/Import modal, auth menu
  TimerBar.tsx        - Sticky bottom Pomodoro timer (5/15/25/50m presets)
  NotesWidget.tsx     - Auto-saving notes textarea
  FeedbackWidget.tsx  - Feedback submission form
  UniversalInput.tsx  - Hero search bar that fires studybuddy:open event
  AuthProvider.tsx    - Supabase auth context
lib/
  flashcards.ts       - localStorage CRUD + Q/A parser for flashcard save
  streak.ts           - localStorage streak tracking utilities
  widgets.json        - Widget registry (notes, flashcard-deck, youtube, canva, feedback)
  supabase.ts         - Supabase anon client
supabase/migrations/  - delete_user() SECURITY DEFINER RPC
```

## Features (all complete)
1. **StudyBuddy** — Floating orange chat button, quick-action chips, notes context, tone styles
2. **Universal Input** — Global search/paste bar that prefills StudyBuddy
3. **Expandable Widgets** — WidgetShell with collapse/expand on every widget
4. **Timer Bar** — Sticky bottom Pomodoro bar with 5/15/25/50m presets; records streak
5. **Streaks** — Daily study session tracking, flame badge in header
6. **Flashcard Deck** — Save Q/A pairs from StudyBuddy; flip-card review with nav + delete
7. **Export / Import** — Download JSON (notes + flashcards + study dates); import with validation
8. **Focus Mode** — Header toggle hides YouTube, Canva, Feedback; keeps Notes + Flashcard Deck
9. **StudyBuddy Customization** — Gear icon → settings panel: rename + tone (Friendly/Formal/Concise)
10. **Canva Widget** — Opens canva.com in new tab for visual study materials

## Design Tokens
- Background: `#F7F7FB`
- Primary gradient: `#4F46E5 → #7C3AED`
- Accent gradient: `#F97316 → #EC4899`

## Custom Events
- `studybuddy:open` — `{ text: string }` — opens StudyBuddy + prefills input
- `flashcards:updated` — triggers FlashcardDeck reload

## Running
- Dev server: `npm run dev` (port 5000, 0.0.0.0)
- Workflow: "Start application"

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `OPENAI_API_KEY` — OpenAI API key (secret)
- `ADMIN_PASS` — Admin panel password (default: admin123)
