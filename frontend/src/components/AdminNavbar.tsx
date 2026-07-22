"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutAdmin } from '@/app/actions';
import { SideDrawer } from '@/components/SideDrawer';
import { Menu, LayoutDashboard } from 'lucide-react';

type ActiveTab = 'overview' | 'alumni' | 'ambassadors' | 'reunion' | 'messages' | 'broadcast' | 'gallery' | 'leadership' | 'reunion-settings' | 'audit-logs' | 'manage-admins' | 'support' | 'payments' | 'payment-settings' | 'profile-requests';

interface AdminNavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  data: {
    alumni: any[];
    ambassadors: any[];
    reunions: any[];
    messages: any[];
  };
  galleryImages: any[];
  boardMembers: any[];
  adminRole?: string;
}

export default function AdminNavbar({ 
  activeTab, 
  setActiveTab, 
  data, 
  galleryImages, 
  boardMembers, 
  adminRole
}: AdminNavbarProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/admin/login');
  };

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
  };

  return (
    <>
      <header className="admin-navbar" style={{ position: 'relative', zIndex: 900 }}>
        <div className="admin-navbar-container" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Hamburger Menu */}
          <button 
            onClick={() => setDrawerOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#111827',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '8px'
            }}
          >
            <Menu size={28} />
          </button>

          {/* Logo/Brand */}
          <div className="admin-brand" style={{ margin: 0 }}>
            <img src="/profile.jpeg" alt="Logo" className="admin-logo" />
            <div className="admin-brand-text">
              <h2>NPAE Admin</h2>
              <span>National Management Panel</span>
            </div>
          </div>
        </div>
      </header>

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="left"
        width={320}
        title="Admin Navigation"
        icon={<LayoutDashboard size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
          <button onClick={() => handleNavClick('overview')} className={`admin-nav-btn ${activeTab === 'overview' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
            📊 Overview
          </button>
          <button onClick={() => handleNavClick('alumni')} className={`admin-nav-btn ${activeTab === 'alumni' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'space-between' }}>
            <span>👥 Alumni</span> <span className="nav-count">{data.alumni.length}</span>
          </button>
          <button onClick={() => handleNavClick('ambassadors')} className={`admin-nav-btn ${activeTab === 'ambassadors' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'space-between' }}>
            <span>🌟 Ambassadors</span> <span className="nav-count">{data.ambassadors.length}</span>
          </button>
          <button onClick={() => handleNavClick('reunion')} className={`admin-nav-btn ${activeTab === 'reunion' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'space-between' }}>
            <span>🎫 Reunion</span> <span className="nav-count">{data.reunions.length}</span>
          </button>
          <button onClick={() => handleNavClick('messages')} className={`admin-nav-btn ${activeTab === 'messages' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'space-between' }}>
            <span>✉️ Messages</span> <span className="nav-count">{data.messages.length}</span>
          </button>
          <button onClick={() => handleNavClick('broadcast')} className={`admin-nav-btn ${activeTab === 'broadcast' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
            📢 Broadcast
          </button>
          <button onClick={() => handleNavClick('gallery')} className={`admin-nav-btn ${activeTab === 'gallery' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'space-between' }}>
            <span>🖼️ Gallery</span> <span className="nav-count">{galleryImages.length}</span>
          </button>
          <button onClick={() => handleNavClick('leadership')} className={`admin-nav-btn ${activeTab === 'leadership' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'space-between' }}>
            <span>🏛️ Leadership</span> <span className="nav-count">{boardMembers.length}</span>
          </button>
          <button onClick={() => handleNavClick('profile-requests')} className={`admin-nav-btn ${activeTab === 'profile-requests' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
            🔄 Profile Requests
          </button>
          <button onClick={() => handleNavClick('reunion-settings')} className={`admin-nav-btn ${activeTab === 'reunion-settings' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
            ⚙️ Reunion Settings
          </button>
          <button onClick={() => handleNavClick('audit-logs')} className={`admin-nav-btn ${activeTab === 'audit-logs' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
            🔒 Audit Logs
          </button>
          
          {adminRole === 'super_admin' && (
            <button onClick={() => handleNavClick('manage-admins')} className={`admin-nav-btn ${activeTab === 'manage-admins' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
              👤 Manage Admins
            </button>
          )}
          
          <button onClick={() => handleNavClick('support')} className={`admin-nav-btn ${activeTab === 'support' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
            🎫 Support
          </button>
          <button onClick={() => handleNavClick('payments')} className={`admin-nav-btn ${activeTab === 'payments' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
            💳 Payments
          </button>
          <button onClick={() => handleNavClick('payment-settings')} className={`admin-nav-btn ${activeTab === 'payment-settings' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
            ⚙️ Payment Settings
          </button>

          <div style={{ height: '1px', background: '#e5e7eb', margin: '16px 0' }} />

          <Link href="/admin/profile" onClick={() => setDrawerOpen(false)} className="admin-nav-btn admin-profile-btn" style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
            👤 My Profile
          </Link>
          <Link href="/" onClick={() => setDrawerOpen(false)} className="admin-nav-btn admin-back-btn" style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
            ← Back to Site
          </Link>
          <button onClick={handleLogout} className="admin-nav-btn admin-logout-btn" style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}>
            🚪 Logout
          </button>
        </div>
      </SideDrawer>
    </>
  );
}