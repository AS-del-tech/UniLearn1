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
      <header className="bg-white/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                UniLearn
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Study dashboard with AI-powered widgets</p>
            </div>
            <a
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
            >
              Admin
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <WidgetRenderer key={widget.id} widget={widget} />
          ))}
        </div>
      </main>
    </div>
  );
}
