import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const AdminRiders = () => {
  const [riders, setRiders] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const fetchRiders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/riders?status=${status}`);
      setRiders(res.data.data.riders);
      setTotal(res.data.data.total);
    } catch { /* silent */ }
    setLoading(false);
  }, [status]);

  useEffect(() => { fetchRiders(); }, [fetchRiders]);

  const handleApprove = async (id) => {
    setActionLoading(id + '_a');
    try { await api.put(`/admin/riders/${id}/approve`); fetchRiders(); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
    setActionLoading('');
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason (optional):');
    if (reason === null) return;
    setActionLoading(id + '_r');
    try { await api.put(`/admin/riders/${id}/reject`, { reason }); fetchRiders(); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
    setActionLoading('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rider Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">{total} rider{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['pending', 'verified', 'rejected', 'all'].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${status === s ? 'bg-gray-900 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : riders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No riders found</div>
      ) : (
        <div className="space-y-3">
          {riders.map(r => (
            <div key={r._id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
                🛵
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-gray-900 truncate">{r.user?.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[r.verificationStatus]}`}>
                    {r.verificationStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{r.user?.email} · {r.user?.phone}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Vehicle: {r.vehicleType} {r.vehicleNumber ? `· ${r.vehicleNumber}` : ''} · Status: {r.status}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {r.verificationStatus !== 'verified' && (
                  <button onClick={() => handleApprove(r._id)} disabled={actionLoading === r._id + '_a'}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                    {actionLoading === r._id + '_a' ? '...' : '✅ Approve'}
                  </button>
                )}
                {r.verificationStatus !== 'rejected' && (
                  <button onClick={() => handleReject(r._id)} disabled={actionLoading === r._id + '_r'}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                    {actionLoading === r._id + '_r' ? '...' : '❌ Reject'}
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

export default AdminRiders;
