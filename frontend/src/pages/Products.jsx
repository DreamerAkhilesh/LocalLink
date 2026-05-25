import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import NoImagePlaceholder from '../components/NoImagePlaceholder';

/**
 * Add to Cart Button Component
 */
const AddToCartButton = ({ product }) => {
  const { addToCart, isInCart, getItemQuantity, clearError } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    clearError();
    
    const success = addToCart(product, 1);
    
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
    
    setIsAdding(false);
  };

  const inCart = isInCart(product._id);
  const quantity = getItemQuantity(product._id);

  if (showSuccess) {
    return (
      <button className="bg-green-600 text-white py-2 px-3 rounded-md text-sm flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Added!
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || product.stock === 0}
      className={`py-2 px-3 rounded-md transition-colors text-sm ${
        product.stock === 0
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : inCart
          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
          : 'bg-secondary-600 hover:bg-secondary-700 text-white'
      }`}
    >
      {isAdding ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
          Adding...
        </div>
      ) : product.stock === 0 ? (
        'Out of Stock'
      ) : inCart ? (
        `In Cart (${quantity})`
      ) : (
        'Add to Cart'
      )}
    </button>
  );
};

/**
 * Products Page Component
 * Browse and search products
 * - Vendor: sees only their own products with edit/delete actions
 * - Customer/Guest: sees all products with add to cart
 */
