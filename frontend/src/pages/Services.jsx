import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * Services Page Component
 * Browse and search services
 */
const Services = () => {
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const categories = [
    'home-services',
    'beauty-wellness',
    'education-tutoring',
    'health-medical',
    'repair-maintenance',
    'cleaning',
    'transportation',
    'event-services',
    'professional-services',
    'other'
  ];

  // Fetch services
  const fetchServices = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...filters
      });

      // Remove empty filters
      Object.keys(filters).forEach(key => {
        if (!filters[key]) {
          params.delete(key);
        }
      });

      const response = await api.get(`/services?${params}`);
      setServices(response.data.data.services);
      setPagination(response.data.data.pagination);
      setError('');
    } catch (err) {
      setError('Failed to fetch services');
      console.error('Fetch services error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading && services.length === 0) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Local Services</h1>
        <p className="text-gray-600">Find professional services from local providers in your area</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Services
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by title, description..."
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
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price (₹)
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price (₹)
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="5000"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Sort */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="createdAt">Newest</option>
                <option value="basePrice">Price</option>
                <option value="title">Name</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="asc">Low to High</option>
                <option value="desc">High to Low</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
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

      {/* Services Grid */}
      {services.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {services.map(service => (
              <div key={service._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {/* Service Image */}
                <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-t-lg bg-gray-200">
                  {service.images && service.images.length > 0 ? (
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="h-48 w-full object-cover object-center"
                    />
                  ) : (
                    <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6v10a2 2 0 002 2h4a2 2 0 002-2V6" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Service Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {service.description}
                  </p>
                  
                  {/* Vendor Info */}
                  <p className="text-xs text-gray-500 mb-2">
                    by {service.vendor?.businessName || service.vendor?.name}
                  </p>
                  
                  {/* Service Details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary-600">
                        {service.pricingType === 'negotiable' ? 'Negotiable' : formatPrice(service.basePrice)}
                        {service.pricingType !== 'negotiable' && (
                          <span className="text-sm text-gray-500 font-normal">
                            /{service.priceUnit?.replace('per-', '')}
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-gray-500">
                        {service.duration?.estimated && formatDuration(service.duration.estimated)}
                      </span>
                    </div>
                    
                    {/* Category Badge */}
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      {service.category?.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/services/${service._id}`}
                      className="flex-1 bg-primary-600 text-white text-center py-2 px-3 rounded-md hover:bg-primary-700 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                    {isAuthenticated && (
                      <button className="bg-secondary-600 text-white py-2 px-3 rounded-md hover:bg-secondary-700 transition-colors text-sm">
                        Book Now
                      </button>
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
                onClick={() => fetchServices(pagination.current - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-700">
                Page {pagination.current} of {pagination.pages}
              </span>
              
              <button
                onClick={() => fetchServices(pagination.current + 1)}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6v10a2 2 0 002 2h4a2 2 0 002-2V6" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-500">Try adjusting your search filters or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default Services;