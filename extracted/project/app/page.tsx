'use client';

import { useEffect, useState } from 'react';
import WidgetRenderer from '@/components/WidgetRenderer';
import widgetsData from '@/lib/widgets.json';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">UniLearn</h1>
            <a
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </a>
          </div>
          <p className="text-muted-foreground mt-1">Study dashboard with AI-powered widgets</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <WidgetRenderer key={widget.id} widget={widget} />
          ))}
        </div>
      </main>
    </div>
  );
}
