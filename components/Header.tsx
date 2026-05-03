'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, LogOut, Trash2, User } from 'lucide-react';

export default function Header() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
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

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                UniLearn
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Study dashboard with AI-powered widgets</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
              >
                Admin
              </Link>

              {!loading && (
                user ? (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowMenu((v) => !v)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-all"
                    >
                      <User className="w-4 h-4 shrink-0" />
                      <span className="max-w-[160px] truncate">{user.email}</span>
                      <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-slate-100 py-1.5 z-20">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-slate-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-muted-foreground" />
                          Log Out
                        </button>
                        <div className="border-t border-slate-100 mx-2 my-1" />
                        <button
                          onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); setDeleteError(''); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-foreground mb-2">Delete Account</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete your account. This action <strong>cannot be undone</strong>.
            </p>
            {deleteError && (
              <p className="text-sm text-destructive bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-foreground hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
