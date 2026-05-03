import { CircleAlert as AlertCircle, Youtube } from 'lucide-react';
import NotesWidget from './NotesWidget';
import TimerWidget from './TimerWidget';
import AIWidget from './AIWidget';

interface Widget {
  id: string;
  name: string;
  type: 'ai' | 'embed' | 'utility';
  inputType: 'text' | 'url' | 'none';
}

interface WidgetRendererProps {
  widget: Widget;
}

export default function WidgetRenderer({ widget }: WidgetRendererProps) {
  if (widget.id === 'notes') {
    return <NotesWidget />;
  }

  if (widget.id === 'timer') {
    return <TimerWidget />;
  }

  if (widget.type === 'ai') {
    return <AIWidget id={widget.id} name={widget.name} />;
  }

  if (widget.type === 'embed') {
    return (
      <div className="h-64 bg-card border border-border rounded-lg flex flex-col p-6 hover:border-border/80 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <Youtube className="w-8 h-8 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-foreground">{widget.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{widget.type}</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full bg-secondary rounded flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Embed placeholder</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 bg-card border border-border rounded-lg flex items-center justify-center text-muted-foreground">
      <AlertCircle className="w-8 h-8" />
    </div>
  );
}
