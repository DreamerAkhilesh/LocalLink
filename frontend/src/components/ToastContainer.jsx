import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useToastState } from '../context/ToastContext';

/**
 * ToastContainer — pixel-faithful React port of the demo's ToastContainer.vue.
 * Renders into document.body via a portal so it is never clipped by overflow/z-index.
 */

const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

const STYLES = {
  success: {
    background: 'rgba(22,163,74,0.12)',
    color: '#15803d',
    borderColor: 'rgba(22,163,74,0.22)',
  },
  error: {
    background: 'rgba(220,38,38,0.12)',
    color: '#b91c1c',
    borderColor: 'rgba(220,38,38,0.22)',
  },
  warning: {
    background: 'rgba(234,179,8,0.12)',
    color: '#a16207',
    borderColor: 'rgba(234,179,8,0.22)',
  },
  info: {
    background: 'rgba(124,58,237,0.10)',
    color: '#6d28d9',
    borderColor: 'rgba(124,58,237,0.20)',
  },
};

const Toast = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 260);
  };

  const style = STYLES[toast.type] || STYLES.info;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '13px 16px',
        borderRadius: 13,
        fontSize: '0.9rem',
        fontWeight: 600,
        lineHeight: 1.4,
        pointerEvents: 'auto',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${style.borderColor}`,
        background: style.background,
        color: style.color,
        fontFamily: 'inherit',
        maxWidth: 420,
        width: '100%',
        willChange: 'transform, opacity',
        transition: 'transform 0.28s cubic-bezier(.21,1.02,.73,1), opacity 0.28s ease',
        opacity: visible && !leaving ? 1 : 0,
        transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(60px) scale(0.95)',
      }}
    >
      <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{ICONS[toast.type]}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          opacity: 0.5,
          lineHeight: 1,
          padding: '0 2px',
          color: 'inherit',
          fontFamily: 'inherit',
          flexShrink: 0,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={e => (e.currentTarget.style.opacity = 0.5)}
      >
        &times;
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToastState();

  if (toasts.length === 0) return null;

  return ReactDOM.createPortal(
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 420,
        width: 'calc(100vw - 48px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
