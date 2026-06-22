export default function Skeleton({ type = 'card', className = '' }) {
  return (
    <div className={`skeleton ${type} ${className}`}>
      {type === 'kpi' && (
        <>
          <div className="skeleton-line short" />
          <div className="skeleton-line" />
        </>
      )}
      {type === 'card' && (
        <>
          <div className="skeleton-line short" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line short" />
        </>
      )}
      {type === 'list' && (
        <>
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </>
      )}
      {type === 'chart' && (
        <div className="skeleton-chart" />
      )}
      {type === 'avatar' && (
        <div className="skeleton-avatar" />
      )}
    </div>
  );
}
