# Local Link — Development Status

## Project Overview
Local Link is a community-based marketplace platform built with the MERN stack (MongoDB, Express, React, Node.js). It connects local vendors (shops and service providers) with nearby customers. Vendors can list products and services; customers can browse, order, and book them. An admin panel manages vendor verification and content approval.

**Stack**: MongoDB · Express.js · React.js · Node.js · Tailwind CSS · JWT Auth · Leaflet Maps

---

## Running the Project

```bash
# Terminal 1 — Backend (port 5000)
cd backend
node server.js

# Terminal 2 — Frontend (port 3000)
cd frontend
npm start

# MongoDB must be running locally on port 27017
```

**Admin credentials**
- Email: `admin@locallink.com`
- Password: `Admin@1234`

---

## Architecture

```
backend/
  config/         # MongoDB connection
  controllers/    # Route handlers (auth, product, service, order, booking, admin)
  middleware/     # JWT auth, role authorization, optional auth
  models/         # Mongoose schemas
  routes/         # Express routers
  scripts/        # Utility scripts (createAdmin, createIndexes, testGeo)
  utils/          # Input validation rules

frontend/
  src/
    components/   # Navbar, Footer, Cart, LocationPicker, ServiceBookingModal, NotificationBell
    context/      # AuthContext, CartContext, LocationContext, NotificationContext
    pages/        # All page components
    pages/admin/  # Admin-only pages
    services/     # Axios API instance + authService
```

---

## Database Models

| Model | Key Fields |
|-------|-----------|
| User | name, email, password (hashed), phone, role (customer/vendor/admin), address, isActive |
| VendorProfile | user (ref), businessName, businessType (shop/service), category, description, location (GeoJSON Point), isVerified, verificationStatus |
| Product | name, description, vendor (ref VendorProfile), category, price, stock, unit, images, isAvailable, status (active/inactive/pending-approval/rejected) |
| Service | title, description, provider (ref VendorProfile), category, pricingType, basePrice, priceUnit, duration, images, isAvailable, status |
| Order | orderNumber, customer (ref User), vendor (ref VendorProfile), items[], deliveryType, deliveryAddress, paymentMethod, status, statusHistory[], totalAmount |
| Booking | customer (ref User), provider (ref VendorProfile), service (ref Service), scheduledDate, scheduledTime, serviceLocation, status, statusHistory[] |
| Notification | recipient (ref User), type, title, message, isRead |

---

## What Is Fully Working

### Authentication
- JWT-based login and registration for customer and vendor roles
- Password hashing with bcryptjs
- Protected routes on frontend (ProtectedRoute, AdminRoute components)
- Optional auth middleware for public endpoints that also serve logged-in users
- `GET /api/auth/profile` — returns user + vendorProfile
- `PUT /api/auth/profile` — update user info
- `PUT /api/auth/change-password`
- `PUT /api/auth/vendor/location` — update vendor GPS location (lat/lng/address)

### Vendor Registration & Profile
- Vendors register with business name, type (shop/service), and category
- Location picker (Leaflet map) available during registration and in profile page
- Location uses GPS detection, address search (Nominatim), or manual map click
- Vendor profile shows existing location on load; can update anytime from Profile page
- Profile page has a working "Edit Profile" form for personal info

### Admin System
- Admin account created via `node scripts/createAdmin.js`
- Admin dashboard at `/admin` with stats (users, vendors, products, services, orders, bookings)
- Vendor verification: admin can approve or reject vendor accounts
- Product approval: admin can approve or reject products (sets status active/rejected)
- Service approval: admin can approve or reject services
- Notifications sent to vendor on approval/rejection
- Admin routes protected by `AdminRoute` component on frontend

### Product System
- Vendors create products (saved as `pending-approval`, must be approved by admin to go public)
- Public product listing filters by `status: active` and `isAvailable: true`
- Location-based filtering: if customer has location enabled, products are filtered by vendors within radius using `$nearSphere` geo query
- The `2dsphere` index on `VendorProfile.location` is required and must be created via `node scripts/createIndexes.js` if the collection pre-existed
- Search by name/description/tags, filter by category, price range, sort options, pagination
- Vendors see their own products (all statuses) at `/products/vendor/my-products`
- Soft delete (sets status to inactive)
- Pre-save hook: automatically sets `isAvailable = false` when stock reaches 0

