import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect admin and rider to their own dashboards
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
    if (user?.role === 'rider') {
      navigate('/rider', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'rider') {
      fetchDashboardData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (user?.role === 'vendor') {
        const [productsRes, servicesRes, ordersRes, bookingsRes] = await Promise.all([
          api.get('/products/vendor/my-products?limit=5'),
          api.get('/services/vendor/my-services?limit=5'),
          api.get('/orders/vendor?limit=5'),
          api.get('/bookings/vendor/stats'),
        ]);
        setStats({
          totalProducts: productsRes.data.data.pagination?.total || 0,
          totalServices: servicesRes.data.data.pagination?.total || 0,
          totalOrders: ordersRes.data.data.pagination?.total || 0,
          totalBookings: bookingsRes.data.data?.totalBookings || 0,
        });
        setRecentItems([
          ...productsRes.data.data.products.map(p => ({ ...p, type: 'product' })),
          ...servicesRes.data.data.services.map(s => ({ ...s, type: 'service' })),
        ]);
      } else {
        const [ordersRes, bookingsRes] = await Promise.all([
          api.get('/orders?limit=5'),
          api.get('/bookings?limit=5'),
        ]);
        const totalSpent = ordersRes.data.data.orders?.reduce((sum, o) => sum + o.totalAmount, 0) || 0;
        setStats({
          totalOrders: ordersRes.data.data.pagination?.total || 0,
          totalBookings: bookingsRes.data.data.pagination?.total || 0,
          totalSpent,
        });
        setRecentItems([
          ...ordersRes.data.data.orders.map(o => ({ ...o, type: 'order' })),
          ...bookingsRes.data.data.bookings.map(b => ({ ...b, type: 'booking' })),
        ]);
      }
    } catch {
      setStats({ totalProducts: 0, totalServices: 0, totalOrders: 0, totalBookings: 0, totalSpent: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 48px', position: 'relative', zIndex: 1 }}>
      {/* Page header */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
          Welcome back, <span style={{ background: 'linear-gradient(135deg,var(--accent),#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{user?.name?.split(' ')[0]}</span>! 👋
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.92rem', margin: 0 }}>
          {user?.role === 'vendor' ? 'Manage your products, services, and orders' : 'Track your orders and discover local offerings'}
        </p>
      </div>

      {user?.role === 'vendor'
        ? <VendorDashboard stats={stats} recentItems={recentItems} />
        : <CustomerDashboard stats={stats} recentItems={recentItems} />
      }
    </div>
  );
};

/* ── Vendor Dashboard ── */
const VendorDashboard = ({ stats, recentItems }) => {
  const [vendorProfile, setVendorProfile] = useState(null);

  useEffect(() => {
    api.get('/auth/profile').then(r => setVendorProfile(r.data.data.vendorProfile)).catch(() => {});
  }, []);

  const verificationStatus = vendorProfile?.verificationStatus || 'pending';
  const hasLocation = vendorProfile?.location?.coordinates?.[0] !== 0 || vendorProfile?.location?.coordinates?.[1] !== 0;

  const statCards = [
    { label: 'Products', value: stats.totalProducts || 0, icon: '📦', color: 'rgba(37,99,235,0.1)', iconColor: '#2563eb' },
    { label: 'Services', value: stats.totalServices || 0, icon: '🛠️', color: 'rgba(5,150,105,0.1)', iconColor: '#059669' },
    { label: 'Orders', value: stats.totalOrders || 0, icon: '🛒', color: 'rgba(217,119,6,0.1)', iconColor: '#d97706' },
    { label: 'Bookings', value: stats.totalBookings || 0, icon: '📅', color: 'rgba(124,58,237,0.1)', iconColor: 'var(--accent)' },
  ];

  const quickActions = [
    { to: '/products/new', icon: '➕', label: 'Add Product', color: 'rgba(37,99,235,0.1)' },
    { to: '/services/new', icon: '🛠️', label: 'Add Service', color: 'rgba(5,150,105,0.1)' },
    { to: '/orders', icon: '📦', label: 'View Orders', color: 'rgba(217,119,6,0.1)' },
    { to: '/bookings', icon: '📅', label: 'View Bookings', color: 'rgba(124,58,237,0.1)' },
  ];

  return (
    <>
      {/* Verification status banner */}
      {vendorProfile && verificationStatus !== 'verified' && (
        <div className={`rounded-xl px-5 py-4 mb-6 border ${
          verificationStatus === 'rejected'
            ? 'bg-red-50 border-red-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{verificationStatus === 'rejected' ? '❌' : '⏳'}</span>
            <div>
              <p className={`font-semibold ${verificationStatus === 'rejected' ? 'text-red-800' : 'text-yellow-800'}`}>
                {verificationStatus === 'rejected' ? 'Account Rejected' : 'Account Pending Verification'}
              </p>
              <p className={`text-sm mt-0.5 ${verificationStatus === 'rejected' ? 'text-red-700' : 'text-yellow-700'}`}>
                {verificationStatus === 'rejected'
                  ? `Your vendor account was rejected. ${vendorProfile?.verificationNote ? `Reason: ${vendorProfile.verificationNote}` : 'Please contact support.'}`
                  : 'Your account is under review by our admin team. You can add products and services once approved.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Location missing banner */}
      {vendorProfile && !hasLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">📍</span>
          <div className="flex-1">
            <p className="font-semibold text-blue-800">Business location not set</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Customers using location-based search won't find your products or services. Set your location now.
            </p>
          </div>
          <Link to="/profile" className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            Set Location
          </Link>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }} className="stats-row">
        {statCards.map(({ label, value, icon, color }) => (
          <div key={label} className="glass-card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14, animation: 'cardFadeUp 0.4s ease both' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{icon}</div>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
              <p style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1 }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-card" style={{ padding: '22px 24px', marginBottom: 22 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>⚡ Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }} className="actions-row">
          {quickActions.map(({ to, icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="action-card"
            >
              <div className="action-card__icon" style={{ background: color }}>{icon}</div>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent listings */}
      <div className="glass-card" style={{ padding: '22px 24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>📋 Recent Listings</h2>
        {recentItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentItems.slice(0, 5).map(item => (
              <div key={`${item.type}-${item._id}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.5)', border: '1px solid var(--border)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0, fontSize: '1rem',
                    background: item.type === 'product' ? 'rgba(37,99,235,0.1)' : 'rgba(5,150,105,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{item.type === 'product' ? '📦' : '🛠️'}</div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.92rem' }}>{item.name || item.title}</p>
                    <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: 0 }}>
                      {item.type === 'product' ? `₹${item.price}/${item.unit}` : `₹${item.basePrice}/${item.priceUnit?.replace('per-', '')}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`badge ${item.isActive ? 'badge--green' : 'badge--red'}`}>{item.isActive ? 'Active' : 'Inactive'}</span>
                  <Link to={`/${item.type}s/${item._id}/edit`} style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>Edit →</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏪</div>
            <p style={{ color: 'var(--muted)', marginBottom: 18 }}>No listings yet. Start by adding your first product or service!</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link to="/products/new" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>Add Product</Link>
              <Link to="/services/new" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>Add Service</Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) { .stats-row { grid-template-columns: 1fr 1fr !important; } .actions-row { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .stats-row { grid-template-columns: 1fr 1fr !important; } .actions-row { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </>
  );
};

/* ── Customer Dashboard ── */
const CustomerDashboard = ({ stats, recentItems }) => {
  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders || 0, icon: '🛒', color: 'rgba(37,99,235,0.1)' },
    { label: 'Total Bookings', value: stats.totalBookings || 0, icon: '📅', color: 'rgba(5,150,105,0.1)' },
    { label: 'Total Spent', value: `₹${stats.totalSpent || 0}`, icon: '💰', color: 'rgba(217,119,6,0.1)' },
  ];

  const quickActions = [
    { to: '/products', icon: '🛒', label: 'Browse Products', color: 'rgba(37,99,235,0.1)' },
    { to: '/services', icon: '🔧', label: 'Find Services', color: 'rgba(5,150,105,0.1)' },
    { to: '/orders', icon: '📦', label: 'My Orders', color: 'rgba(217,119,6,0.1)' },
    { to: '/bookings', icon: '📅', label: 'My Bookings', color: 'rgba(124,58,237,0.1)' },
  ];

  return (
    <>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }} className="stats-row">
        {statCards.map(({ label, value, icon, color }) => (
          <div key={label} className="glass-card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14, animation: 'cardFadeUp 0.4s ease both' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{icon}</div>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
              <p style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1 }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-card" style={{ padding: '22px 24px', marginBottom: 22 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>⚡ Explore Local</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }} className="actions-row">
          {quickActions.map(({ to, icon, label, color }) => (
            <Link key={to} to={to} className="action-card">
              <div className="action-card__icon" style={{ background: color }}>{icon}</div>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card" style={{ padding: '22px 24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>🕐 Recent Activity</h2>
        {recentItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentItems.slice(0, 5).map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.5)', border: '1px solid var(--border)',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, fontSize: '1rem', background: item.type === 'order' ? 'rgba(37,99,235,0.1)' : 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.type === 'order' ? '🛒' : '📅'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text)', margin: 0, fontSize: '0.9rem' }}>
                    {item.type === 'order' ? `Order #${item._id?.slice(-6)}` : `Booking for ${item.service?.title || 'Service'}`}
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: '0.78rem', margin: 0 }}>
                    {item.type === 'order' ? `₹${item.totalAmount}` : item.status}
                  </p>
                </div>
                <span className={`badge ${
                  item.status === 'delivered' || item.status === 'confirmed' ? 'badge--green'
                    : item.status === 'pending' ? 'badge--amber'
                    : item.status === 'cancelled' ? 'badge--red'
                    : 'badge--gray'
                }`}>
                  {item.status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🛍️</div>
            <p style={{ color: 'var(--muted)', marginBottom: 18 }}>No activity yet. Start exploring local products and services!</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link to="/products" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>Browse Products</Link>
              <Link to="/services" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>Find Services</Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) { .stats-row { grid-template-columns: 1fr 1fr !important; } .actions-row { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .stats-row { grid-template-columns: 1fr !important; } .actions-row { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </>
  );
};

export default Dashboard;
