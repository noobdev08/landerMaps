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
10. [Frontend Integration](#frontend-integration)
11. [Deployment](#deployment)
12. [Development Workflow](#development-workflow)
13. [Troubleshooting](#troubleshooting)
14. [Code Examples](#code-examples)

---

## Project Overview

### Vision
LanderMaps is a full-featured marketplace platform for Minecraft map creators and enthusiasts. The platform enables:
- **Map Creators**: Upload, manage, and monetize custom maps
- **Map Buyers**: Browse, purchase, and download maps
- **Administrators**: Complete CRUD management with authentication

### Key Features
- **Dual-role Access**: Public browsing vs. protected admin management
- **Secure Authentication**: JWT-based token system with bcrypt password hashing
- **Payment Processing**: Stripe integration for secure checkout
- **File Management**: Supabase storage for maps and thumbnails
- **Database Management**: Prisma ORM with PostgreSQL migrations
- **Public/Private Visibility**: Published flag controls map discoverability

### Use Cases
1. **Admin Creates Map**: Upload map file + thumbnail → set price → publish
2. **Public Browses**: View map list → see details → checkout or download (free)
3. **Buyer Purchases**: Select map → checkout with Stripe → download via email verification
4. **Admin Edits**: Update details, price, or visibility status
5. **Admin Deletes**: Remove map and associated order data

---

## Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Next.js)                │
│         (Handles UI, auth UI, checkout redirect)            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│          Express.js Backend (Node.js)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ PUBLIC ROUTES (/):                                  │    │
│  │  - GET / → List published maps (with thumbnails)    │    │
│  │  - GET /:id → Get map detail                        │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ AUTH ROUTES (/auth):                                │    │
│  │  - POST /login → Return JWT token                   │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ADMIN ROUTES (/admin) [Protected]:                  │    │
│  │  - GET /maps → Get all maps (admin view)            │    │
│  │  - POST /maps → Create map                          │    │
│  │  - PATCH /maps/:id → Update map                     │    │
│  │  - DELETE /maps/:id → Delete map                    │    │
│  │  - POST /upload → Upload file to Supabase          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ PAYMENT ROUTES (/api):                              │    │
│  │  - POST /checkout → Create Stripe session           │    │
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

**Authentication Flow:**
```
Frontend POST /auth/login {username, password}
  → Backend verifies credentials with bcrypt
  → JWT token signed with JWT_AUTH secret
  → Return token to frontend
  → Frontend stores token in header for future requests
```

**Purchase Flow:**
```
Frontend POST /api/checkout {mapId}
  → Backend creates Stripe session with map details
  → Return checkout URL to frontend
  → Frontend redirects user to Stripe
  → User completes payment on Stripe
  → Stripe webhook calls backend POST /api/webhook
  → Backend creates Order record in database
  → User downloads via POST /api/download?email=buyer@example.com
```

**Admin Map Management:**
```
Frontend authenticated with JWT token
  1. Upload: POST /admin/upload?type=map → Get fileUrl
  2. Create: POST /admin/maps {title, description, price, fileUrl, ...}
  3. Read:   GET /admin/maps → List all maps
  4. Update: PATCH /admin/maps/:id {updated fields}
  5. Delete: DELETE /admin/maps/:id → Remove map
```

---

## Tech Stack

### Backend Core
- **Node.js**: JavaScript runtime (ES modules enabled)
- **Express.js 5.2.1**: Web framework and HTTP server
- **Prisma 7.7.0**: ORM for database management
- **@prisma/adapter-pg**: PostgreSQL adapter for Prisma

### Databases & Storage
- **PostgreSQL**: Relational database for maps and orders
- **Supabase**: Hosted PostgreSQL + file storage (S3-compatible)

### Authentication & Security
- **jsonwebtoken 9.0.3**: JWT token generation and verification
- **bcrypt 6.0.0**: Password hashing for secure storage
- **dotenv 17.4.1**: Environment variable management

### Payment & Integration
- **stripe 22.0.1**: Payment processing and checkout sessions
- **body-parser 2.2.2**: Raw request body parsing for webhook verification

---

## Setup & Installation

### Prerequisites

Ensure you have installed:
- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **PostgreSQL**: Locally or via Supabase
- **Git**: For version control

### Step-by-Step Installation

1. **Clone and Navigate**:
   ```bash
   cd landerMaps/backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment** (see [Environment Configuration](#environment-configuration)):
   ```bash
   # Create .env file with all required variables
   cp .env.example .env  # or create manually
   ```

4. **Initialize Database**:
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database (creates tables)
   npx prisma db push

   # Or run migrations (if database already exists)
   npx prisma migrate deploy
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Server listens on `http://localhost:5000`

6. **Verify Installation**:
   ```bash
   # Test public endpoint
   curl http://localhost:5000/

   # Should return array of published maps (or empty if no maps exist)
   ```

---

## Environment Configuration

### `.env` File Template

Create `backend/.env` with the following variables:

```env
# ========================================
# DATABASE CONFIGURATION
# ========================================
DATABASE_URL="postgresql://user:password@host:5432/dbname"
DIRECT_URL="postgresql://user:password@host:5432/dbname"

# ========================================
# AUTHENTICATION
# ========================================
JWT_AUTH="your-super-secret-jwt-key-at-least-32-chars"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="$2b$10$hashed.bcrypt.password.here"

# ========================================
# STRIPE PAYMENT PROCESSING
# ========================================
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
CLIENT_URL="http://localhost:3000"

# ========================================
# SUPABASE STORAGE
# ========================================
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=5000
```

### Environment Variable Details

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string (connection pooling) | `postgresql://user:pass@localhost:5432/maps` |
| `DIRECT_URL` | PostgreSQL direct connection (migrations) | Same as `DATABASE_URL` |
| `JWT_AUTH` | Secret key for signing JWT tokens | `MyS3cr3tK3y123456789...` |
| `ADMIN_USERNAME` | Username for admin login | `admin` |
| `ADMIN_PASSWORD` | Bcrypt-hashed admin password | `$2b$10$...` |
| `STRIPE_SECRET_KEY` | Stripe secret for API calls | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `CLIENT_URL` | Frontend URL for Stripe redirects | `http://localhost:3000` |
| `SUPABASE_URL` | Supabase project URL | `https://abcdef.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service role key for Supabase | Long JWT starting with `eyJ...` |
| `PORT` | Server port (optional, default 5000) | `5000` |

### Getting Credentials

**PostgreSQL/Supabase**:
- Use Supabase dashboard → Settings → Database → Connection string
- Copy `postgresql://...` format

**Stripe**:
- Login to Stripe dashboard
- Developers → API Keys → Copy Secret Key and Webhook Secret
- Create webhook endpoint at `http://yourdomain.com/api/webhook`

**Supabase Storage**:
- Supabase dashboard → Settings → API
- Copy `Project URL` and `Service Role Key` (secret)

**JWT Secret**:
- Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Admin Password**:
```bash
# Generate bcrypt hash of your password
node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('YourPasswordHere', 10, (err, hash) => {
  if(err) console.error(err);
  else console.log(hash);
});
"
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        Map                              │
├─────────────────────────────────────────────────────────┤
│ id (PK)              Int @id @autoincrement             │
│ title                String                             │
│ description          String                             │
│ price                Int (cents, 0 = free)              │
│ fileUrl              String (Supabase path)             │
│ thumbnail            String (Supabase path)             │
│ tags                 String[] (array)                   │
│ changelog            String? (optional)                 │
│ published            Boolean @default(true)             │
│ createdAt            DateTime @default(now())           │
│ updatedAt            DateTime @updatedAt                │
│ orders               Order[] (relation)                 │
└─────────────────────────────────────────────────────────┘
           │
           │ 1:N Relationship
           │ (One map has many orders)
           ▼
┌─────────────────────────────────────────────────────────┐
│                       Order                             │
├─────────────────────────────────────────────────────────┤
│ id (PK)              Int @id @autoincrement             │
│ mapId (FK)           Int                                │
│ map                  Map (relation)                     │
│ stripeSessionId      String @unique                     │
│ buyerEmail           String                             │
│ amountPaid           Int (cents)                        │
│ createdAt            DateTime @default(now())           │
└─────────────────────────────────────────────────────────┘
```

### Table: Map

**Purpose**: Stores metadata for each Minecraft map available in the marketplace

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Int | Primary Key, Auto-increment | Unique map identifier |
| `title` | String | Not null | Map name displayed to users |
| `description` | String | Not null | Long-form description of map |
| `price` | Int | Not null | Price in cents (100 = €1.00, 0 = free) |
| `fileUrl` | String | Not null | Supabase storage path to .zip file |
| `thumbnail` | String | Not null | Supabase storage path to image |
| `tags` | String[] | Default [] | Search/filter tags (e.g., ["adventure", "parkour"]) |
| `changelog` | String | Nullable | Version notes or update history |
| `published` | Boolean | Default true | Controls public visibility |
| `createdAt` | DateTime | Default now() | Timestamp of creation |
| `updatedAt` | DateTime | Auto-update | Modified timestamp |

### Table: Order

**Purpose**: Tracks purchases and payment records for audit and download verification

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Int | Primary Key | Unique order identifier |
| `mapId` | Int | Foreign Key → Map.id | Links to purchased map |
| `stripeSessionId` | String | Unique | Stripe session ID for payment verification |
| `buyerEmail` | String | Not null | Email used to authorize future downloads |
| `amountPaid` | Int | Not null | Actual amount paid in cents |
| `createdAt` | DateTime | Default now() | Payment timestamp |

### Schema Migrations

**Migration History** (located in `backend/prisma/migrations/`):

1. **20260409212437_init**: Initial schema with Map, Order, DiscountCode
2. **20260410004449_int**: Converted price fields to INTEGER (cents)
3. **20260410010525_x_discount**: Removed DiscountCode table and Map.isFree field
4. **20260410015142_published**: Added Map.published boolean field

---

## API Reference

### Base URL
```
http://localhost:5000
```

### Response Format
All responses are JSON. Error responses include a `message` field:
```json
{ "message": "Error description" }
```

### Authentication
Protected routes require the JWT token in the `authorization` header:
```
headers: { "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

---

### Public Routes

#### GET `/`
**List All Published Maps**

Returns paginated list of published maps (public browsing view).

**Query Parameters**: None

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Adventure Map",
    "thumbnail": "thumbnails/1712000000000_map.png",
    "price": 2500,
    "tags": ["adventure", "exploration"]
  },
  {
    "id": 2,
    "title": "Free Parkour",
    "thumbnail": "thumbnails/1712000010000_parkour.png",
    "price": 0,
    "tags": ["parkour", "free"]
  }
]
```

**Error Responses**:
- `500 Server Error` `{ "message": "Server error" }`

**Usage Notes**:
- Only returns maps with `published: true`
- Sorted by `createdAt` descending (newest first)
- Includes subset of fields (not full description or changelog)

---

#### GET `/:id`
**Get Map Details**

Returns full details for a single published map.

**URL Parameters**:
- `id` (number) - Map ID

**Response**: `200 OK`
```json
{
  "id": 1,
  "title": "Adventure Map",
  "description": "Explore a vast world with dungeons and treasures...",
  "thumbnail": "thumbnails/1712000000000_map.png",
  "price": 2500,
  "tags": ["adventure", "exploration"],
  "changelog": "v1.2: Added new dungeon level"
}
```

**Error Responses**:
- `404 Not Found` `{ "message": "Map not found" }`
- `500 Server Error` `{ "message": "Server error" }`

**Example**:
```bash
curl http://localhost:5000/1
```

---

### Authentication Routes

#### POST `/auth/login`
**Admin Login**

Authenticates admin credentials and returns a JWT token.

**Request Body**:
```json
{
  "username": "admin",
  "password": "MySecurePassword"
}
```

**Response**: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzEyNDAwMDAwLCJleHAiOjE3MTI0NDMyMDB9.signature"
}
```

**Error Responses**:
- `400 Bad Request` `{ "message": "Incorrect Password" }`
- `400 Bad Request` `{ "message": "Unauthorized access, invalid username" }`
- `500 Server Error` `{ "message": "Server error" }`

**Token Details**:
- Expires in 12 hours
- Store in frontend and attach to subsequent requests: `headers: { "authorization": token }`
- Signed with `JWT_AUTH` environment variable

**Example**:
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "MyPassword"}'
```

---

### Admin Routes (Protected)

**All admin routes require JWT token in `authorization` header.**

#### POST `/admin/upload?type=map` | `/admin/upload?type=thumbnail`
**Upload File to Supabase**

Uploads a file to Supabase storage and returns the storage path.

**Query Parameters** (Required):
- `type=map` - Upload a map .zip file
- `type=thumbnail` - Upload a map image thumbnail

**Request Headers**:
```
authorization: <JWT token>
Content-Type: multipart/form-data
```

**Request Body** (multipart):
- `file` - The file to upload (form field name must be `file`)

**Response**: `200 OK`
```json
{
  "filePath": "maps/1712000000000_MyMap.zip"
}
```

**Error Responses**:
- `400 Bad Request` `{ "message": "Query param 'type' must be 'map' or 'thumbnail'" }`
- `400 Bad Request` `{ "message": "No file provided" }`
- `500 Server Error` `{ "message": "Upload failed" }`

**Usage Notes**:
- Automatically prefixes filename with timestamp to ensure uniqueness
- Max file size depends on your Supabase plan (typically 5GB)
- Returns full storage path to use in map creation

**Example**:
```javascript
const formData = new FormData();
formData.append('file', mapFile); // HTML File object

const response = await fetch('http://localhost:5000/admin/upload?type=map', {
  method: 'POST',
  headers: { 'authorization': jwtToken },
  body: formData  
});
const { filePath } = await response.json();
```

---

#### GET `/admin/maps`
**List All Maps (Admin View)**

Returns all maps (published and unpublished) with all fields.

**Request Headers**:
```
authorization: <JWT token>
```

**Response**: `200 OK`
```json 
[
  {
    "id": 1,
    "title": "Adventure Map",
    "description": "...",
    "price": 2500,
    "fileUrl": "maps/1712000000000_adventure.zip",
    "thumbnail": "thumbnails/1712000000000_thumb.png",
    "tags": ["adventure"],
    "changelog": "v1.2",
    "published": true,
    "createdAt": "2026-04-10T12:00:00Z",
    "updatedAt": "2026-04-10T12:00:00Z"
  }
]
```

**Error Responses**:
- `500 Server Error` `{ "message": "Server error" }`

---

#### POST `/admin/maps`
**Create New Map**

Creates a new map record in the database.

**Request Headers**:
```
authorization: <JWT token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Adventure Map",
  "description": "Explore a vast world with dungeons and treasures",
  "price": 2500,
  "fileUrl": "maps/1712000000000_adventure.zip",
  "thumbnail": "thumbnails/1712000000000_thumb.png",
  "tags": ["adventure", "exploration"],
  "changelog": "Initial release",
  "published": true
}
```

**Required Fields**: title, description, price, fileUrl, thumbnail  
**Optional Fields**: tags (default []), changelog, published (default true)

**Response**: `201 Created`
```json
{
  "message": "Map created successfully",
  "newMap": {
    "id": 5,
    "title": "Adventure Map",
    ...
  }
}
```

**Error Responses**:
- `400 Bad Request` `{ "message": "Missing required fields" }`
- `500 Server Error` `{ "message": "Server error" }`

---

#### PATCH `/admin/maps/:id`
**Update Map**

Updates one or more fields of an existing map.

**URL Parameters**:
- `id` (number) - Map ID to update

**Request Headers**:
```
authorization: <JWT token>
Content-Type: application/json
```

**Request Body** (any or all fields):
```json
{
  "title": "Updated Title",
  "price": 3000,
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

**Error Responses**:
- `400 Bad Request` `{ "message": "Map ID is required" }`
- `400 Bad Request` `{ "message": "Price cannot be negative" }`
- `500 Server Error` `{ "message": "Server error" }`

---

#### DELETE `/admin/maps/:id`
**Delete Map**

Deletes a map record from the database.

**URL Parameters**:
- `id` (number) - Map ID to delete

**Request Headers**:
```
authorization: <JWT token>
```

**Response**: `200 OK`
```json
{
  "message": "Map deleted successfully"
}
```

**Error Responses**:
- `400 Bad Request` `{ "message": "Map ID is required" }`
- `404 Not Found` `{ "message": "Map not found" }`
- `500 Server Error` `{ "message": "Server error" }`

**Notes**:
- Cascades to delete associated Order records
- Does NOT delete files from Supabase (cleanup manually if needed)

---

### Payment Routes

#### POST `/api/checkout`
**Create Stripe Checkout Session**

Initiates a Stripe checkout session for a map purchase.

**Request Body**:
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

**Error Responses**:
- `404 Not Found` `{ "message": "Map not found" }`
- `500 Server Error` `{ "message": "Server error" }`

**Usage Flow**:
1. Frontend calls endpoint → receives `url`
2. Redirect user to `url` (Stripe checkout page)
3. User completes payment on Stripe
4. Stripe redirects to `${CLIENT_URL}/success?session_id=...` or `${CLIENT_URL}/cancel`
5. User can download via `/api/download/:id?email=buyer@example.com`

**Stripe Behavior**:
- Currency: EUR
- Metadata includes mapId for download verification
- Success URL: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `${CLIENT_URL}/cancel`

---

#### GET `/api/download/:id?email=<buyerEmail>`
**Get Signed Download URL**

Returns a temporary signed download URL for a map file.

**URL Parameters**:
- `id` (number) - Map ID to download
- `email` (query, optional for free maps) - Buyer email for authorization

**Response**: `200 OK`
```json
{
  "downloadUrl": "https://xxxxx.supabase.co/storage/v1/object/sign/maps/1712000000000_adventure.zip?token=xxxxx&expires=1712086400"
}
```

**Error Responses**:
- `400 Bad Request` `{ "message": "Email is required" }` (for paid maps)
- `403 Forbidden` `{ "message": "Please purchase this map first" }` (order not found)
- `404 Not Found` `{ "message": "Map not found" }`
- `500 Server Error` `{ "message": "Server error" }`

**Logic**:
- **Free maps** (price = 0): No email required
- **Paid maps**: Email must match a completed Order record for that map
- URL is valid for 24 hours (86400 seconds)
- Email comparison is case-insensitive

**Example**:
```bash
# Free map
curl http://localhost:5000/api/download/2

# Paid map
curl 'http://localhost:5000/api/download/1?email=buyer@example.com'
```

---

#### POST `/api/webhook`
**Stripe Webhook Endpoint**

Receives webhook events from Stripe. Creates an Order record on successful checkout.

**Request Headers**:
```
stripe-signature: t=1712000000,v1=xxxxx,...
Content-Type: application/json
```

**Request Body**: (Stripe sends; your backend receives)
```json
{
  "id": "evt_xxxxx",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_xxxxx",
      "metadata": { "mapId": "1" },
      "customer_details": { "email": "buyer@example.com" },
      "amount_total": 2500
    }
  }
}
```

**Response**: `200 OK`
```json
{
  "received": true
}
```

**Error Responses**:
- `400 Bad Request` on invalid signature

**Setup**:
1. Create webhook endpoint in Stripe Dashboard
2. URL: `http://yourdomain.com/api/webhook`
3. Events: Select `checkout.session.completed`
4. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET` env var
5. Backend verifies signature before creating Order

**Automatic Behavior**:
- On valid `checkout.session.completed` event:
  - Create Order record with mapId, stripeSessionId, buyerEmail, amountPaid
  - Order enables customer download via `/api/download/:id?email=...`

---

## Authentication & Security

### JWT Token Flow

**Token Generation** (on login):
```javascript
const token = jwt.sign(
  { username: username },
  process.env.JWT_AUTH,
  { expiresIn: "12h" }
);
```

**Token Verification** (on protected routes):
```javascript
jwt.verify(token, process.env.JWT_AUTH, (err, decoded) => {
  if (err) return res.status(400).json({ message: "Unauthorized access" });
  req.username = decoded.username; // Attach to request
  next();
});
```

**Token Usage**:
- Store in frontend (localStorage, cookie, etc.)
- Send in every admin request: `headers: { "authorization": token }`
- Backend extracts from `req.headers['authorization']` (no "Bearer" prefix)

### Password Security

**Hashing** (admin password stored in .env):
```javascript
const hashedPassword = await bcrypt.hash("MyPassword", 10);
// Store in .env: ADMIN_PASSWORD=$2b$10$hashed...
```

**Verification** (on login):
```javascript
const match = await bcrypt.compare(inputPassword, process.env.ADMIN_PASSWORD);
```

### Best Practices

1. **Never commit `.env` to Git**: Use `.env.example` for reference
2. **Use strong JWT secrets**: At least 32 characters, random
3. **Rotate JWT secrets periodically**: All tokens invalidated
4. **HTTPS only in production**: Prevent token interception
5. **Secure storage on frontend**: Use httpOnly cookies if possible
6. **Token expiry**: 12 hours balances security and UX

---

## Payment Processing

### Stripe Integration Flow

**Architecture**:
```
Frontend → Backend /checkout → Stripe Checkout Page → User Payment
  ↓                                    ↓
Backend stores in DB ← Stripe Webhook /webhook
  ↓
User downloads
```

### Checkout Session Creation

**Backend Code**:
```javascript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: { name: map.title },
      unit_amount: map.price // in cents
    },
    quantity: 1
  }],
  mode: 'payment',
  success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.CLIENT_URL}/cancel`,
  metadata: { mapId: map.id }
});
```

