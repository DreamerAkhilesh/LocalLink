import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Cart from './Cart';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
    setIsMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(/[\s._-]+/).map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : 'U';

  const navLinks = [
    ...(isAuthenticated
      ? [{ to: '/dashboard', label: 'Dashboard' }]
      : [{ to: '/', label: 'Home' }]
    ),
    { to: '/products', label: 'Products' },
    { to: '/services', label: 'Services' },
  ];

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="ll-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">

          {/* ── Brand ── */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 shrink-0 no-underline"
            style={{ color: 'inherit' }}
          >
            {/* Animated Logo */}
            <div style={{
              width: 36, height: 36, flexShrink: 0,
              filter: 'drop-shadow(0 2px 8px rgba(124,58,237,0.35))',
              transition: 'transform 0.35s cubic-bezier(.25,.46,.45,.94), filter 0.35s ease',
            }}
              className="brand-logo"
            >
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="llGrad" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#llGrad)" />
                {/* LL letters */}
                <text x="5" y="22" fill="white" fontSize="14" fontWeight="800" fontFamily="Inter,sans-serif" letterSpacing="-1">LL</text>
              </svg>
            </div>

            <div className="flex flex-col leading-none gap-px">
              <span style={{
                fontWeight: 800,
                fontSize: '1.1rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                background: 'linear-gradient(90deg,var(--text) 0%,var(--text) 35%,#7c3aed 50%,#a78bfa 62%,var(--text) 75%,var(--text) 100%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 4s ease-in-out infinite',
              }}>
                Local Link
              </span>
              <span style={{ fontSize: '0.58rem', color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.04em', opacity: 0.75 }}>
                Community Marketplace
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  fontWeight: 500,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  color: isActive(to) ? 'var(--accent)' : 'var(--text-secondary)',
                  background: isActive(to) ? 'var(--accent-glow)' : 'transparent',
                  position: 'relative',
                }}
              >
                {label}
                {isActive(to) && (
                  <span style={{
                    position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
                    width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)',
                    display: 'block',
                  }} />
                )}
              </Link>
            ))}
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2">

            {/* Notification bell */}
            {isAuthenticated && <NotificationBell />}

            {/* Cart (customer or guest) */}
            {(!isAuthenticated || user?.role === 'customer') && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all"
                style={{
                  background: 'rgba(124,58,237,0.06)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--accent-glow)';
                  e.currentTarget.style.color = 'var(--accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.06)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: 'linear-gradient(135deg,var(--accent),#a78bfa)',
                    color: 'white', fontSize: '0.62rem', fontWeight: 700,
                    width: 18, height: 18, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(124,58,237,0.4)',
                  }}>
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                {/* Trigger */}
                <button
                  onClick={() => setIsDropdownOpen(v => !v)}
                  className="flex items-center gap-2 rounded-xl transition-all"
                  style={{
                    padding: '4px 10px 4px 4px',
                    cursor: 'pointer',
                    background: isDropdownOpen ? 'var(--accent-glow)' : 'transparent',
                    border: 'none',
                    color: 'inherit',
                  }}
                  onMouseEnter={e => { if (!isDropdownOpen) e.currentTarget.style.background = 'var(--accent-glow)'; }}
                  onMouseLeave={e => { if (!isDropdownOpen) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg,var(--accent),#a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.02em',
                    flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <span className="hidden md:block" style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name}
                  </span>
                  <svg
                    width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5"
                    style={{ transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 256, background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)',
                    padding: 6,
                    zIndex: 100,
                    animation: 'cardFadeUp 0.15s ease',
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 8px' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'linear-gradient(135deg,var(--accent),#a78bfa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                      }}>
                        {initials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                        <span style={{
                          display: 'inline-block', fontSize: '0.64rem', fontWeight: 700,
                          padding: '1px 8px', borderRadius: 4, marginTop: 3,
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          background: user?.role === 'vendor' ? '#fef3c7' : 'var(--accent-100)',
                          color: user?.role === 'vendor' ? '#92400e' : 'var(--accent)',
                        }}>
                          {user?.role === 'vendor' ? 'Vendor' : 'Customer'}
                        </span>
                      </div>
                    </div>

                    <div style={{ height: 1, background: 'var(--border)', margin: '4px 6px' }} />

                    {/* Menu items */}
                    {[
                      { to: '/dashboard', icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />, label: 'Dashboard' },
                      { to: '/profile', icon: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>, label: 'Profile' },
                      ...(user?.role === 'customer' ? [
                        { to: '/orders', icon: <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />, label: 'My Orders' },
                        { to: '/bookings', icon: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />, label: 'My Bookings' },
                      ] : [
                        { to: '/orders', icon: <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />, label: 'Manage Orders' },
                        { to: '/bookings', icon: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />, label: 'Manage Bookings' },
                      ]),
                    ].map(({ to, icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 10px', borderRadius: 9,
                          color: 'var(--text-secondary)', textDecoration: 'none',
                          fontWeight: 500, fontSize: '0.86rem',
                          transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)'; e.currentTarget.style.color = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{icon}</svg>
                        {label}
                      </Link>
                    ))}

                    <div style={{ height: 1, background: 'var(--border)', margin: '4px 6px' }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 10px', borderRadius: 9, width: '100%',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--danger)', fontWeight: 500, fontSize: '0.86rem',
                        fontFamily: 'inherit', textAlign: 'left',
                        transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.86rem' }}>Login</Link>
                <Link to="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.86rem' }}>Get Started</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileOpen(v => !v)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl"
              style={{
                background: 'rgba(124,58,237,0.06)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer',
              }}
            >
              {isMobileOpen ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {isMobileOpen && (
          <div style={{
            borderTop: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            padding: '12px 16px 16px',
            animation: 'cardFadeUp 0.15s ease',
          }}>
            <div className="flex flex-col gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsMobileOpen(false)}
                  style={{
                    padding: '10px 14px', borderRadius: 10, fontWeight: 500, fontSize: '0.92rem',
                    textDecoration: 'none', transition: 'all 0.15s',
                    color: isActive(to) ? 'var(--accent)' : 'var(--text-secondary)',
                    background: isActive(to) ? 'var(--accent-glow)' : 'transparent',
                  }}
                >
                  {label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                  <Link to="/dashboard" onClick={() => setIsMobileOpen(false)} style={{ padding: '10px 14px', borderRadius: 10, fontWeight: 500, fontSize: '0.92rem', textDecoration: 'none', color: 'var(--text-secondary)' }}>Dashboard</Link>
                  <Link to="/profile" onClick={() => setIsMobileOpen(false)} style={{ padding: '10px 14px', borderRadius: 10, fontWeight: 500, fontSize: '0.92rem', textDecoration: 'none', color: 'var(--text-secondary)' }}>Profile</Link>
                  <button onClick={handleLogout} style={{ padding: '10px 14px', borderRadius: 10, fontWeight: 500, fontSize: '0.92rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontFamily: 'inherit' }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                  <Link to="/login" onClick={() => setIsMobileOpen(false)} className="btn-secondary" style={{ textAlign: 'center', marginTop: 4 }}>Login</Link>
                  <Link to="/register" onClick={() => setIsMobileOpen(false)} className="btn-primary" style={{ textAlign: 'center', marginTop: 4 }}>Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Cart Sidebar */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
