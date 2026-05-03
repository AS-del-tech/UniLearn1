'use client';

import { useEffect, useState } from 'react';
import WidgetRenderer from '@/components/WidgetRenderer';
import Header from '@/components/Header';
import ChatWidget from '@/components/ChatWidget';
import widgetsData from '@/lib/widgets.json';
import { BookOpen, Zap, Brain, Sparkles } from 'lucide-react';

interface Widget {
  id: string;
  name: string;
  type: 'ai' | 'embed' | 'utility';
  inputType: 'text' | 'url' | 'none';
}

export default function Dashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setWidgets(widgetsData.widgets as Widget[]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F7FB' }}>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7FB' }}>
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Floating background shapes */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          />
          <div
            className="absolute -top-12 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl"
            style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)' }}
          />
          <div
            className="absolute top-32 left-1/3 w-64 h-64 rounded-full opacity-5 blur-2xl"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
          />
          {/* Subtle floating icons */}
          <BookOpen className="absolute top-8 right-24 w-8 h-8 opacity-5 text-indigo-600 rotate-12" />
          <Brain className="absolute top-20 left-16 w-10 h-10 opacity-5 text-purple-600 -rotate-6" />
          <Zap className="absolute bottom-4 right-1/4 w-6 h-6 opacity-5 text-orange-500 rotate-45" />
          <Sparkles className="absolute top-12 left-1/2 w-6 h-6 opacity-5 text-pink-500" />
        </div>

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-12 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700 mb-6">
            <Sparkles className="w-3 h-3" />
            AI-powered
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4" style={{ color: '#111827' }}>
            Your Personal{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
            >
              Learning Hub
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: '#6B7280' }}>
            Summarize notes, generate flashcards, track study sessions, and get instant AI help — all in one place.
          </p>
        </div>
      </section>

      {/* Widget Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <WidgetRenderer key={widget.id} widget={widget} />
          ))}
        </div>
      </main>

      {/* AI Chat (floating) */}
      <ChatWidget />
    </div>
  );
}
