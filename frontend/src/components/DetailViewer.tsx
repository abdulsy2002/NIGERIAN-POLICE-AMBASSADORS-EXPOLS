import type { ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DetailItem {
  label: string;
  /** The value to display. Can be a string, number, or any React node (e.g. a StatusBadge). */
  value: ReactNode;
  /** Render the value in monospace font (good for IDs, emails, codes). */
  mono?: boolean;
  /** How many grid columns this item spans (1 or 2). Default: 1. */
  span?: 1 | 2;
  /** If true, the item will be hidden */
  hidden?: boolean;
}

interface DetailViewerProps {
  /** Optional section title */
  title?: string;
  /** Optional subtitle / description under the title */
  subtitle?: string;
  items: DetailItem[];
  /** Number of columns in the grid. Default: 2. */
  columns?: 1 | 2 | 3;
  /** Extra class for the outer wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DetailViewer({
  title,
  subtitle,
  items,
  columns = 2,
  className = '',
}: DetailViewerProps) {
  const visibleItems = items.filter(i => !i.hidden);

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--bg-surface, #ffffff)',
        border: '1px solid var(--border-default, #e5e7eb)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Section Header */}
      {(title || subtitle) && (
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle, #f3f4f6)',
        }}>
          {title && (
            <p className="text-h3" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #111827)' }}>
              {title}
            </p>
          )}
          {subtitle && (
            <p className="text-body-sm" style={{ margin: '3px 0 0', fontSize: '0.875rem', color: 'var(--text-tertiary, #6b7280)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Grid of Items */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '1px',
        backgroundColor: 'var(--border-subtle, #f3f4f6)',
      }}>
        {visibleItems.map((item, i) => (
          <div
            key={i}
            style={{
              gridColumn: item.span === 2 ? `span ${Math.min(item.span, columns)}` : 'span 1',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              padding: '14px 20px',
            }}
          >
            <p className="text-label" style={{ margin: '0 0 5px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary, #6b7280)' }}>
              {item.label}
            </p>
            {typeof item.value === 'string' || typeof item.value === 'number' ? (
              <p style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-primary, #111827)',
                fontFamily: item.mono ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
                wordBreak: 'break-word',
              }}>
                {item.value ?? '—'}
              </p>
            ) : (
              <div>{item.value ?? <span style={{ color: 'var(--text-tertiary, #6b7280)', fontSize: 13 }}>—</span>}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
