import { User } from 'lucide-react';

export default function Avatar({ src, alt = '', size = 'md', loading }) {
  const sizes = { sm: 28, md: 40, lg: 56 };
  const px = sizes[size] || sizes.md;

  if (loading) {
    return <div className="skeleton-avatar" style={{ width: px, height: px }} />;
  }

  const initials = alt.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="avatar" style={{ width: px, height: px }}>
      {src ? (
        <img src={src} alt={alt} className="avatar-img" />
      ) : (
        <div className="avatar-fallback">
          <User size={px / 1.6} />
        </div>
      )}
    </div>
  );
}
