import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StatCard = ({ label, value, color, to }) => (
  <Link to={to || '#'} className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow`}>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
  </Link>
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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and pending approvals</p>
      </div>

      {/* Pending alerts */}
      {(stats?.vendors?.pending > 0 || stats?.products?.pending > 0 || stats?.services?.pending > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 mb-6 flex flex-wrap gap-4">
          <span className="font-medium text-yellow-800">⚠️ Pending approvals:</span>
          {stats.vendors.pending > 0 && (
            <Link to="/admin/vendors" className="text-yellow-700 underline">{stats.vendors.pending} vendor{stats.vendors.pending > 1 ? 's' : ''}</Link>
          )}
          {stats.products.pending > 0 && (
            <Link to="/admin/products" className="text-yellow-700 underline">{stats.products.pending} product{stats.products.pending > 1 ? 's' : ''}</Link>
          )}
          {stats.services.pending > 0 && (
            <Link to="/admin/services" className="text-yellow-700 underline">{stats.services.pending} service{stats.services.pending > 1 ? 's' : ''}</Link>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats?.users?.total} color="text-gray-900" to="/admin/users" />
        <StatCard label="Total Vendors" value={stats?.users?.vendors} color="text-blue-600" to="/admin/vendors?status=all" />
        <StatCard label="Total Orders" value={stats?.orders} color="text-yellow-600" />
        <StatCard label="Total Bookings" value={stats?.bookings} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vendors */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
            Vendors
            <Link to="/admin/vendors" className="text-sm text-blue-600 hover:underline">View all →</Link>
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">⏳ Pending</span>
              <span className="font-bold text-yellow-700">{stats?.vendors?.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded-full">✅ Verified</span>
              <span className="font-bold text-green-700">{stats?.vendors?.verified}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded-full">❌ Rejected</span>
              <span className="font-bold text-red-700">{stats?.vendors?.rejected}</span>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
            Products
            <Link to="/admin/products" className="text-sm text-blue-600 hover:underline">View all →</Link>
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">⏳ Pending</span>
              <span className="font-bold text-yellow-700">{stats?.products?.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded-full">✅ Active</span>
              <span className="font-bold text-green-700">{stats?.products?.active}</span>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
            Services
            <Link to="/admin/services" className="text-sm text-blue-600 hover:underline">View all →</Link>
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">⏳ Pending</span>
              <span className="font-bold text-yellow-700">{stats?.services?.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded-full">✅ Active</span>
              <span className="font-bold text-green-700">{stats?.services?.active}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
