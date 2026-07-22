"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logoutUser } from "@/app/actions";
import { SideDrawer } from "@/components/SideDrawer";
import { Home, Info, UserPlus, Users, Image, Mail, HelpCircle, BadgeCheck, Crown, Headset, CreditCard, LayoutDashboard, LogIn, LogOut, Shield, ChevronDown, User } from "lucide-react";
import Dropdown from "@/components/Dropdown";

const NAV_LINKS = [
  { href: "/",            label: "Home",          icon: <Home size={18} /> },
  { href: "/about",       label: "About",         icon: <Info size={18} /> },
  { href: "/registration",label: "Registration",  icon: <UserPlus size={18} /> },
  { href: "/reunion",     label: "Reunion",       icon: <Users size={18} /> },
  { href: "/gallery",     label: "Gallery",       icon: <Image size={18} /> },
  { href: "/contact",     label: "Contact",       icon: <Mail size={18} /> },
  { href: "/faqs",        label: "FAQs",          icon: <HelpCircle size={18} /> },
  { href: "/validate",    label: "Validate User", icon: <BadgeCheck size={18} /> },
  { href: "/leadership",  label: "Leadership",    icon: <Crown size={18} /> },
  { href: "/support",     label: "Support",       icon: <Headset size={18} /> },
  { href: "/payment",     label: "Payment",       icon: <CreditCard size={18} /> },
];

export default function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    setDrawerOpen(false);
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  const authLinks = isLoggedIn
    ? [{ href: "/dashboard", label: "My Dashboard", icon: <LayoutDashboard size={18} /> }]
    : [
        { href: "/login",       label: "Login",        icon: <LogIn size={18} /> },
        { href: "/admin/login", label: "Admin Panel",  icon: <Shield size={18} /> },
      ];

  const allLinks = [...NAV_LINKS, ...authLinks];

  return (
    <>
      <header id="main-header">
        <div className="container">
          <nav>
            {/* Left side: hamburger + logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button
                className="menu-toggle"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                style={{ display: 'flex', background: 'transparent', border: 'none', padding: 0 }}
              >
                <span className="hamburger"></span>
              </button>

              <Link href="/" className="logo" style={{ margin: 0 }}>
                <img src="/profile.jpeg" alt="EX-POLS Logo" className="logo-img" />
                <span>EX-POLS </span>
              </Link>
            </div>

            {/* Right side: account dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

              {isLoggedIn ? (
                /* ── Logged-in account dropdown ── */
                <Dropdown
                  align="right"
                  width={210}
                  trigger={
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '7px 14px 7px 10px',
                      borderRadius: 30,
                      border: '1px solid #e5e7eb',
                      background: '#f8f9fc',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#003366',
                    }}>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={14} />
                      </span>
                      My Account
                      <ChevronDown size={14} style={{ color: '#6b7280' }} />
                    </div>
                  }
                  header={
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#003366' }}>EX-POLS Member</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>Member Portal</p>
                    </div>
                  }
                  items={[
                    { label: 'My Dashboard', icon: <LayoutDashboard size={14} />, onClick: () => router.push('/dashboard') },
                    { label: 'Support', icon: <Headset size={14} />, onClick: () => router.push('/support') },
                    { label: 'Payment', icon: <CreditCard size={14} />, onClick: () => router.push('/payment') },
                    { divider: true },
                    { label: 'Logout', icon: <LogOut size={14} />, onClick: handleLogout, danger: true },
                  ]}
                />
              ) : (
                /* ── Guest account dropdown ── */
                <Dropdown
                  align="right"
                  width={190}
                  trigger={
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '8px 16px',
                      borderRadius: 30,
                      background: '#003366',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}>
                      Login
                      <ChevronDown size={14} />
                    </div>
                  }
                  items={[
                    { label: 'Member Login', icon: <LogIn size={14} />, onClick: () => router.push('/login') },
                    { divider: true },
                    { label: 'Admin Panel', icon: <Shield size={14} />, onClick: () => router.push('/admin/login') },
                  ]}
                />
              )}

            </div>
          </nav>
        </div>
      </header>

      {/* Side Drawer Navigation */}
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="left"
        width={320}
        title="EX-POLS Navigation"
        icon={<img src="/profile.jpeg" alt="Logo" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />}
      >
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Main nav links */}
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', padding: '8px 8px 4px' }}>
            Menu
          </p>
          {allLinks.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.95rem',
                  color: isActive ? '#003366' : '#374151',
                  background: isActive ? '#dbeafe' : 'transparent',
                  transition: 'background 150ms, color 150ms',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = '#f1f5f9'; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; } }}
              >
                <span style={{ color: isActive ? '#003366' : '#6b7280', display: 'flex' }}>{icon}</span>
                {label}
              </Link>
            );
          })}

          {/* Divider + Auth Actions */}
          <div style={{ height: 1, background: '#e5e7eb', margin: '12px 0' }} />
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', padding: '0 8px 4px' }}>
            Account
          </p>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: '#dc2626',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'background 150ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <Link
              href="/admin/login"
              onClick={() => setDrawerOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: '#003366',
                background: '#dbeafe',
                textDecoration: 'none',
                transition: 'background 150ms',
              }}
            >
              <Shield size={18} />
              Admin Panel
            </Link>
          )}
        </nav>
      </SideDrawer>
    </>
  );
}