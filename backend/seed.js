/**
 * LocalLink — Comprehensive Database Seed Script
 * Run: node seed.js
 * Run clean: node seed.js --clean
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User         = require('./models/User');
const VendorProfile = require('./models/VendorProfile');
const Product      = require('./models/Product');
const Service      = require('./models/Service');
const Order        = require('./models/Order');
const Booking      = require('./models/Booking');

const CLEAN = process.argv.includes('--clean');

// ── helpers ─────────────────────────────────────────────────
const hashPwd = (p) => bcrypt.hash(p, 12);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
const genOrderNum = (i) => `ORD${Date.now()}${String(i).padStart(4,'0')}`;
const genBookNum  = (i) => `BKG${Date.now()}${String(i).padStart(4,'0')}`;

// ── time slots helper ────────────────────────────────────────
const fullWeekSlots = () => ['monday','tuesday','wednesday','thursday','friday','saturday'].map(day => ({
  day,
  timeSlots: [{ startTime: '09:00', endTime: '18:00', isAvailable: true }]
}));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CUSTOMERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CUSTOMERS_DATA = [
  { name: 'John Doe',       email: 'john@example.com',  phone: '9876543210', city: 'Mumbai',    pincode: '400001', state: 'Maharashtra', street: '12 Marine Lines' },
  { name: 'Priya Sharma',   email: 'priya@example.com', phone: '9812345678', city: 'Delhi',     pincode: '110001', state: 'Delhi',       street: '45 Connaught Place' },
  { name: 'Rahul Mehta',    email: 'rahul@example.com', phone: '9823456789', city: 'Bangalore', pincode: '560001', state: 'Karnataka',   street: '7 MG Road' },
  { name: 'Ananya Krishnan',email: 'ananya@example.com',phone: '9834567890', city: 'Chennai',   pincode: '600001', state: 'Tamil Nadu',  street: '33 Anna Salai' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  VENDORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const VENDORS_DATA = [
  {
    email: 'sharma.grocery@example.com', phone: '9800001111', name: 'Ramesh Sharma',
    city: 'Mumbai', pincode: '400001', state: 'Maharashtra', street: '55 Dadar West',
    biz: { businessName: "Sharma's Fresh Grocery", businessType: 'shop', category: 'grocery',
      description: 'Your neighbourhood grocery store with fresh fruits, vegetables, and daily essentials since 1995.',
      rating: 4.6, totalReviews: 128, totalOrders: 340,
      location: { type: 'Point', coordinates: [72.8311, 19.0176], address: '55 Dadar West, Mumbai' },
    }
  },
  {
    email: 'bakery.wala@example.com', phone: '9800002222', name: 'Sunita Patel',
    city: 'Mumbai', pincode: '400002', state: 'Maharashtra', street: '18 Bandra West',
    biz: { businessName: 'The Artisan Bakery', businessType: 'shop', category: 'bakery',
      description: 'Freshly baked breads, cakes, pastries, and cookies made with love every morning.',
      rating: 4.8, totalReviews: 215, totalOrders: 512,
      location: { type: 'Point', coordinates: [72.8328, 19.0547], address: '18 Bandra West, Mumbai' },
    }
  },
  {
    email: 'techtronics@example.com', phone: '9800003333', name: 'Vikram Singh',
    city: 'Delhi', pincode: '110001', state: 'Delhi', street: '22 Nehru Place',
    biz: { businessName: 'TechTronics Electronics', businessType: 'shop', category: 'electronics',
      description: 'Latest smartphones, laptops, accessories, and gadgets at competitive prices.',
      rating: 4.4, totalReviews: 89, totalOrders: 201,
      location: { type: 'Point', coordinates: [77.2090, 28.5355], address: '22 Nehru Place, Delhi' },
    }
  },
  {
    email: 'fashionhub@example.com', phone: '9800004444', name: 'Meena Joshi',
    city: 'Bangalore', pincode: '560001', state: 'Karnataka', street: '8 Commercial Street',
    biz: { businessName: 'Fashion Hub Boutique', businessType: 'shop', category: 'clothing',
      description: 'Trendy ethnic and western wear for men, women, and kids. Fresh collection every season.',
      rating: 4.3, totalReviews: 74, totalOrders: 189,
      location: { type: 'Point', coordinates: [77.6072, 12.9716], address: '8 Commercial Street, Bangalore' },
    }
  },
  {
    email: 'medplus.pharmacy@example.com', phone: '9800005555', name: 'Dr. Arjun Nair',
    city: 'Chennai', pincode: '600001', state: 'Tamil Nadu', street: '101 Anna Salai',
    biz: { businessName: 'MedPlus Pharmacy', businessType: 'shop', category: 'pharmacy',
      description: 'Licensed pharmacy with genuine medicines, health supplements, and wellness products.',
      rating: 4.7, totalReviews: 162, totalOrders: 445,
      location: { type: 'Point', coordinates: [80.2707, 13.0827], address: '101 Anna Salai, Chennai' },
    }
  },
  // Service vendors
  {
    email: 'quickfix.plumber@example.com', phone: '9800006666', name: 'Mohan Yadav',
    city: 'Mumbai', pincode: '400003', state: 'Maharashtra', street: '77 Kurla West',
    biz: { businessName: 'QuickFix Plumbing Services', businessType: 'service', category: 'plumber',
      description: 'Professional plumbing solutions — pipe repairs, installation, leak fixing, and bathroom fittings.',
      rating: 4.5, totalReviews: 93, totalOrders: 210,
      location: { type: 'Point', coordinates: [72.8797, 19.0728], address: '77 Kurla West, Mumbai' },
    }
  },
  {
    email: 'sparkselectric@example.com', phone: '9800007777', name: 'Ravi Kumar',
    city: 'Delhi', pincode: '110002', state: 'Delhi', street: '34 Lajpat Nagar',
    biz: { businessName: 'Sparks Electrical Services', businessType: 'service', category: 'electrician',
      description: 'Expert electricians for wiring, repairs, appliance installation, and electrical safety checks.',
      rating: 4.6, totalReviews: 110, totalOrders: 280,
      location: { type: 'Point', coordinates: [77.2273, 28.5697], address: '34 Lajpat Nagar, Delhi' },
    }
  },
  {
    email: 'cleanmaster@example.com', phone: '9800008888', name: 'Pooja Reddy',
    city: 'Bangalore', pincode: '560002', state: 'Karnataka', street: '12 Indiranagar',
    biz: { businessName: 'CleanMaster Home Services', businessType: 'service', category: 'cleaner',
      description: 'Professional home and office cleaning with eco-friendly products. Deep clean, regular, and move-in/out.',
      rating: 4.7, totalReviews: 187, totalOrders: 420,
      location: { type: 'Point', coordinates: [77.6410, 12.9784], address: '12 Indiranagar, Bangalore' },
    }
  },
  {
    email: 'skilltutor@example.com', phone: '9800009999', name: 'Amit Gupta',
    city: 'Chennai', pincode: '600002', state: 'Tamil Nadu', street: '56 T Nagar',
    biz: { businessName: 'SkillUp Tutoring Center', businessType: 'service', category: 'tutor',
      description: 'Expert tutoring in Maths, Science, English, and Computer Science for Class 6–12 and competitive exams.',
      rating: 4.8, totalReviews: 94, totalOrders: 156,
      location: { type: 'Point', coordinates: [80.2336, 13.0418], address: '56 T Nagar, Chennai' },
    }
  },
  {
    email: 'woodcraft@example.com', phone: '9800010000', name: 'Suresh Verma',
    city: 'Mumbai', pincode: '400004', state: 'Maharashtra', street: '23 Matunga',
    biz: { businessName: 'WoodCraft Carpentry', businessType: 'service', category: 'carpenter',
      description: 'Custom furniture, woodwork repairs, modular kitchen fittings, and interior woodwork.',
      rating: 4.4, totalReviews: 67, totalOrders: 134,
      location: { type: 'Point', coordinates: [72.8438, 19.0267], address: '23 Matunga, Mumbai' },
    }
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  PRODUCTS  (indexed by vendor index 0–4)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const makeProducts = (vendorProfileId, vendorIdx) => {
  const lists = [
    // 0 — Sharma's Grocery
    [
      { name: 'Basmati Rice Premium', description: 'Long-grain aged basmati rice with fragrant aroma. Perfect for biryani and pulao.', category: 'groceries', price: 120, originalPrice: 140, discount: 14, stock: 200, unit: 'kg', tags: ['rice','basmati','premium'], rating: 4.7, orderCount: 89, specifications: { brand: 'India Gate', weight: '1 kg' },
        images: ['https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Toor Dal (Pigeon Peas)', description: 'Fresh toor dal sourced directly from farmers. Rich in protein and fiber.', category: 'groceries', price: 95, originalPrice: 110, discount: 13, stock: 150, unit: 'kg', tags: ['dal','toor','protein'], rating: 4.5, orderCount: 74,
        images: ['https://images.unsplash.com/photo-1585374173935-f8b2e4ce58c0?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Sunflower Cooking Oil', description: 'Refined sunflower oil, light and healthy for everyday cooking.', category: 'groceries', price: 180, originalPrice: 200, discount: 10, stock: 80, unit: 'liter', tags: ['oil','cooking','sunflower'], rating: 4.3, orderCount: 55,
        images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Fresh Tomatoes', description: 'Farm-fresh tomatoes delivered daily. Juicy and perfect for curries, salads, and chutneys.', category: 'vegetables', price: 30, stock: 100, unit: 'kg', tags: ['vegetables','tomatoes','fresh'], rating: 4.6, orderCount: 120,
        images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Baby Spinach', description: 'Tender baby spinach leaves, washed and ready to use. High in iron and vitamins.', category: 'vegetables', price: 25, stock: 60, unit: 'packet', tags: ['spinach','greens','healthy'], rating: 4.4, orderCount: 43,
        images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Alphonso Mangoes (Box)', description: 'Authentic Devgad Alphonso mangoes — sweet, saffron-yellow flesh, zero fibre. Seasonal delight!', category: 'fruits', price: 650, originalPrice: 750, discount: 13, stock: 30, unit: 'box', tags: ['mango','alphonso','seasonal'], rating: 4.9, orderCount: 38,
        images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Full Cream Milk (Pouch)', description: 'Fresh pasteurised full cream milk from verified dairy farms. Delivered fresh every morning.', category: 'dairy', price: 32, stock: 300, unit: 'packet', tags: ['milk','dairy','fresh'], rating: 4.6, orderCount: 210,
        images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Paneer (Fresh)', description: 'Soft homestyle paneer made fresh daily. Perfect for curries, grills, and snacks.', category: 'dairy', price: 85, stock: 50, unit: 'packet', tags: ['paneer','dairy','protein'], rating: 4.8, orderCount: 67,
        images: ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop&auto=format'] },
    ],
    // 1 — The Artisan Bakery
    [
      { name: 'Sourdough Bread Loaf', description: 'Classic San Francisco sourdough with crispy crust and chewy crumb. Baked fresh every morning.', category: 'bakery', price: 180, originalPrice: 200, discount: 10, stock: 40, unit: 'piece', tags: ['bread','sourdough','artisan'], rating: 4.9, orderCount: 95,
        images: ['https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Chocolate Truffle Cake (500g)', description: 'Decadent Belgian chocolate truffle cake layered with ganache. Perfect for celebrations.', category: 'bakery', price: 499, originalPrice: 550, discount: 9, stock: 20, unit: 'piece', tags: ['cake','chocolate','celebration'], rating: 4.8, orderCount: 72,
        images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Butter Croissants (Pack of 4)', description: 'Flaky, buttery French-style croissants baked fresh every morning. Pairs perfectly with coffee.', category: 'bakery', price: 120, stock: 60, unit: 'packet', tags: ['croissant','french','butter'], rating: 4.7, orderCount: 88,
        images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Multigrain Sandwich Bread', description: 'Healthy multigrain loaf with oats, flaxseeds, and sunflower seeds. Soft and nutritious.', category: 'bakery', price: 95, stock: 50, unit: 'piece', tags: ['bread','multigrain','healthy'], rating: 4.5, orderCount: 61,
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Cinnamon Rolls (6 pcs)', description: 'Warm cinnamon rolls with cream cheese frosting. Our bestseller every Sunday!', category: 'bakery', price: 249, originalPrice: 280, discount: 11, stock: 25, unit: 'box', tags: ['cinnamon','rolls','sweet'], rating: 4.9, orderCount: 105,
        images: ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Blueberry Muffins (Pack of 3)', description: 'Moist blueberry muffins bursting with fresh berries. No preservatives, baked fresh daily.', category: 'bakery', price: 149, stock: 35, unit: 'packet', tags: ['muffin','blueberry','breakfast'], rating: 4.6, orderCount: 49,
        images: ['https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop&auto=format'] },
    ],
    // 2 — TechTronics Electronics
    [
      { name: 'Samsung Galaxy M34 5G', description: '6000mAh battery, 50MP camera, 6.5" Super AMOLED display. 128GB storage, 8GB RAM.', category: 'mobile', price: 18999, originalPrice: 21999, discount: 14, stock: 15, unit: 'piece', tags: ['samsung','5g','smartphone'], rating: 4.5, orderCount: 28, specifications: { brand: 'Samsung', model: 'Galaxy M34 5G' },
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop&auto=format'] },
      { name: 'boAt Rockerz 450 Headphones', description: 'Wireless bluetooth headphones with 15-hour battery and 40mm acoustic drivers. Foldable design.', category: 'electronics', price: 1299, originalPrice: 2999, discount: 57, stock: 40, unit: 'piece', tags: ['headphones','wireless','boat'], rating: 4.4, orderCount: 62, specifications: { brand: 'boAt', model: 'Rockerz 450' },
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Realme Narzo 60x 5G', description: '108MP AI camera, 5000mAh battery, Dimensity 6100+ processor. Slimmest in its class.', category: 'mobile', price: 12999, originalPrice: 15999, discount: 19, stock: 12, unit: 'piece', tags: ['realme','5g','camera'], rating: 4.3, orderCount: 19, specifications: { brand: 'Realme', model: 'Narzo 60x' },
        images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop&auto=format'] },
      { name: 'TP-Link Wi-Fi Router AC1750', description: 'Dual-band router with speeds up to 1750Mbps. Perfect for homes and small offices.', category: 'electronics', price: 2499, originalPrice: 3200, discount: 22, stock: 22, unit: 'piece', tags: ['router','wifi','networking'], rating: 4.6, orderCount: 34, specifications: { brand: 'TP-Link', model: 'Archer A7' },
        images: ['https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Lenovo IdeaPad Slim 3 Laptop', description: '15.6" FHD display, Core i5, 8GB RAM, 512GB SSD. Ideal for students and professionals.', category: 'computers', price: 45999, originalPrice: 52999, discount: 13, stock: 8, unit: 'piece', tags: ['laptop','lenovo','student'], rating: 4.5, orderCount: 11, specifications: { brand: 'Lenovo', model: 'IdeaPad Slim 3' },
        images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Portronics Pico Projector', description: 'Compact mini projector, 200 lumens, HDMI and USB-C. Great for presentations and movies.', category: 'electronics', price: 8999, originalPrice: 11999, discount: 25, stock: 6, unit: 'piece', tags: ['projector','portable','home-theatre'], rating: 4.2, orderCount: 8,
        images: ['https://images.unsplash.com/photo-1536240478700-b869ad10e2f2?w=400&h=300&fit=crop&auto=format'] },
    ],
    // 3 — Fashion Hub
    [
      { name: 'Kurta Set — Indigo Block Print', description: 'Hand block-printed cotton kurta with matching pyjama. Breathable fabric, perfect for summers.', category: 'clothing', price: 899, originalPrice: 1299, discount: 31, stock: 25, unit: 'piece', tags: ['kurta','cotton','ethnic'], rating: 4.7, orderCount: 44, specifications: { material: 'Cotton', color: 'Indigo', size: 'S/M/L/XL/XXL' },
        images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Women\'s Linen Palazzo Set', description: 'Elegant linen palazzo pants with co-ord top. Lightweight and stylish for office and casual wear.', category: 'clothing', price: 1199, originalPrice: 1599, discount: 25, stock: 18, unit: 'piece', tags: ['palazzo','linen','women'], rating: 4.5, orderCount: 31, specifications: { material: 'Linen', color: 'Beige/White/Teal' },
        images: ['https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Men\'s Slim Fit Chinos', description: 'Premium stretch chinos in classic mid-rise slim fit. Versatile for casual and semi-formal occasions.', category: 'clothing', price: 749, originalPrice: 999, discount: 25, stock: 30, unit: 'piece', tags: ['chinos','men','casual'], rating: 4.4, orderCount: 27, specifications: { material: 'Cotton blend', color: 'Khaki/Navy/Olive' },
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Embroidered Silk Saree', description: 'Kanjivaram silk saree with traditional zari embroidery. Ideal for weddings and festivals.', category: 'clothing', price: 3499, originalPrice: 4500, discount: 22, stock: 10, unit: 'piece', tags: ['saree','silk','kanjivaram'], rating: 4.8, orderCount: 15, specifications: { material: 'Silk', color: 'Royal Red/Gold' },
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Kolhapuri Sandals (Men)', description: 'Handcrafted genuine leather Kolhapuri sandals. Durable, comfortable, and traditionally styled.', category: 'footwear', price: 599, originalPrice: 799, discount: 25, stock: 22, unit: 'piece', tags: ['sandals','leather','kolhapuri'], rating: 4.6, orderCount: 38, specifications: { material: 'Genuine Leather', color: 'Tan/Brown' },
        images: ['https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=300&fit=crop&auto=format'] },
    ],
    // 4 — MedPlus Pharmacy
    [
      { name: 'Dettol Antiseptic Liquid (500ml)', description: 'Hospital-grade antiseptic for wound cleaning, personal hygiene, and surface disinfection.', category: 'medicines', price: 149, originalPrice: 165, discount: 10, stock: 120, unit: 'ml', tags: ['antiseptic','dettol','hygiene'], rating: 4.7, orderCount: 88, specifications: { brand: 'Dettol' },
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Centrum Multivitamin (100 tabs)', description: 'Complete multivitamin formula with 24 essential nutrients for daily wellness support.', category: 'health', price: 649, originalPrice: 749, discount: 13, stock: 55, unit: 'box', tags: ['multivitamin','centrum','supplement'], rating: 4.6, orderCount: 52, specifications: { brand: 'Centrum' },
        images: ['https://images.unsplash.com/photo-1550159930-40066082a4fc?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Omron Digital BP Monitor', description: 'Clinically validated automatic blood pressure monitor with large display and memory for 60 readings.', category: 'health', price: 1899, originalPrice: 2500, discount: 24, stock: 18, unit: 'piece', tags: ['bp-monitor','omron','health'], rating: 4.8, orderCount: 29, specifications: { brand: 'Omron', model: 'HEM-7120' },
        images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Glucon-D Orange Flavour (1kg)', description: 'Instant energy glucose drink enriched with Vitamin D and calcium. Great for summer hydration.', category: 'health', price: 185, originalPrice: 210, discount: 12, stock: 80, unit: 'packet', tags: ['energy','glucose','vitamin'], rating: 4.4, orderCount: 67, specifications: { brand: 'Glucon-D' },
        images: ['https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Himalaya Liv.52 DS (60 tabs)', description: 'Ayurvedic liver support supplement for healthy liver function and detoxification.', category: 'medicines', price: 189, originalPrice: 215, discount: 12, stock: 90, unit: 'box', tags: ['himalaya','liver','ayurvedic'], rating: 4.6, orderCount: 71, specifications: { brand: 'Himalaya' },
        images: ['https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400&h=300&fit=crop&auto=format'] },
      { name: 'Pulse Oximeter Fingertip', description: 'Portable fingertip pulse oximeter. Measures SpO2 and pulse rate in seconds. Includes batteries.', category: 'health', price: 799, originalPrice: 1200, discount: 33, stock: 25, unit: 'piece', tags: ['oximeter','pulse','health'], rating: 4.5, orderCount: 36,
        images: ['https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop&auto=format'] },
    ],
  ];
  return (lists[vendorIdx] || []).map(p => ({ ...p, vendor: vendorProfileId, isAvailable: true, status: 'active', images: p.images || [], viewCount: randInt(50, 500), reviewCount: p.rating ? Math.floor(p.orderCount * 0.4) : 0 }));
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  SERVICES  (indexed by vendor index 5–9)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const makeServices = (vendorProfileId, vendorIdx) => {
  const lists = [
    // 5 — QuickFix Plumbing
    [
      { title: 'Pipe Leak Repair', description: 'Fast diagnosis and repair of leaking pipes, joints, and connections. Includes inspection of nearby plumbing.', category: 'plumbing', pricingType: 'fixed', basePrice: 299, priceUnit: 'per-visit', duration: { estimated: 60, unit: 'hours' }, features: ['Same-day service','Warranty on work','Genuine spare parts'], tags: ['leak','repair','pipe'], isEmergencyService: true, emergencyCharges: 150, rating: 4.6, bookingCount: 112,
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format'] },
      { title: 'Bathroom Fitting & Installation', description: 'Complete bathroom plumbing setup — shower, taps, flush, washbasin, and drainage system installation.', category: 'plumbing', pricingType: 'fixed', basePrice: 1200, priceUnit: 'per-project', duration: { estimated: 4, unit: 'hours' }, features: ['Labour only','Site cleanup','1-year workmanship warranty'], tags: ['bathroom','installation','fitting'], rating: 4.5, bookingCount: 67,
        images: ['https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop&auto=format'] },
      { title: 'Water Tank Cleaning', description: 'Professional overhead and underground water tank cleaning with disinfection. Ensures safe, clean water supply.', category: 'plumbing', pricingType: 'fixed', basePrice: 499, priceUnit: 'per-visit', duration: { estimated: 2, unit: 'hours' }, features: ['Eco-friendly chemicals','Certificate provided','Before & after photos'], tags: ['tank','cleaning','water'], rating: 4.7, bookingCount: 85,
        images: ['https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=400&h=300&fit=crop&auto=format'] },
    ],
    // 6 — Sparks Electrical
    [
      { title: 'Electrical Wiring & Repair', description: 'Safe rewiring, switch/socket replacement, and circuit repair by certified electricians.', category: 'electrical', pricingType: 'hourly', basePrice: 350, priceUnit: 'per-hour', duration: { estimated: 2, unit: 'hours' }, features: ['ISI certified materials','Safety inspection','MCB installation'], tags: ['wiring','repair','electrical'], isEmergencyService: true, emergencyCharges: 200, rating: 4.7, bookingCount: 134,
        images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&auto=format'] },
      { title: 'Fan & Light Installation', description: 'Professional installation of ceiling fans, tube lights, LED strips, and chandelier fittings.', category: 'electrical', pricingType: 'fixed', basePrice: 199, priceUnit: 'per-visit', duration: { estimated: 1, unit: 'hours' }, features: ['Per unit pricing','Same-day slots','No hidden charges'], tags: ['fan','light','installation'], rating: 4.5, bookingCount: 198,
        images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=300&fit=crop&auto=format'] },
      { title: 'AC Installation & Service', description: 'Split and window AC installation, gas refilling, coil cleaning, and annual maintenance contracts.', category: 'ac-repair', pricingType: 'fixed', basePrice: 799, priceUnit: 'per-visit', duration: { estimated: 2, unit: 'hours' }, features: ['All brands','Gas top-up available','AMC packages available'], tags: ['ac','installation','service'], rating: 4.6, bookingCount: 89,
        images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop&auto=format'] },
    ],
    // 7 — CleanMaster
    [
      { title: 'Home Deep Cleaning', description: 'Thorough deep cleaning of your entire home — kitchen, bathrooms, bedrooms, and living areas. Steam cleaning available.', category: 'cleaning', pricingType: 'fixed', basePrice: 1499, priceUnit: 'per-visit', duration: { estimated: 6, unit: 'hours' }, features: ['Eco-friendly products','Trained staff','Before & after photos'], tags: ['deep-clean','home','thorough'], rating: 4.8, bookingCount: 203,
        images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&auto=format'] },
      { title: 'Kitchen Deep Clean', description: 'Intensive kitchen cleaning — chimney, stove, tiles, sink, shelves, and appliances. Grease removal guaranteed.', category: 'cleaning', pricingType: 'fixed', basePrice: 699, priceUnit: 'per-visit', duration: { estimated: 3, unit: 'hours' }, features: ['Chimney cleaning','Appliance wipe-down','Anti-bacterial spray'], tags: ['kitchen','chimney','deep-clean'], rating: 4.7, bookingCount: 156,
        images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format'] },
      { title: 'Sofa & Carpet Dry Cleaning', description: 'Professional fabric sofa and carpet dry cleaning with steam extraction. Removes stains, odours, and dust mites.', category: 'cleaning', pricingType: 'per-visit', basePrice: 299, priceUnit: 'per-visit', duration: { estimated: 2, unit: 'hours' }, features: ['Per seat/sq.ft pricing','Fast dry','Stain removal guarantee'], tags: ['sofa','carpet','steam'], rating: 4.6, bookingCount: 118,
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop&auto=format'] },
      { title: 'Office Cleaning (Daily/Weekly)', description: 'Regular office cleaning service — floors, workstations, pantry, and washrooms. Flexible daily/weekly contracts.', category: 'cleaning', pricingType: 'fixed', basePrice: 899, priceUnit: 'per-day', duration: { estimated: 3, unit: 'hours' }, features: ['Morning/evening slots','Consumables included','Insured staff'], tags: ['office','regular','contract'], rating: 4.5, bookingCount: 72,
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&auto=format'] },
    ],
    // 8 — SkillUp Tutoring
    [
      { title: 'Mathematics Tutoring (Class 6–10)', description: 'Concept-based maths tutoring covering NCERT curriculum. Exam preparation, practice sets, and weekly tests.', category: 'tutoring', pricingType: 'hourly', basePrice: 499, priceUnit: 'per-hour', duration: { estimated: 1, unit: 'hours' }, features: ['NCERT + CBSE/ICSE','Weekly assessments','Study materials'], tags: ['maths','school','cbse'], rating: 4.8, bookingCount: 94,
        images: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop&auto=format'] },
      { title: 'Physics & Chemistry (Class 11–12)', description: 'Comprehensive coaching for JEE/NEET aspirants and board exam preparation in Physics and Chemistry.', category: 'tutoring', pricingType: 'hourly', basePrice: 699, priceUnit: 'per-hour', duration: { estimated: 1, unit: 'hours' }, features: ['JEE/NEET focus','Mock test series','Doubt sessions'], tags: ['physics','chemistry','jee','neet'], rating: 4.9, bookingCount: 81,
        images: ['https://images.unsplash.com/photo-1532094349884-543559ce5b79?w=400&h=300&fit=crop&auto=format'] },
      { title: 'English Grammar & Communication', description: 'Improve spoken English, writing skills, and grammar with personalised one-on-one or group sessions.', category: 'tutoring', pricingType: 'hourly', basePrice: 399, priceUnit: 'per-hour', duration: { estimated: 1, unit: 'hours' }, features: ['Spoken English','Grammar workbooks','Certificate on completion'], tags: ['english','grammar','communication'], rating: 4.7, bookingCount: 65,
        images: ['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop&auto=format'] },
    ],
    // 9 — WoodCraft Carpentry
    [
      { title: 'Custom Furniture Design & Build', description: 'Bespoke wooden furniture designed to your specifications — wardrobes, beds, study tables, and storage units.', category: 'carpentry', pricingType: 'negotiable', basePrice: 5000, priceUnit: 'per-project', duration: { estimated: 7, unit: 'days' }, features: ['3D design preview','Grade A wood','5-year warranty'], tags: ['furniture','custom','wood'], rating: 4.5, bookingCount: 42,
        images: ['https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&h=300&fit=crop&auto=format'] },
      { title: 'Door & Window Repair', description: 'Fixing warped or broken wooden doors and windows — hinge replacement, polishing, lock installation.', category: 'carpentry', pricingType: 'fixed', basePrice: 399, priceUnit: 'per-visit', duration: { estimated: 2, unit: 'hours' }, features: ['Same-day service','Genuine hardware','Polishing included'], tags: ['door','window','repair'], rating: 4.4, bookingCount: 78,
        images: ['https://images.unsplash.com/photo-1517281862878-818d89f4b53d?w=400&h=300&fit=crop&auto=format'] },
      { title: 'Modular Kitchen Installation', description: 'Professional installation of modular kitchen cabinets, shutters, counter tops, and pull-out units.', category: 'carpentry', pricingType: 'fixed', basePrice: 3500, priceUnit: 'per-project', duration: { estimated: 3, unit: 'days' }, features: ['All brands','Plywood + laminate','Lifetime hardware support'], tags: ['modular','kitchen','installation'], rating: 4.6, bookingCount: 31,
        images: ['https://images.unsplash.com/photo-1556909114-49d4aa7ba39f?w=400&h=300&fit=crop&auto=format'] },
    ],
  ];
  const serviceVendorIdx = vendorIdx - 5;
  return (lists[serviceVendorIdx] || []).map(s => ({
    ...s,
    provider: vendorProfileId,
    isAvailable: true,
    status: 'active',
    images: s.images || [],
    availableSlots: fullWeekSlots(),
    serviceArea: { radius: 10, specificAreas: ['Local area', 'City-wide'] },
    requirements: { materialsIncluded: false },
    viewCount: randInt(30, 400),
    reviewCount: Math.floor((s.bookingCount || 10) * 0.35),
  }));
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MAIN SEED FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function seed() {
  console.log('\n🌱 LocalLink Database Seed Script\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB\n');

    // ── Clean ──────────────────────────────────────────────
    if (CLEAN) {
      console.log('🧹 Cleaning existing data…');
      await Promise.all([User.deleteMany({}), VendorProfile.deleteMany({}), Product.deleteMany({}), Service.deleteMany({}), Order.deleteMany({}), Booking.deleteMany({})]);
      console.log('   All collections cleared.\n');
    }

    // ── Customers ──────────────────────────────────────────
    console.log('👤 Creating customers…');
    const passwordHash = await hashPwd('Test123456');
    const customers = await User.insertMany(CUSTOMERS_DATA.map(c => ({
      name: c.name, email: c.email, phone: c.phone, role: 'customer',
      password: passwordHash, isActive: true, isVerified: true,
      address: { street: c.street, city: c.city, pincode: c.pincode, state: c.state },
    })));
    console.log(`   ✅ ${customers.length} customers created`);

    // ── Vendor Users ───────────────────────────────────────
    console.log('\n🏪 Creating vendor users…');
    const vendorUsers = await User.insertMany(VENDORS_DATA.map(v => ({
      name: v.name, email: v.email, phone: v.phone, role: 'vendor',
      password: passwordHash, isActive: true, isVerified: true,
      address: { street: v.street, city: v.city, pincode: v.pincode, state: v.state },
    })));
    console.log(`   ✅ ${vendorUsers.length} vendor users created`);

    // ── Vendor Profiles ────────────────────────────────────
    console.log('\n📋 Creating vendor profiles…');
    const vendorProfiles = await VendorProfile.insertMany(vendorUsers.map((u, i) => {
      const biz = VENDORS_DATA[i].biz;
      return {
        user: u._id, businessName: biz.businessName, businessType: biz.businessType,
        category: biz.category, description: biz.description,
        rating: biz.rating || 4.5, totalReviews: biz.totalReviews || 50,
        totalOrders: biz.totalOrders || 100,
        location: biz.location,
        isVerified: true, isActive: true,
        serviceRadius: biz.businessType === 'service' ? 10 : 5,
        operatingHours: {
          monday:    { open: '09:00', close: '20:00', isOpen: true },
          tuesday:   { open: '09:00', close: '20:00', isOpen: true },
          wednesday: { open: '09:00', close: '20:00', isOpen: true },
          thursday:  { open: '09:00', close: '20:00', isOpen: true },
          friday:    { open: '09:00', close: '20:00', isOpen: true },
          saturday:  { open: '09:00', close: '18:00', isOpen: true },
          sunday:    { open: '10:00', close: '14:00', isOpen: i < 5 },
        },
      };
    }));
    console.log(`   ✅ ${vendorProfiles.length} vendor profiles created`);

    // ── Products ───────────────────────────────────────────
    console.log('\n📦 Creating products…');
    const allProducts = [];
    for (let i = 0; i < 5; i++) {
      const prods = makeProducts(vendorProfiles[i]._id, i);
      allProducts.push(...prods);
    }
    const savedProducts = await Product.insertMany(allProducts);
    console.log(`   ✅ ${savedProducts.length} products created`);

    // ── Services ───────────────────────────────────────────
    console.log('\n🛠️  Creating services…');
    const allServices = [];
    for (let i = 5; i < 10; i++) {
      const svcs = makeServices(vendorProfiles[i]._id, i);
      allServices.push(...svcs);
    }
    const savedServices = await Service.insertMany(allServices);
    console.log(`   ✅ ${savedServices.length} services created`);

    // ── Orders ─────────────────────────────────────────────
    console.log('\n🛒 Creating orders…');

    const orderStatuses = ['pending','confirmed','preparing','ready','out-for-delivery','delivered','delivered','delivered','cancelled'];
    const orderTemplates = [];
    let orderCounter = 1;

    // Each customer gets orders from multiple vendors
    const orderScenarios = [
      // [customerIdx, vendorIdx (shop only: 0-4), productIdxInVendor, qty, daysAgoN, status]
      [0, 0, [0,1,2], [2,1,1], 20, 'delivered'],
      [0, 1, [0,1], [1,2], 14, 'delivered'],
      [0, 2, [0], [1], 7, 'out-for-delivery'],
      [0, 3, [2,4], [1,1], 3, 'confirmed'],
      [0, 4, [0,1], [1,1], 1, 'pending'],

      [1, 0, [3,4,6], [2,3,4], 25, 'delivered'],
      [1, 1, [2,4], [1,1], 18, 'delivered'],
      [1, 2, [1,3], [1,2], 10, 'delivered'],
      [1, 3, [0,1], [1,1], 5, 'preparing'],
      [1, 4, [2,4], [1,1], 2, 'confirmed'],

      [2, 0, [0,5,7], [1,1,2], 30, 'delivered'],
      [2, 1, [0,2,5], [2,1,1], 22, 'delivered'],
      [2, 2, [4], [1], 8, 'cancelled'],
      [2, 3, [2,3], [2,1], 4, 'ready'],
      [2, 4, [0,5], [1,1], 1, 'pending'],

      [3, 0, [1,2,6], [3,1,2], 35, 'delivered'],
      [3, 1, [1,3,4], [1,1,1], 28, 'delivered'],
      [3, 2, [2,5], [1,1], 12, 'delivered'],
      [3, 3, [0,4], [1,1], 6, 'confirmed'],
      [3, 4, [1,3], [2,1], 2, 'pending'],
    ];

    const productsByVendor = [];
    for (let i = 0; i < 5; i++) {
      const vp = vendorProfiles[i];
      productsByVendor.push(savedProducts.filter(p => p.vendor.toString() === vp._id.toString()));
    }

    for (const [custIdx, vendIdx, prodIdxs, qtys, daysAgoN, status] of orderScenarios) {
      const customer = customers[custIdx];
      const vendorProfile = vendorProfiles[vendIdx];
      const vendProds = productsByVendor[vendIdx];

      const items = prodIdxs.map((pIdx, i) => {
        const product = vendProds[Math.min(pIdx, vendProds.length - 1)];
        if (!product) return null;
        const qty = qtys[i] || 1;
        return { product: product._id, quantity: qty, price: product.price, total: product.price * qty };
      }).filter(Boolean);

      if (items.length === 0) continue;

      const subtotal = items.reduce((s, i) => s + i.total, 0);
      const deliveryCharges = subtotal > 500 ? 0 : 40;
      const totalAmount = subtotal + deliveryCharges;

      const hist = [{ status: 'pending', timestamp: daysAgo(daysAgoN + 1), note: 'Order placed', updatedBy: customer._id }];
      if (['confirmed','preparing','ready','out-for-delivery','delivered','cancelled'].includes(status)) {
        hist.push({ status: 'confirmed', timestamp: daysAgo(daysAgoN), note: 'Order confirmed', updatedBy: vendorUsers[vendIdx]._id });
      }
      if (['preparing','ready','out-for-delivery','delivered'].includes(status)) {
        hist.push({ status: 'preparing', timestamp: daysAgo(daysAgoN - 1), note: 'Preparing your order' });
      }
      if (['ready','out-for-delivery','delivered'].includes(status)) {
        hist.push({ status: 'ready', timestamp: daysAgo(Math.max(0, daysAgoN - 2)), note: 'Ready for pickup/delivery' });
      }
      if (['out-for-delivery','delivered'].includes(status)) {
        hist.push({ status: 'out-for-delivery', timestamp: daysAgo(Math.max(0, daysAgoN - 3)), note: 'Out for delivery' });
      }
      if (status === 'delivered') {
        hist.push({ status: 'delivered', timestamp: daysAgo(Math.max(0, daysAgoN - 4)), note: 'Delivered successfully' });
      }
      if (status === 'cancelled') {
        hist.push({ status: 'cancelled', timestamp: daysAgo(daysAgoN), note: 'Cancelled by customer' });
      }

      orderTemplates.push({
        orderNumber: genOrderNum(orderCounter++),
        customer: customer._id, vendor: vendorProfile._id,
        items, subtotal, deliveryCharges, discount: 0, totalAmount,
        deliveryAddress: {
          name: customer.name, phone: customer.phone,
          street: CUSTOMERS_DATA[custIdx].street, city: CUSTOMERS_DATA[custIdx].city,
          pincode: CUSTOMERS_DATA[custIdx].pincode,
        },
        deliveryType: rand(['home-delivery','self-pickup']),
        status,
        statusHistory: hist,
        paymentMethod: rand(['cash-on-delivery','pay-at-shop']),
        paymentStatus: status === 'delivered' ? 'payment-received' : 'unpaid',
        orderDate: daysAgo(daysAgoN + 1),
        expectedDeliveryDate: daysFromNow(status === 'pending' ? 2 : 0),
        actualDeliveryDate: status === 'delivered' ? daysAgo(Math.max(0, daysAgoN - 4)) : undefined,
        isReviewed: status === 'delivered' && Math.random() > 0.4,
        rating: status === 'delivered' ? randInt(3, 5) : undefined,
      });
    }

    const savedOrders = await Order.insertMany(orderTemplates);
    console.log(`   ✅ ${savedOrders.length} orders created`);

    // ── Bookings ───────────────────────────────────────────
    console.log('\n📅 Creating bookings…');

    const serviceVendorProfiles = vendorProfiles.slice(5); // indices 5-9
    const bookingStatuses = ['pending','confirmed','completed','completed','completed','cancelled','in-progress'];

    const bookingScenarios = [
      // [custIdx, serviceVendorIdx (0=plumber,1=electrical,2=cleaner,3=tutor,4=carpenter), serviceIdx, daysAgoN, status]
      [0, 0, 0, 15, 'completed'],
      [0, 2, 0, 8, 'completed'],
      [0, 1, 1, 3, 'confirmed'],
      [0, 3, 0, -2, 'pending'],    // future booking

      [1, 2, 1, 20, 'completed'],
      [1, 1, 0, 12, 'completed'],
      [1, 4, 0, 5, 'confirmed'],
      [1, 0, 2, -1, 'pending'],    // future

      [2, 3, 1, 25, 'completed'],
      [2, 2, 0, 18, 'completed'],
      [2, 0, 1, 7, 'completed'],
      [2, 1, 2, 2, 'in-progress'],
      [2, 4, 1, -3, 'pending'],   // future

      [3, 2, 3, 30, 'completed'],
      [3, 3, 2, 22, 'completed'],
      [3, 1, 1, 10, 'cancelled'],
      [3, 0, 0, 4, 'confirmed'],
      [3, 4, 2, -1, 'pending'],   // future
    ];

    const servicesByVendor = serviceVendorProfiles.map(svp =>
      savedServices.filter(s => s.provider.toString() === svp._id.toString())
    );

    const bookingDocs = [];
    let bookingCounter = 1;

    for (const [custIdx, svcVendIdx, svcIdx, daysAgoN, status] of bookingScenarios) {
      const customer = customers[custIdx];
      const custData = CUSTOMERS_DATA[custIdx];
      const svVendorProfile = serviceVendorProfiles[svcVendIdx];
      const svVendorUser = vendorUsers[5 + svcVendIdx];
      const svcList = servicesByVendor[svcVendIdx];
      const service = svcList[Math.min(svcIdx, svcList.length - 1)];
      if (!service) continue;

      const scheduledDate = daysAgoN < 0 ? daysFromNow(Math.abs(daysAgoN)) : daysAgo(daysAgoN);

      const hist = [{ status: 'pending', timestamp: daysAgo(daysAgoN + 2), note: 'Booking placed', updatedBy: 'customer' }];
      if (['confirmed','in-progress','completed','cancelled'].includes(status)) {
        hist.push({ status: 'confirmed', timestamp: daysAgo(daysAgoN + 1), note: 'Booking confirmed by vendor', updatedBy: 'vendor' });
      }
      if (['in-progress','completed'].includes(status)) {
        hist.push({ status: 'in-progress', timestamp: daysAgo(Math.max(0, daysAgoN - 1)), note: 'Service started', updatedBy: 'vendor' });
      }
      if (status === 'completed') {
        hist.push({ status: 'completed', timestamp: daysAgo(Math.max(0, daysAgoN - 1)), note: 'Service completed successfully', updatedBy: 'vendor' });
      }
      if (status === 'cancelled') {
        hist.push({ status: 'cancelled', timestamp: daysAgo(daysAgoN), note: 'Cancelled by customer', updatedBy: 'customer' });
      }

      bookingDocs.push({
        bookingNumber: genBookNum(bookingCounter++),
        customer: customer._id,
        vendor: svVendorProfile._id,
        service: service._id,
        serviceDetails: {
          name: service.title, description: service.description,
          price: service.basePrice, duration: service.duration.estimated * 60,
          category: service.category,
        },
        scheduledDate,
        scheduledTime: rand(['09:00','10:00','11:00','14:00','15:00','16:00']),
        totalAmount: service.basePrice,
        customerInfo: { name: customer.name, phone: customer.phone, email: customer.email, address: { street: custData.street, city: custData.city, state: custData.state, pincode: custData.pincode } },
        serviceLocation: 'customer-location',
        serviceAddress: { street: custData.street, city: custData.city, state: custData.state, pincode: custData.pincode },
        paymentMethod: rand(['cash','pay-at-service']),
        paymentStatus: status === 'completed' ? 'payment-received' : 'unpaid',
        status,
        statusHistory: hist,
        bookingDate: daysAgo(daysAgoN + 2),
        rating: status === 'completed' ? randInt(4, 5) : undefined,
        feedback: status === 'completed' ? rand(['Excellent work! Very professional.','Great service, highly recommended!','On time and thorough.','Very satisfied with the results.']) : undefined,
        completedAt: status === 'completed' ? daysAgo(Math.max(0, daysAgoN - 1)) : undefined,
        cancelledAt: status === 'cancelled' ? daysAgo(daysAgoN) : undefined,
      });
    }

    const savedBookings = await Booking.insertMany(bookingDocs);
    console.log(`   ✅ ${savedBookings.length} bookings created`);

    // ── Summary ────────────────────────────────────────────
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉  Seed complete!\n');
    console.log('📊 Summary:');
    console.log(`   👤 Customers    : ${customers.length}`);
    console.log(`   🏪 Vendors      : ${vendorProfiles.length}`);
    console.log(`   📦 Products     : ${savedProducts.length}`);
    console.log(`   🛠️  Services     : ${savedServices.length}`);
    console.log(`   🛒 Orders       : ${savedOrders.length}`);
    console.log(`   📅 Bookings     : ${savedBookings.length}`);
    console.log('\n🔑 Login credentials (all passwords: Test123456)');
    console.log('\n   Customers:');
    CUSTOMERS_DATA.forEach(c => console.log(`   • ${c.email}`));
    console.log('\n   Vendors:');
    VENDORS_DATA.forEach(v => console.log(`   • ${v.email}  (${v.biz.businessName})`));
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    if (err.errors) Object.entries(err.errors).forEach(([k,v]) => console.error(`   ${k}: ${v.message}`));
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

seed();
