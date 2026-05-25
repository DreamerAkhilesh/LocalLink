import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StatCard = ({ label, value, sub, color = '#7c3aed', icon }) => (
  <div style={{
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 16, padding: '20px 24px',
    display: 'flex', alignItems: 'center', gap: 16,
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
      background: `${color}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.5rem',
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color, marginTop: 1, fontWeight: 600 }}>{sub}</div>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = stats
    ? stats.vendors.pending + stats.products.pending + stats.services.pending
    : 0;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          🛡️ Admin Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: '0.9rem' }}>
          Platform overview and pending approvals
        </p>
      </div>

      {/* Pending alert */}
      {!loading && pendingCount > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <span style={{ color: '#92400e', fontWeight: 600, fontSize: '0.9rem' }}>
            {pendingCount} item{pendingCount !== 1 ? 's' : ''} waiting for your review
            {stats.vendors.pending > 0 && ` · ${stats.vendors.pending} vendor${stats.vendors.pending !== 1 ? 's' : ''}`}
            {stats.products.pending > 0 && ` · ${stats.products.pending} product${stats.products.pending !== 1 ? 's' : ''}`}
            {stats.services.pending > 0 && ` · ${stats.services.pending} service${stats.services.pending !== 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard icon="👥" label="Total Users" value={stats?.users.total} sub={`${stats?.users.vendors} vendors`} />
            <StatCard icon="🏪" label="Vendors" value={stats?.users.vendors}
              sub={`${stats?.vendors.pending} pending approval`} color="#f59e0b" />
            <StatCard icon="📦" label="Products" value={stats?.products.total}
              sub={`${stats?.products.pending} pending · ${stats?.products.active} active`} color="#10b981" />
            <StatCard icon="🔧" label="Services" value={stats?.services.total}
              sub={`${stats?.services.pending} pending · ${stats?.services.active} active`} color="#3b82f6" />
            <StatCard icon="🛒" label="Total Orders" value={stats?.orders} color="#8b5cf6" />
            <StatCard icon="📅" label="Total Bookings" value={stats?.bookings} color="#ec4899" />
          </div>

          {/* Quick links */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 24,
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {[
                { to: '/admin/vendors', label: '🏪 Review Vendors', badge: stats?.vendors.pending },
                { to: '/admin/products', label: '📦 Review Products', badge: stats?.products.pending },
                { to: '/admin/services', label: '🔧 Review Services', badge: stats?.services.pending },
              ].map(({ to, label, badge }) => (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 10,
                  background: 'rgba(124,58,237,0.06)', border: '1px solid var(--border)',
                  color: 'var(--text)', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; e.currentTarget.style.color = 'var(--text)'; }}
                >
                  {label}
                  {badge > 0 && (
                    <span style={{
                      background: '#ef4444', color: 'white', borderRadius: 10,
                      fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px',
                    }}>{badge}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
