'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  BookOpen,
  Zap,
  HelpCircle,
  FileText,
  Settings,
  Save,
} from 'lucide-react';
import { saveFlashcards, parseFlashcardsFromText } from '@/lib/flashcards';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DEFAULT_NAME = 'StudyBuddy';
const TONES = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'concise', label: 'Concise' },
];

const GREETING = (name: string): Message => ({
  role: 'assistant',
  content: `Hi! I'm ${name}, your personal learning assistant. I can help you study, quiz you, summarize your notes, and explain concepts. What would you like to do?`,
});

const QUICK_ACTIONS = [
  { label: 'Summarize my notes', icon: FileText },
  { label: 'Quiz me', icon: HelpCircle },
  { label: 'Explain a concept', icon: BookOpen },
  { label: 'Make flashcards', icon: Zap },
];

export default function StudyBuddy() {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [buddyName, setBuddyName] = useState(DEFAULT_NAME);
  const [tone, setTone] = useState('friendly');
  const [nameInput, setNameInput] = useState(DEFAULT_NAME);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const name = localStorage.getItem('studybuddy-name') ?? DEFAULT_NAME;
      const savedTone = localStorage.getItem('studybuddy-tone') ?? 'friendly';
      setBuddyName(name);
      setNameInput(name);
      setTone(savedTone);
      setMessages([GREETING(name)]);
    } catch {
      setMessages([GREETING(DEFAULT_NAME)]);
    }
  }, []);

  useEffect(() => {
    if (open && !showSettings) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, showSettings]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    function handleOpen(e: Event) {
      const { text } = (e as CustomEvent<{ text: string }>).detail ?? {};
      setOpen(true);
      if (text) {
        setTimeout(() => {
          setInput(text);
          inputRef.current?.focus();
        }, 150);
      }
    }
    function handleOutsideClick(e: MouseEvent) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowSettings(false);
      }
    }
    window.addEventListener('studybuddy:open', handleOpen);
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      window.removeEventListener('studybuddy:open', handleOpen);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  function getNotesContext(): string {
    try {
      return localStorage.getItem('unilearn-notes') ?? '';
    } catch {
      return '';
    }
  }

  function saveSettings() {
    const name = nameInput.trim() || DEFAULT_NAME;
    try {
      localStorage.setItem('studybuddy-name', name);
      localStorage.setItem('studybuddy-tone', tone);
    } catch {}
    setBuddyName(name);
    setShowSettings(false);
    setMessages((msgs) => {
      if (msgs.length === 1 && msgs[0].role === 'assistant') return [GREETING(name)];
      return msgs;
    });
  }

  async function sendMessage(text: string = input) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated,
          buddyName,
          tone,
          context: getNotesContext() ? { notes: getNotesContext() } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
      } else {
        setMessages([...updated, { role: 'assistant', content: data.reply }]);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveFlashcards = useCallback((content: string) => {
    const cards = parseFlashcardsFromText(content);
    if (cards.length === 0) return;
    const count = saveFlashcards(cards);
    setSavedMsg(`Saved ${count} flashcard${count !== 1 ? 's' : ''} to your deck.`);
    window.dispatchEvent(new CustomEvent('flashcards:updated'));
    setTimeout(() => setSavedMsg(''), 3000);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const showQuickActions = messages.length <= 1 && !loading;
  const hasNotes = !!getNotesContext().trim();

  return (
    <>
      {open && (
        <div
          ref={panelRef}
          className="chat-panel-enter fixed bottom-24 right-5 z-50 w-80 sm:w-96 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          style={{ height: '540px' }}
        >
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{buddyName}</p>
                <p className="text-white/70 text-xs">Your AI study assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {hasNotes && (
                <span className="text-white/60 text-xs bg-white/10 px-2 py-0.5 rounded-full hidden sm:inline">Notes attached</span>
              )}
              <button
                onClick={() => setShowSettings((v) => !v)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-transform duration-200 hover:scale-95"
              >
                <Settings className="w-3.5 h-3.5 text-white" />
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setShowSettings(false);
                }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-transform duration-200 hover:scale-95"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="shrink-0 bg-slate-50 border-b border-slate-100 px-4 py-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Assistant name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={24}
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Tone</label>
                <div className="flex gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`flex-1 py-1.5 text-xs rounded-xl border transition-all duration-200 hover:scale-[0.98] ${
                        tone === t.value
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-medium'
                          : 'border-slate-200 text-muted-foreground hover:border-slate-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={saveSettings}
                className="w-full py-1.5 rounded-xl text-xs font-medium text-white transition-all duration-200 hover:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              >
                Save settings
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={`message-enter flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5 max-w-[78%]">
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap transition-all duration-200 ${
                      msg.role === 'user'
                        ? 'text-white rounded-tr-sm'
                        : 'bg-slate-50 border border-slate-100 text-foreground rounded-tl-sm'
                    }`}
                    style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' } : {}}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'assistant' && parseFlashcardsFromText(msg.content).length >= 2 && (
                    <button
                      onClick={() => handleSaveFlashcards(msg.content)}
                      className="self-start flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 border border-violet-100 rounded-full text-xs font-medium text-violet-700 hover:bg-violet-100 transition-all duration-200 hover:scale-[0.98]"
                    >
                      <Save className="w-3 h-3" />
                      Save {parseFlashcardsFromText(msg.content).length} flashcards
                    </button>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-3 py-2.5 flex flex-col gap-1.5 min-w-[150px]">
                  <span className="text-xs text-muted-foreground">StudyBuddy is thinking...</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-xs text-destructive bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-center">{error}</p>}
            {savedMsg && <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-center">{savedMsg}</p>}

            {showQuickActions && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(label)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-all duration-200 hover:scale-[0.98]"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-3 border-t border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-200">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${buddyName}...`}
                maxLength={1000}
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground/50 outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-40 shrink-0 hover:scale-95 active:scale-90"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed right-5 bottom-24 sm:bottom-28 z-50 transition-all duration-200">
        {!open && (
          <span
            className="ping-slow absolute inset-0 rounded-full"
            style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)', opacity: 0.3 }}
          />
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)' }}
          aria-label={`Open ${buddyName}`}
        >
          {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        </button>
      </div>
    </>
  );
}
