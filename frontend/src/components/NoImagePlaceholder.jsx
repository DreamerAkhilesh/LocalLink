import React from 'react';

/**
 * NoImagePlaceholder
 * A visually appealing placeholder shown when a product/service has no image.
 * Uses category to pick a matching icon + gradient.
 *
 * Props:
 *   category – string  the product/service category
 *   name     – string  product/service name (shown as label)
 *   height   – string  CSS height (default '192px' ≈ h-48)
 */

const CATEGORY_CONFIG = {
  // Grocery / food
  groceries:    { icon: '🛒', bg: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)', label: 'Grocery' },
  vegetables:   { icon: '🥦', bg: 'linear-gradient(135deg, #d4edda 0%, #a8d5b5 100%)', label: 'Vegetables' },
  fruits:       { icon: '🍎', bg: 'linear-gradient(135deg, #fde8e8 0%, #f5c6cb 100%)', label: 'Fruits' },
  dairy:        { icon: '🥛', bg: 'linear-gradient(135deg, #e8f4fd 0%, #bee5eb 100%)', label: 'Dairy' },
  bakery:       { icon: '🥖', bg: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)', label: 'Bakery' },
  // Clothing
  clothing:     { icon: '👕', bg: 'linear-gradient(135deg, #e2d9f3 0%, #d1c4e9 100%)', label: 'Clothing' },
  footwear:     { icon: '👟', bg: 'linear-gradient(135deg, #fce4d6 0%, #f8cbad 100%)', label: 'Footwear' },
  accessories:  { icon: '👜', bg: 'linear-gradient(135deg, #fde8e8 0%, #f5c6cb 100%)', label: 'Accessories' },
  // Electronics
  electronics:  { icon: '💡', bg: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)', label: 'Electronics' },
  mobile:       { icon: '📱', bg: 'linear-gradient(135deg, #cce5ff 0%, #b8daff 100%)', label: 'Mobile' },
  computers:    { icon: '💻', bg: 'linear-gradient(135deg, #d6d8db 0%, #c8cbcf 100%)', label: 'Computers' },
  // Health
  pharmacy:     { icon: '💊', bg: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)', label: 'Pharmacy' },
  medicines:    { icon: '💊', bg: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)', label: 'Medicines' },
  health:       { icon: '🩺', bg: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)', label: 'Health' },
  // Stationery
  stationery:   { icon: '✏️', bg: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)', label: 'Stationery' },
  books:        { icon: '📚', bg: 'linear-gradient(135deg, #fce4d6 0%, #f8cbad 100%)', label: 'Books' },
  office:       { icon: '🖊️', bg: 'linear-gradient(135deg, #e2d9f3 0%, #d1c4e9 100%)', label: 'Office' },
  // Home
  'home-appliances': { icon: '🏠', bg: 'linear-gradient(135deg, #cce5ff 0%, #b8daff 100%)', label: 'Appliances' },
  furniture:    { icon: '🪑', bg: 'linear-gradient(135deg, #fce4d6 0%, #f8cbad 100%)', label: 'Furniture' },
  // Services
  plumbing:     { icon: '🔧', bg: 'linear-gradient(135deg, #cce5ff 0%, #b8daff 100%)', label: 'Plumbing' },
  electrical:   { icon: '⚡', bg: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)', label: 'Electrical' },
  carpentry:    { icon: '🪚', bg: 'linear-gradient(135deg, #fce4d6 0%, #f8cbad 100%)', label: 'Carpentry' },
  painting:     { icon: '🎨', bg: 'linear-gradient(135deg, #e2d9f3 0%, #d1c4e9 100%)', label: 'Painting' },
  cleaning:     { icon: '🧹', bg: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)', label: 'Cleaning' },
  'appliance-repair': { icon: '🔨', bg: 'linear-gradient(135deg, #d6d8db 0%, #c8cbcf 100%)', label: 'Repair' },
  'ac-repair':  { icon: '❄️', bg: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)', label: 'AC Service' },
  'computer-repair': { icon: '🖥️', bg: 'linear-gradient(135deg, #d6d8db 0%, #c8cbcf 100%)', label: 'Tech Repair' },
  'mobile-repair': { icon: '📱', bg: 'linear-gradient(135deg, #cce5ff 0%, #b8daff 100%)', label: 'Mobile Repair' },
  tutoring:     { icon: '📖', bg: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)', label: 'Tutoring' },
  'music-lessons': { icon: '🎵', bg: 'linear-gradient(135deg, #e2d9f3 0%, #d1c4e9 100%)', label: 'Music' },
  'fitness-training': { icon: '💪', bg: 'linear-gradient(135deg, #fce4d6 0%, #f8cbad 100%)', label: 'Fitness' },
  'beauty-services': { icon: '💅', bg: 'linear-gradient(135deg, #fde8e8 0%, #f5c6cb 100%)', label: 'Beauty' },
  photography:  { icon: '📷', bg: 'linear-gradient(135deg, #d6d8db 0%, #c8cbcf 100%)', label: 'Photography' },
  catering:     { icon: '🍽️', bg: 'linear-gradient(135deg, #fce4d6 0%, #f8cbad 100%)', label: 'Catering' },
  gardening:    { icon: '🌱', bg: 'linear-gradient(135deg, #d4edda 0%, #a8d5b5 100%)', label: 'Gardening' },
  delivery:     { icon: '🚚', bg: 'linear-gradient(135deg, #cce5ff 0%, #b8daff 100%)', label: 'Delivery' },
  other:        { icon: '🏪', bg: 'linear-gradient(135deg, #e2e3e5 0%, #d6d8db 100%)', label: 'Other' },
};

const DEFAULT = { icon: '🛍️', bg: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)', label: 'Product' };

const NoImagePlaceholder = ({ category = '', name = '', height = '192px' }) => {
  const cfg = CATEGORY_CONFIG[category?.toLowerCase()] || DEFAULT;

  return (
    <div
      style={{
        width: '100%',
        height,
        background: cfg.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        userSelect: 'none',
      }}
    >
      {/* Big emoji icon */}
      <span style={{ fontSize: '2.8rem', lineHeight: 1 }}>{cfg.icon}</span>

      {/* Category badge */}
      <span style={{
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'rgba(0,0,0,0.4)',
        background: 'rgba(255,255,255,0.55)',
        padding: '2px 10px',
        borderRadius: 20,
      }}>
        {cfg.label}
      </span>

      {/* Short name if provided */}
      {name && (
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 500,
          color: 'rgba(0,0,0,0.45)',
          maxWidth: '80%',
          textAlign: 'center',
          lineHeight: 1.3,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {name}
        </span>
      )}
    </div>
  );
};

export default NoImagePlaceholder;
