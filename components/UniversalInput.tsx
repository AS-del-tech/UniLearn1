'use client';

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

export default function UniversalInput() {
  const [value, setValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    // Fire a custom event to open StudyBuddy with the pasted text
    window.dispatchEvent(
      new CustomEvent('studybuddy:open', { detail: { text: trimmed } })
    );
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <Search className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste notes, a link, or ask a question — StudyBuddy will handle it..."
          className="flex-1 bg-transparent pl-11 pr-4 py-3.5 text-sm text-foreground placeholder-muted-foreground/60 outline-none rounded-2xl"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="m-1.5 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask AI
        </button>
      </div>
    </form>
  );
}
