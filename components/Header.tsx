'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, LogOut, Trash2, User, Flame, X } from 'lucide-react';
import { getStreakCount } from '@/lib/streak';
import { getFlashcards } from '@/lib/flashcards';

interface HeaderProps {
  focusMode: boolean;
  onToggleFocus: () => void;
}

export default function Header({ focusMode, onToggleFocus }: HeaderProps) {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [streak, setStreak] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStreak(getStreakCount());
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSignOut() {
    setShowMenu(false);
    await signOut();
    router.push('/');
  }

  async function handleDeleteAccount() {
    if (!session) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error ?? 'Failed to delete account.');
        return;
      }
      await signOut();
      router.push('/');
    } catch {
      setDeleteError('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  function handleExport() {
    try {
      const notes = localStorage.getItem('unilearn-notes') ?? '';
      const flashcards = getFlashcards();
      const studyDates = JSON.parse(localStorage.getItem('unilearn-study-dates') ?? '[]');
      const data = { version: '1.0', exportedAt: new Date().toISOString(), notes, flashcards, studyDates };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unilearn-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string;
        const data = JSON.parse(raw);
        if (!data.version) throw new Error('Invalid format');
        if (typeof data.notes === 'string') localStorage.setItem('unilearn-notes', data.notes);
        if (Array.isArray(data.flashcards)) {
          localStorage.setItem('unilearn-flashcards', JSON.stringify(data.flashcards));
          window.dispatchEvent(new CustomEvent('flashcards:updated'));
        }
        if (Array.isArray(data.studyDates)) localStorage.setItem('unilearn-study-dates', JSON.stringify(data.studyDates));
        setImportMsg('✅ Data imported successfully. Refresh to see your notes.');
        setTimeout(() => setImportMsg(''), 4000);
      } catch {
        setImportMsg('❌ Invalid file. Please use a UniLearn export.');
        setTimeout(() => setImportMsg(''), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">UniLearn</h1>
              <p className="text-sm text-muted-foreground mt-0.5">All-in-one study platform</p>
            </div>

            <div className="flex items-center gap-2">
              {streak > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-full">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs font-semibold text-orange-600">{streak}</span>
                </div>
              )}

              <button
                onClick={onToggleFocus}
                title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-[0.98] active:scale-95 ${focusMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
              >
                <span className="hidden sm:inline">{focusMode ? 'Focus On' : 'Focus'}</span>
              </button>

              <button
                onClick={() => setShowExport(true)}
                title="Export / Import"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 hover:scale-[0.98] active:scale-95"
              >
                <span className="hidden sm:inline">Export</span>
              </button>

              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary hidden sm:inline-flex">Admin</Link>

              {!loading && (user ? (
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setShowMenu((v) => !v)} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-all duration-200 hover:scale-[0.98] active:scale-95">
                    <User className="w-4 h-4 shrink-0" />
                    <span className="max-w-[120px] truncate hidden sm:inline">{user.email}</span>
                    <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-slate-100 py-1.5 z-20">
                      <div className="px-4 py-2 border-b border-slate-100"><p className="text-xs text-muted-foreground truncate">{user.email}</p></div>
                      <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-slate-50 transition-colors"><LogOut className="w-4 h-4 text-muted-foreground" />Log Out</button>
                      <div className="border-t border-slate-100 mx-2 my-1" />
                      <button onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); setDeleteError(''); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" />Delete Account</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary">Log In</Link>
                  <Link href="/signup" className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 hover:scale-[0.98] active:scale-95 shadow-sm">Sign Up</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {showExport && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Export / Import</h2>
              <button onClick={() => { setShowExport(false); setImportMsg(''); }} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all duration-200 hover:scale-95 active:scale-90"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Download your notes, flashcards, and study data as JSON, or restore from a previous export.</p>
            <div className="space-y-3">
              <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-[0.98] active:scale-95" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>Download Export (.json)</button>
              <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-slate-100 border border-slate-200 text-foreground hover:bg-slate-200 transition-all duration-200 hover:scale-[0.98] active:scale-95">Import from file</button>
              <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            </div>
            {importMsg && <p className={`text-xs mt-3 px-3 py-2 rounded-xl border text-center ${importMsg.startsWith('✅') ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-200'}`}>{importMsg}</p>}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-foreground mb-2">Delete Account</h2>
            <p className="text-sm text-muted-foreground mb-4">This will permanently delete your account. This action <strong>cannot be undone</strong>.</p>
            {deleteError && <p className="text-sm text-destructive bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">{deleteError}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }} disabled={deleting} className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-foreground hover:bg-slate-200 transition-all duration-200 hover:scale-[0.98] active:scale-95 disabled:opacity-50">Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all duration-200 hover:scale-[0.98] active:scale-95 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