### Service System
- Same approval workflow as products (pending-approval → admin approves → active)
- Service field is `provider` (not `vendor`) — this is intentional and consistent throughout
- Location-based filtering same as products
- Flexible pricing: fixed, hourly, per-visit, negotiable
- Duration tracking in minutes

### Order System
- Customers add products to cart (CartContext, persisted in localStorage)
- Checkout supports home delivery (with address) or self-pickup
- Payment methods: Cash on Delivery, Pay at Shop
- Multi-vendor: one checkout creates separate orders per vendor automatically
- Stock validated and decremented on order creation; restored on cancellation
- Order status flow: pending → confirmed → preparing → ready → out-for-delivery → delivered
- Vendors update order status with optional notes
- Customers can cancel pending/confirmed orders
- Full status history timeline stored per order

### Booking System
- Customers book services via ServiceBookingModal
- Service location options: home service, vendor location, online
- Date/time scheduling
- Booking status flow: pending → confirmed → in-progress → completed
- Vendors manage bookings from `/bookings` (vendor view)
- Customers view/cancel/reschedule from `/bookings` (customer view)
- Vendor booking stats endpoint: `GET /api/bookings/vendor/stats`

### Notifications
- NotificationBell component in navbar
- Notifications created on: vendor approval/rejection, product approval/rejection, service approval/rejection
- NotificationContext manages unread count and polling

### Location System
- LocationContext stores user's lat/lng/radius in localStorage
- LocationBar and LocationPicker components for customer location setting
- When location is enabled, product/service API calls include lat/lng/radius params
- If geo query returns 0 vendors, API returns empty results with a message (not a silent failure)
- Dashboard shows a warning banner for vendors who haven't set their location

### Dashboard
- Vendor dashboard: live stats (products, services, orders, bookings), recent listings, quick actions
- Vendor dashboard shows a location-missing warning banner with link to profile if location is `[0,0]`
- Customer dashboard: live stats (orders, bookings, total spent), quick navigation
- Admin redirected to `/admin` automatically

---

## Known Issues / Limitations

### No Real Payment Integration
- Only Cash on Delivery and Pay at Shop are supported
- No Razorpay, Stripe, or UPI integration

### No Image Upload
- Product and service images are stored as URLs (strings), not actual file uploads
- No S3, Cloudinary, or local multer upload implemented
- Vendors must paste image URLs manually

### Profile Page — Vendor Business Info Not Editable
- The Business Information section in Profile shows vendor data as read-only
- There is no form to update businessName, businessType, category, or description after registration

### Password Change — UI Only
- The "Change Password" button in Profile exists but has no form implemented
- The backend endpoint `PUT /api/auth/change-password` works correctly

### No Email Verification
- Users are marked `isVerified: false` by default but no email is sent
- No OTP or email confirmation flow exists

### No Real-time Updates
- No WebSocket or Socket.io — order/booking status changes require page refresh to reflect
- Notifications use polling (if implemented) not push

### Location Edge Cases
- If a vendor sets location to `[0,0]` (default), they won't appear in any location-based search
- The `createIndexes.js` script must be run manually on fresh MongoDB instances to create the `2dsphere` index — without it, all geo queries fail with an error

