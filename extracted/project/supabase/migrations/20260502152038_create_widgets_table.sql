/*
  # Create widgets table for UniLearn

  1. New Tables
    - `widgets`
      - `id` (uuid, primary key)
      - `widget_id` (text, unique slug like "notes", "timer")
      - `name` (text, display name)
      - `type` (text, one of: ai, embed, utility)
      - `endpoint` (text, optional API endpoint)
      - `input_type` (text, one of: text, url, none)
      - `enabled` (boolean, whether visible on dashboard)
      - `position` (integer, display order)
      - `config` (jsonb, extra config per widget)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - RLS enabled
    - Public read for enabled widgets
    - No unauthenticated writes (admin uses service role key via server-side API)

  3. Seed Data
    - Notes, Timer, AI Summary, AI Flashcards, YouTube widgets
*/

CREATE TABLE IF NOT EXISTS widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('ai', 'embed', 'utility')),
  endpoint text DEFAULT '',
  input_type text NOT NULL DEFAULT 'none' CHECK (input_type IN ('text', 'url', 'none')),
  enabled boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read enabled widgets"
  ON widgets FOR SELECT
  USING (enabled = true);

CREATE POLICY "Service role can read all widgets"
  ON widgets FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert widgets"
  ON widgets FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update widgets"
  ON widgets FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete widgets"
  ON widgets FOR DELETE
  TO service_role
  USING (true);

INSERT INTO widgets (widget_id, name, type, endpoint, input_type, enabled, position, config) VALUES
  ('notes', 'Notes', 'utility', '', 'none', true, 0, '{"placeholder": "Start typing your notes..."}'),
  ('timer', 'Pomodoro Timer', 'utility', '', 'none', true, 1, '{"workMinutes": 25, "breakMinutes": 5}'),
  ('ai-summarize', 'AI Summarizer', 'ai', '/api/ai/summarize', 'text', true, 2, '{"maxLength": 2000}'),
  ('ai-flashcards', 'AI Flashcards', 'ai', '/api/ai/flashcards', 'text', true, 3, '{"maxLength": 2000}'),
  ('youtube', 'YouTube Embed', 'embed', '', 'url', true, 4, '{"defaultUrl": ""}')
ON CONFLICT (widget_id) DO NOTHING;
