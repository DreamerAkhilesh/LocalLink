import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Home Page Component
 * Landing page with hero section and features
 */
const Home = () => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect with Your
              <span className="block text-secondary-400">Local Community</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Discover local products and services. Support neighborhood businesses. 
              Build stronger communities through Local Link.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                  Get Started
                </Link>
                <Link to="/products" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard" className="bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                  Go to Dashboard
                </Link>
                <Link to={user?.role === 'customer' ? '/products' : '/dashboard'} className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                  {user?.role === 'customer' ? 'Browse Products' : 'Manage Listings'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose Local Link?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're building a platform that puts community first, connecting neighbors 
              and supporting local businesses.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Hyperlocal Discovery</h3>
              <p className="text-gray-600">
                Find products and services right in your neighborhood. Support businesses 
                within walking distance.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Trust & Transparency</h3>
              <p className="text-gray-600">
                Verified vendors, transparent pricing, and community reviews ensure 
                you get quality products and services.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Community First</h3>
              <p className="text-gray-600">
                Every transaction strengthens your local economy and builds lasting 
                relationships with your neighbors.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              How Local Link Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to connect with your local community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* For Customers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">For Customers</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Browse & Discover</h4>
                    <p className="text-gray-600">Find local products and services in your area</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Order or Book</h4>
                    <p className="text-gray-600">Place orders for products or book services easily</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Pay & Enjoy</h4>
                    <p className="text-gray-600">Simple payment options and quality service</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* For Vendors */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">For Vendors</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-secondary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Create Profile</h4>
                    <p className="text-gray-600">Set up your business profile and showcase your offerings</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-secondary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">List Products/Services</h4>
                    <p className="text-gray-600">Add your products or services with photos and details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-secondary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Manage & Grow</h4>
                    <p className="text-gray-600">Handle orders, serve customers, and grow your business</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join Your Local Community?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Whether you're looking to buy local or sell local, Local Link is your gateway to community commerce.
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=customer" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Join as Customer
              </Link>
              <Link to="/register?role=vendor" className="bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Join as Vendor
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;