# LanderMaps - Ultra Documentation

**Complete Project Documentation for the Minecraft Map Marketplace Platform**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Setup & Installation](#setup--installation)
5. [Environment Configuration](#environment-configuration)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Authentication & Security](#authentication--security)
9. [Payment Processing](#payment-processing)
10. [Discount System](#discount-system)
11. [Frontend Features](#frontend-features)
12. [Deployment](#deployment)
13. [Development Workflow](#development-workflow)
14. [Troubleshooting](#troubleshooting)
15. [Code Examples](#code-examples)

---

## Project Overview

### Vision
LanderMaps is a full-featured marketplace platform for Minecraft map creators and enthusiasts. The platform enables:
- **Map Creators**: Upload, manage, and monetize custom maps
- **Map Buyers**: Browse, purchase, and download maps with secure payments
- **Administrators**: Complete CRUD management with authentication and pricing control

### Key Features
- **Dual-role Access**: Public browsing vs. protected admin management
- **Secure Authentication**: JWT-based token system with bcrypt password hashing
- **Payment Processing**: Stripe integration for secure checkout with discount support
- **Discount System**: Set percentage discounts on individual maps
- **Terms Acceptance**: Required terms agreement for paid map purchases
- **File Management**: Supabase storage for maps and thumbnails
- **Database Management**: Prisma ORM with PostgreSQL migrations
- **Public/Private Visibility**: Published flag controls map discoverability
- **Download Verification**: Email-based verification for purchased map downloads

### Use Cases
1. **Admin Creates Map**: Upload map file + thumbnail → set price and optional discount → publish
2. **Public Browses**: View map list with discount badges → see details → checkout or download (free)
3. **Buyer Purchases**: Select paid map → accept terms modal → checkout with Stripe → receive download link
4. **Discount Application**: Set 20% discount → original price struck through → new price shown in Stripe
5. **Admin Edits**: Update details, price, discount, or visibility status
6. **Admin Deletes**: Remove map and associated order data

---

## Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                   │
│    (Homepage, Map Detail, Admin Dashboard, Checkout UI)     │
└──────────────────────────────────┬──────────────────────────┘
                                   │ HTTP/REST
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│          Express.js Backend (Node.js)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ PUBLIC ROUTES (/):                                  │    │
│  │  - GET / → List published maps with discounts       │    │
│  │  - GET /:id → Get map detail + discount info        │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ AUTH ROUTES (/auth):                                │    │
│  │  - POST /login → Return JWT token                   │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ADMIN ROUTES (/admin) [Protected]:                  │    │
│  │  - GET /maps → Get all maps (admin view)            │    │
│  │  - POST /maps → Create map with discount support    │    │
│  │  - PATCH /maps/:id → Update map incl. discount      │    │
│  │  - DELETE /maps/:id → Delete map                    │    │
│  │  - POST /upload → Upload file to Supabase          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ PAYMENT ROUTES (/api):                              │    │
│  │  - POST /checkout → Create Stripe session w/discount│    │
│  │  - GET /download/:id → Get signed download URL      │    │
│  │  - POST /webhook → Stripe webhook handler           │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   PostgreSQL      Supabase       Stripe
   Database        Storage        Payment
  (Prisma)        (CDN/Files)      API
```

### Data Flow Examples

**Homepage with Discounts:**
```
Frontend GET /
  → Backend returns published maps with discount field
  → Frontend displays discount badge if discount > 0
  → Shows: -X% badge + original price struck + new price in green
```

**Paid Map Purchase with Terms:**
```
Frontend clicks "Buy Now" on paid map
  → Terms acceptance modal appears
  → User checks "I accept terms"
  → Frontend POST /api/checkout {mapId}
  → Backend calculates: price * (100 - discount) / 100
  → Backend creates Stripe session with discounted amount
  → Returns checkout URL
  → Frontend redirects to Stripe with discounted price
  → User completes payment
  → Stripe webhook calls backend POST /api/webhook
  → Backend creates Order record with amountPaid (after discount)
  → User receives download link via email verification
```

**Admin Discount Management:**
```
Frontend uploads map files
  → Frontend PATCH /admin/maps/:id {price, discount}
  → Backend validates: discount 0-100, price >= 0
  → Backend updates database
  → Frontend shows: €5.00 → €2.50 (-50%) in admin list
```

---

## Tech Stack

### Frontend Stack
- **React 19.2.4**: UI framework with hooks
- **React Router DOM 7.14.0**: Client-side routing
- **Vite 8.0.4**: Fast build tool and dev server
- **Axios 1.15.0**: HTTP client for API calls
- **CSS-in-JS**: Inline styles for styling

### Backend Stack
- **Node.js**: JavaScript runtime (ES modules)
- **Express.js 5.2.1**: Web framework and HTTP server
- **Prisma 7.7.0**: ORM for database management
- **@prisma/adapter-pg**: PostgreSQL adapter

### Databases & Storage
- **PostgreSQL**: Relational database (via Supabase)
- **Supabase**: Hosted PostgreSQL + S3-compatible file storage

### Authentication & Security
- **jsonwebtoken 9.0.3**: JWT token generation/verification
- **bcrypt 6.0.0**: Password hashing
- **dotenv 17.4.1**: Environment variable management

### Payment & External Services
- **Stripe 22.0.1**: Payment processing and checkout
- **@supabase/supabase-js**: Supabase SDK for file uploads

---

## Setup & Installation

### Prerequisites
- Node.js 18+ ([nodejs.org](https://nodejs.org/))
- PostgreSQL via Supabase or local install
- Git for version control

### Backend Setup

1. **Navigate to Backend**:
   ```bash
   cd landerMaps/backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Create .env File** (see [Environment Configuration](#environment-configuration)):
   ```bash
   # Edit or create backend/.env with all variables
   ```

4. **Initialize Database**:
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Apply migrations
   npx prisma migrate deploy

   # Or push schema if no migrations exist
   npx prisma db push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   # Server listens on http://localhost:5000
   ```

### Frontend Setup

1. **Navigate to Frontend**:
   ```bash
   cd landerMaps/frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   # Server listens on http://localhost:5173
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## Environment Configuration

### Backend `.env` File Template

```env
# ========================================
# DATABASE CONFIGURATION
# ========================================
DATABASE_URL="postgresql://user:password@host:5432/dbname"
DIRECT_URL="postgresql://user:password@host:5432/dbname"

# ========================================
# AUTHENTICATION
# ========================================
JWT_AUTH="your-super-secret-jwt-key-min-32-chars"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="$2b$10$hashed.bcrypt.password"

# ========================================
# STRIPE PAYMENT PROCESSING
# ========================================
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
CLIENT_URL="http://localhost:5173"
PORT=5000

# ========================================
# SUPABASE STORAGE
# ========================================
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Environment Variable Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL pooled connection | `postgresql://user:pass@localhost:5432/maps` |
| `DIRECT_URL` | PostgreSQL direct connection (migrations) | Same as above |
| `JWT_AUTH` | Secret for signing JWT tokens | `MyS3cr3tK3y1234567890...` |
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD` | Bcrypt-hashed password | `$2b$10$...` |
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing key | `whsec_...` |
| `CLIENT_URL` | Frontend URL (for Stripe redirects) | `http://localhost:5173` |
| `SUPABASE_URL` | Supabase project URL | `https://abcdef.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (secret) | `eyJ...` (long JWT) |
| `PORT` | Backend server port | `5000` |

### Credential Generation Guide

**JWT Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Bcrypt Password Hash**:
```bash
node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('YourPasswordHere', 10, (err, hash) => {
  if(err) console.error(err);
  else console.log(hash);
});
"
```

**Stripe Keys**: Dashboard → Developers → API Keys → Copy Secret Key + Webhook Secret

**Supabase**: Dashboard → Settings → API → Copy Project URL + Service Role Key

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────┐
│                       Map                                │
├──────────────────────────────────────────────────────────┤
│ id                   Int @id @autoincrement              │
│ title                String                              │
│ description          String                              │
│ price                Int (cents, 0 = free)               │
│ discount             Int? (0-100, optional)              │
│ fileUrl              String (Supabase storage path)      │
│ filePath             String (Storage key for signing)    │
│ thumbnail            String (Supabase storage path)      │
│ thumbnailPath        String (Storage key)                │
│ tags                 String[] (array)                    │
│ changelog            String? (optional)                  │
│ published            Boolean @default(true)              │
│ createdAt            DateTime @default(now())            │
│ updatedAt            DateTime @updatedAt                 │
│ orders               Order[] (1:N relation)              │
└──────────────────────────────────────────────────────────┘
           │
           │ 1:N Relationship
           │ (One map has many orders)
           ▼
┌──────────────────────────────────────────────────────────┐
│                      Order                               │
├──────────────────────────────────────────────────────────┤
│ id                   Int @id @autoincrement              │
│ mapId                Int (Foreign Key)                   │
│ map                  Map (relation)                      │
│ stripeSessionId      String @unique                      │
│ buyerEmail           String                              │
│ amountPaid           Int (cents, includes discount)      │
│ createdAt            DateTime @default(now())            │
└──────────────────────────────────────────────────────────┘
```

### Table: Map

**Purpose**: Stores all map metadata for the marketplace

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Int | PK, Auto-increment | Unique identifier |
| `title` | String | Not null | Map name/title |
| `description` | String | Not null | Long-form description |
| `price` | Int | Not null | Price in cents (100 = €1.00, 0 = free) |
| `discount` | Int? | Optional, 0-100 | Discount percentage (null = no discount) |
| `fileUrl` | String | Not null | Public URL to .zip file on Supabase |
| `filePath` | String | Not null | Storage path for generating signed URLs |
| `thumbnail` | String | Not null | Public URL to thumbnail image |
| `thumbnailPath` | String | Not null | Storage path for thumbnail |
| `tags` | String[] | Default [] | Search tags ["adventure", "survival"] |
| `changelog` | String | Nullable | Version notes/update history |
| `published` | Boolean | Default true | Controls public visibility |
| `createdAt` | DateTime | Default now() | Creation timestamp |
| `updatedAt` | DateTime | Auto-update | Last modification timestamp |

### Table: Order

**Purpose**: Purchase records for audit and download authorization

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Int | PK, Auto-increment | Order ID |
| `mapId` | Int | FK → Map.id | Link to purchased map |
| `stripeSessionId` | String | Unique | Stripe session ID |
| `buyerEmail` | String | Not null | Email for download verification |
| `amountPaid` | Int | Not null | Final paid amount in cents (after discount) |
| `createdAt` | DateTime | Default now() | Payment timestamp |

### Discount System Behavior

**Discount Field**:
- Optional field (NULL if no discount)
- Valid range: 0-100 (percentage)
- Applied at checkout: `finalPrice = price * (100 - discount) / 100`
- Displayed on homepage badge, detail page, and admin dashboard

**Example**:
- Original price: €50.00 (5000 cents)
- Discount: 20%
- Final price: €40.00 (4000 cents)
- Formula: 5000 * (100 - 20) / 100 = 4000

### Migration History

Located in `backend/prisma/migrations/`:

1. **20260409212437_init** - Initial schema
2. **20260410004449_int** - Price fields to INTEGER
3. **20260410010525_x_discount** - Removed old discount system
4. **20260410015142_published** - Added published field
5. **20260528011551_add_discount** - Added discount percentage field

---

## API Reference

### Base URL
```
http://localhost:5000
```

### Response Format
All responses are JSON:
- Success: `{ "data": {...} }` or direct object/array
- Error: `{ "message": "Error description" }`

### Authentication
Protected routes require JWT in the `authorization` header:
```
headers: { "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

---

## Public Routes

### GET `/`
**List Published Maps**

Returns all published maps with optional discount info.

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Adventure Map",
    "thumbnail": "https://...",
    "price": 5000,
    "discount": 20,
    "tags": ["adventure", "exploration"]
  },
  {
    "id": 2,
    "title": "Free Parkour",
    "thumbnail": "https://...",
    "price": 0,
    "discount": null,
    "tags": ["parkour"]
  }
]
```

**Notes**:
- Only published maps (`published: true`)
- Sorted by `createdAt` descending
- Discount field included (null if no discount)

---

### GET `/:id`
**Get Map Details**

Returns full map information with discount.

**URL Parameters**:
- `id` (number) - Map ID

**Response**: `200 OK`
```json
{
  "id": 1,
  "title": "Adventure Map",
  "description": "Explore a vast world with dungeons...",
  "thumbnail": "https://...",
  "price": 5000,
  "discount": 20,
  "tags": ["adventure", "exploration"],
  "changelog": "v1.2: Added new level"
}
```

**Errors**:
- `404 Not Found` - Map doesn't exist
- `500 Server Error`

---

## Authentication Routes

### POST `/auth/login`
**Admin Login**

Returns JWT token for authenticated requests.

**Request**:
```json
{
  "username": "admin",
  "password": "MySecurePassword"
}
```

**Response**: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Details**:
- Expires in 12 hours
- Sign subsequent requests: `headers: { "authorization": token }`

**Errors**:
- `400 Bad Request` - Invalid username or password
- `500 Server Error`

---

## Admin Routes (Protected)

**All require JWT token in `authorization` header.**

### POST `/admin/upload?type=map|thumbnail`
**Upload File to Supabase**

**Query Parameters** (Required):
- `type=map` - Upload map .zip file
- `type=thumbnail` - Upload map image

**Request**:
```
Headers: authorization: <JWT>
Body: multipart/form-data with "file" field
```

**Response**: `200 OK`
```json
{
  "url": "https://supabase.../maps/1712000000000_MyMap.zip",
  "path": "maps/1712000000000_MyMap.zip"
}
```

**Errors**:
- `400 Bad Request` - Invalid type or no file
- `500 Server Error` - Upload failed

---

### GET `/admin/maps`
**List All Maps (Admin View)**

Returns all maps (published and draft).

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Adventure Map",
    "description": "...",
    "price": 5000,
    "discount": 20,
    "tags": ["adventure"],
    "changelog": "v1.2",
    "published": true,
    "createdAt": "2026-04-10T12:00:00Z",
    "updatedAt": "2026-04-10T12:00:00Z"
  }
]
```

---

### POST `/admin/maps`
**Create New Map**

**Request**:
```json
{
  "title": "Adventure Map",
  "description": "Explore dungeons and treasures",
  "price": 5000,
  "discount": 20,
  "fileUrl": "maps/1712000000000_adventure.zip",
  "filePath": "maps/1712000000000_adventure.zip",
  "thumbnail": "thumbnails/1712000000000_thumb.png",
  "thumbnailPath": "thumbnails/1712000000000_thumb.png",
  "tags": ["adventure", "exploration"],
  "changelog": "Initial release",
  "published": true
}
```

**Required**: title, description, price, fileUrl, filePath, thumbnail, thumbnailPath
**Optional**: tags, changelog, published, discount

**Response**: `201 Created`
```json
{
  "message": "Map created successfully",
  "newMap": { ... }
}
```

**Errors**:
- `400 Bad Request` - Missing fields or invalid discount
- `500 Server Error`

---

### PATCH `/admin/maps/:id`
**Update Map**

**Request**:
```json
{
  "title": "Updated Title",
  "price": 3000,
  "discount": 15,
  "published": false
}
```

**Response**: `200 OK`
```json
{
  "message": "Map updated successfully",
  "updatedMap": { ... }
}
```

**Validation**:
- Discount: 0-100 or null
- Price: >= 0

---

### DELETE `/admin/maps/:id`
**Delete Map**

**Response**: `200 OK`
```json
{
  "message": "Map deleted successfully"
}
```

---

## Payment Routes

### POST `/api/checkout`
**Create Stripe Checkout Session**

Creates a Stripe session with **discounted price applied**.

**Request**:
```json
{
  "mapId": 1
}
```

**Response**: `200 OK`
```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_xxxxxxxxxxxxx"
}
```

**Price Calculation**:
```
If discount exists:
  finalPrice = price * (100 - discount) / 100
Else:
  finalPrice = price
```

**Example**:
- Map price: €50.00 (5000 cents)
- Discount: 20%
- Stripe charges: €40.00 (4000 cents)

**Errors**:
- `404 Not Found` - Map doesn't exist
- `500 Server Error`

---

### GET `/api/download/:id?email=buyer@example.com`
**Get Download Link**

Returns signed Supabase URL for map file (free or purchased).

**Query Parameters** (Required):
- `email` - Buyer email (for purchased maps)

**Response**: `200 OK`
```json
{
  "downloadUrl": "https://supabase.../maps/1712000000000_map.zip?token=xxxxx"
}
```

**Logic**:
- Free map (`price === 0`): Return directly
- Paid map: Check if email has purchase order
- If no order: `403 Forbidden` - "Please purchase this map first"

**Errors**:
- `400 Bad Request` - Email required for paid maps
- `403 Forbidden` - No purchase found
- `404 Not Found` - Map not found
- `500 Server Error`

---

### POST `/api/webhook`
**Stripe Webhook Handler**

Receives Stripe events and creates Order records.

**Stripe Configuration**:
- Event: `checkout.session.completed`
- Endpoint: `http://yourdomain.com/api/webhook`
- Signing secret: `STRIPE_WEBHOOK_SECRET`

**Webhook Payload** (example):
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_xxxxx",
      "amount_total": 4000,
      "customer_details": {
        "email": "buyer@example.com"
      },
      "metadata": {
        "mapId": "1"
      }
    }
  }
}
```

**Action**:
- Verify webhook signature
- Create Order with `amountPaid` (final amount after discount)
- Prevent duplicate orders

**Response**: `200 OK`
```json
{
  "received": true
}
```

---

## Discount System

### Overview
The discount system allows setting percentage-based discounts on individual maps.

### Features
- **Optional**: Each map can have 0% discount or no discount (NULL)
- **Percentage-based**: 0-100% off
- **Automatic Calculation**: Applied at checkout automatically
- **Transparency**: Shown on homepage, detail page, and admin dashboard

### Admin Dashboard Discount Input

**Location**: Admin Dashboard → Create/Edit Map

**Input Field**:
- Label: "Discount (% off, optional)"
- Type: Number input
- Range: 0-100
- Default: Empty (no discount)
- Live preview: Shows calculated discounted price

**Display in Admin Map List**:
```
Without discount:  €5.00
With 20% discount: €5.00 → €4.00 (-20%)
```

### Frontend Homepage Badge

**When discount exists** (discount > 0):
```
┌─────────────────────────┐
│ -20% (red badge)        │
│ €5.00 (strikethrough)   │
│ €4.00 (green, bold)     │
└─────────────────────────┘
```

**When no discount** (discount = null):
```
┌──────────────────┐
│ €5.00 (gold)     │
│ or               │
│ FREE (green)     │
└──────────────────┘
```

### Frontend Map Detail Page

**Price Display with Discount**:
```
-20% OFF (red text)
€5.00 → €4.00 (strikethrough original, green new price)
```

**Price Display without Discount**:
```
€5.00 (gold text, large)
or FREE (green, large)
```

### Stripe Checkout Integration

**Automatic Application**:
1. User clicks "Buy Now" on paid map
2. Terms acceptance modal appears
3. User accepts terms
4. Frontend POST `/api/checkout {mapId}`
5. Backend retrieves map with discount
6. Backend calculates: `finalPrice = price * (100 - discount) / 100`
7. Stripe session created with discounted amount
8. User sees discounted price in Stripe

**Example Flow**:
- Map created: €50.00, 20% discount
- Stripe checkout: €40.00
- Payment confirms at €40.00
- Order stores `amountPaid: 4000` (4000 cents)

### Backend Validation

**Create/Update Map**:
```javascript
if (discount !== undefined && (discount < 0 || discount > 100)) {
  return res.status(400).json({ message: "Discount must be between 0 and 100" });
}
```

**Checkout Session**:
```javascript
const finalPrice = map.discount
  ? Math.round(map.price * (100 - map.discount) / 100)
  : map.price;
```

---

## Frontend Features

### Pages

#### Home Page (`frontend/src/pages/Home.jsx`)
- **Displays**: Published maps in grid layout
- **Discount Badge**: Shows `-X%` in red + original/new prices
- **Features**: Hero section, map grid, search tags
- **Hover Effect**: Scale image, highlight border

#### Map Detail Page (`frontend/src/pages/MapDetail.jsx`)
- **Displays**: Full map information with description and changelog
- **Discount Display**: Large "-X% OFF" badge + price comparison
- **Purchase Flow**: 
  - Free maps: Direct download button
  - Paid maps: "Buy Now" → Terms modal → Stripe checkout
- **Terms Modal**: Shows acceptance checkbox for paid maps
- **Download After Purchase**: Email verification to access download
- **Features**: Sticky price panel, responsive layout

#### Admin Dashboard (`frontend/src/pages/AdminDashboard.jsx`)
- **Map Management**: Create, edit, delete maps
- **Discount Field**: Number input with live preview of discounted price
- **File Upload**: Map .zip and thumbnail image
- **Map List**: Shows all maps (published/draft) with discount display
- **Validation**: Real-time feedback on form changes

#### Success Page (`frontend/src/pages/Success.jsx`)
- **Displays**: Payment success message
- **Redirect**: Link back to store

#### Cancel Page (`frontend/src/pages/Cancel.jsx`)
- **Displays**: Payment cancelled message
- **Imports Fixed**: Now includes `Link` and `Navbar` components
- **Redirect**: Link back to store

### Components

#### Navbar (`frontend/src/components/Navbar.jsx`)
- **Navigation**: Links to home, admin dashboard
- **Styling**: Pixel-art theme with brown/gold colors

#### PixelBtn Component
- **Styling**: Pixel-art button with multiple variants
- **Variants**: brown, green, gold, red
- **States**: Normal, hover, disabled

### Styling Theme

**Color Palette**:
- Background: `#0d0d0d` (dark)
- Primary: `#f0d0a0` (cream)
- Success: `#6aaa30` (green)
- Warning: `#f0c040` (gold)
- Error: `#e05050` (red)
- Accent: `#b8955a` (bronze)

**Font Variables**:
- `--pixel`: Pixel-art font (8-12px)
- `--vt`: Variable font for body text (16-18px)

---

## Payment Processing

### Stripe Integration

**Setup**:
1. Create Stripe account
2. Get API keys: Dashboard → Developers → API Keys
3. Set webhook endpoint: `https://yourdomain.com/api/webhook`
4. Add keys to `.env`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

**Checkout Flow**:
1. Frontend: User clicks "Buy Now" on paid map
2. Frontend: Terms modal appears, user accepts
3. Frontend: POST `/api/checkout {mapId}`
4. Backend: Calculates discounted price (if applicable)
5. Backend: Creates Stripe session with calculated amount
6. Frontend: Redirects to Stripe checkout URL
7. User: Enters payment info on Stripe
8. Stripe: Calls webhook POST `/api/webhook`
9. Backend: Creates Order record
10. Frontend: Redirects to `/success` page
11. User: Enters email to verify purchase and download

**Webhook Security**:
- Verify signature using `STRIPE_WEBHOOK_SECRET`
- Prevent duplicate orders by checking `stripeSessionId` uniqueness
- Log events for debugging

---

## Authentication & Security

### JWT Token System

**Token Generation**:
```javascript
const token = jwt.sign(
  { username: admin_username },
  process.env.JWT_AUTH,
  { expiresIn: '12h' }
);
```

**Token Verification**:
```javascript
const decoded = jwt.verify(token, process.env.JWT_AUTH);
```

**Frontend Storage**:
- Stored in `localStorage`
- Sent in `authorization` header on protected requests
- Cleared on logout

### Password Security

**Hashing**:
```javascript
const hashed = await bcrypt.hash(password, 10);
```

**Verification**:
```javascript
const valid = await bcrypt.compare(inputPassword, storedHash);
```

**Admin Credentials**:
- Store `ADMIN_PASSWORD` as bcrypt hash in `.env`
- Never store plaintext passwords

### Protected Routes

**Middleware** (`backend/middleware/authMiddleware.js`):
```javascript
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_AUTH);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
```

### Terms Acceptance

**Modal** (`frontend/src/pages/MapDetail.jsx`):
- Appears only for paid maps (`map.price > 0`)
- Shows terms text in scrollable box
- Requires checkbox acceptance to proceed
- Clicking "Proceed to Checkout" triggers Stripe flow

**Terms Text**:
```
I accept the terms of policy when buying this map:
I do not share the map with others and only buy it for personal use.
I don't use it in any way for making profit or sharing without making profit.
(You are allowed to make copies of the file for yourself.
This way you can replay the map in its saved state or original state.)
```

---

## Deployment

### Backend Deployment (Render, Heroku, etc.)

1. **Push to Git**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Set Environment Variables**:
   - Add `.env` variables to platform (Render: Environment, Heroku: Config Vars)

3. **Database Migration**:
   - Platform runs: `npx prisma migrate deploy`

4. **Start Command**:
   ```bash
   node server.js
   ```

### Frontend Deployment (Vercel, Netlify)

1. **Build Project**:
   ```bash
   npm run build
   ```

2. **Deploy Build Output** (`dist/` folder)

3. **Environment Configuration**:
   - Set `VITE_API_BASE_URL` if API URL differs
   - Frontend currently uses hardcoded: `https://landermaps.onrender.com`

4. **Redirect Configuration** (`vercel.json`):
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## Development Workflow

### Running Both Servers Locally

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# Server on http://localhost:5000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# Server on http://localhost:5173
```

### Database Changes

**Schema Update** (`backend/prisma/schema.prisma`):
```prisma
model Map {
  id       Int     @id @default(autoincrement())
  discount Int?    // Add new field
}
```

**Create Migration**:
```bash
npx prisma migrate dev --name add_discount
```

**Apply Existing Migrations**:
```bash
npx prisma migrate deploy
```

### Adding New Features

1. **Backend**:
   - Update schema in `schema.prisma`
   - Create migration: `npx prisma migrate dev --name feature_name`
   - Update controllers to handle new field
   - Add API endpoints or modify existing ones

2. **Frontend**:
   - Update components to display/input new data
   - Update API calls to send/receive new fields
   - Test with real backend

---

## Troubleshooting

### Backend Issues

**"Cannot find module"**:
```bash
npm install
npx prisma generate
```

**Database connection error**:
- Verify `DATABASE_URL` in `.env`
- Test connection: `psql [connection_string]`
- Check Supabase dashboard for IP whitelisting

**Stripe webhook not triggering**:
- Verify `STRIPE_WEBHOOK_SECRET` in `.env`
- Check Stripe dashboard → Webhooks → Recent attempts
- Ensure backend is publicly accessible

**File upload fails**:
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Check Supabase storage bucket exists
- Verify bucket permissions (public read)

### Frontend Issues

**Vite dev server won't start**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Styles not loading**:
- Check CSS-in-JS inline styles
- Verify Vite config in `vite.config.js`

**API calls failing**:
- Check backend URL in `frontend/src/api/api.js`
- Verify CORS in backend (`backend/server.js`)
- Check browser console for error details

### Common Errors

**"Discount must be between 0 and 100"**:
- Admin entered discount outside range
- Solution: Enter number between 0-100

**"Payment Cancelled"**:
- User clicked back button on Stripe
- Frontend should show Cancel page with "No worries — you were not charged"

**"Map not found" after discount set**:
- Likely API caching issue
- Solution: Refresh page or clear browser cache

---

## Code Examples

### Creating a Discounted Map via API

**Request**:
```bash
curl -X POST http://localhost:5000/admin/maps \
  -H "authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Adventure Map",
    "description": "Explore dungeons",
    "price": 5000,
    "discount": 20,
    "fileUrl": "maps/1712000000000_adventure.zip",
    "filePath": "maps/1712000000000_adventure.zip",
    "thumbnail": "thumbnails/1712000000000_thumb.png",
    "thumbnailPath": "thumbnails/1712000000000_thumb.png",
    "tags": ["adventure"],
    "published": true
  }'
```

### Calculating Discounted Price in JavaScript

**Frontend**:
```javascript
function calculateFinalPrice(price, discount) {
  if (!discount) return price;
  return Math.round(price * (100 - discount) / 100);
}

const original = 5000; // €50.00
const discount = 20;
const final = calculateFinalPrice(original, discount); // 4000 (€40.00)
```

**Backend** (in payment controller):
```javascript
const finalPrice = map.discount
  ? Math.round(map.price * (100 - map.discount) / 100)
  : map.price;
```

### Handling Discounts in Stripe Session

```javascript
const map = await prisma.map.findUnique({ where: { id: Number(mapId) } });

const finalPrice = map.discount
  ? Math.round(map.price * (100 - map.discount) / 100)
  : map.price;

const session = await stripe.checkout.sessions.create({
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: { name: map.title },
      unit_amount: finalPrice
    },
    quantity: 1
  }],
  // ... rest of session config
});
```

---

## File Structure

```
landerMaps/
├── backend/
│   ├── server.js                 # Main entry point
│   ├── package.json              # Dependencies
│   ├── .env                       # Environment variables
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # Migration history
│   ├── controllers/
│   │   ├── adminController.js    # Map CRUD operations
│   │   ├── authController.js     # Login endpoint
│   │   ├── publicController.js   # Public endpoints
│   │   └── paymentController.js  # Stripe + downloads
│   ├── routes/
│   │   ├── adminRoutes.js        # Admin endpoints
│   │   ├── authRoute.js          # Auth endpoints
│   │   ├── publicRoute.js        # Public endpoints
│   │   └── paymentRoute.js       # Payment endpoints
│   └── middleware/
│       ├── authMiddleware.js     # JWT verification
│       └── uploadMiddleware.js   # File upload config
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx              # Entry point
│   │   ├── App.jsx               # Router setup
│   │   ├── api/
│   │   │   └── api.js            # Axios instance + endpoints
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Homepage with map grid
│   │   │   ├── MapDetail.jsx     # Map details + purchase
│   │   │   ├── AdminDashboard.jsx # Admin controls
│   │   │   ├── AdminLogin.jsx    # Admin login
│   │   │   ├── Success.jsx       # Payment success
│   │   │   └── Cancel.jsx        # Payment cancelled
│   │   └── components/
│   │       └── Navbar.jsx        # Navigation
│   ├── package.json              # Dependencies
│   └── vite.config.js            # Vite configuration
│
└── ULTRA_DOCUMENTATION.md        # This file
```

---

## Summary

LanderMaps is a complete marketplace for Minecraft maps with:
- **Secure authentication** (JWT + bcrypt)
- **Payment processing** (Stripe with discount support)
- **File storage** (Supabase)
- **Database management** (Prisma + PostgreSQL)
- **Discount system** (percentage-based, automatic calculation)
- **Terms acceptance** (required for paid purchases)
- **Responsive UI** (React with pixel-art theme)
- **Admin controls** (full CRUD + discount management)

All features work together seamlessly to provide a professional, user-friendly marketplace experience.

---

**Last Updated**: 2026-05-28
**Version**: 2.0 (with discount system and terms acceptance)
