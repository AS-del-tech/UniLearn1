'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText } from 'lucide-react';

const STORAGE_KEY = 'unilearn-notes';
const DEBOUNCE_DELAY = 500;

export default function NotesWidget() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setContent(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, content);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [content, loading]);

  if (loading) {
    return (
      <div className="h-64 bg-white rounded-2xl shadow-md flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-64 bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Notes</h3>
            <p className="text-xs text-muted-foreground">Auto-saved</p>
          </div>
        </div>
        {saved && <span className="text-xs text-emerald-500 font-medium">Saved</span>}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your notes here..."
        className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
      />
    </div>
  );
}
