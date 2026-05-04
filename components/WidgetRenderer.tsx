import { CircleAlert as AlertCircle, Youtube, FileText, MessageSquare, Zap, Palette } from 'lucide-react';
import NotesWidget from './NotesWidget';
import FeedbackWidget from './FeedbackWidget';
import FlashcardDeck from './FlashcardDeck';
import WidgetShell from './WidgetShell';

interface Widget {
  id: string;
  name: string;
  type: 'ai' | 'embed' | 'utility';
  inputType: 'text' | 'url' | 'none';
}

interface WidgetRendererProps {
  widget: Widget;
  focusMode?: boolean;
}

const FOCUS_WHITELIST = new Set(['notes', 'flashcard-deck']);

export default function WidgetRenderer({ widget, focusMode }: WidgetRendererProps) {
  // In focus mode, hide distractions
  if (focusMode && !FOCUS_WHITELIST.has(widget.id)) return null;

  if (widget.id === 'notes') {
    return (
      <WidgetShell title="Notes" subtitle="Auto-saved" icon={FileText} iconBg="bg-indigo-50" iconColor="text-indigo-500" defaultExpanded>
        <NotesWidget />
      </WidgetShell>
    );
  }

  if (widget.id === 'flashcard-deck') {
    return (
      <WidgetShell title="Flashcard Deck" subtitle="Review your cards" icon={Zap} iconBg="bg-violet-50" iconColor="text-violet-500" defaultExpanded>
        <FlashcardDeck />
      </WidgetShell>
    );
  }

  if (widget.id === 'feedback') {
    return (
      <WidgetShell title="Feedback" subtitle="Share your thoughts" icon={MessageSquare} iconBg="bg-emerald-50" iconColor="text-emerald-500" defaultExpanded>
        <FeedbackWidget />
      </WidgetShell>
    );
  }

  if (widget.id === 'canva') {
    return (
      <WidgetShell title="Canva" subtitle="Design tool" icon={Palette} iconBg="bg-cyan-50" iconColor="text-cyan-500" defaultExpanded>
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-slate-100 p-6 flex flex-col" style={{ minHeight: '160px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center">
              <Palette className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Canva</h3>
              <p className="text-xs text-muted-foreground">Create visual study materials</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            Design mind maps, study guides, infographics, and more with Canva.
          </p>
          <a
            href="https://www.canva.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #00C4CC, #7B2FF7)' }}
          >
            <Palette className="w-4 h-4" />
            Open Canva
          </a>
        </div>
      </WidgetShell>
    );
  }

  if (widget.type === 'embed') {
    return (
      <WidgetShell title={widget.name} subtitle="Embed" icon={Youtube} iconBg="bg-red-50" iconColor="text-red-500" defaultExpanded>
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
      </WidgetShell>
    );
  }

  return (
    <div className="h-64 bg-white rounded-2xl shadow-md flex items-center justify-center text-muted-foreground border border-slate-100">
      <AlertCircle className="w-8 h-8" />
    </div>
  );
}
