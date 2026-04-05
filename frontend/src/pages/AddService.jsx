import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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

  const [form, setForm] = useState({
    title: '', description: '', category: '',
    pricingType: 'fixed', basePrice: '', priceUnit: 'per-visit',
    duration: { estimated: '', unit: 'hours' },
    images: ['']
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
          images: s.images?.length ? s.images : ['']
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

  const handleImageChange = (index, value) => {
    const imgs = [...form.images];
    imgs[index] = value;
    setForm(prev => ({ ...prev, images: imgs }));
  };

  const addImageField = () => setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  const removeImageField = (i) => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        basePrice: parseFloat(form.basePrice),
        duration: { ...form.duration, estimated: parseInt(form.duration.estimated) },
        images: form.images.filter(img => img.trim())
      };
      if (isEdit) {
        await api.put(`/services/${id}`, payload);
        navigate('/services');
      } else {
        await api.post('/services', payload);
        setSubmitted(true);
      }
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      setError(validationErrors?.[0]?.msg || err.response?.data?.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  if (submitted) return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <div className="text-5xl mb-4">⏳</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Service Submitted for Review</h2>
      <p className="text-gray-600 mb-6">Your service has been submitted and is pending admin approval. It will be visible to customers once approved.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setSubmitted(false); setForm({ title: '', description: '', category: '', pricingType: 'fixed', basePrice: '', priceUnit: 'per-visit', duration: { estimated: '', unit: 'hours' }, images: [''] }); }}
          className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700">Add Another</button>
        <button onClick={() => navigate('/services')} className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50">View My Services</button>
      </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Images</label>
          <p className="text-xs text-gray-500 mb-2">Enter image URLs (optional)</p>
          {form.images.map((img, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={img} onChange={(e) => handleImageChange(i, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://example.com/image.jpg" />
              {form.images.length > 1 && (
                <button type="button" onClick={() => removeImageField(i)}
                  className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50">✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addImageField}
            className="text-sm text-primary-600 hover:text-primary-700">+ Add another image</button>
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
