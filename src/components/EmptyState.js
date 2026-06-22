import React from 'react';
import { Inbox, Plus, AlertCircle, Search, FileText, Users } from 'lucide-react';

const ICON_MAP = {
  inbox: Inbox,
  plus: Plus,
  alert: AlertCircle,
  search: Search,
  file: FileText,
  users: Users,
};

const VARIANT_STYLES = {
  neutral: 'empty-state-neutral',
  info: 'empty-state-info',
  success: 'empty-state-success',
  warning: 'empty-state-warning',
};

export const EmptyState = React.forwardRef(function EmptyState(
  {
    icon = 'inbox',
    title = 'No items found',
    description = 'There\'s nothing to display here. Try adjusting your filters or adding new data.',
    actionLabel,
    onAction,
    variant = 'neutral',
    className = '',
    children,
  },
  ref
) {
  const IconComponent = ICON_MAP[icon] || Inbox;
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.neutral;

  return (
    <div ref={ref} className={[
      'empty-state',
      variantClass,
      className
    ].filter(Boolean).join(' ')}>
      <div className="empty-state-icon">
        <IconComponent size={48} aria-hidden="true" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="empty-state-action"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
      {children && <div className="empty-state-children">{children}</div>}
    </div>
  );
});
