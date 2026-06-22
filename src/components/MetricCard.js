import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, unit, subtext, trend, loading }) {
  if (loading) {
    return (
      <div className="card metric-card">
        <div className="skeleton-line short" />
        <div className="skeleton-line medium" />
        <div className="skeleton-line short" />
      </div>
    );
  }

  return (
    <div className="card metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      {subtext && <div className="metric-subtext">{subtext}</div>}
      {trend !== undefined && (
        <div className={`metric-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trend > 0 ? '+' : ''}{trend}%</span>
        </div>
      )}
    </div>
  );
}
