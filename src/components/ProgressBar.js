export default function ProgressBar({ value, max = 100, label, loading }) {
  if (loading) {
    return <div className="skeleton-line medium" />;
  }

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="progress-container">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      <div className="progress-value">{percentage.toFixed(0)}%</div>
    </div>
  );
}
