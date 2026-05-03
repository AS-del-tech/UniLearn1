'use client';

import WidgetRenderer from '@/components/WidgetRenderer';
import Header from '@/components/Header';
import widgetsData from '@/lib/widgets.json';

interface Widget {
  id: string;
  name: string;
  type: 'ai' | 'embed' | 'utility';
  inputType: 'text' | 'url' | 'none';
}

const widgets = widgetsData.widgets as Widget[];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
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
