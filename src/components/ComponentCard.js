export default function ComponentCard({ children, className = '', loading, skeletonType = 'card' }) {
  if (loading) {
    return <div className={`card ${className}`}><div className="skeleton-line" /></div>;
  }

  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
}
