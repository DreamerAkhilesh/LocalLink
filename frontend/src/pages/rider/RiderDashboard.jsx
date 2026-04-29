import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

/**
 * RiderDashboard — main page for delivery partners
 * Shows: online toggle, active order card, stats, order history
 */
const RiderDashboard = () => {
  const { user, riderProfile, updateRiderProfile } = useAuth();
  const [profile, setProfile] = useState(riderProfile);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, activeRes, statsRes, historyRes] = await Promise.all([
        api.get('/rider/me'),
        api.get('/rider/orders/active'),
        api.get('/rider/stats'),
        api.get('/rider/orders?status=all&limit=10')
      ]);
      setProfile(profileRes.data.data.rider);
      updateRiderProfile(profileRes.data.data.rider);
      setActiveOrder(activeRes.data.data.order);
      setStats(statsRes.data.data);
      setOrders(historyRes.data.data.orders);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [updateRiderProfile]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Poll active order every 15s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/rider/orders/active');
        setActiveOrder(res.data.data.order);
      } catch { /* silent */ }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await api.put('/rider/toggle-availability');
      setProfile(prev => ({ ...prev, isAvailable: res.data.data.isAvailable, status: res.data.data.status }));
      updateRiderProfile({ isAvailable: res.data.data.isAvailable, status: res.data.data.status });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
    setToggling(false);
  };

  const handleOrderAction = async (orderId, action, label) => {
    setActionLoading(action);
    try {
      await api.put(`/rider/orders/${orderId}/${action}`);
      await fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${label}`);
    }
    setActionLoading('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isOnline = profile?.isAvailable;
  const isVerified = profile?.isVerified;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rider Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome, {user?.name}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
      )}

      {/* Verification warning */}
      {!isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="font-semibold text-yellow-800">Account Pending Verification</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              {profile?.verificationStatus === 'rejected'
                ? `Your account was rejected. Reason: ${profile?.verificationNote || 'Contact support.'}`
                : 'Your account is under review. You can go online once approved by admin.'}
            </p>
          </div>
        </div>
      )}

      {/* Online / Offline Toggle */}
      <div className="bg-white rounded-xl border shadow-sm p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800 text-lg">
            {isOnline ? '🟢 You are Online' : '🔴 You are Offline'}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            Status: <span className="font-medium capitalize">{profile?.status || 'offline'}</span>
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={toggling || !isVerified}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
            isOnline
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {toggling ? '...' : isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Today's Deliveries", value: stats.todayDeliveries, icon: '📦' },
            { label: 'Total Deliveries', value: stats.completedDeliveries, icon: '✅' },
            { label: 'Total Earnings', value: `₹${stats.totalEarnings}`, icon: '💰' },
            { label: 'Rating', value: stats.rating > 0 ? `${stats.rating.toFixed(1)} ⭐` : 'N/A', icon: '⭐' }
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border shadow-sm p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Active Order Card */}
      {activeOrder ? (
        <ActiveOrderCard
          order={activeOrder}
          onAction={handleOrderAction}
          actionLoading={actionLoading}
        />
      ) : (
        isOnline && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center mb-6">
            <p className="text-4xl mb-2">🛵</p>
            <p className="font-semibold text-blue-800">Waiting for orders...</p>
            <p className="text-sm text-blue-600 mt-1">You'll be notified when an order is assigned to you.</p>
          </div>
        )
      )}

      {/* Order History */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-800">Recent Deliveries</h2>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No deliveries yet</div>
        ) : (
          <div className="divide-y">
            {orders.map(order => (
              <OrderHistoryRow key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Active Order Card ─── */
const ActiveOrderCard = ({ order, onAction, actionLoading }) => {
  const statusConfig = {
    'assigned-to-rider': {
      label: 'New Order Assigned',
      color: 'bg-yellow-50 border-yellow-300',
      nextAction: 'accept',
      nextLabel: '✅ Accept Order',
      btnClass: 'bg-green-600 hover:bg-green-700 text-white'
    },
    'picked-up': {
      label: 'Order Picked Up',
      color: 'bg-blue-50 border-blue-300',
      nextAction: 'start-delivery',
      nextLabel: '🚴 Start Delivery',
      btnClass: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    'out-for-delivery': {
      label: 'Out for Delivery',
      color: 'bg-purple-50 border-purple-300',
      nextAction: 'delivered',
      nextLabel: '📬 Mark Delivered',
      btnClass: 'bg-purple-600 hover:bg-purple-700 text-white'
    }
  };

  // assigned-to-rider needs accept first, then picked-up
  const cfg = statusConfig[order.status];
  if (!cfg) return null;

  // Special case: after accepting, next step is picked-up
  const actionMap = {
    'assigned-to-rider': 'accept',
    'picked-up': 'start-delivery',
    'out-for-delivery': 'delivered'
  };
  const action = actionMap[order.status];

  return (
    <div className={`rounded-xl border-2 p-5 mb-6 ${cfg.color}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800 text-lg">📋 {cfg.label}</h2>
        <span className="text-xs bg-white px-2 py-1 rounded-full border font-mono">
          #{order.orderNumber}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {/* Pickup */}
        <div className="flex items-start gap-3 bg-white rounded-lg p-3">
          <span className="text-green-600 text-xl mt-0.5">📍</span>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pickup</p>
            <p className="font-semibold text-gray-800">{order.vendor?.businessName || 'Vendor'}</p>
            <p className="text-sm text-gray-600">
              {order.pickupLocation?.address || order.vendor?.location?.address || 'Address not available'}
            </p>
          </div>
        </div>

        {/* Drop */}
        <div className="flex items-start gap-3 bg-white rounded-lg p-3">
          <span className="text-red-500 text-xl mt-0.5">🏠</span>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Drop</p>
            <p className="font-semibold text-gray-800">{order.deliveryAddress?.name}</p>
            <p className="text-sm text-gray-600">
              {order.deliveryAddress?.street}, {order.deliveryAddress?.city} — {order.deliveryAddress?.pincode}
            </p>
            <p className="text-sm text-gray-600">📞 {order.deliveryAddress?.phone}</p>
          </div>
        </div>

        {/* Items summary */}
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Items</p>
          {order.items?.map((item, i) => (
            <p key={i} className="text-sm text-gray-700">
              {item.product?.name || 'Product'} × {item.quantity}
            </p>
          ))}
          <p className="text-sm font-semibold text-gray-800 mt-1">Total: ₹{order.totalAmount}</p>
        </div>
      </div>

      <button
        onClick={() => onAction(order._id, action, cfg.nextLabel)}
        disabled={!!actionLoading}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${cfg.btnClass}`}
      >
        {actionLoading === action ? 'Updating...' : cfg.nextLabel}
      </button>
    </div>
  );
};

/* ─── Order History Row ─── */
const STATUS_COLORS = {
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  'out-for-delivery': 'bg-blue-100 text-blue-700',
  'picked-up': 'bg-yellow-100 text-yellow-700',
  'assigned-to-rider': 'bg-orange-100 text-orange-700'
};

const OrderHistoryRow = ({ order }) => (
  <div className="px-5 py-4 flex items-center justify-between">
    <div>
      <p className="font-medium text-gray-800 text-sm">#{order.orderNumber}</p>
      <p className="text-xs text-gray-500 mt-0.5">
        {order.deliveryAddress?.city} · ₹{order.totalAmount}
      </p>
    </div>
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
      {order.status}
    </span>
  </div>
);

export default RiderDashboard;
