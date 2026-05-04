'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react';

interface WidgetShellProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export default function WidgetShell({
  title, subtitle, icon: Icon, iconBg, iconColor,
  defaultExpanded = true, children,
}: WidgetShellProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full text-left bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 px-5 py-4 flex items-center justify-between transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 transition-colors shrink-0" />
      </button>
    );
  }

  return (
    <div className="relative group/shell">
      {children}
      <button
        onClick={() => setExpanded(false)}
        title="Collapse"
        className="absolute top-3.5 right-3.5 z-10 w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors opacity-0 group-hover/shell:opacity-100"
      >
        <ChevronUp className="w-3 h-3 text-slate-500" />
      </button>
    </div>
  );
}
