import React, { useEffect, useState } from 'react';
import { X, Maximize2, Search } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface SideDrawerSidebarItem {
  id: string;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  tags?: React.ReactNode[];
  onClick: () => void;
}

export interface SideDrawerTab {
  key: string;
  label: string;
  count?: number;
  content: React.ReactNode;
}

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  width?: string | number;

  // Header
  icon?: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  actions?: React.ReactNode;

  // Sidebar
  sidebarItems?: SideDrawerSidebarItem[];
  activeItemId?: string;
  sidebarSearchPlaceholder?: string;
  onSidebarSearch?: (query: string) => void;
  sidebarHeader?: React.ReactNode;

  // Main Content
  tabs?: SideDrawerTab[];
  children?: React.ReactNode;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  open,
  onClose,
  position = 'right',
  width = '90%',
  icon,
  title,
  subtitle,
  actions,
  sidebarItems,
  activeItemId,
  sidebarSearchPlaceholder = 'Search...',
  onSidebarSearch,
  sidebarHeader,
  tabs,
  children,
}) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(tabs?.[0]?.key || '');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (tabs && tabs.length > 0 && !tabs.find((t) => t.key === activeTab)) {
      setActiveTab(tabs[0].key);
    }
  }, [tabs, activeTab]);

  useEffect(() => {
    if (open) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!isRendered) return null;

  const drawerContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [position]: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: width,
          maxWidth: width === '90%' ? '1200px' : 'none',
          boxShadow: position === 'right' ? '-25px 0 60px rgba(0,0,0,0.25)' : '25px 0 60px rgba(0,0,0,0.25)',
          transform: isVisible ? 'translateX(0)' : `translateX(${position === 'right' ? '100%' : '-100%'})`,
          transition: 'transform 300ms ease-out',
          background: '#f8f9fc',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            borderBottom: '1px solid #e5e5e5',
            background: '#ffffff',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {icon && (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#dbeafe',
                  color: '#003366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#003366' }}>{title}</h2>
              {subtitle && <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{subtitle}</p>}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {actions}
            <div style={{ width: 1, height: 24, background: '#e5e5e5', margin: '0 6px' }} />
            <button
              title="Maximise"
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={onClose}
              title="Close"
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body (Split View) */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Sidebar */}
          {sidebarItems && (
            <div
              style={{
                width: 288,
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                borderRight: '1px solid #e5e5e5',
                background: '#f1f3f8',
              }}
            >
              {/* Search */}
              <div style={{ padding: '14px', borderBottom: '1px solid #e5e5e5', flexShrink: 0 }}>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <Search
                    size={14}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                  />
                  <input
                    type="text"
                    placeholder={sidebarSearchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      onSidebarSearch?.(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      paddingLeft: 32,
                      paddingRight: 12,
                      paddingTop: 8,
                      paddingBottom: 8,
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      background: '#ffffff',
                      fontSize: '0.875rem',
                      color: '#111827',
                      outline: 'none',
                    }}
                  />
                </div>
                {sidebarHeader ?? (
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>
                    {sidebarItems.length} Records
                  </div>
                )}
              </div>

              {/* List */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {sidebarItems.map((item) => {
                  const isActive = item.id === activeItemId;
                  return (
                    <div
                      key={item.id}
                      onClick={item.onClick}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #e5e5e5',
                        borderLeft: isActive ? '3px solid #003366' : '3px solid transparent',
                        background: isActive ? '#dbeafe' : 'transparent',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#e9ecf5'; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: isActive ? '#003366' : '#111827', marginBottom: 2 }}>
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: item.tags?.length ? 6 : 0 }}>
                          {item.subtitle}
                        </div>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {item.tags.map((tag, i) => (
                            <React.Fragment key={i}>{tag}</React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Main Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#ffffff' }}>
            {/* Tabs */}
            {tabs && tabs.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #e5e5e5', flexShrink: 0 }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: '12px 16px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      border: 'none',
                      borderBottom: activeTab === tab.key ? '2px solid #003366' : '2px solid transparent',
                      color: activeTab === tab.key ? '#003366' : '#6b7280',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'color 150ms',
                    }}
                  >
                    {tab.label}
                    {tab.count !== undefined && (
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: 99,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          background: activeTab === tab.key ? '#dbeafe' : '#f3f4f6',
                          color: activeTab === tab.key ? '#1e40af' : '#9ca3af',
                        }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f8f9fc' }}>
              {tabs ? tabs.find((t) => t.key === activeTab)?.content : children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};
