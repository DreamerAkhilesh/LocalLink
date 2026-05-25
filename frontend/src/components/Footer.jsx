import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--text)', color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 32px 28px' }}>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 40, marginBottom: 36 }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '-0.02em',
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
              }}>LL</div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', letterSpacing: '-0.01em' }}>Local Link</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.5)', maxWidth: 280 }}>
              Connecting local businesses and customers in a community-based marketplace.
              Supporting local commerce through transparency and trust.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 18 }}>
              {[
                // Twitter
                <path key="tw" d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />,
                // Instagram
                <><rect key="ig-r" x="2" y="2" width="20" height="20" rx="5" ry="5" /><path key="ig-p" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line key="ig-l" x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></>,
                // LinkedIn
                <><path key="li-p" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect key="li-r" x="2" y="9" width="4" height="12" /><circle key="li-c" cx="4" cy="4" r="2" /></>,
              ].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{ color: 'rgba(255,255,255,0.35)', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#c4b5fd')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{icon}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.38)', marginBottom: 16 }}>Explore</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                { to: '/products', label: 'Browse Products' },
                { to: '/services', label: 'Find Services' },
                { to: '/register?role=vendor', label: 'Become a Vendor' },
                { to: '/', label: 'How it Works' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    style={{ color: 'rgba(255,255,255,0.58)', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#c4b5fd')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.58)')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.38)', marginBottom: 16 }}>Account</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Register' },
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/profile', label: 'Profile' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    style={{ color: 'rgba(255,255,255,0.58)', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#c4b5fd')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.58)')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.38)', marginBottom: 16 }}>Support</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(label => (
                <li key={label}>
                  <a
                    href="#"
                    style={{ color: 'rgba(255,255,255,0.58)', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#c4b5fd')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.58)')}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            © 2026 Local Link. All rights reserved. Built for community empowerment.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Made with <span style={{ color: '#a78bfa' }}>♥</span> for local communities
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