### Admin Panel Gaps
- No order management in admin panel (can't view/manage all orders)
- No booking management in admin panel
- No user deactivation UI (model supports `isActive` but no admin action)
- No bulk approve/reject for products or services

### Duplicate Schema Index Warning
- Console shows `[MONGOOSE] Warning: Duplicate schema index on {"user":1}` for VendorProfile
- Caused by both `unique: true` on the field and `vendorProfileSchema.index({ user: 1 })` — harmless but noisy

---

## What Needs To Be Done

### High Priority
1. **Image Upload** — Integrate Cloudinary or multer for actual file uploads instead of URL strings
2. **Vendor Business Profile Edit** — Allow vendors to update businessName, category, description from Profile page
3. **Password Change Form** — Wire up the existing backend endpoint to a frontend form
4. **Real-time Notifications** — Replace polling with Socket.io for instant order/booking status updates

### Medium Priority
5. **Payment Gateway** — Integrate Razorpay or Stripe for online payments
6. **Email Notifications** — Send emails on registration, order placement, status changes (Nodemailer + Gmail/SendGrid)
7. **Admin Order/Booking Management** — Add order and booking views to admin panel
8. **Reviews & Ratings** — Allow customers to rate products and services after completion
9. **Search Improvements** — Add full-text search index on MongoDB for better product/service search

### Low Priority / Future
10. **Fix duplicate index warning** — Remove redundant `vendorProfileSchema.index({ user: 1 })` since `unique: true` already creates it
11. **User deactivation** — Admin UI to activate/deactivate user accounts
12. **Vendor analytics** — Revenue charts, order trends, popular products
13. **Customer wishlist** — Save products/services for later
14. **Promo codes / discounts** — Coupon system for orders
15. **Production deployment** — Deploy to cloud (Railway/Render for backend, Vercel for frontend, MongoDB Atlas for DB)

---

## API Endpoints Reference

### Auth — `/api/auth`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | /register | Public | Register user (customer or vendor) |
| POST | /login | Public | Login, returns JWT |
| GET | /profile | Private | Get current user + vendorProfile |
| PUT | /profile | Private | Update name, phone, address |
| PUT | /change-password | Private | Change password |
| PUT | /vendor/location | Vendor | Update business GPS location |

### Products — `/api/products`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | / | Public | Browse active products (filters: search, category, price, lat/lng/radius, sort, page) |
| GET | /:id | Public | Single product detail |
| POST | / | Vendor (verified) | Create product (saved as pending-approval) |
| PUT | /:id | Vendor | Update own product |
| DELETE | /:id | Vendor | Soft delete own product |
| GET | /vendor/my-products | Vendor | Own products (all statuses) |

### Services — `/api/services`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | / | Public | Browse active services (same filters as products) |
| GET | /:id | Public | Single service detail |
| POST | / | Vendor (verified) | Create service (saved as pending-approval) |
| PUT | /:id | Vendor | Update own service |
| DELETE | /:id | Vendor | Soft delete own service |
| GET | /vendor/my-services | Vendor | Own services (all statuses) |

### Orders — `/api/orders`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | / | Customer | Create order (multi-vendor, validates stock) |
| GET | / | Customer | Own order history (filter by status, sort, paginate) |
| GET | /vendor | Vendor | Incoming orders for vendor's products |
| GET | /:id | Customer/Vendor | Single order detail |
| PUT | /:id/status | Vendor | Update order status with optional note |
| PUT | /:id/cancel | Customer/Vendor | Cancel order (restores stock) |

### Bookings — `/api/bookings`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | / | Customer | Create booking |
| GET | / | Customer | Own bookings |
| GET | /vendor | Vendor | Incoming bookings |
| GET | /vendor/stats | Vendor | Booking statistics |
| GET | /:id | Customer/Vendor | Single booking detail |
| PUT | /:id/status | Vendor | Update booking status |
| PUT | /:id/cancel | Customer | Cancel booking |
| PUT | /:id/reschedule | Customer | Reschedule booking |

### Admin — `/api/admin`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | /stats | Admin | Platform-wide statistics |
| GET | /vendors | Admin | List vendors (filter by status) |
| PUT | /vendors/:id/approve | Admin | Approve vendor |
| PUT | /vendors/:id/reject | Admin | Reject vendor with reason |
| GET | /products | Admin | List products (filter by status) |
| PUT | /products/:id/approve | Admin | Approve product (sets active) |
| PUT | /products/:id/reject | Admin | Reject product |
| GET | /services | Admin | List services (filter by status) |
| PUT | /services/:id/approve | Admin | Approve service |
| PUT | /services/:id/reject | Admin | Reject service |
| GET | /users | Admin | List all users |

### Notifications — `/api/notifications`
- `GET /` — Get user notifications
- `PUT /:id/read` — Mark as read
- `PUT /read-all` — Mark all as read

---

## Git Info
- **Branch**: `feature/admin-system`
- **Remote**: GitHub
- All changes committed and pushed
