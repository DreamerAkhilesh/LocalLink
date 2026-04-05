import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const STATUS_COLORS = {
  'pending-approval': 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-600'
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('pending-approval');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/products?status=${status}`);
      setProducts(res.data.data.products);
      setTotal(res.data.data.total);
    } catch { /* silent */ }
    setLoading(false);
  }, [status]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleApprove = async (id) => {
    setActionLoading(id + '_a');
    try { await api.put(`/admin/products/${id}/approve`); fetchProducts(); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
    setActionLoading('');
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason (optional):');
    if (reason === null) return;
    setActionLoading(id + '_r');
    try { await api.put(`/admin/products/${id}/reject`, { reason }); fetchProducts(); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
    setActionLoading('');
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">{total} product{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['pending-approval', 'active', 'rejected', 'all'].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${status === s ? 'bg-gray-900 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {s === 'pending-approval' ? 'Pending' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No products found</div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p._id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
              {/* Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[p.status]}`}>
                    {p.status === 'pending-approval' ? 'Pending' : p.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{p.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {p.vendor?.businessName} · {p.category} · {formatPrice(p.price)}/{p.unit} · Stock: {p.stock}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                {p.status !== 'active' && (
                  <button onClick={() => handleApprove(p._id)} disabled={actionLoading === p._id + '_a'}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                    {actionLoading === p._id + '_a' ? '...' : '✅ Approve'}
                  </button>
                )}
                {p.status !== 'rejected' && (
                  <button onClick={() => handleReject(p._id)} disabled={actionLoading === p._id + '_r'}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                    {actionLoading === p._id + '_r' ? '...' : '❌ Reject'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
