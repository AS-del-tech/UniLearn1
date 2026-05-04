# UniLearn — Smart Study Dashboard

## Overview
A Next.js 13 App Router study platform with AI-powered widgets, StudyBuddy AI assistant, stopwatch + XP/level system, streaks, flashcards, focus mode, export/import, and Supabase auth.

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
  admin/page.tsx      - Admin panel: widget manager + feedback viewer, password show/hide toggle
components/           - React components
  StudyBuddy.tsx      - Floating AI chat, outside-click close, "thinking…" indicator, flashcard save
  WidgetRenderer.tsx  - Renders widgets by id, supports focusMode prop
  WidgetShell.tsx     - Expandable/collapsible wrapper for all widgets
  FlashcardDeck.tsx   - Flip-card review widget reading from localStorage
  Header.tsx          - Subtitle "All-in-one study platform", streak badge, Focus/Export, auth menu
  TimerBar.tsx        - Sticky bottom stopwatch + XP/level bar (persists in localStorage)
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
1. **StudyBuddy** — Floating orange chat button; closes on outside click; "StudyBuddy is thinking…" typing indicator with bounce dots; quick-action chips; notes context; tone styles; gear settings panel
2. **Universal Input** — Global search/paste bar that prefills StudyBuddy
3. **Expandable Widgets** — WidgetShell with collapse/expand on every widget
4. **Stopwatch + XP/Level** — Sticky bottom stopwatch; earns ~1 XP/2 min; 4 levels (0/100/250/500 XP); level-up toast; XP persists in `localStorage['unilearn-xp']`
5. **Streaks** — Daily study session tracking, flame badge in header
6. **Flashcard Deck** — Save Q/A pairs from StudyBuddy; flip-card review with nav + delete
7. **Export / Import** — Download JSON (notes + flashcards + study dates); import with validation
8. **Focus Mode** — Header toggle hides YouTube, Canva, Feedback; keeps Notes + Flashcard Deck
9. **StudyBuddy Customization** — Rename + tone (Friendly/Formal/Concise)
10. **Canva Widget** — Opens canva.com in new tab for visual study materials
11. **Admin Panel** — Password field with Eye/EyeOff show/hide toggle; widget CRUD; feedback viewer

## UI Polish
- All interactive elements use `transition-all duration-200` (150–250 ms)
- Hover: `hover:scale-[0.98]`, Active: `active:scale-95` on buttons
- Widget cards: `hover:shadow-md hover:-translate-y-0.5`
- Header subtitle: "All-in-one study platform"

## Design Tokens
- Background: `#F7F7FB`
- Primary gradient: `#4F46E5 → #7C3AED`
- Accent gradient: `#F97316 → #EC4899`

## localStorage Keys
- `unilearn-notes` — notes content
- `unilearn-flashcards` — flashcard array
- `unilearn-study-dates` — streak date array
- `studybuddy-name` — AI assistant name
- `studybuddy-tone` — AI tone preference
- `unilearn-xp` — XP points for level system

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
- `ADMIN_PASS` — Admin panel password (validated server-side via `/api/admin/widgets`)
