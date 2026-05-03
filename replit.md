# UniLearn - Study Dashboard

## Overview
A Next.js study dashboard with AI-powered widgets built with Supabase backend.

## Tech Stack
- **Framework**: Next.js 13.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend/DB**: Supabase (PostgreSQL)
- **UI Components**: Radix UI primitives

## Project Structure
```
app/            - Next.js App Router pages (layout, page, globals.css)
components/     - React components (WidgetRenderer, NotesWidget, TimerWidget, ui/)
lib/            - Utilities (supabase client, types, utils, widgets.json)
hooks/          - Custom React hooks
supabase/       - Supabase migrations
```

## Features
- Dashboard with widget grid layout
- Notes widget (persistent notes)
- Pomodoro Timer widget
- AI Summarizer widget placeholder
- AI Flashcards widget placeholder
- YouTube Embed widget placeholder
- Admin panel at /admin

## Running
- Dev server: `npm run dev` on port 5000 (0.0.0.0)
- Workflow: "Start application"

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (secret)
- `OPENAI_API_KEY` - OpenAI API key (secret, for AI features)
- `ADMIN_PASS` - Admin panel password
