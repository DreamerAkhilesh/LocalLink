# LocalLink 🛍️

A full-stack hyperlocal marketplace where customers discover nearby shops and service providers, place orders, book services, and track everything in one place.
It's exactly a combination of various products and services at one place bringing comfort and ease to the customer.

---

## Features

### For Customers
- **Browse products & services** — filtered by location radius or browse all
- **Location-aware search** — set your city/address and radius; fallback to all listings if no vendors are nearby
- **Add to cart & checkout** — home delivery or self-pickup, COD or pay-at-shop
- **Book services** — choose a date/time slot, track booking status
- **Order & booking history** — real-time status updates with timeline
- **Notifications** — in-app alerts for order/booking changes

### For Vendors
- **Dashboard** — overview of orders, bookings, products, and services
- **Product management** — add/edit/delete products with image upload (drag-and-drop or browse), pricing, stock, discounts
- **Service management** — add/edit/delete services with pricing types (fixed / hourly / per-visit / negotiable), duration, and availability slots
- **Order fulfilment** — accept, prepare, and mark orders as delivered
- **Booking management** — confirm, start, complete, or cancel bookings

### Authentication
- Email + phone registration with **OTP email verification** (Mailtrap in dev, any SMTP in prod)
- JWT-based sessions (7-day expiry)
- Separate customer and vendor roles

### UX
- Purple Glass design system (dark/light-friendly CSS variables)
- Toast notification system (success / error / info / warning)
- Category-aware image placeholders when no photo is uploaded
- Debounced search filters (no per-keystroke API calls)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Tailwind CSS, Axios |
| Backend | Node.js 18+, Express 4, Mongoose 8 |
| Database | MongoDB Atlas |
| Auth | JWT (jsonwebtoken), bcryptjs |
| File uploads | Multer 2 (disk storage) |
| Email | Nodemailer + Mailtrap (dev) / any SMTP (prod) |
| Maps | Leaflet / react-leaflet |

---

## Project Structure

```
LocalLink/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── services/        # Email service (Nodemailer)
│   ├── utils/           # Validation rules (express-validator)
│   ├── uploads/         # User-uploaded images (gitignored)
│   ├── seed.js          # Demo data seeder
│   ├── server.js        # Entry point
│   └── .env.example     # Environment variable template
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/  # Reusable UI (Navbar, ImageUploader, ToastContainer…)
    │   ├── context/     # React Context (Auth, Cart, Location, Toast, Notifications)
    │   ├── pages/       # Route-level page components
    │   └── services/    # Axios API instance & auth service
    ├── package.json     # "proxy": "http://localhost:5000" for dev
    └── .env.example     # Environment variable template
```

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- [Mailtrap](https://mailtrap.io) account (free) for email OTP

### 1. Clone and install

```bash
git clone https://github.com/your-username/LocalLink.git
cd LocalLink

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install
```

### 2. Configure environment variables

**Backend** — copy the template and fill in your values:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string (32+ chars) for signing tokens |
| `CLIENT_URL` | Frontend origin — `http://localhost:3000` for dev |
| `MAILTRAP_HOST` | `sandbox.smtp.mailtrap.io` |
| `MAILTRAP_PORT` | `2525` |
| `MAILTRAP_USER` | From Mailtrap → your inbox → SMTP Settings |
| `MAILTRAP_PASS` | From Mailtrap → your inbox → SMTP Settings |

**Frontend** — in development no `.env` is needed. The `"proxy": "http://localhost:5000"` entry in `frontend/package.json` forwards all `/api/*` requests to the backend automatically.

### 3. Seed demo data (optional)

```bash
cd backend
node seed.js           # Adds demo users, vendors, products, services
node seed.js --clean   # Wipes everything and re-seeds
```

**Demo credentials** (all passwords: `Test123456`)

| Role | Email |
|------|-------|
| Customer | john@example.com |
| Customer | priya@example.com |
| Customer | rahul@example.com |
| Customer | ananya@example.com |
| Vendor — Grocery | sharma.grocery@example.com |
| Vendor — Bakery | bakery.wala@example.com |
| Vendor — Electronics | techtronics@example.com |
| Vendor — Fashion | fashionhub@example.com |
| Vendor — Pharmacy | medplus.pharmacy@example.com |
| Vendor — Plumbing | quickfix.plumber@example.com |
| Vendor — Electrical | sparkselectric@example.com |
| Vendor — Cleaning | cleanmaster@example.com |
| Vendor — Tutoring | skilltutor@example.com |
| Vendor — Carpentry | woodcraft@example.com |

### 4. Start the servers

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:3000)
cd frontend && npm start
```

Open **http://localhost:3000**

---

## Deployment

### Backend environment variables

Set these on your hosting platform (Render, Railway, Fly.io, etc.):

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_long_random_production_secret
CLIENT_URL=https://your-frontend-domain.com
MAILTRAP_HOST=smtp.sendgrid.net    # or any SMTP provider
MAILTRAP_PORT=587
MAILTRAP_USER=apikey
MAILTRAP_PASS=your_smtp_api_key
EMAIL_FROM=noreply@your-domain.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend environment variables

Set before `npm run build` or in your hosting dashboard (Vercel, Netlify, etc.):

```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### Build

```bash
cd frontend && npm run build
# Serve the build/ folder from Vercel / Netlify / S3 + CloudFront
```

### 🖼️ Uploaded images — Cloudinary (production-ready)

Images are uploaded directly to **Cloudinary** (`multer-storage-cloudinary`). Files are stored permanently in the cloud — they are never written to the server's ephemeral filesystem. Each upload returns a full `https://res.cloudinary.com/...` URL that works across any domain.

To set it up, add the three `CLOUDINARY_*` env vars listed above (get them from [cloudinary.com](https://cloudinary.com) → Dashboard → API Keys after creating a free account).

---

## API Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register (triggers OTP email) |
| POST | `/api/auth/verify-otp` | — | Verify OTP → returns JWT |
| POST | `/api/auth/resend-otp` | — | Resend OTP |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/profile` | JWT | Current user profile |
| POST | `/api/upload` | JWT | Upload image file → `{ url: "/uploads/..." }` |
| GET | `/api/products` | optional | Products list (search, filter, geo) |
| POST | `/api/products` | Vendor JWT | Create product |
| PUT | `/api/products/:id` | Vendor JWT | Update product |
| DELETE | `/api/products/:id` | Vendor JWT | Delete product |
| GET | `/api/services` | optional | Services list (search, filter, geo) |
| POST | `/api/services` | Vendor JWT | Create service |
| GET | `/api/orders` | JWT | My orders |
| POST | `/api/orders` | Customer JWT | Place order |
| GET | `/api/bookings` | JWT | My bookings |
| POST | `/api/bookings` | Customer JWT | Book a service |
| GET | `/api/notifications` | JWT | Notifications |

---

## License

MIT
