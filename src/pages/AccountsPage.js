import React, { useState } from 'react';
import { useAccounts } from '../hooks/useAccounts';
import { ComponentCard } from '../components/ComponentCard';
import { Avatar } from '../components/Avatar';
import { Tag } from '../components/Tag';
import { Button } from '../components/Button';
import { SearchInput } from '../components/SearchInput';
import { EmptyState } from '../components/EmptyState';
import { Skeleton } from '../components/Skeleton';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { supabase } from '../supabaseClient';
import { Users, Plus, Trash2, RefreshCw } from 'lucide-react';

const PLATFORMS = ['instagram', 'twitter', 'youtube', 'linkedin', 'tiktok'];

export default function AccountsPage() {
  const { accounts, loading, error, retry } = useAccounts();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ handle: '', platform: 'instagram', followers_count: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = accounts.filter(a =>
    a.handle?.toLowerCase().includes(search.toLowerCase()) ||
    a.platform?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: err } = await supabase.from('accounts').insert({
        user_id: user.id,
        handle: form.handle,
        platform: form.platform,
        followers_count: parseInt(form.followers_count) || 0,
      });
      if (err) throw err;
      setShowAdd(false);
      setForm({ handle: '', platform: 'instagram', followers_count: '' });
      retry();
    } catch (err) {
      setSaveError(err.message || 'Failed to add account.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { error: err } = await supabase.from('accounts').delete().eq('id', deleteId);
      if (err) throw err;
      setDeleteId(null);
      retry();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n || 0);

  return (
    <div className="accounts-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">Manage your connected social media accounts</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Account
        </Button>
      </div>

      <div className="accounts-toolbar">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search accounts..."
          style={{ maxWidth: 320 }}
        />
        <Button variant="ghost" size="sm" onClick={retry} disabled={loading}>
          <RefreshCw size={15} /> Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="error" style={{ marginBottom: 'var(--space-4)' }}>
          {error} <button className="retry-inline" onClick={retry}>Retry</button>
        </Alert>
      )}

      <div className="accounts-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={120} radius="md" />
          ))
        ) : filtered.length === 0 ? (
          <div className="empty-full">
            <EmptyState
              icon={<Users size={40} />}
              title={search ? 'No matching accounts' : 'No accounts yet'}
              description={search ? 'Try a different search term.' : 'Add your first social media account to get started.'}
              action={!search && { label: 'Add Account', onClick: () => setShowAdd(true) }}
            />
          </div>
        ) : (
          filtered.map(acc => (
            <ComponentCard key={acc.id} className="account-card">
              <div className="account-card-header">
                <Avatar name={acc.handle} size="md" />
                <div className="account-card-info">
                  <span className="account-handle">{acc.handle}</span>
                  <Tag variant={acc.platform} size="sm">{acc.platform}</Tag>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => setDeleteId(acc.id)}
                  title="Remove account"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="account-card-stats">
                <div className="stat-item">
                  <span className="stat-label">Followers</span>
                  <span className="stat-value">{fmt(acc.followers_count)}</span>
                </div>
              </div>
            </ComponentCard>
          ))
        )}
      </div>

      {/* Add Account Modal */}
      <Modal
        isOpen={showAdd}
        onClose={() => { setShowAdd(false); setSaveError(null); }}
        title="Add Social Account"
        size="sm"
      >
        <form onSubmit={handleAdd} className="add-form">
          {saveError && <Alert variant="error">{saveError}</Alert>}
          <div className="form-group">
            <label className="form-label">Handle / Username</label>
            <input
              className="form-input"
              placeholder="@username"
              value={form.handle}
              onChange={e => setForm(f => ({ ...f, handle: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Platform</label>
            <select
              className="form-input"
              value={form.platform}
              onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
            >
              {PLATFORMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Followers Count</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 12000"
              value={form.followers_count}
              onChange={e => setForm(f => ({ ...f, followers_count: e.target.value }))}
              min="0"
            />
          </div>
          <div className="form-actions">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>Add Account</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Remove Account"
        size="sm"
      >
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          Are you sure you want to remove this account? This action cannot be undone.
        </p>
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Remove</Button>
        </div>
      </Modal>

      <style>{`
        .accounts-page { padding: var(--space-6); }
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-5);
          gap: var(--space-3);
        }
        .page-title { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text-primary); margin: 0 0 var(--space-1); }
        .page-subtitle { color: var(--color-text-secondary); margin: 0; }
        .accounts-toolbar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
          flex-wrap: wrap;
        }
        .accounts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: var(--space-4);
        }
        .empty-full { grid-column: 1 / -1; }
        .account-card-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }
        .account-card-info { flex: 1; display: flex; flex-direction: column; gap: var(--space-1); }
        .account-handle { font-weight: 600; color: var(--color-text-primary); font-size: var(--font-size-sm); }
        .delete-btn {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: var(--space-1);
          border-radius: var(--radius-sm);
          transition: color var(--transition-fast);
        }
        .delete-btn:hover { color: var(--color-error); }
        .account-card-stats { display: flex; gap: var(--space-4); }
        .stat-item { display: flex; flex-direction: column; gap: 2px; }
        .stat-label { font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-value { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-text-primary); }
        .add-form { display: flex; flex-direction: column; gap: var(--space-4); }
        .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
        .form-label { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-primary); }
        .form-input {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          font-size: var(--font-size-base);
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }
        .form-input:focus { border-color: var(--color-primary); }
        .form-actions { display: flex; justify-content: flex-end; gap: var(--space-2); margin-top: var(--space-2); }
        .retry-inline { background: none; border: none; color: var(--color-primary); cursor: pointer; text-decoration: underline; }
        @media (max-width: 480px) {
          .accounts-page { padding: var(--space-4); }
          .page-header { flex-direction: column; }
          .accounts-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
