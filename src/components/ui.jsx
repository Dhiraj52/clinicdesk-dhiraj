import { Children, cloneElement, isValidElement, useEffect, useId, useRef } from 'react';
import { STATUS } from '../utils.js';

export function PageTitle({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const statusInfo = STATUS[status];

  return (
    <span className={`badge ${statusInfo?.color || 'gray'}`}>
      {statusInfo?.label || status}
    </span>
  );
}

export function StatusBreakdownList({ appointments }) {
  return (
    <div className="status-counts">
      {Object.entries(STATUS)
        .filter(([key]) => key !== 'booked_late')
        .map(([key, details]) => (
          <div key={key}>
            <span className={`status-dot ${details.color}`} />
            <span>{details.label}</span>
            <strong>
              {appointments.filter(
                (appointment) => appointment.status === key,
              ).length}
            </strong>
          </div>
        ))}
    </div>
  );
}

export function Stat({ label, value, icon, accent }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${accent || ''}`}>{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export function Empty({ title, text, action }) {
  return (
    <div className="empty">
      <span aria-hidden="true">▤</span>
      <strong>{title}</strong>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function Field({ label, error, wide, children }) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const input = Children.map(children, (child) => {
    if (!isValidElement(child) || child.type === 'small') {
      return child;
    }

    return cloneElement(child, {
      id: child.props.id || fieldId,
      'aria-invalid': Boolean(error),
      'aria-describedby': error
        ? errorId
        : child.props['aria-describedby'],
    });
  });
  const labelTarget = Children.toArray(children).find(
    (child) => isValidElement(child) && child.type !== 'small',
  );
  const inputId = labelTarget?.props.id || fieldId;

  return (
    <label className={`field ${wide ? 'wide' : ''}`} htmlFor={inputId}>
      <span>{label}</span>
      {input}
      {error && (
        <small className="error" id={errorId} role="alert">
          {error}
        </small>
      )}
    </label>
  );
}

export function Modal({ title, children, onClose }) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const firstControl = dialogRef.current?.querySelector(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
    );
    (firstControl || dialogRef.current)?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusableElements = dialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [onClose]);

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="modal-head">
          <h3>{title}</h3>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
