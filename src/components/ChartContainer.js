export default function ChartContainer({ title, subtitle, children, loading, className = '' }) {
  if (loading) {
    return (
      <div className={`card chart-container ${className}`}>
        <div className="skeleton-line short" />
        <div className="skeleton-chart" />
      </div>
    );
  }

  return (
    <div className={`card chart-container ${className}`}>
      <div className="chart-header">
        {title && <h3 className="chart-title">{title}</h3>}
        {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      </div>
      <div className="chart-body">
        {children}
      </div>
    </div>
  );
}