### Webhook Verification

**Stripe sends signed webhook**:
```javascript
const event = stripe.webhooks.constructEvent(
  req.body, // Raw body (not JSON parsed!)
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**Key Security Point**: Body must be raw (not parsed to JSON) for signature verification.

### Order Recording

**On checkout.session.completed**:
```javascript
await prisma.order.create({
  data: {
    mapId: Number(session.metadata.mapId),
    stripeSessionId: session.id,
    buyerEmail: session.customer_details.email,
    amountPaid: session.amount_total
  }
});
```

This enables download verification by checking if an order exists for `(mapId, buyerEmail)`.

### Price Handling

- **Storage**: Always in cents (100 = €1.00)
- **Stripe**: Expects cents (unit_amount: 2500)
- **Display**: Format in frontend (€25.00)
- **Free maps**: price = 0, no Stripe session needed

---

## Frontend Integration

### Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install axios  # or fetch if preferred
   ```

2. **Create API client** (e.g., `api/client.js`):
   ```javascript
   const API_BASE = 'http://localhost:5000';

   export const apiClient = {
     // Public
     getMaps: () => fetch(`${API_BASE}/`).then(r => r.json()),
     getMapDetail: (id) => fetch(`${API_BASE}/${id}`).then(r => r.json()),

     // Auth
     login: (username, password) => 
       fetch(`${API_BASE}/auth/login`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username, password })
       }).then(r => r.json()),

     // Admin (all require token in header)
     adminGetMaps: (token) =>
       fetch(`${API_BASE}/admin/maps`, {
         headers: { 'authorization': token }
       }).then(r => r.json()),

     adminCreateMap: (token, mapData) =>
       fetch(`${API_BASE}/admin/maps`, {
         method: 'POST',
         headers: {
           'authorization': token,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify(mapData)
       }).then(r => r.json()),

     adminUpload: (token, file, type) => {
       const formData = new FormData();
       formData.append('file', file);
       return fetch(`${API_BASE}/admin/upload?type=${type}`, {
         method: 'POST',
         headers: { 'authorization': token },
         body: formData
       }).then(r => r.json());
     },

     // Payment
     createCheckout: (mapId) =>
       fetch(`${API_BASE}/api/checkout`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ mapId })
       }).then(r => r.json()),

     getDownload: (mapId, email) =>
       fetch(`${API_BASE}/api/download/${mapId}${email ? '?email=' + email : ''}`).then(r => r.json())
   };
   ```

