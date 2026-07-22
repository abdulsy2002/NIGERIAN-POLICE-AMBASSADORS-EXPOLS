import { useState, useRef, useEffect, type ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DropdownItemConfig {
  label?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void | Promise<void>;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItemConfig[];
  header?: ReactNode;
  align?: 'left' | 'right';
  width?: number | string;
}

// ─── Keyframe animation injected once ────────────────────────────────────────
const ANIM_ID = 'dropdown-fade-anim';
if (typeof document !== 'undefined' && !document.getElementById(ANIM_ID)) {
  const style = document.createElement('style');
  style.id = ANIM_ID;
  style.textContent = `
    @keyframes ddFadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dropdown({
  trigger,
  items,
  header,
  align = 'right',
  width = 200,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
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

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger */}
      <div onClick={() => setOpen((v) => !v)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>

      {/* Dropdown Panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            zIndex: 2000,
            top: 'calc(100% + 8px)',
            [align === 'right' ? 'right' : 'left']: 0,
            width: width,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            animation: 'ddFadeIn 120ms ease forwards',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          {header && (
            <div
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              {header}
            </div>
          )}

          {/* Items */}
          <div style={{ padding: '4px 0' }}>
            {items.map((item, i) => {
              if (item.divider) {
                return (
                  <div
                    key={i}
                    style={{
                      height: 1,
                      backgroundColor: '#f3f4f6',
                      margin: '4px 0',
                    }}
                  />
                );
              }

              return (
                <button
                  key={i}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setOpen(false);
                    if (item.onClick) await item.onClick();
                  }}
                  disabled={item.disabled}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    opacity: item.disabled ? 0.4 : 1,
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: 'Poppins, Inter, sans-serif',
                    color: item.danger ? '#dc2626' : '#374151',
                    textAlign: 'left',
                    transition: 'background 100ms, color 100ms',
                  }}
                  onMouseEnter={(e) => {
                    if (!item.disabled) {
                      e.currentTarget.style.backgroundColor = item.danger ? '#fee2e2' : '#f1f5f9';
                      e.currentTarget.style.color = item.danger ? '#b91c1c' : '#003366';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = item.danger ? '#dc2626' : '#374151';
                  }}
                >
                  {item.icon && (
                    <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </span>
                  )}
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
