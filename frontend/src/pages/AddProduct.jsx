import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CATEGORIES = [
  'groceries','vegetables','fruits','dairy','bakery',
  'clothing','footwear','accessories',
  'electronics','mobile','computers',
  'pharmacy','medicines','health',
  'stationery','books','office',
  'home-appliances','furniture','other'
];

const UNITS = ['piece','kg','gram','liter','ml','packet','box','dozen'];

const AddProduct = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '', description: '', category: '', price: '',
    stock: '', unit: 'piece', images: [''], discount: 0
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
        const res = await api.get(`/products/${id}`);
        const p = res.data.data.product;
        setForm({
          name: p.name, description: p.description, category: p.category,
          price: p.price, stock: p.stock, unit: p.unit,
          images: p.images?.length ? p.images : [''], discount: p.discount || 0
        });
      } catch {
        setError('Failed to load product');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, value) => {
    const imgs = [...form.images];
    imgs[index] = value;
    setForm(prev => ({ ...prev, images: imgs }));
  };

  const addImageField = () => setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  const removeImageField = (i) => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        discount: parseFloat(form.discount) || 0,
        images: form.images.filter(img => img.trim())
      };
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      navigate('/dashboard');
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      setError(validationErrors?.[0]?.msg || err.response?.data?.message || 'Failed to save product');
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
        <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input name="name" value={form.name} onChange={handleChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Fresh Tomatoes" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Describe your product (min 10 characters)" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
            <select name="unit" value={form.unit} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
            <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
            <input name="discount" type="number" min="0" max="100" value={form.discount} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Images *</label>
          <p className="text-xs text-gray-500 mb-2">Enter image URLs (at least one required)</p>
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
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
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

export default AddProduct;
