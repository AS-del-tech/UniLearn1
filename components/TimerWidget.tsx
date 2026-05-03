'use client';

import { useEffect, useState } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

const POMODORO_MINUTES = 25;
const TOTAL_SECONDS = POMODORO_MINUTES * 60;

export default function TimerWidget() {
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  // Timer interval
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

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TOTAL_SECONDS);
  };

  return (
    <div className="h-64 bg-card border border-border rounded-lg flex flex-col p-6 hover:border-border/80 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-8 h-8 text-muted-foreground" />
        <div>
          <h3 className="font-semibold text-foreground">Pomodoro Timer</h3>
          <p className="text-xs text-muted-foreground">25 minutes</p>
        </div>
      </div>

      {/* Timer Display */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <div className="text-6xl font-mono font-bold text-foreground tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary border border-border rounded text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
