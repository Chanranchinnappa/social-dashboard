import React, { useMemo } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useMetrics } from '../hooks/useMetrics';
import { useAccounts } from '../hooks/useAccounts';
import { ChartContainer } from '../components/ChartContainer';
import { MetricCard } from '../components/MetricCard';
import { ComponentCard } from '../components/ComponentCard';
import { Skeleton } from '../components/Skeleton';
import { ProgressBar } from '../components/ProgressBar';
import { Tag } from '../components/Tag';
import { EmptyState } from '../components/EmptyState';
import { Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react';

export default function EngagementPage() {
  const { metrics, loading: mLoading, error: mError, retry: mRetry } = useMetrics();
  const { accounts, loading: aLoading } = useAccounts();

  const platformEngagement = useMemo(() => {
    const byPlatform = {};
    metrics.forEach(m => {
      const p = m.platform || 'unknown';
      if (!byPlatform[p]) byPlatform[p] = { platform: p, likes: 0, comments: 0, shares: 0, count: 0 };
      byPlatform[p].likes += m.likes || 0;
      byPlatform[p].comments += m.comments || 0;
      byPlatform[p].shares += m.shares || 0;
      byPlatform[p].count += 1;
    });
    return Object.values(byPlatform);
  }, [metrics]);

  const totals = useMemo(() => metrics.reduce((acc, m) => ({
    likes: acc.likes + (m.likes || 0),
    comments: acc.comments + (m.comments || 0),
    shares: acc.shares + (m.shares || 0),
    engagement_rate: Math.max(acc.engagement_rate, m.engagement_rate || 0),
  }), { likes: 0, comments: 0, shares: 0, engagement_rate: 0 }), [metrics]);

  const radarData = platformEngagement.map(p => ({
    platform: p.platform,
    Likes: p.likes,
    Comments: p.comments,
    Shares: p.shares,
  }));

  const maxEngagement = Math.max(...platformEngagement.map(p => p.likes + p.comments + p.shares), 1);

  const fmt = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n || 0);

  return (
    <div className="engagement-page">
      <div className="page-header">
        <h1 className="page-title">Engagement</h1>
        <p className="page-subtitle">Deep dive into your audience interactions</p>
      </div>

      {/* Metric Cards */}
      <div className="metric-row">
        {mLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={80} radius="md" />)
        ) : (
          <>
            <MetricCard
              title="Total Likes"
              value={fmt(totals.likes)}
              icon={<Heart size={18} />}
              color="error"
            />
            <MetricCard
              title="Total Comments"
              value={fmt(totals.comments)}
              icon={<MessageCircle size={18} />}
              color="warning"
            />
            <MetricCard
              title="Total Shares"
              value={fmt(totals.shares)}
              icon={<Share2 size={18} />}
              color="info"
            />
            <MetricCard
              title="Peak Eng. Rate"
              value={`${totals.engagement_rate.toFixed(2)}%`}
              icon={<TrendingUp size={18} />}
              color="success"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <ChartContainer title="Engagement by Platform" loading={mLoading} error={mError} onRetry={mRetry}>
          {platformEngagement.length === 0 ? (
            <EmptyState title="No engagement data" description="Metrics will appear once recorded." size="sm" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={platformEngagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="platform" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }} />
                <Legend />
                <Bar dataKey="likes" fill="var(--color-error)" name="Likes" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comments" fill="var(--color-warning)" name="Comments" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shares" fill="var(--color-info)" name="Shares" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        <ChartContainer title="Engagement Radar" loading={mLoading} error={mError} onRetry={mRetry}>
          {radarData.length < 3 ? (
            <EmptyState title="Not enough data" description="Need data from 3+ platforms for radar view." size="sm" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="platform" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                <Radar name="Likes" dataKey="Likes" stroke="var(--color-error)" fill="var(--color-error)" fillOpacity={0.3} />
                <Radar name="Comments" dataKey="Comments" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.3} />
                <Legend />
                <Tooltip contentStyle={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </div>

      {/* Platform Breakdown */}
      <ComponentCard title="Platform Engagement Breakdown">
        {mLoading ? (
          <Skeleton height={200} radius="md" />
        ) : platformEngagement.length === 0 ? (
          <EmptyState title="No platform data" size="sm" />
        ) : (
          <div className="platform-list">
            {platformEngagement.map(p => {
              const total = p.likes + p.comments + p.shares;
              const pct = Math.round((total / maxEngagement) * 100);
              return (
                <div key={p.platform} className="platform-row">
                  <div className="platform-header">
                    <Tag variant={p.platform} size="sm">{p.platform}</Tag>
                    <span className="platform-total">{fmt(total)} interactions</span>
                  </div>
                  <ProgressBar value={pct} max={100} color="primary" showLabel />
                  <div className="platform-breakdown">
                    <span><Heart size={12} /> {fmt(p.likes)}</span>
                    <span><MessageCircle size={12} /> {fmt(p.comments)}</span>
                    <span><Share2 size={12} /> {fmt(p.shares)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ComponentCard>

      <style>{`
        .engagement-page { padding: var(--space-6); }
        .page-header { margin-bottom: var(--space-6); }
        .page-title { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text-primary); margin: 0 0 var(--space-1); }
        .page-subtitle { color: var(--color-text-secondary); margin: 0; }
        .metric-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        @media (min-width: 900px) { .charts-grid { grid-template-columns: 1fr 1fr; } }
        .platform-list { display: flex; flex-direction: column; gap: var(--space-5); }
        .platform-row { display: flex; flex-direction: column; gap: var(--space-2); }
        .platform-header { display: flex; align-items: center; justify-content: space-between; }
        .platform-total { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
        .platform-breakdown {
          display: flex;
          gap: var(--space-4);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }
        .platform-breakdown span { display: flex; align-items: center; gap: var(--space-1); }
        @media (max-width: 480px) {
          .engagement-page { padding: var(--space-4); }
          .metric-row { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
