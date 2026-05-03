'use client';

import { useState } from 'react';
import { Zap } from 'lucide-react';

interface Flashcard {
  question: string;
  answer: string;
}

type ResultType = 'summary' | 'flashcards' | null;

interface AIWidgetProps {
  id: string;
  name: string;
}

export default function AIWidget({ id, name }: AIWidgetProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultType, setResultType] = useState<ResultType>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);

  const isSummarizer = id === 'ai-summarize';
  const isFlashcards = id === 'ai-flashcards';

  const clearResult = () => {
    setError(null);
    setSummary(null);
    setFlashcards(null);
    setResultType(null);
  };

  const callApi = async (endpoint: string, type: ResultType) => {
    if (!text.trim()) { setError('Please enter some text first.'); return; }
    if (text.length > 2000) { setError('Text must be 2000 characters or fewer.'); return; }
    clearResult();
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
      if (type === 'summary') setSummary(data.summary);
      else if (type === 'flashcards') setFlashcards(data.flashcards);
      setResultType(type);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const overLimit = text.length > 2000;
  const hasResult = summary !== null || flashcards !== null;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col p-6 border border-slate-100 min-h-64">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
          <Zap className="w-5 h-5 text-sky-500" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">{name}</h3>
          <p className="text-xs text-muted-foreground">AI-powered</p>
        </div>
      </div>

      <div className="mb-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your study text here..."
          disabled={loading}
          className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all disabled:opacity-50"
        />
        <p className={`text-xs mt-1 text-right ${overLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
          {text.length}/2000
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        {isSummarizer && (
          <button
            onClick={() => callApi('/api/ai/summarize', 'summary')}
            disabled={loading || overLimit}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Summarize'}
          </button>
        )}
        {isFlashcards && (
          <button
            onClick={() => callApi('/api/ai/flashcards', 'flashcards')}
            disabled={loading || overLimit}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl text-sm font-medium hover:from-sky-600 hover:to-indigo-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Flashcards'}
          </button>
        )}
        {!isSummarizer && !isFlashcards && (
          <>
            <button
              onClick={() => callApi('/api/ai/summarize', 'summary')}
              disabled={loading || overLimit}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Summarize'}
            </button>
            <button
              onClick={() => callApi('/api/ai/flashcards', 'flashcards')}
              disabled={loading || overLimit}
              className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-foreground hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Flashcards'}
            </button>
          </>
        )}
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground text-center py-2 animate-pulse">Generating...</div>
      )}

      {error && !loading && (
        <div className="text-sm text-destructive bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {!loading && hasResult && resultType === 'summary' && summary && (
        <div>
          <p className="text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wide">Summary</p>
          <p className="text-sm text-foreground leading-relaxed bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5">
            {summary}
          </p>
        </div>
      )}

      {!loading && hasResult && resultType === 'flashcards' && flashcards && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">
            Flashcards ({flashcards.length})
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {flashcards.map((card, i) => (
              <div key={i} className="bg-sky-50 border border-sky-100 rounded-xl px-3 py-2.5 text-sm">
                <p className="text-foreground font-medium mb-1">Q: {card.question}</p>
                <p className="text-muted-foreground">A: {card.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
