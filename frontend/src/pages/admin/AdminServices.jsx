import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const STATUS_TABS = ['pending-approval', 'active', 'rejected', 'all'];

const badge = (status) => {
  const cfg = {
    'pending-approval': { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    active:             { bg: '#d1fae5', color: '#065f46', label: 'Active' },
    rejected:           { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
    inactive:           { bg: '#f3f4f6', color: '#6b7280', label: 'Inactive' },
  };
  const c = cfg[status] || { bg: '#f3f4f6', color: '#374151', label: status };
  return (
    <span style={{
      background: c.bg, color: c.color,
      fontSize: '0.72rem', fontWeight: 700,
      padding: '2px 8px', borderRadius: 6,
    }}>{c.label}</span>
  );
};

const AdminServices = () => {
  const [tab, setTab] = useState('pending-approval');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/admin/services?status=${tab}&limit=50`);
      setItems(r.data.data.services);
      setTotal(r.data.data.total);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    setActionLoading(id + '_approve');
    try { await api.put(`/admin/services/${id}/approve`); load(); }
    catch { } finally { setActionLoading(null); }
  };

  const reject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal + '_reject');
    try {
      await api.put(`/admin/services/${rejectModal}/reject`, { reason: rejectReason || 'Does not meet requirements' });
      setRejectModal(null); setRejectReason(''); load();
    } catch { } finally { setActionLoading(null); }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>
        🔧 Service Approvals
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 24 }}>
        Review and approve services before they go live
      </p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.84rem', transition: 'all 0.15s', fontFamily: 'inherit',
            background: tab === t ? 'var(--accent)' : 'rgba(124,58,237,0.06)',
            color: tab === t ? 'white' : 'var(--text)',
          }}>
            {t === 'pending-approval' ? 'Pending' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: '0.82rem', alignSelf: 'center' }}>
          {total} result{total !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔧</div>
          <p>No {tab === 'pending-approval' ? 'pending' : tab} services</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(item => (
            <div key={item._id} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '16px 20px',
              display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap',
            }}>
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.title}
                  style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 70, height: 70, borderRadius: 8, flexShrink: 0,
                  background: 'var(--bg-deep)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.8rem',
                }}>🔧</div>
              )}

              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text)' }}>{item.title}</span>
                  {badge(item.status)}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                  by {item.provider?.businessName} · {item.category}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>
                  ₹{item.basePrice} {item.pricingType}
                  {item.description && <> · {item.description.slice(0, 80)}{item.description.length > 80 ? '…' : ''}</>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                  Added: {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                {item.status !== 'active' && (
                  <button onClick={() => approve(item._id)}
                    disabled={actionLoading === item._id + '_approve'}
                    style={{
                      padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: '0.82rem',
                      fontFamily: 'inherit', opacity: actionLoading === item._id + '_approve' ? 0.6 : 1,
                    }}>
                    {actionLoading === item._id + '_approve' ? '…' : '✅ Approve'}
                  </button>
                )}
                {item.status !== 'rejected' && (
                  <button onClick={() => { setRejectModal(item._id); setRejectReason(''); }}
                    style={{
                      padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: '0.82rem',
                      fontFamily: 'inherit',
                    }}>❌ Reject</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }} onClick={() => setRejectModal(null)}>
          <div style={{
            background: 'var(--card)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420,
            border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 14px', color: 'var(--text)', fontSize: '1rem', fontWeight: 700 }}>Reject Service</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (shown to vendor)…" rows={3}
              style={{
                width: '100%', borderRadius: 8, border: '1px solid var(--border)',
                padding: '10px 12px', fontFamily: 'inherit', fontSize: '0.88rem',
                background: 'var(--bg)', color: 'var(--text)', resize: 'vertical', boxSizing: 'border-box',
              }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectModal(null)} style={{
                padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
              }}>Cancel</button>
              <button onClick={reject} disabled={!!actionLoading} style={{
                padding: '8px 18px', borderRadius: 8, border: 'none',
                background: '#ef4444', color: 'white', cursor: 'pointer',
                fontWeight: 700, fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1,
              }}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
