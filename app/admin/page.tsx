'use client';

import { useState, useEffect } from 'react';
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

const EMPTY_WIDGET: Omit<Widget, 'id'> & { id: string } = {
  id: '',
  name: '',
  type: 'utility',
  inputType: 'none',
  endpoint: '',
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [fetchError, setFetchError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Widget>({ ...EMPTY_WIDGET });

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<Widget>({ ...EMPTY_WIDGET });
  const [addError, setAddError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/widgets', {
        headers: { 'x-admin-password': password },
      });
      if (res.status === 401) {
        setAuthError('Incorrect password.');
        return;
      }
      if (!res.ok) {
        setAuthError('Server error. Please try again.');
        return;
      }
      const data = await res.json();
      setWidgets(data.widgets ?? []);
      setAuthed(true);
    } catch {
      setAuthError('Network error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function saveWidgets(updated: Widget[]) {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ widgets: updated }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? 'Failed to save.');
        return false;
      }
      setWidgets(data.widgets);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      return true;
    } catch {
      setSaveError('Network error. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  function startEdit(widget: Widget) {
    setEditingId(widget.id);
    setEditForm({ ...widget, endpoint: widget.endpoint ?? '' });
    setShowAddForm(false);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    const updated = widgets.map((w) => (w.id === editingId ? { ...editForm, endpoint: editForm.endpoint || undefined } : w));
    const ok = await saveWidgets(updated);
    if (ok) setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete widget "${id}"?`)) return;
    const updated = widgets.filter((w) => w.id !== id);
    await saveWidgets(updated);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    if (!addForm.id.trim() || !/^[a-z0-9-]+$/.test(addForm.id)) {
      setAddError('ID must be lowercase letters, numbers, and dashes only.');
      return;
    }
    if (widgets.some((w) => w.id === addForm.id)) {
      setAddError('A widget with this ID already exists.');
      return;
    }
    if (!addForm.name.trim()) {
      setAddError('Name is required.');
      return;
    }
    const newWidget: Widget = { ...addForm, endpoint: addForm.endpoint || undefined };
    const updated = [...widgets, newWidget];
    const ok = await saveWidgets(updated);
    if (ok) {
      setShowAddForm(false);
      setAddForm({ ...EMPTY_WIDGET });
      setAddError('');
    }
  }

  function updateEditForm(field: keyof Widget, value: string) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateAddForm(field: keyof Widget, value: string) {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-lg p-8">
          <h1 className="text-xl font-bold text-foreground mb-1">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter the admin password to continue.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            {authError && <p className="text-sm text-destructive">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading || !password}
              className="w-full px-3 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage widget configuration</p>
          </div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {saveError && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-4 py-3">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-3">
            Widgets saved successfully.
          </div>
        )}

        {/* Widget List */}
        <div className="space-y-3">
          {widgets.map((widget) => (
            <div key={widget.id} className="bg-card border border-border rounded-lg p-5">
              {editingId === widget.id ? (
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
                    Editing: {widget.id}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Name</label>
                      <input
                        value={editForm.name}
                        onChange={(e) => updateEditForm('name', e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Type</label>
                      <select
                        value={editForm.type}
                        onChange={(e) => updateEditForm('type', e.target.value)}
                        className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      >
                        <option value="utility">utility</option>
                        <option value="ai">ai</option>
                        <option value="embed">embed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Input Type</label>
                      <select
                        value={editForm.inputType}
                        onChange={(e) => updateEditForm('inputType', e.target.value)}
                        className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      >
                        <option value="none">none</option>
                        <option value="text">text</option>
                        <option value="url">url</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Endpoint (optional)</label>
                      <input
                        value={editForm.endpoint ?? ''}
                        onChange={(e) => updateEditForm('endpoint', e.target.value)}
                        placeholder="/api/ai/..."
                        className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-secondary border border-border rounded text-sm text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">{widget.name}</span>
                      <span className="text-xs bg-secondary border border-border rounded px-2 py-0.5 text-muted-foreground">
                        {widget.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{widget.id}</p>
                    <p className="text-xs text-muted-foreground">
                      inputType: <span className="text-foreground">{widget.inputType}</span>
                      {widget.endpoint && (
                        <>
                          {' · '}endpoint:{' '}
                          <span className="text-foreground font-mono">{widget.endpoint}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(widget)}
                      className="px-3 py-1.5 bg-secondary border border-border rounded text-xs text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(widget.id)}
                      className="px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Widget */}
        {showAddForm ? (
          <div className="bg-card border border-border rounded-lg p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
              New Widget
            </p>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">ID</label>
                  <input
                    value={addForm.id}
                    onChange={(e) => updateAddForm('id', e.target.value.toLowerCase())}
                    placeholder="my-widget"
                    required
                    className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Lowercase, letters, numbers, dashes</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Name</label>
                  <input
                    value={addForm.name}
                    onChange={(e) => updateAddForm('name', e.target.value)}
                    placeholder="My Widget"
                    required
                    className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Type</label>
                  <select
                    value={addForm.type}
                    onChange={(e) => updateAddForm('type', e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    <option value="utility">utility</option>
                    <option value="ai">ai</option>
                    <option value="embed">embed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Input Type</label>
                  <select
                    value={addForm.inputType}
                    onChange={(e) => updateAddForm('inputType', e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    <option value="none">none</option>
                    <option value="text">text</option>
                    <option value="url">url</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground block mb-1">Endpoint (optional)</label>
                  <input
                    value={addForm.endpoint ?? ''}
                    onChange={(e) => updateAddForm('endpoint', e.target.value)}
                    placeholder="/api/ai/..."
                    className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>
              {addError && <p className="text-sm text-destructive">{addError}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Widget'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setAddForm({ ...EMPTY_WIDGET }); setAddError(''); }}
                  className="px-4 py-2 bg-secondary border border-border rounded text-sm text-foreground hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null); }}
            className="w-full px-4 py-3 bg-secondary border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
          >
            + Add widget
          </button>
        )}

        {fetchError && (
          <p className="text-sm text-destructive">{fetchError}</p>
        )}
      </main>
    </div>
  );
}
