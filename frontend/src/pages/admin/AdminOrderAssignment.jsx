import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

/**
 * AdminOrderAssignment — admin assigns riders to ready orders
 */
const AdminOrderAssignment = () => {
  const [orders, setOrders] = useState([]);
  const [availableRiders, setAvailableRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState('');
  const [selectedRider, setSelectedRider] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, ridersRes] = await Promise.all([
        api.get('/admin/orders?status=ready'),
        api.get('/admin/riders/available')
      ]);
      setOrders(ordersRes.data.data?.orders || []);
      setAvailableRiders(ridersRes.data.data.riders);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async (orderId) => {
    const riderId = selectedRider[orderId];
    if (!riderId) return alert('Please select a rider first');
    setAssigning(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/assign-rider`, { riderId });
      await fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to assign rider');
    }
    setAssigning('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Assignment</h1>
        <p className="text-gray-500 text-sm mt-1">
          Assign available riders to orders that are ready for pickup
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {/* Available Riders Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="font-semibold text-blue-800">
              🛵 {availableRiders.length} rider{availableRiders.length !== 1 ? 's' : ''} available
            </p>
            {availableRiders.length > 0 && (
              <p className="text-sm text-blue-600 mt-1">
                {availableRiders.map(r => r.user?.name).join(', ')}
              </p>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p>No orders ready for assignment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="bg-white rounded-xl border p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Ready
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Customer: {order.customer?.name} · {order.customer?.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        Vendor: {order.vendor?.businessName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Drop: {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        ₹{order.totalAmount}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {availableRiders.length === 0 ? (
                        <p className="text-sm text-gray-400">No riders available</p>
                      ) : (
                        <>
                          <select
                            value={selectedRider[order._id] || ''}
                            onChange={e => setSelectedRider(prev => ({ ...prev, [order._id]: e.target.value }))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Rider</option>
                            {availableRiders.map(r => (
                              <option key={r._id} value={r._id}>
                                {r.user?.name} ({r.vehicleType})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssign(order._id)}
                            disabled={assigning === order._id || !selectedRider[order._id]}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                          >
                            {assigning === order._id ? 'Assigning...' : 'Assign'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrderAssignment;