### Common Workflows

**Public Map Browsing**:
```javascript
// List all maps
const maps = await apiClient.getMaps();

// Show in grid/list component
maps.forEach(map => {
  console.log(`${map.title} - €${(map.price / 100).toFixed(2)}`);
});

// Get details when user clicks a map
const detail = await apiClient.getMapDetail(1);
```

**Admin Login**:
```javascript
const response = await apiClient.login('admin', 'password');
const token = response.token;

// Store token (e.g., in localStorage)
localStorage.setItem('authToken', token);

// Use in subsequent requests
const maps = await apiClient.adminGetMaps(token);
```

**Upload and Create Map**:
```javascript
const token = localStorage.getItem('authToken');

// Upload map file
const uploadResp = await apiClient.adminUpload(token, mapFile, 'map');
const fileUrl = uploadResp.filePath;

// Upload thumbnail
const thumbResp = await apiClient.adminUpload(token, thumbnailFile, 'thumbnail');
const thumbnail = thumbResp.filePath;

// Create map record
const createResp = await apiClient.adminCreateMap(token, {
  title: 'My Map',
  description: 'A cool map',
  price: 2500,
  fileUrl,
  thumbnail,
  tags: ['adventure'],
  published: true
});
```

**Free Map Download**:
```javascript
const downloadResp = await apiClient.getDownload(2);
const { downloadUrl } = downloadResp;
// Open in new window or trigger download
window.open(downloadUrl, '_blank');
```

