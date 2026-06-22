import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ title, value, change, trend, loading, icon: Icon }) {
  if (loading) {
    return (
      <div className="card kpi-card">
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    );
  }

  return (
    <div className="card kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {Icon && <Icon className="kpi-icon" size={20} />}
      </div>
      <div className="kpi-value">{value}</div>
      {change !== undefined && (
        <div className={`kpi-change ${trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'neutral'}`}>
          {trend === 'up' && <TrendingUp size={14} />}
          {trend === 'down' && <TrendingDown size={14} />}
          {trend === 'neutral' && <Minus size={14} />}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
