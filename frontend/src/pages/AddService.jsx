import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import ImageUploader from '../components/ImageUploader';

const CATEGORIES = [
  'plumbing','electrical','carpentry','painting','cleaning',
  'appliance-repair','ac-repair','computer-repair','mobile-repair',
  'home-maintenance','gardening','pest-control',
  'tutoring','music-lessons','fitness-training',
  'beauty-services','massage','healthcare',
  'photography','event-planning','catering',
  'transportation','delivery','moving','other'
];

const PRICING_TYPES = ['fixed','hourly','per-visit','negotiable'];
const PRICE_UNITS = ['per-hour','per-visit','per-project','per-day'];

const AddService = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    title: '', description: '', category: '',
    pricingType: 'fixed', basePrice: '', priceUnit: 'per-visit',
    duration: { estimated: '', unit: 'hours' },
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'vendor') navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await api.get(`/services/${id}`);
        const s = res.data.data.service;
        setForm({
          title: s.title, description: s.description, category: s.category,
          pricingType: s.pricingType, basePrice: s.basePrice, priceUnit: s.priceUnit,
          duration: { estimated: s.duration?.estimated || '', unit: s.duration?.unit || 'hours' },
          images: s.images || []
        });
      } catch {
        setError('Failed to load service');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('duration.')) {
      const key = name.split('.')[1];
      setForm(prev => ({ ...prev, duration: { ...prev.duration, [key]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        basePrice: parseFloat(form.basePrice),
        duration: { ...form.duration, estimated: parseInt(form.duration.estimated) },
      };
      if (isEdit) {
        await api.put(`/services/${id}`, payload);
        toast.success('Service updated successfully!');
      } else {
        await api.post('/services', payload);
        toast.success('Service added successfully!');
      }
      navigate('/dashboard');
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const msg = validationErrors?.[0]?.msg || err.response?.data?.message || 'Failed to save service';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-primary-600 hover:text-primary-700 text-sm flex items-center mb-2">
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Service' : 'Add New Service'}</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Home Plumbing Repair" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Describe your service (min 10 characters)" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select name="category" value={form.category} onChange={handleChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' ')}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Type *</label>
            <select name="pricingType" value={form.pricingType} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              {PRICING_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Unit *</label>
            <select name="priceUnit" value={form.priceUnit} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              {PRICE_UNITS.map(u => <option key={u} value={u}>{u.replace(/-/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹) *</label>
            <input name="basePrice" type="number" min="0" step="0.01" value={form.basePrice} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
            <input name="duration.estimated" type="number" min="1" value={form.duration.estimated} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. 2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration Unit</label>
            <select name="duration.unit" value={form.duration.unit} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Images</label>
          <ImageUploader
            images={form.images}
            onChange={(urls) => setForm(prev => ({ ...prev, images: urls }))}
            max={4}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium">
            {loading ? 'Saving...' : isEdit ? 'Update Service' : 'Add Service'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddService;