**Paid Map Purchase**:
```javascript
// Step 1: Create checkout session
const checkoutResp = await apiClient.createCheckout(1);
const checkoutUrl = checkoutResp.url;

// Step 2: Redirect to Stripe
window.location.href = checkoutUrl;

// Step 3: After user completes payment on Stripe,
// they're redirected back to your app
// Step 4: On success page, user can download
const email = 'buyer@example.com'; // From order confirmation
const downloadResp = await apiClient.getDownload(1, email);
const { downloadUrl } = downloadResp;
window.open(downloadUrl, '_blank');
```

### UI Component Examples

**Map Card Component** (React):
```jsx
function MapCard({ map, onDownload, onPurchase }) {
  return (
    <div className="map-card">
      <img src={map.thumbnail} alt={map.title} />
      <h3>{map.title2}</h3>
      <p className="tags">{map.tags.join(', ')}</p>
      <p className="price">
        {map.price === 0 ? 'FREE' : `€${(map.price / 100).toFixed(2)}`}
      </p>
      <button 
        onClick={() => map.price === 0 ? onDownload(map.id) : onPurchase(map.id)}
      >
        {map.price === 0 ? 'Download' : 'Buy'}
      </button>
    </div>
  );
}
```

**Admin Store Component** (React):
```jsx
function AdminStore({ token }) {
  const [maps, setMaps] = useState([]);

  useEffect(() => {
    apiClient.adminGetMaps(token).then(setMaps);
  }, [token]);

  const handleCreate = async (mapData) => {
    const resp = await apiClient.adminCreateMap(token, mapData);
    setMaps([resp.newMap, ...maps]);
  };

  const handleDelete = async (mapId) => {
    await apiClient.adminDeleteMap(token, mapId);
    setMaps(maps.filter(m => m.id !== mapId));
  };

  return (
    <div className="admin-store">
      <CreateMapForm onSubmit={handleCreate} />
      {maps.map(map => (
        <MapRow key={map.id} map={map} onDelete={handleDelete} />
      ))}
    </div>
  );
}
```

