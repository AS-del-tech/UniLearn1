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
    if (!text.trim()) {
      setError('Please enter some text first.');
      return;
    }
    if (text.length > 2000) {
      setError('Text must be 2000 characters or fewer.');
      return;
    }

    clearResult();
    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      if (type === 'summary') {
        setSummary(data.summary);
      } else if (type === 'flashcards') {
        setFlashcards(data.flashcards);
      }
      setResultType(type);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = () => callApi('/api/ai/summarize', 'summary');
  const handleFlashcards = () => callApi('/api/ai/flashcards', 'flashcards');

  const hasResult = summary !== null || flashcards !== null;
  const charCount = text.length;
  const overLimit = charCount > 2000;

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col p-6 hover:border-border/80 transition-colors min-h-64">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-8 h-8 text-muted-foreground shrink-0" />
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground">AI-powered</p>
        </div>
      </div>

      {/* Input */}
      <div className="mb-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your study text here..."
          disabled={loading}
          className="w-full h-24 bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground placeholder-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
        />
        <p className={`text-xs mt-1 text-right ${overLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
          {charCount}/2000
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mb-4">
        {(isSummarizer || (!isSummarizer && !isFlashcards)) && (
          <button
            onClick={handleSummarize}
            disabled={loading || overLimit}
            className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && resultType === null ? 'Loading...' : 'Summarize'}
          </button>
        )}
        {(isFlashcards || (!isSummarizer && !isFlashcards)) && (
          <button
            onClick={handleFlashcards}
            disabled={loading || overLimit}
            className="flex-1 px-3 py-2 bg-secondary border border-border rounded text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && resultType === null ? 'Loading...' : 'Flashcards'}
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-sm text-muted-foreground text-center py-2">
          Generating{isSummarizer ? ' summary' : isFlashcards ? ' flashcards' : ''}...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* Summary Result */}
      {!loading && hasResult && resultType === 'summary' && summary && (
        <div className="mt-1">
          <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Summary</p>
          <p className="text-sm text-foreground leading-relaxed bg-secondary border border-border rounded px-3 py-2">
            {summary}
          </p>
        </div>
      )}

      {/* Flashcards Result */}
      {!loading && hasResult && resultType === 'flashcards' && flashcards && (
        <div className="mt-1">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
            Flashcards ({flashcards.length})
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {flashcards.map((card, i) => (
              <div key={i} className="bg-secondary border border-border rounded px-3 py-2 text-sm">
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
