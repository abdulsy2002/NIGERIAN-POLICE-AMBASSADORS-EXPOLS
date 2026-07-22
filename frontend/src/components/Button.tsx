import { type ReactNode, type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const styles: Record<string, Record<string, string | number>> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    border: 'none',
    borderRadius: 8,
    fontFamily: 'Poppins, Inter, sans-serif',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 150ms, opacity 150ms, transform 80ms',
    whiteSpace: 'nowrap',
  },
  primary:   { background: '#003366', color: '#ffffff' },
  secondary: { background: '#f1f5f9', color: '#374151', border: '1px solid #e5e7eb' },
  danger:    { background: '#dc2626', color: '#ffffff' },
  ghost:     { background: 'transparent', color: '#374151' },
  sm: { padding: '5px 12px', fontSize: 12 },
  md: { padding: '8px 16px', fontSize: 13 },
  lg: { padding: '11px 22px', fontSize: 14 },
};

const hoverBg: Record<string, string> = {
  primary: '#002147',
  secondary: '#e2e8f0',
  danger: '#b91c1c',
  ghost: '#f1f5f9',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      style={{
        ...styles.base,
        ...styles[variant],
        ...styles[size],
        opacity: isDisabled ? 0.55 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) e.currentTarget.style.background = hoverBg[variant];
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = (styles[variant].background as string) ?? 'transparent';
        onMouseLeave?.(e);
      }}
    >
      {loading ? (
        <span style={{
          width: 12, height: 12, borderRadius: '50%',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          display: 'inline-block',
          animation: 'btnSpin 0.6s linear infinite',
        }} />
      ) : icon}
      {children}
    </button>
  );
}
