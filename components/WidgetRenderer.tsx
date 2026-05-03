import { CircleAlert as AlertCircle, Zap, Youtube } from 'lucide-react';
import NotesWidget from './NotesWidget';
import TimerWidget from './TimerWidget';

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
  // Render specific utility widgets
  if (widget.id === 'notes') {
    return <NotesWidget />;
  }

  if (widget.id === 'timer') {
    return <TimerWidget />;
  }

  // Placeholder for AI and embed widgets
  if (widget.type === 'ai') {
    return (
      <div className="h-64 bg-card border border-border rounded-lg flex flex-col p-6 hover:border-border/80 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-8 h-8 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-foreground">{widget.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{widget.type}</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter text..."
                disabled
                className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm text-muted-foreground placeholder-muted-foreground/50 cursor-not-allowed"
              />
              <button
                disabled
                className="w-full px-3 py-2 bg-primary/10 border border-border rounded text-sm text-muted-foreground hover:bg-primary/20 transition-colors cursor-not-allowed"
              >
                Process
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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

  // Fallback
  return (
    <div className="h-64 bg-card border border-border rounded-lg flex items-center justify-center text-muted-foreground">
      <AlertCircle className="w-8 h-8" />
    </div>
  );
}
