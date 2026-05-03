'use client';

import { useState } from 'react';
import { MessageSquare, CheckCircle } from 'lucide-react';

export default function FeedbackWidget() {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) { setError('Please enter a message.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), name: name.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
      setSuccess(true);
      setMessage('');
      setName('');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-64 bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col p-6 border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">Feedback</h3>
          <p className="text-xs text-muted-foreground">Share your thoughts</p>
        </div>
      </div>

      {success ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
          <p className="text-sm font-medium text-foreground">Thanks for your feedback!</p>
          <button
            onClick={() => setSuccess(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1 underline underline-offset-2"
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            disabled={loading}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all disabled:opacity-50"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind?"
            disabled={loading}
            maxLength={1000}
            className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all disabled:opacity-50"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>
      )}
    </div>
  );
}
