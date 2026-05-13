# Allo Inventory Reservation System 📦

A production-style inventory reservation system designed to prevent overselling during concurrent checkout scenarios.

This project simulates a real-world e-commerce inventory workflow where multiple users may attempt to reserve the same product simultaneously. The focus of this implementation is handling race conditions safely using transactional database operations.

## Live Demo

🔗 https://alloinventory.vercel.app

---

## Problem Statement

In e-commerce systems, overselling happens when multiple users try to reserve or purchase the same limited inventory at the same time.

Example:

- Available stock = 1
- User A clicks **Reserve**
- User B clicks **Reserve** almost simultaneously
- Without concurrency control, both requests may succeed

This creates inconsistent inventory state and poor user experience.

---

## Solution

To solve this, I implemented a temporary reservation mechanism backed by database transactions.

Flow:

- User selects a product
- User requests a reservation
- System validates stock atomically
- Reservation is created for 10 minutes
- Reserved stock becomes unavailable to others
- User can confirm reservation before expiry
- Expired reservations are released automatically

---

## Features

- Temporary inventory reservation (10-minute hold)
- Concurrency-safe reservation creation
- Reservation confirmation flow
- Manual reservation release
- Automatic expired reservation cleanup
- Product inventory listing
- Warehouse inventory support
- Real-time stock refresh
- Error handling for invalid / expired requests

---

## Tech Stack 🛠️

**Framework**
- Next.js 15 (App Router)

**Language**
- TypeScript

**Database**
- PostgreSQL (Supabase)

**ORM**
- Prisma ORM

**Styling**
- Tailwind CSS

**Deployment**
- Vercel

---

## API Endpoints

### Get Products
```http
GET /api/products
```

Fetches available inventory/products.

---

### Create Reservation
```http
POST /api/reservations
```

Creates a temporary reservation if stock is available.

---

### Confirm Reservation
```http
POST /api/reservations/[id]/confirm
```

Confirms an active reservation before expiry.

---

### Release Reservation
```http
POST /api/reservations/[id]/release
```

Releases reserved inventory back to stock.

---

### Get Warehouses
```http
GET /api/warehouses
```

Fetches warehouse inventory data.

---

## Project Structure

```bash
app/
├── api/
│   ├── products/
│   │   └── route.ts
│   │
│   ├── reservations/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── confirm/
│   │       │   └── route.ts
│   │       └── release/
│   │           └── route.ts
│   │
│   └── warehouses/
│       └── route.ts
│
├── reservations/
│   └── [id]/
│       └── page.tsx
│
├── page.tsx
├── layout.tsx
├── globals.css
└── favicon.ico

components/
├── Navbar.tsx
├── ProductCard.tsx
└── ReservationForm.tsx

lib/
├── prisma.ts
└── reservation-utils.ts

prisma/
├── schema.prisma
└── seed.ts

types/
└── index.ts
```

---

## Local Setup

### Clone Repository

```bash
git clone https://github.com/Raman-954/AlloHealth.git
cd allo-inventory-system
```

---

### Environment Variables

Create `.env` file:

```env
DATABASE_URL="your_supabase_pooling_url"
DIRECT_URL="your_supabase_direct_url"
```

Example:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

---

### Install Dependencies

```bash
npm install
```

---

### Database Setup

Push schema:

```bash
npx prisma db push
```

Generate Prisma client:

```bash
npx prisma generate
```

Seed sample data:

```bash
npx prisma db seed
```

---

### Run Project

```bash
npm run dev
```

Runs at:

```bash
http://localhost:3000
```

---

## Engineering Decisions

### 1. Concurrency Handling

The primary challenge was preventing overselling during simultaneous reservation attempts.

I used **Prisma Interactive Transactions** to ensure atomic operations.

Within the transaction:

- stock availability is checked
- reservation creation happens
- inventory consistency is preserved

Because these steps occur atomically, concurrent requests cannot incorrectly reserve the same stock.

---

### 2. Reservation Expiration Strategy

Instead of background cron jobs, I implemented lazy cleanup.

How it works:

Before processing reservation logic:

- expired pending reservations are identified
- reserved stock is released automatically

Benefits:

- simpler deployment
- reduced infrastructure complexity
- fewer operational dependencies

---

### 3. Why Database Transactions Instead of Redis Locks?

For this project scope, PostgreSQL transactions were the most practical choice.

Advantages:

- strong consistency guarantees
- simpler implementation
- no additional infrastructure
- easier debugging

In larger distributed systems, Redis distributed locking would be a stronger scaling option.

---

### 4. Error Handling

Handled key failure scenarios:

**409 Conflict**
- stock no longer available

**410 Gone**
- reservation expired

**400 Bad Request**
- invalid request payload

This keeps frontend state predictable.

---

## Trade-offs

Intentional engineering trade-offs:

- lazy cleanup instead of scheduled workers
- SQL locking instead of distributed locking
- no authentication layer
- no payment/order workflow

These choices kept the solution focused and maintainable.

---

## Future Improvements

Possible scaling improvements:

- Redis distributed locks
- background cleanup workers
- reservation queues
- authentication / user accounts
- payment integration
- audit logging
- observability / monitoring

---

## What This Project Demonstrates

This project showcases:

- backend API design
- concurrency-safe transaction handling
- database schema design
- Prisma ORM integration
- PostgreSQL inventory workflows
- engineering tradeoff decision-making
- full-stack deployment workflow

---

## Author

**Raman Kumar**

GitHub: https://github.com/Raman-954  
LinkedIn: https://www.linkedin.com/in/raman-kumar-webdev/
