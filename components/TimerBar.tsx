'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

const XP_STORAGE_KEY = 'unilearn-xp';
const MS_PER_XP = 120000;
const LEVEL_THRESHOLDS = [0, 100, 250, 500];

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getLevel(xp: number) {
  if (xp >= LEVEL_THRESHOLDS[3]) return 4;
  if (xp >= LEVEL_THRESHOLDS[2]) return 3;
  if (xp >= LEVEL_THRESHOLDS[1]) return 2;
  return 1;
}

function getProgress(xp: number) {
  const level = getLevel(xp);
  const current = LEVEL_THRESHOLDS[level - 1];
  const next = LEVEL_THRESHOLDS[level] ?? (current + 250);
  const progress = ((xp - current) / (next - current)) * 100;
  return { level, current, next, progress: Math.max(0, Math.min(100, progress)) };
}

export default function TimerBar() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [xp, setXp] = useState(0);
  const [toast, setToast] = useState('');
  const lastTickRef = useRef<number | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(XP_STORAGE_KEY) ?? '0');
      if (!Number.isNaN(saved)) setXp(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (isRunning) {
      lastTickRef.current = Date.now();
      const interval = setInterval(() => {
        const now = Date.now();
        const last = lastTickRef.current ?? now;
        const deltaMs = now - last;
        lastTickRef.current = now;
        setElapsed((prev) => prev + Math.max(1, Math.floor(deltaMs / 1000)));
        setXp((prev) => {
          const nextXp = prev + Math.floor(deltaMs / MS_PER_XP);
          if (nextXp > prev) {
            try { localStorage.setItem(XP_STORAGE_KEY, String(nextXp)); } catch {}
            const prevLevel = getLevel(prev);
            const nextLevel = getLevel(nextXp);
            if (nextLevel > prevLevel) {
              setToast(`Level up! You reached Level ${nextLevel} 🎉`);
              if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
              toastTimerRef.current = setTimeout(() => setToast(''), 2500);
            }
          }
          return nextXp;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    lastTickRef.current = null;
  }, [isRunning]);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const { level, next, progress } = useMemo(() => getProgress(xp), [xp]);
  const nextLevel = level < 4 ? level + 1 : 4;
  const timeLabel = formatTime(elapsed);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Stopwatch</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-foreground">Level {level}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">→ Level {nextLevel}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #4F46E5, #7C3AED)' }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>{xp} XP</span>
            <span>{next - xp} XP to next level</span>
          </div>
        </div>

        <span className="text-lg font-mono font-bold text-foreground tabular-nums shrink-0">{timeLabel}</span>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsRunning((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-[0.98] active:scale-95 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            {isRunning ? <><Pause className="w-3.5 h-3.5" /><span className="hidden sm:inline">Pause</span></> : <><Play className="w-3.5 h-3.5" /><span className="hidden sm:inline">Start</span></>}
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setElapsed(0);
              lastTickRef.current = null;
            }}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-all duration-200 hover:scale-95 active:scale-90"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {toast && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
}