---

## Deployment

### Deployment Checklist

- [ ] Environment variables configured in deployment platform
- [ ] Database migrated and initialized
- [ ] Stripe webhook URL updated to production domain
- [ ] Frontend `CLIENT_URL` points to production domain
- [ ] HTTPS enabled on backend and frontend
- [ ] Supabase credentials secured
- [ ] JWT secret changed from development value
- [ ] Admin password changed from default
- [ ] CORS configured if frontend on different domain
- [ ] Monitoring/logging set up
- [ ] Backups configured for database

### Deployment Options

**Heroku** (Recommended for beginners):
```bash
# 1. Create app
heroku create your-app-name

# 2. Set environment variables
heroku config:set DATABASE_URL=···
heroku config:set JWT_AUTH=···
# ... (set all environment variables)

# 3. Push code
git push heroku main

# 4. Run migrations
heroku run npx prisma db push

# 5. View logs
heroku logs --tail
```

**Vercel/Netlify** (Frontend) + Railway/Fly.io (Backend):
- Deploy frontend separately
- Deploy backend to hosting service
- Update `CLIENT_URL` and `DATABASE_URL` in backend environment

**Docker** (Any cloud):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "run", "prod"]  # Add prod script to package.json
```

---

## Development Workflow

### Local Development

1. **Start backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend** (in separate terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access**:
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:3000` (typical)

