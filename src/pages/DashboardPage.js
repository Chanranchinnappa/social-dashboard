import React, { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useMetrics } from '../hooks/useMetrics';
import { useAccounts } from '../hooks/useAccounts';
import { KPICard } from '../components/KPICard';
import { ChartContainer } from '../components/ChartContainer';
import { ComponentCard } from '../components/ComponentCard';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { Tag } from '../components/Tag';
import {
  Users, Heart, MessageCircle, Share2,
  TrendingUp, Eye, BarChart2
} from 'lucide-react';

const COLORS = {
  instagram: 'var(--color-primary)',
  twitter: 'var(--color-info)',
  youtube: 'var(--color-error)',
  linkedin: 'var(--color-success)',
};

export default function DashboardPage() {
  const { metrics, loading: mLoading, error: mError, retry: mRetry } = useMetrics();
  const { accounts, loading: aLoading, error: aError, retry: aRetry } = useAccounts();

  const kpis = useMemo(() => {
    if (!metrics.length) return {};
    return metrics.reduce((acc, m) => ({
      followers: (acc.followers || 0) + (m.followers || 0),
      likes: (acc.likes || 0) + (m.likes || 0),
      comments: (acc.comments || 0) + (m.comments || 0),
      shares: (acc.shares || 0) + (m.shares || 0),
      impressions: (acc.impressions || 0) + (m.impressions || 0),
      engagement_rate: Math.max(acc.engagement_rate || 0, m.engagement_rate || 0),
    }), {});
  }, [metrics]);

  const trendData = useMemo(() => {
    const byDate = {};
    metrics.forEach(m => {
      const date = m.recorded_at ? m.recorded_at.slice(0, 10) : 'Unknown';
      if (!byDate[date]) byDate[date] = { date, likes: 0, comments: 0, impressions: 0 };
      byDate[date].likes += m.likes || 0;
      byDate[date].comments += m.comments || 0;
      byDate[date].impressions += m.impressions || 0;
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
  }, [metrics]);

  const platformData = useMemo(() => {
    const byPlatform = {};
    metrics.forEach(m => {
      const p = m.platform || 'unknown';
      if (!byPlatform[p]) byPlatform[p] = { platform: p, followers: 0, engagement: 0 };
      byPlatform[p].followers += m.followers || 0;
      byPlatform[p].engagement += m.engagement_rate || 0;
    });
    return Object.values(byPlatform);
  }, [metrics]);

  const fmt = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n || 0);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your social media performance at a glance</p>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        {mLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="kpi-skeleton">
              <Skeleton height={100} radius="md" />
            </div>
          ))
        ) : mError ? (
          <div className="error-row">
            <span>Failed to load metrics.</span>
            <button className="retry-btn" onClick={mRetry}>Retry</button>
          </div>
        ) : (
          <>
            <KPICard title="Total Followers" value={fmt(kpis.followers)} icon={<Users size={20} />} color="primary" />
            <KPICard title="Total Likes" value={fmt(kpis.likes)} icon={<Heart size={20} />} color="error" />
            <KPICard title="Comments" value={fmt(kpis.comments)} icon={<MessageCircle size={20} />} color="warning" />
            <KPICard title="Shares" value={fmt(kpis.shares)} icon={<Share2 size={20} />} color="info" />
            <KPICard title="Impressions" value={fmt(kpis.impressions)} icon={<Eye size={20} />} color="success" />
            <KPICard title="Peak Eng. Rate" value={`${(kpis.engagement_rate || 0).toFixed(2)}%`} icon={<TrendingUp size={20} />} color="primary" />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <ChartContainer
          title="Engagement Trend (14 Days)"
          loading={mLoading}
          error={mError}
          onRetry={mRetry}
        >
          {trendData.length === 0 ? (
            <EmptyState icon={<BarChart2 size={32} />} title="No trend data" description="Metrics will appear here once recorded." size="sm" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="likes" stroke="var(--color-primary)" strokeWidth={2} dot={false} name="Likes" />
                <Line type="monotone" dataKey="comments" stroke="var(--color-success)" strokeWidth={2} dot={false} name="Comments" />
                <Line type="monotone" dataKey="impressions" stroke="var(--color-warning)" strokeWidth={2} dot={false} name="Impressions" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        <ChartContainer
          title="Followers by Platform"
          loading={mLoading}
          error={mError}
          onRetry={mRetry}
        >
          {platformData.length === 0 ? (
            <EmptyState icon={<BarChart2 size={32} />} title="No platform data" description="Connect accounts to see platform breakdown." size="sm" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="platform" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)'
                  }}
                />
                <Bar dataKey="followers" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Followers" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </div>

      {/* Connected Accounts */}
      <ComponentCard title="Connected Accounts" loading={aLoading} error={aError} onRetry={aRetry}>
        {accounts.length === 0 && !aLoading ? (
          <EmptyState title="No accounts connected" description="Go to Accounts to add your social media profiles." size="sm" />
        ) : (
          <div className="accounts-list">
            {accounts.map(acc => (
              <div key={acc.id} className="account-row">
                <div className="account-info">
                  <span className="account-handle">{acc.handle}</span>
                  <Tag variant={acc.platform} size="sm">{acc.platform}</Tag>
                </div>
                <div className="account-stats">
                  <span className="stat-item"><Users size={14} /> {fmt(acc.followers_count)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ComponentCard>

      <style>{`
        .dashboard-page { padding: var(--space-6); }
        .page-header { margin-bottom: var(--space-6); }
        .page-title { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text-primary); margin: 0 0 var(--space-1); }
        .page-subtitle { color: var(--color-text-secondary); margin: 0; }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        .kpi-skeleton { width: 100%; }
        .error-row {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          gap: var(--space-3);
          color: var(--color-error);
        }
        .retry-btn {
          padding: var(--space-1) var(--space-3);
          border: 1px solid var(--color-error);
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--color-error);
          cursor: pointer;
          font-size: var(--font-size-sm);
        }
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        @media (min-width: 900px) {
          .charts-grid { grid-template-columns: 1fr 1fr; }
        }
        .accounts-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .account-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3);
          background: var(--color-bg-primary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }
        .account-info { display: flex; align-items: center; gap: var(--space-2); }
        .account-handle { font-weight: 500; color: var(--color-text-primary); font-size: var(--font-size-sm); }
        .account-stats { display: flex; align-items: center; gap: var(--space-2); color: var(--color-text-secondary); font-size: var(--font-size-sm); }
        .stat-item { display: flex; align-items: center; gap: var(--space-1); }
        @media (max-width: 480px) {
          .dashboard-page { padding: var(--space-4); }
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
