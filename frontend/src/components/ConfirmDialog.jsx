import React from 'react';
import { AlertTriangle, Trash2, XCircle, HelpCircle } from 'lucide-react';

/**
 * Reusable confirmation modal — drop-in replacement for window.confirm().
 *
 * Props:
 *   isOpen        boolean          – controls visibility
 *   title         string           – bold heading
 *   message       string|ReactNode – body text (supports JSX)
 *   confirmLabel  string           – confirm button label (default: "Confirm")
 *   cancelLabel   string           – cancel button label  (default: "Cancel")
 *   variant       'danger'|'warning'|'info'  (default: 'danger')
 *   onConfirm     () => void       – called when user clicks confirm
 *   onCancel      () => void       – called when user clicks cancel / backdrop
 */
const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const themes = {
    danger: {
      iconBg: 'var(--error-bg)',
      icon:   <XCircle size={26} color="var(--error)" />,
      btnBg:  'var(--error)',
      btnHover: '#b71c1c',
    },
    warning: {
      iconBg: 'var(--warning-bg)',
      icon:   <AlertTriangle size={26} color="var(--warning)" />,
      btnBg:  'var(--warning)',
      btnHover: '#e65100',
    },
    info: {
      iconBg: 'var(--primary-light)',
      icon:   <HelpCircle size={26} color="var(--primary)" />,
      btnBg:  'var(--primary)',
      btnHover: 'var(--primary-hover)',
    },
  };

  const t = themes[variant] ?? themes.danger;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px',
        animation: 'cdFadeIn 0.15s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '420px', width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
          animation: 'cdSlideUp 0.2s cubic-bezier(0.16,1,0.3,1)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Icon badge */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: t.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
        }}>
          {t.icon}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.2rem', fontWeight: 800,
          color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.3,
        }}>
          {title}
        </h3>

        {/* Body */}
        <p style={{
          fontSize: '0.9rem', color: 'var(--text-secondary)',
          lineHeight: 1.65, marginBottom: '28px',
        }}>
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '12px' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px',
              backgroundColor: t.btnBg, color: '#fff',
              border: 'none', borderRadius: 'var(--radius)',
              fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer', transition: 'var(--transition)',
            }}
            onMouseOver={e => (e.currentTarget.style.filter = 'brightness(0.88)')}
            onMouseOut={e  => (e.currentTarget.style.filter = 'none')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cdFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cdSlideUp {
          from { transform: translateY(20px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