### Database Changes

**Update Schema**:
```bash
# Edit backend/prisma/schema.prisma

# Review changes
npx prisma migrate dev
# Follow prompts to create migration

# Or if developing
npx prisma db push
```

**Reset Database** (development only):
```bash
npx prisma migrate reset
# Clears all data and re-runs migrations
```

### Testing Endpoints

**Postman/Insomnia**:
- Import `backend/test.rest` if available
- Test each endpoint with sample data

**cURL**:
```bash
# Public
curl http://localhost:5000/

# Auth
curl -X POST http://localhost:5000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"..."}'

# Admin (requires token)
curl http://localhost:5000/admin/maps \
  -H 'authorization: <token>'
```

### Debugging

**Backend Logs**:
```javascript
// Add console logs
console.log('Received request:', req.body);
console.error('Database error:', err);
```

**Check Database State**:
```bash
# Open Prisma Studio
npx prisma studio
# Opens browser UI to view/edit data at http://localhost:5555
```

**Monitor Requests**:
```bash
# Use network tab in browser DevTools
# or add logging middleware to Express
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

---

## Troubleshooting

### Common Issues

**Database Connection Error**:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Check PostgreSQL is running
- Verify `DATABASE_URL` is correct
- For Supabase: Connection pooling vs. direct connection

**JWT Token Invalid**:
```
UnauthorizedError: invalid token
```
- Ensure `JWT_AUTH` environment variable matches between login and verification
- Check token hasn't expired (12 hour expiry)
- Verify header format: `authorization: token` (no "Bearer" prefix)

**Stripe Webhook Not Firing**:
- Verify webhook secret in `.env` matches Stripe dashboard
- Check endpoint URL is publicly accessible (not localhost)
- Webhook body must be raw (not JSON-parsed)
- Test webhook in Stripe dashboard → Webhooks → "Send test event"

**File Upload Fails**:
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Verify bucket "maps" exists in Supabase
- Check file size limits
- Ensure bucket permissions allow uploads

**Maps Not Showing in Public List**:
- Verify `published: true` on map records
- Check in Prisma Studio: `npx prisma studio`
- Confirm database is populated

**Admin Can't Create Map**:
- Verify JWT token is valid and not expired
- Check all required fields provided: title, description, price, fileUrl, thumbnail
- Verify `ADMIN_PASSWORD` in `.env` is bcrypt-hashed

### Debug Mode

**Enable Verbose Logging**:
```javascript
// In server.js
import 'dotenv/config';

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Log database queries
const prisma = new PrismaClient({
  log: [
    { emit: 'stdout', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ],
});
```

**Check Prisma Client State**:
```bash
npx prisma db execute --stdin < query.sql
# Or use Prisma Studio
npx prisma studio
```

---

## Code Examples

### Complete Admin Workflow (Pseudocode)

```javascript
// Frontend: Admin Dashboard

// 1. Login
const loginResp = await fetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username: 'admin', password: 'pass' })
});
const { token } = await loginResp.json();
localStorage.setItem('authToken', token);

