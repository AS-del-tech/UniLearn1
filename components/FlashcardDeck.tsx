'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, ChevronLeft, ChevronRight, RotateCcw, Trash2, Layers } from 'lucide-react';
import { getFlashcards, deleteFlashcard, type SavedFlashcard } from '@/lib/flashcards';

export default function FlashcardDeck() {
  const [cards, setCards] = useState<SavedFlashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const reload = useCallback(() => {
    const loaded = getFlashcards();
    setCards(loaded);
    setIndex(0);
    setFlipped(false);
  }, []);

  useEffect(() => {
    reload();
    const handler = () => reload();
    window.addEventListener('flashcards:updated', handler);
    return () => window.removeEventListener('flashcards:updated', handler);
  }, [reload]);

  const current = cards[index];

  function next() { setFlipped(false); setIndex((i) => Math.min(i + 1, cards.length - 1)); }
  function prev() { setFlipped(false); setIndex((i) => Math.max(i - 1, 0)); }

  function handleDelete(id: string) {
    deleteFlashcard(id);
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    setIndex((i) => Math.min(i, Math.max(updated.length - 1, 0)));
    setFlipped(false);
  }

  if (reviewing && current) {
    return (
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border border-slate-100 p-6 flex flex-col" style={{ minHeight: '260px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Flashcard Deck</h3>
              <p className="text-xs text-muted-foreground">{index + 1} / {cards.length}</p>
            </div>
          </div>
          <button onClick={() => { setReviewing(false); setFlipped(false); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-slate-100">
            Exit review
          </button>
        </div>

        {/* Flip card */}
        <div
          className="flex-1 relative cursor-pointer select-none"
          onClick={() => setFlipped((f) => !f)}
          style={{ perspective: '1000px', minHeight: '120px' }}
        >
          <div
            className="absolute inset-0 transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col items-center justify-center p-4 text-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-xs text-indigo-400 font-medium uppercase tracking-wide mb-2">Question</p>
              <p className="text-sm font-medium text-foreground leading-relaxed">{current.question}</p>
              <p className="text-xs text-muted-foreground mt-3">Click to reveal answer</p>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center p-4 text-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-xs text-emerald-500 font-medium uppercase tracking-wide mb-2">Answer</p>
              <p className="text-sm text-foreground leading-relaxed">{current.answer}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => handleDelete(current.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={prev} disabled={index === 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} disabled={index === cards.length - 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 disabled:opacity-30 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => { setIndex(0); setFlipped(false); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-slate-100 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-slate-100 p-6 flex flex-col" style={{ minHeight: '200px' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
          <Zap className="w-5 h-5 text-violet-500" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">Flashcard Deck</h3>
          <p className="text-xs text-muted-foreground">
            {cards.length === 0 ? 'No cards yet' : `${cards.length} card${cards.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <Layers className="w-10 h-10 text-slate-200 mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Your deck is empty</p>
          <p className="text-xs text-muted-foreground/70">Ask StudyBuddy to "Make flashcards" and save them here.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-2 max-h-32 overflow-y-auto pr-1 mb-4">
            {cards.slice(0, 3).map((c) => (
              <div key={c.id} className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-muted-foreground truncate border border-slate-100">
                Q: {c.question}
              </div>
            ))}
            {cards.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">+{cards.length - 3} more</p>
            )}
          </div>
          <button
            onClick={() => setReviewing(true)}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all shadow-sm"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
          >
            Review Cards
          </button>
        </>
      )}
    </div>
  );
}
