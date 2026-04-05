import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/vendors?status=${status}`);
      setVendors(res.data.data.vendors);
      setTotal(res.data.data.total);
    } catch { /* silent */ }
    setLoading(false);
  }, [status]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await api.put(`/admin/vendors/${id}/approve`);
      fetchVendors();
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    setActionLoading('');
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason (optional):') ?? '';
    if (reason === null) return;
    setActionLoading(id + '_reject');
    try {
      await api.put(`/admin/vendors/${id}/reject`, { reason });
      fetchVendors();
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    setActionLoading('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-500 text-sm mt-1">{total} vendor{total !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex gap-2">
          {['pending', 'verified', 'rejected', 'all'].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${status === s ? 'bg-gray-900 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div></div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No {status} vendors found</div>
      ) : (
        <div className="space-y-4">
          {vendors.map(vendor => (
            <div key={vendor._id} className="bg-white rounded-xl border p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{vendor.businessName}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[vendor.verificationStatus]}`}>
                    {vendor.verificationStatus}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{vendor.businessType}</span>
                </div>
                <p className="text-sm text-gray-600">{vendor.user?.name} · {vendor.user?.email} · {vendor.user?.phone}</p>
                <p className="text-sm text-gray-500">Category: {vendor.category}</p>
                {vendor.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{vendor.description}</p>}
                {vendor.verificationNote && (
                  <p className="text-sm text-red-600 mt-1">Rejection reason: {vendor.verificationNote}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Registered: {new Date(vendor.user?.createdAt).toLocaleDateString('en-IN')}</p>
              </div>

              {vendor.verificationStatus === 'pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleApprove(vendor._id)}
                    disabled={actionLoading === vendor._id + '_approve'}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                    {actionLoading === vendor._id + '_approve' ? '...' : '✅ Approve'}
                  </button>
                  <button onClick={() => handleReject(vendor._id)}
                    disabled={actionLoading === vendor._id + '_reject'}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                    {actionLoading === vendor._id + '_reject' ? '...' : '❌ Reject'}
                  </button>
                </div>
              )}
              {vendor.verificationStatus === 'verified' && (
                <button onClick={() => handleReject(vendor._id)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 flex-shrink-0">
                  Revoke
                </button>
              )}
              {vendor.verificationStatus === 'rejected' && (
                <button onClick={() => handleApprove(vendor._id)}
                  className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 flex-shrink-0">
                  Re-approve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVendors;