// 2. Upload Map File
const mapFile = fileInput.files[0];
const uploadResp = await fetch('/admin/upload?type=map', {
  method: 'POST',
  headers: { 'authorization': token },
  body: new FormData().add('file', mapFile)
});
const { filePath: fileUrl } = await uploadResp.json();

// 3. Upload Thumbnail
const thumbFile = thumbInput.files[0];
const thumbResp = await fetch('/admin/upload?type=thumbnail', {
  method: 'POST',
  headers: { 'authorization': token },
  body: new FormData().add('file', thumbFile)
});
const { filePath: thumbnail } = await thumbResp.json();

// 4. Create Map Record
const createResp = await fetch('/admin/maps', {
  method: 'POST',
  headers: {
    'authorization': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My Adventure Map',
    description: 'Epic exploration adventure',
    price: 2500, // €25.00
    fileUrl,
    thumbnail,
    tags: ['adventure', 'exploration'],
    published: true
  })
});
const { newMap } = await createResp.json();

// 5. View All Maps
const mapsResp = await fetch('/admin/maps', {
  headers: { 'authorization': token }
});
const allMaps = await mapsResp.json();

// 6. Update Map
const updateResp = await fetch(`/admin/maps/${newMap.id}`, {
  method: 'PATCH',
  headers: {
    'authorization': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ price: 3000 })
});

