const STORAGE_KEY = 'unilearn-flashcards';

export interface SavedFlashcard {
  id: string;
  question: string;
  answer: string;
  savedAt: string;
}

export function saveFlashcards(cards: Array<{ question: string; answer: string }>): number {
  try {
    const existing = getFlashcards();
    const newCards: SavedFlashcard[] = cards.map((c) => ({
      id: Math.random().toString(36).slice(2),
      question: c.question,
      answer: c.answer,
      savedAt: new Date().toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, ...newCards]));
    return newCards.length;
  } catch { return 0; }
}

export function getFlashcards(): SavedFlashcard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function deleteFlashcard(id: string): void {
  try {
    const cards = getFlashcards().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch { /* ignore */ }
}

export function clearAllFlashcards(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

/** Parse Q/A pairs from StudyBuddy responses */
export function parseFlashcardsFromText(text: string): Array<{ question: string; answer: string }> {
  const cards: Array<{ question: string; answer: string }> = [];
  // Match patterns like "1. Q: ... / A: ..." or "Q: ...\nA: ..."
  const re = /Q:\s*(.+?)(?:\s*\/\s*A:|\s*\n+A:)\s*(.+?)(?=\n\s*\d+\.|$)/gis;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const q = m[1].trim();
    const a = m[2].trim();
    if (q && a) cards.push({ question: q, answer: a });
  }
  return cards;
}
