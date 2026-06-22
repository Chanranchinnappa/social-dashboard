import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export const Modal = React.forwardRef(function Modal(
  {
    isOpen = false,
    onClose,
    title,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    footer,
    children,
    className = '',
  },
  ref
) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl',
    full: 'modal-full',
  }[size] || 'modal-md';

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className={['modal-overlay', className].filter(Boolean).join(' ')}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={(el) => {
          modalRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        tabIndex={-1}
        className={['modal', sizeClass].filter(Boolean).join(' ')}
      >
        <div className="modal-header">
          {title && (
            <h2 id="modal-title" className="modal-title">{title}</h2>
          )}
          {showCloseButton && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
});
