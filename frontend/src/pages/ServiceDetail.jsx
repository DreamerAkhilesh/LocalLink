import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ServiceBookingModal from '../components/ServiceBookingModal';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/services/${id}`);
        setService(res.data.data.service);
      } catch (err) {
        setError(err.response?.data?.message || 'Service not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role === 'vendor') { alert('Vendors cannot book services. Please login as a customer.'); return; }
    setBookingOpen(true);
  };

  const handleBookingSuccess = (booking) => {
    setBookingOpen(false);
    setBookingSuccess(booking);
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p);

  const formatDuration = (mins, unit) => {
    if (!mins) return '';
    if (unit === 'days') return `${mins} day${mins > 1 ? 's' : ''}`;
    if (unit === 'hours' || mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${mins} min`;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <p className="text-red-600 text-lg mb-4">{error}</p>
      <Link to="/services" className="text-primary-600 hover:underline">← Back to Services</Link>
    </div>
  );

  if (!service) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/services" className="hover:text-primary-600">Services</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{service.title}</span>
      </nav>

      {/* Booking success banner */}
      {bookingSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <span className="text-green-600 text-xl">✓</span>
          <div>
            <p className="font-semibold text-green-800">Booking Confirmed!</p>
            <p className="text-sm text-green-700">
              Booking #{bookingSuccess.bookingNumber} — {new Date(bookingSuccess.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {bookingSuccess.scheduledTime}
            </p>
            <Link to="/bookings" className="text-sm text-green-700 underline mt-1 inline-block">View My Bookings →</Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

          {/* Images */}
          <div className="p-6 border-r border-gray-100">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
              {service.images?.length > 0 ? (
                <img
                  src={service.images[selectedImage]}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6v10a2 2 0 002 2h4a2 2 0 002-2V6" />
                  </svg>
                </div>
              )}
            </div>
            {service.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {service.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${selectedImage === i ? 'border-primary-500' : 'border-gray-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col">
            {/* Category + Emergency badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full capitalize">
                {service.category?.replace(/-/g, ' ')}
              </span>
              {service.isEmergencyService && (
                <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">🚨 Emergency Available</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h1>

            {/* Provider */}
            <p className="text-sm text-gray-500 mb-4">
              by <span className="font-medium text-gray-700">{service.provider?.businessName || 'Local Provider'}</span>
              {service.provider?.address?.city && (
                <span className="text-gray-400"> · {service.provider.address.city}</span>
              )}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-primary-600">
                {service.pricingType === 'negotiable' ? 'Negotiable' : formatPrice(service.basePrice)}
              </span>
              {service.pricingType !== 'negotiable' && (
                <span className="text-gray-500 text-sm">{service.priceUnit?.replace(/-/g, ' ')}</span>
              )}
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              {service.duration?.estimated && (
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  ⏱ {formatDuration(service.duration.estimated, service.duration.unit)}
                </span>
              )}
              <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full capitalize">
                {service.pricingType?.replace(/-/g, ' ')} pricing
              </span>
              {service.serviceArea?.radius && (
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  📍 Serves within {service.serviceArea.radius} km
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{service.description}</p>

            {/* Features */}
            {service.features?.length > 0 && (
              <ul className="space-y-1 mb-6">
                {service.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            )}

            {/* Book Now button */}
            <div className="mt-auto">
              {user?.role !== 'vendor' ? (
                <button
                  onClick={handleBookNow}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm"
                >
                  📅 Book This Service
                </button>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 text-center">
                  Switch to a customer account to book services
                </div>
              )}
              {!isAuthenticated && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  <Link to="/login" className="text-primary-600 hover:underline">Login</Link> to book this service
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Requirements */}
        {service.requirements?.specialRequirements && (
          <div className="border-t px-6 py-5">
            <h2 className="text-base font-semibold text-gray-800 mb-2">Special Requirements</h2>
            <p className="text-sm text-gray-600">{service.requirements.specialRequirements}</p>
          </div>
        )}

        {/* Provider info */}
        {service.provider && (
          <div className="border-t px-6 py-5 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Service Provider</h2>
            <p className="text-base font-medium text-gray-900">{service.provider.businessName}</p>
            {service.provider.address?.city && (
              <p className="text-sm text-gray-500">{service.provider.address.city}, {service.provider.address.state}</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link to="/services" className="text-sm text-primary-600 hover:underline">← Back to Services</Link>
      </div>

      {/* Booking Modal */}
      <ServiceBookingModal
        service={service}
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default ServiceDetail;
