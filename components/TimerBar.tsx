'use client';

import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { recordStudySession } from '@/lib/streak';

const PRESETS = [
  { label: '5m',  seconds: 5 * 60 },
  { label: '15m', seconds: 15 * 60 },
  { label: '25m', seconds: 25 * 60 },
  { label: '50m', seconds: 50 * 60 },
];

export default function TimerBar() {
  const [preset, setPreset] = useState(PRESETS[2]); // default 25m
  const [timeLeft, setTimeLeft] = useState(PRESETS[2].seconds);
  const [isRunning, setIsRunning] = useState(false);

  // Sync timeLeft when preset changes (only when not running)
  useEffect(() => {
    if (!isRunning) setTimeLeft(preset.seconds);
  }, [preset, isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          recordStudySession();
          return preset.seconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, preset.seconds]);

  // Record session when user starts timer
  useEffect(() => {
    if (isRunning) recordStudySession();
  }, [isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((preset.seconds - timeLeft) / preset.seconds) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-4">
        {/* Icon + label */}
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Focus Timer</span>
        </div>

        {/* Preset selector */}
        <div className="flex items-center gap-1 shrink-0">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { if (!isRunning) { setPreset(p); setTimeLeft(p.seconds); } }}
              disabled={isRunning}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                preset.label === p.label
                  ? 'text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 disabled:hover:bg-transparent'
              }`}
              style={preset.label === p.label ? { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' } : {}}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-0">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
            }}
          />
        </div>

        {/* Time display */}
        <span className="text-lg font-mono font-bold text-foreground tabular-nums shrink-0">
          {String(minutes).padStart(2, '0')}
          <span className={isRunning ? 'opacity-100' : 'opacity-40'}>:</span>
          {String(seconds).padStart(2, '0')}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsRunning((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white transition-all shadow-sm"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            {isRunning
              ? <><Pause className="w-3.5 h-3.5" /><span className="hidden sm:inline">Pause</span></>
              : <><Play  className="w-3.5 h-3.5" /><span className="hidden sm:inline">Start</span></>
            }
          </button>
          <button
            onClick={() => { setIsRunning(false); setTimeLeft(preset.seconds); }}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
