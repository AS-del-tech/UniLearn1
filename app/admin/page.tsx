'use client';

import { useState } from 'react';
import Link from 'next/link';

type WidgetType = 'ai' | 'embed' | 'utility';
type InputType = 'text' | 'url' | 'none';

interface Widget {
  id: string;
  name: string;
  type: WidgetType;
  inputType: InputType;
  endpoint?: string;
}

interface FeedbackEntry {
  id: string;
  message: string;
  name?: string;
  timestamp: string;
}

const EMPTY_WIDGET: Widget = { id: '', name: '', type: 'utility', inputType: 'none', endpoint: '' };

type Tab = 'widgets' | 'feedback';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('widgets');

  // Widgets state
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Widget>({ ...EMPTY_WIDGET });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<Widget>({ ...EMPTY_WIDGET });
  const [addError, setAddError] = useState('');

  // Feedback state
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackLoaded, setFeedbackLoaded] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/widgets', {
        headers: { 'x-admin-password': password },
      });
      if (res.status === 401) { setAuthError('Incorrect password.'); return; }
      if (!res.ok) { setAuthError('Server error. Please try again.'); return; }
      const data = await res.json();
      setWidgets(data.widgets ?? []);
      setAuthed(true);
    } catch {
      setAuthError('Network error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadFeedback() {
    if (feedbackLoaded) return;
    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      const res = await fetch('/api/admin/feedback', {
        headers: { 'x-admin-password': password },
      });
      if (!res.ok) { setFeedbackError('Failed to load feedback.'); return; }
      const data = await res.json();
      setFeedback(data.feedback ?? []);
      setFeedbackLoaded(true);
    } catch {
      setFeedbackError('Network error.');
    } finally {
      setFeedbackLoading(false);
    }
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === 'feedback') loadFeedback();
  }

  async function saveWidgets(updated: Widget[]) {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ widgets: updated }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error ?? 'Failed to save.'); return false; }
      setWidgets(data.widgets);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      return true;
    } catch {
      setSaveError('Network error.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    const updated = widgets.map((w) => w.id === editingId ? { ...editForm, endpoint: editForm.endpoint || undefined } : w);
    const ok = await saveWidgets(updated);
    if (ok) setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete widget "${id}"?`)) return;
    await saveWidgets(widgets.filter((w) => w.id !== id));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    if (!addForm.id.trim() || !/^[a-z0-9-]+$/.test(addForm.id)) {
      setAddError('ID must be lowercase letters, numbers, and dashes only.');
      return;
    }
    if (widgets.some((w) => w.id === addForm.id)) { setAddError('A widget with this ID already exists.'); return; }
    if (!addForm.name.trim()) { setAddError('Name is required.'); return; }
    const ok = await saveWidgets([...widgets, { ...addForm, endpoint: addForm.endpoint || undefined }]);
    if (ok) { setShowAddForm(false); setAddForm({ ...EMPTY_WIDGET }); setAddError(''); }
  }

  const inputClass = "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all";
  const selectClass = "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all";

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          <h1 className="text-xl font-bold text-foreground mb-1">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter the admin password to continue.</p>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className={inputClass}
            />
            {authError && <p className="text-sm text-destructive">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading || !password}
              className="w-full px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? 'Checking...' : 'Login'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage widget configuration</p>
          </div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary">
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {(['widgets', 'feedback'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {saveError && (
          <div className="text-sm text-destructive bg-red-50 border border-red-200 rounded-xl px-4 py-3">{saveError}</div>
        )}
        {saveSuccess && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">Widgets saved successfully.</div>
        )}

        {/* Widgets Tab */}
        {activeTab === 'widgets' && (
          <div className="space-y-3">
            {widgets.map((widget) => (
              <div key={widget.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                {editingId === widget.id ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-3">Editing: {widget.id}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Name</label>
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className={inputClass} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Type</label>
                        <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as WidgetType })} className={selectClass}>
                          <option value="utility">utility</option>
                          <option value="ai">ai</option>
                          <option value="embed">embed</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Input Type</label>
                        <select value={editForm.inputType} onChange={(e) => setEditForm({ ...editForm, inputType: e.target.value as InputType })} className={selectClass}>
                          <option value="none">none</option>
                          <option value="text">text</option>
                          <option value="url">url</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Endpoint (optional)</label>
                        <input value={editForm.endpoint ?? ''} onChange={(e) => setEditForm({ ...editForm, endpoint: e.target.value })} placeholder="/api/ai/..." className={inputClass} />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-foreground hover:bg-slate-200 transition-all">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{widget.name}</span>
                        <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg px-2 py-0.5 font-medium">{widget.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{widget.id}</p>
                      <p className="text-xs text-muted-foreground">
                        inputType: <span className="text-foreground">{widget.inputType}</span>
                        {widget.endpoint && <>{' · '}endpoint: <span className="text-foreground font-mono">{widget.endpoint}</span></>}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setEditingId(widget.id); setEditForm({ ...widget, endpoint: widget.endpoint ?? '' }); setShowAddForm(false); }} className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-foreground hover:bg-slate-200 transition-all">Edit</button>
                      <button onClick={() => handleDelete(widget.id)} className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs text-destructive hover:bg-red-100 transition-all">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {showAddForm ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-3">New Widget</p>
                <form onSubmit={handleAdd} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">ID</label>
                      <input value={addForm.id} onChange={(e) => setAddForm({ ...addForm, id: e.target.value.toLowerCase() })} placeholder="my-widget" required className={inputClass} />
                      <p className="text-xs text-muted-foreground mt-1">Lowercase, letters, numbers, dashes</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Name</label>
                      <input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="My Widget" required className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Type</label>
                      <select value={addForm.type} onChange={(e) => setAddForm({ ...addForm, type: e.target.value as WidgetType })} className={selectClass}>
                        <option value="utility">utility</option>
                        <option value="ai">ai</option>
                        <option value="embed">embed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Input Type</label>
                      <select value={addForm.inputType} onChange={(e) => setAddForm({ ...addForm, inputType: e.target.value as InputType })} className={selectClass}>
                        <option value="none">none</option>
                        <option value="text">text</option>
                        <option value="url">url</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground block mb-1">Endpoint (optional)</label>
                      <input value={addForm.endpoint ?? ''} onChange={(e) => setAddForm({ ...addForm, endpoint: e.target.value })} placeholder="/api/ai/..." className={inputClass} />
                    </div>
                  </div>
                  {addError && <p className="text-sm text-destructive">{addError}</p>}
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm disabled:opacity-50">
                      {saving ? 'Adding...' : 'Add Widget'}
                    </button>
                    <button type="button" onClick={() => { setShowAddForm(false); setAddForm({ ...EMPTY_WIDGET }); setAddError(''); }} className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-foreground hover:bg-slate-200 transition-all">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button onClick={() => { setShowAddForm(true); setEditingId(null); }} className="w-full px-4 py-3 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-sm text-muted-foreground hover:text-foreground hover:border-indigo-300 transition-all">
                + Add widget
              </button>
            )}
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-3">
            {feedbackLoading && (
              <div className="text-sm text-muted-foreground text-center py-8 animate-pulse">Loading feedback...</div>
            )}
            {feedbackError && (
              <div className="text-sm text-destructive bg-red-50 border border-red-200 rounded-xl px-4 py-3">{feedbackError}</div>
            )}
            {!feedbackLoading && feedbackLoaded && feedback.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No feedback yet.</p>
              </div>
            )}
            {feedback.map((entry) => (
              <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <p className="text-sm text-foreground leading-relaxed mb-3">{entry.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    {entry.name ? entry.name : 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