const Products = () => {
  const { isAuthenticated, user } = useAuth();
  const { getLocationParams, locationEnabled, radius } = useLocation();
  const isVendor = user?.role === 'vendor';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const initialFilters = { search: '', category: '', minPrice: '', maxPrice: '', sortBy: 'createdAt', sortOrder: 'desc' };
  const [filters, setFilters] = useState(initialFilters);           // drives UI inputs
  const [debouncedFilters, setDebouncedFilters] = useState(initialFilters); // drives API
  const debounceRef = useRef(null);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [locationMeta, setLocationMeta] = useState({ filtered: false, fallback: false, radiusKm: null });
  const [useNearMe, setUseNearMe] = useState(true); // page-level toggle for location filter

  const categories = [
    'groceries','vegetables','fruits','dairy','bakery',
    'clothing','footwear','accessories',
    'electronics','mobile','computers',
    'pharmacy','medicines','health',
    'stationery','books','office',
    'home-appliances','furniture','other'
  ];

  const fetchProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      let response;
      if (isVendor) {
        const params = new URLSearchParams({ page: page.toString(), limit: '12' });
        if (debouncedFilters.search) params.set('search', debouncedFilters.search);
        if (debouncedFilters.category) params.set('category', debouncedFilters.category);
        response = await api.get(`/products/vendor/my-products?${params}`);
      } else {
        const params = new URLSearchParams({ page: page.toString(), limit: '12' });
        if (debouncedFilters.search) params.set('search', debouncedFilters.search);
        if (debouncedFilters.category) params.set('category', debouncedFilters.category);
        if (debouncedFilters.minPrice) params.set('minPrice', debouncedFilters.minPrice);
        if (debouncedFilters.maxPrice) params.set('maxPrice', debouncedFilters.maxPrice);
        if (debouncedFilters.sortBy) params.set('sortBy', debouncedFilters.sortBy);
        if (debouncedFilters.sortOrder) params.set('sortOrder', debouncedFilters.sortOrder);
        // Only attach location params when "Near me" is active
        if (useNearMe) {
          const locParams = getLocationParams();
          if (locParams.lat) { params.set('lat', locParams.lat); params.set('lng', locParams.lng); params.set('radius', locParams.radius); }
        }
        response = await api.get(`/products?${params}`);
      }
      const d = response.data.data;
      setProducts(d.products);
      setPagination(d.pagination);
      setLocationMeta({ filtered: !!d.locationFiltered, fallback: !!d.locationFallback, radiusKm: d.radiusKm });
      setError('');
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, isVendor, getLocationParams, useNearMe]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch {
      alert('Failed to delete product');
    }
  };

  // Text inputs (search, price): debounce 600ms so the API isn't hit on every keystroke.
  // Dropdowns (category, sort): apply immediately.
  const TEXT_KEYS = ['search', 'minPrice', 'maxPrice'];
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (TEXT_KEYS.includes(key)) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setDebouncedFilters(prev => ({ ...prev, [key]: value }));
      }, 600);
    } else {
      setDebouncedFilters(prev => ({ ...prev, [key]: value }));
    }
  };
  const handleFilterChangeBatch = (updates) => {
    setFilters(prev => ({ ...prev, ...updates }));
    setDebouncedFilters(prev => ({ ...prev, ...updates })); // sort is always immediate
  };
  const handleSearch = (e) => { e.preventDefault(); };
  const clearFilters = () => {
    clearTimeout(debounceRef.current);
    setFilters(initialFilters);
    setDebouncedFilters(initialFilters);
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            {isVendor ? 'My Products' : 'Browse Products'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {isVendor
              ? 'Manage your product listings'
              : 'Products from local vendors across all categories'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Near-me toggle (customers only) */}
          {!isVendor && locationEnabled && (
            <button
              onClick={() => setUseNearMe(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600,
                border: '1.5px solid', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit',
                background: useNearMe ? 'var(--accent)' : 'transparent',
                color: useNearMe ? 'white' : 'var(--accent)',
                borderColor: 'var(--accent)',
                boxShadow: useNearMe ? '0 2px 10px rgba(124,58,237,0.25)' : 'none',
              }}
            >
              📍 {useNearMe ? `Within ${radius} km` : 'Show all'}
            </button>
          )}
          {isVendor && (
            <Link to="/products/new" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.86rem' }}>
              + Add Product
            </Link>
          )}
        </div>
      </div>

      {/* Location status banner */}
      {!isVendor && (
        <>
          {locationMeta.filtered && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: 12, padding: '10px 16px', marginBottom: 20,
              fontSize: '0.84rem', color: 'var(--accent)',
            }}>
              <span style={{ fontSize: '1rem' }}>📍</span>
              <span>Showing products from vendors within <strong>{locationMeta.radiusKm} km</strong> of your set location.</span>
              <button onClick={() => setUseNearMe(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                Show all instead →
              </button>
            </div>
          )}
          {locationMeta.fallback && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 12, padding: '10px 16px', marginBottom: 20,
              fontSize: '0.84rem', color: '#92400e',
            }}>
              <span style={{ fontSize: '1rem' }}>⚠️</span>
              <span>No vendors found within <strong>{locationMeta.radiusKm} km</strong> of your location — showing <strong>all available products</strong> instead.</span>
              <button onClick={() => setUseNearMe(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                Keep showing all →
              </button>
            </div>
          )}
          {!locationEnabled && !locationMeta.filtered && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(124,58,237,0.04)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '10px 16px', marginBottom: 20,
              fontSize: '0.84rem', color: 'var(--muted)',
            }}>
              <span>🌐</span>
              <span>Showing all products. <strong>Set your location</strong> in the bar above to see what's near you.</span>
            </div>
          )}
        </>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className={`grid grid-cols-1 ${isVendor ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'} gap-4`}>
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Products
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name, description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range — customer only */}
            {!isVendor && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
                  <input type="number" value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="0" min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                  <input type="number" value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="1000" min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Sort — customer only */}
            {!isVendor && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={`${filters.sortBy}:${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split(':');
                    handleFilterChangeBatch({ sortBy, sortOrder });
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="createdAt:desc">Newest First</option>
                  <option value="createdAt:asc">Oldest First</option>
                  <option value="price:asc">Price: Low to High</option>
                  <option value="price:desc">Price: High to Low</option>
                  <option value="name:asc">Name: A to Z</option>
                  <option value="name:desc">Name: Z to A</option>
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                Search
              </button>
              <button type="button" onClick={clearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-48 w-full object-cover object-center"
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }}
                    />
                  ) : (
                    <NoImagePlaceholder category={product.category} name={product.name} height="192px" />
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Vendor Info */}
                  <p className="text-xs text-gray-500 mb-2">
                    by {product.vendor?.businessName || product.vendor?.name}
                  </p>
                  
                  {/* Price and Stock */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-primary-600">
                      {formatPrice(product.price)}
                      <span className="text-sm text-gray-500 font-normal">/{product.unit}</span>
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {isVendor ? (
                      <>
                        {/* Status badge */}
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          product.status === 'active' ? 'bg-green-100 text-green-700' :
                          product.status === 'pending-approval' ? 'bg-yellow-100 text-yellow-700' :
                          product.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {product.status === 'pending-approval' ? '⏳ Pending' :
                           product.status === 'active' ? '✅ Active' :
                           product.status === 'rejected' ? '❌ Rejected' : product.status}
                        </span>
                        <Link
                          to={`/products/${product._id}/edit`}
                          className="flex-1 bg-primary-600 text-white text-center py-2 px-3 rounded-md hover:bg-primary-700 transition-colors text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="bg-red-500 text-white py-2 px-3 rounded-md hover:bg-red-600 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={`/products/${product._id}`}
                          className="flex-1 bg-primary-600 text-white text-center py-2 px-3 rounded-md hover:bg-primary-700 transition-colors text-sm"
                        >
                          View Details
                        </Link>
                        {isAuthenticated && user?.role === 'customer' && (
                          <AddToCartButton product={product} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => fetchProducts(pagination.current - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-700">
                Page {pagination.current} of {pagination.pages}
              </span>
              
              <button
                onClick={() => fetchProducts(pagination.current + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">
            {isVendor
              ? "You haven't added any products yet."
              : locationEnabled
                ? `No vendors found within ${radius} km of your location. Try increasing the radius or disabling location filter.`
                : 'Try adjusting your search filters or check back later.'}
          </p>
          {isVendor && (
            <Link to="/products/new" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
              Add Your First Product
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;