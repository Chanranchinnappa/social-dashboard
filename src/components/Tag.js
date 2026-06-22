export default function Tag({ label, variant = 'default', onClick }) {
  const variants = {
    default: 'tag-default',
    success: 'tag-success',
    warning: 'tag-warning',
    error: 'tag-error',
    info: 'tag-info',
  };

  return (
    <span
      className={`tag ${variants[variant] || variants.default}`}
      onClick={onClick}
    >
      {label}
    </span>
  );
}