// 7. Delete Map
const deleteResp = await fetch(`/admin/maps/${newMap.id}`, {
  method: 'DELETE',
  headers: { 'authorization': token }
});
```

### Complete Purchase Workflow

```javascript
// Frontend: Customer

// 1. Browse Maps
const maps = await fetch('/').then(r => r.json());

// 2. Get Map Detail
const map = await fetch('/1').then(r => r.json());

// 3a. For Free Map: Download directly
if (map.price === 0) {
  const dl = await fetch('/api/download/1').then(r => r.json());
  window.open(dl.downloadUrl);
}

// 3b. For Paid Map: Checkout
const checkoutResp = await fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mapId: 1 })
});
const { url } = await checkoutResp.json();

// 4. Redirect to Stripe
window.location.href = url;

// 5. User completes payment on Stripe
// Stripe redirects to your success page

// 6. Download after purchase
const email = 'buyer@example.com'; // From order
const dlResp = await fetch(`/api/download/1?email=${email}`).then(r => r.json());
window.open(dlResp.downloadUrl);
```

---

## Summary Table

### All Routes at a Glance

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | No | List published maps |
| GET | `/:id` | No | Get map details |
| POST | `/auth/login` | No | Admin login |
| GET | `/admin/maps` | Yes | List all maps |
| POST | `/admin/maps` | Yes | Create map |
| PATCH | `/admin/maps/:id` | Yes | Update map |
| DELETE | `/admin/maps/:id` | Yes | Delete map |
| POST | `/admin/upload` | Yes | Upload file |
| POST | `/api/checkout` | No | Create Stripe session |
| GET | `/api/download/:id` | No | Get download URL |
| POST | `/api/webhook` | Stripe | Stripe webhook |

---

## Quick Reference

**Start Development**:
```bash
cd backend && npm install && npm run dev
```

**Example Login**:
- Username: `admin`
- Password: (from `.env` ADMIN_PASSWORD before hashing)

**Example Map Price**:
- 2500 cents = €25.00

**Example Free Map Download**:
- GET `/api/download/2` (no email needed)

**Example Paid Map Download**:
- GET `/api/download/1?email=buyer@example.com`

**Token Header Format**:
- `authorization: eyJhbGc...` (token itself, not "Bearer token")

**All Prices in Cents**:
- Frontend displays: €(price/100).toFixed(2)
- Request/response: always in cents

---

**Last Updated**: April 10, 2026  
**Version**: 1.0 - Complete Implementation  
**Project**: LanderMaps Backend - Minecraft Map Marketplace