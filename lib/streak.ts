const STORAGE_KEY = 'unilearn-study-dates';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getStudyDates(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordStudySession(): void {
  try {
    const dates = getStudyDates();
    const today = todayStr();
    if (!dates.includes(today)) {
      dates.push(today);
      // Keep last 365 days only
      const trimmed = dates.slice(-365);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  } catch { /* ignore */ }
}

export function getStreakCount(): number {
  try {
    const dates = new Set(getStudyDates());
    const today = todayStr();
    const yesterday = yesterdayStr();

    // Streak must include today or yesterday to be active
    if (!dates.has(today) && !dates.has(yesterday)) return 0;

    let streak = 0;
    const cursor = new Date();
    // Start from today; if today not studied, start from yesterday
    if (!dates.has(today)) cursor.setDate(cursor.getDate() - 1);

    while (true) {
      const s = cursor.toISOString().slice(0, 10);
      if (!dates.has(s)) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  } catch {
    return 0;
  }
}
