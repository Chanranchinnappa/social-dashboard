import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  rightIcon: RightIcon,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={[
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth ? 'btn-full' : '',
        isDisabled ? 'btn-disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="btn-spinner" size={16} aria-hidden="true" />
      )}
      {!loading && Icon && (
        <Icon className="btn-icon-left" size={16} aria-hidden="true" />
      )}
      <span className="btn-label">{children}</span>
      {!loading && RightIcon && (
        <RightIcon className="btn-icon-right" size={16} aria-hidden="true" />
      )}
    </button>
  );
}
