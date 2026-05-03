'use client';

import { useEffect, useState } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

const POMODORO_MINUTES = 25;
const TOTAL_SECONDS = POMODORO_MINUTES * 60;

export default function TimerWidget() {
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return TOTAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 100;

  return (
    <div className="h-64 bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col p-6 border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
          <Clock className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">Pomodoro Timer</h3>
          <p className="text-xs text-muted-foreground">25 minutes</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-5xl font-mono font-bold text-foreground tabular-nums tracking-tight">
          {String(minutes).padStart(2, '0')}
          <span className={`${isRunning ? 'opacity-100' : 'opacity-40'} transition-opacity`}>:</span>
          {String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={() => setIsRunning(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        ) : (
          <button
            onClick={() => setIsRunning(false)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}
        <button
          onClick={() => { setIsRunning(false); setTimeLeft(TOTAL_SECONDS); }}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-foreground hover:bg-slate-200 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
