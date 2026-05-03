import { CircleAlert as AlertCircle, Youtube } from 'lucide-react';
import NotesWidget from './NotesWidget';
import TimerWidget from './TimerWidget';
import AIWidget from './AIWidget';
import FeedbackWidget from './FeedbackWidget';

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
  if (widget.id === 'notes') return <NotesWidget />;
  if (widget.id === 'timer') return <TimerWidget />;
  if (widget.id === 'feedback') return <FeedbackWidget />;

  if (widget.type === 'ai') {
    return <AIWidget id={widget.id} name={widget.name} />;
  }

  if (widget.type === 'embed') {
    return (
      <div className="h-64 bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col p-6 border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <Youtube className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{widget.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{widget.type}</p>
          </div>
        </div>
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Embed placeholder</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 bg-white rounded-2xl shadow-md flex items-center justify-center text-muted-foreground border border-slate-100">
      <AlertCircle className="w-8 h-8" />
    </div>
  );
}
