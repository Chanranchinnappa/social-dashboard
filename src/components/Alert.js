import React from 'react';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { Button } from './Button';

const VARIANT_CONFIG = {
  success: { icon: CheckCircle, class: 'alert-success' },
  info: { icon: Info, class: 'alert-info' },
  warning: { icon: AlertTriangle, class: 'alert-warning' },
  error: { icon: AlertCircle, class: 'alert-error' },
};

export const Alert = React.forwardRef(function Alert(
  {
    variant = 'info',
    title,
    description,
    icon: IconProp,
    dismissible = false,
    onDismiss,
    actions = [],
    children,
    className = '',
  },
  ref
) {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;
  const DefaultIcon = config.icon;
  const IconComponent = IconProp || DefaultIcon;

  return (
    <div
      ref={ref}
      className={['alert', config.class, className].filter(Boolean).join(' ')}
      role="alert"
    >
      <div className="alert-content">
        <IconComponent
          size={20}
          className="alert-icon"
          aria-hidden="true"
        />
        <div className="alert-body">
          {title && <h4 className="alert-title">{title}</h4>}
          {description && (
            <p className="alert-description">{description}</p>
          )}
          {children}
        </div>
      </div>
      <div className="alert-actions">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        ))}
        {dismissible && (
          <button
            type="button"
            className="alert-dismiss-btn"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
});
