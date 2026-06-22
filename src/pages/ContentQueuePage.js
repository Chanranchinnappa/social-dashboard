import React, { useState } from 'react';
import { useContentQueue } from '../hooks/useContentQueue';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { SearchInput } from '../components/SearchInput';
import { Tag } from '../components/Tag';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { EmptyState } from '../components/EmptyState';
import { supabase } from '../supabaseClient';
import { Plus, FileText, Download } from 'lucide-react';

const STATUS_OPTIONS = ['draft', 'scheduled', 'published', 'failed'];
const PLATFORM_OPTIONS = ['instagram', 'twitter', 'youtube', 'linkedin', 'tiktok'];

export default function ContentQueuePage() {
  const { queue, loading, error, retry } = useContentQueue();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', platform: 'instagram', status: 'draft', scheduled_at: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const filtered = queue.filter(item => {
    const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: err } = await supabase.from('content_queue').insert({
        user_id: user.id,
        title: form.title,
        platform: form.platform,
        status: form.status,
        scheduled_at: form.scheduled_at || null,
      });
      if (err) throw err;
      setShowAdd(false);
      setForm({ title: '', platform: 'instagram', status: 'draft', scheduled_at: '' });
      retry();
    } catch (err) {
      setSaveError(err.message || 'Failed to add content.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Platform', 'Status', 'Scheduled At', 'Created At'];
    const rows = filtered.map(item => [
      item.title || '',
      item.platform || '',
      item.status || '',
      item.scheduled_at || '',
      item.created_at || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'content-queue.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'title', label: 'Title', sortable: true, render: (v) => <span className="content-title">{v}</span> },
    { key: 'platform', label: 'Platform', sortable: true, render: (v) => <Tag variant={v} size="sm">{v}</Tag> },
    { key: 'status', label: 'Status', sortable: true, render: (v) => (
      <Tag variant={v === 'published' ? 'success' : v === 'scheduled' ? 'info' : v === 'failed' ? 'error' : 'default'} size="sm">{v}</Tag>
    )},
    { key: 'scheduled_at', label: 'Scheduled', sortable: true, render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'created_at', label: 'Created', sortable: true, render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Content Queue</h1>
          <p className="page-subtitle">Schedule and track your content across platforms</p>
        </div>
        <div className="header-actions">
          <Button variant="ghost" size="sm" onClick={handleExportCSV} disabled={filtered.length === 0}>
            <Download size={15} /> Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add Content
          </Button>
        </div>
      </div>

      <div className="content-toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search content..." style={{ maxWidth: 280 }} />
        <div className="status-filters">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              className={`filter-chip ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="error" style={{ marginBottom: 'var(--space-4)' }}>
          {error} <button className="retry-inline" onClick={retry}>Retry</button>
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={loading}
        emptyTitle="No content found"
        emptyDescription={search || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'Add your first piece of content to get started.'}
        sortable
        defaultSortKey="created_at"
        defaultSortDirection="desc"
      />

      {/* Add Content Modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setSaveError(null); }} title="Add Content" size="sm">
        <form onSubmit={handleAdd} className="add-form">
          {saveError && <Alert variant="error">{saveError}</Alert>}
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="Content title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Platform</label>
            <select className="form-input" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
              {PLATFORM_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Scheduled Date (optional)</label>
            <input className="form-input" type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
          </div>
          <div className="form-actions">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>Add Content</Button>
          </div>
        </form>
      </Modal>

      <style>{`
        .content-page { padding: var(--space-6); }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-5); gap: var(--space-3); }
        .page-title { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text-primary); margin: 0 0 var(--space-1); }
        .page-subtitle { color: var(--color-text-secondary); margin: 0; }
        .header-actions { display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap; }
        .content-toolbar { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-5); flex-wrap: wrap; }
        .status-filters { display: flex; gap: var(--space-2); flex-wrap: wrap; }
        .filter-chip {
          padding: var(--space-1) var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          background: transparent;
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .filter-chip.active, .filter-chip:hover {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        .content-title { font-weight: 500; color: var(--color-text-primary); }
        .add-form { display: flex; flex-direction: column; gap: var(--space-4); }
        .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
        .form-label { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-primary); }
        .form-input { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-primary); color: var(--color-text-primary); font-size: var(--font-size-base); outline: none; width: 100%; box-sizing: border-box; }
        .form-input:focus { border-color: var(--color-primary); }
        .form-actions { display: flex; justify-content: flex-end; gap: var(--space-2); margin-top: var(--space-2); }
        .retry-inline { background: none; border: none; color: var(--color-primary); cursor: pointer; text-decoration: underline; }
        @media (max-width: 480px) {
          .content-page { padding: var(--space-4); }
          .page-header { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
