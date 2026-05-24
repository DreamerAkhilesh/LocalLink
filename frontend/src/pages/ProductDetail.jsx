import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import NoImagePlaceholder from '../components/NoImagePlaceholder';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, isInCart, getItemQuantity, updateQuantity, removeFromCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedMsg, setAddedMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data.product);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const inCart = product ? isInCart(product._id) : false;
  const cartQty = product ? getItemQuantity(product._id) : 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const success = addToCart(product, qty);
    if (success) {
      setAddedMsg('Added to cart!');
      setTimeout(() => setAddedMsg(''), 2500);
    }
  };

  const handleQtyChange = (delta) => {
    const newQty = qty + delta;
    if (newQty < 1 || newQty > product.stock) return;
    setQty(newQty);
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <p className="text-red-600 text-lg mb-4">{error}</p>
      <Link to="/products" className="text-primary-600 hover:underline">← Back to Products</Link>
    </div>
  );

  if (!product) return null;

  const discountedPrice = product.discount > 0
    ? product.price - (product.price * product.discount / 100)
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{product.name}</span>
      </nav>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

          {/* Images */}
          <div className="p-6 border-r border-gray-100">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
              {product.images?.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <NoImagePlaceholder category={product.category} name={product.name} height="100%" />
              )}
            </div>
            {/* Thumbnail strip */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${selectedImage === i ? 'border-primary-500' : 'border-gray-200'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col">
            {/* Category badge */}
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full mb-3 self-start capitalize">
              {product.category?.replace(/-/g, ' ')}
            </span>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

            {/* Vendor */}
            <p className="text-sm text-gray-500 mb-4">
              Sold by <span className="font-medium text-gray-700">{product.vendor?.businessName || 'Local Vendor'}</span>
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-primary-600">
                {formatPrice(discountedPrice || product.price)}
                <span className="text-base font-normal text-gray-500">/{product.unit}</span>
              </span>
              {discountedPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <span className="bg-green-100 text-green-700 text-sm font-medium px-2 py-0.5 rounded">{product.discount}% off</span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div className="mb-5">
              {product.stock === 0 ? (
                <span className="text-red-600 font-medium text-sm">Out of Stock</span>
              ) : product.stock <= 5 ? (
                <span className="text-orange-600 font-medium text-sm">Only {product.stock} left!</span>
              ) : (
                <span className="text-green-600 font-medium text-sm">In Stock ({product.stock} available)</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Quantity + Add to Cart */}
            {user?.role !== 'vendor' && (
              <div className="mt-auto space-y-3">
                {!inCart ? (
                  <>
                    {/* Quantity selector */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button onClick={() => handleQtyChange(-1)} disabled={qty <= 1}
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 font-bold">−</button>
                        <span className="px-4 py-2 text-sm font-semibold border-x border-gray-300">{qty}</span>
                        <button onClick={() => handleQtyChange(1)} disabled={qty >= product.stock}
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 font-bold">+</button>
                      </div>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      {product.stock === 0 ? 'Out of Stock' : addedMsg || '🛒 Add to Cart'}
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <span className="text-green-700 font-medium text-sm">✓ In your cart ({cartQty})</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(product._id, cartQty - 1)}
                          className="w-7 h-7 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold text-sm">−</button>
                        <span className="text-sm font-semibold w-6 text-center">{cartQty}</span>
                        <button onClick={() => updateQuantity(product._id, cartQty + 1)} disabled={cartQty >= product.stock}
                          className="w-7 h-7 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 font-bold text-sm">+</button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to="/checkout" className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm text-center">
                        Proceed to Checkout
                      </Link>
                      <button onClick={() => removeFromCart(product._id)}
                        className="px-4 py-2.5 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 text-sm">
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && Object.values(product.specifications).some(v => v) && (
          <div className="border-t px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(product.specifications).map(([key, val]) =>
                val ? (
                  <div key={key} className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-sm font-medium text-gray-800">{String(val)}</p>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Vendor info */}
        {product.vendor && (
          <div className="border-t px-6 py-5 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Sold by</h2>
            <p className="text-base font-medium text-gray-900">{product.vendor.businessName}</p>
            {product.vendor.address?.city && (
              <p className="text-sm text-gray-500">{product.vendor.address.city}, {product.vendor.address.state}</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link to="/products" className="text-sm text-primary-600 hover:underline">← Back to Products</Link>
      </div>
    </div>
  );
};

export default ProductDetail;
