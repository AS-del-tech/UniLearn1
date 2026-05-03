'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText } from 'lucide-react';

const STORAGE_KEY = 'unilearn-notes';
const DEBOUNCE_DELAY = 500;

export default function NotesWidget() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setContent(saved);
    }
    setLoading(false);
  }, []);

  // Debounced save to localStorage
  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, content);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [content, loading]);

  if (loading) {
    return (
      <div className="h-64 bg-card border border-border rounded-lg flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-64 bg-card border border-border rounded-lg flex flex-col p-6 hover:border-border/80 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <div>
          <h3 className="font-semibold text-foreground">Notes</h3>
          <p className="text-xs text-muted-foreground">Auto-saved</p>
        </div>
      </div>

      {/* Text Area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your notes here..."
        className="flex-1 w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground placeholder-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
      />
    </div>
  );
}
