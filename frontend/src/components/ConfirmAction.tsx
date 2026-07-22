/**
 * ConfirmAction — Inline popover for confirming destructive actions.
 *
 * Usage:
 *   <ConfirmAction
 *     message="This will permanently delete this record."
 *     onConfirm={handleDelete}
 *     danger
 *   >
 *     <button>Delete</button>
 *   </ConfirmAction>
 */
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/Button';

// ─── Self-inject keyframe animations once ─────────────────────────────────────
const ANIM_ID = 'confirm-action-anim';
if (typeof document !== 'undefined' && !document.getElementById(ANIM_ID)) {
  const style = document.createElement('style');
  style.id = ANIM_ID;
  style.textContent = `
    @keyframes caFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes btnSpin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ConfirmActionProps {
  children: ReactNode;
  message: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  /** Style as a destructive action (red confirm button). Default: true. */
  danger?: boolean;
  /** Disable the entire interaction */
  disabled?: boolean;
  /** Popover position. Default: 'top' */
  position?: 'top' | 'bottom';
  /** Horizontal alignment. Default: 'right' */
  align?: 'left' | 'right';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ConfirmAction({
  children,
  message,
  description,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = true,
  disabled = false,
  position = 'top',
  align = 'right',
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const popoverPosition: React.CSSProperties =
    position === 'top'
      ? { bottom: 'calc(100% + 8px)', top: 'auto' }
      : { top: 'calc(100% + 8px)', bottom: 'auto' };

  const popoverAlign: React.CSSProperties =
    align === 'right' ? { right: 0 } : { left: 0 };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger */}
      <div
        onClick={() => { if (!disabled) setOpen((v) => !v); }}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
      >
        {children}
      </div>

      {/* Popover */}
      {open && (
        <div
          style={{
            position: 'absolute',
            zIndex: 2000,
            ...popoverPosition,
            ...popoverAlign,
            width: 272,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            padding: 16,
            animation: 'caFadeIn 150ms ease forwards',
          }}
        >
          {/* Icon + Message */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: danger ? '#fee2e2' : '#fef3c7',
                color: danger ? '#dc2626' : '#92400e',
              }}
            >
              <AlertTriangle size={15} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#111827',
                  fontFamily: 'Poppins, Inter, sans-serif',
                  lineHeight: 1.4,
                }}
              >
                {message}
              </p>
              {description && (
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: 12,
                    color: '#6b7280',
                    fontFamily: 'Poppins, Inter, sans-serif',
                    lineHeight: 1.5,
                  }}
                >
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              {cancelText}
            </Button>
            <Button
              variant={danger ? 'danger' : 'primary'}
              size="sm"
              onClick={handleConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
