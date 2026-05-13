# Allo Inventory Reservation System

I built this project as part of the AlloHealth engineering assignment.

The main goal was to solve the inventory overselling problem when multiple users try to reserve the same product at nearly the same time.

## Live Demo

https://alloinventory.vercel.app

## What the project does

In e-commerce systems, race conditions can happen when stock is limited.

For example:
- Only 1 unit of a product is available
- Two users try to reserve it at almost the same time
- Without proper handling, both reservations might succeed

This creates incorrect inventory data.

To solve this, I implemented a temporary reservation system where inventory gets reserved for a limited time instead of being permanently reduced immediately.

A user can:
- View available products
- Create a reservation
- Confirm the reservation
- Release the reservation manually
- Let expired reservations return automatically to available stock

## Tech Stack

I used:

- Next.js 15 (App Router)
- TypeScript
- PostgreSQL (Supabase)
- Prisma ORM
- Tailwind CSS
- Vercel for deployment

## API Endpoints

### Products
```http
GET /api/products
```

Used to fetch product inventory.

### Create Reservation
```http
POST /api/reservations
```

Creates a temporary reservation if stock is available.

### Confirm Reservation
```http
POST /api/reservations/[id]/confirm
```

Confirms an existing reservation.

### Release Reservation
```http
POST /api/reservations/[id]/release
```

Releases reserved stock back to inventory.

### Warehouses
```http
GET /api/warehouses
```

Fetches warehouse inventory data.

## Local Setup

Clone the project:

```bash
git clone https://github.com/Raman-954/AlloHealth.git
cd AlloHealth
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
DATABASE_URL="my_database_url"
DIRECT_URL="my_direct_database_url"
```

Setup Prisma:

```bash
npx prisma db push
npx prisma generate
npx prisma db seed
```

Run locally:

```bash
npm run dev
```

## Technical Decisions

### 1. Handling concurrent reservations

The main challenge in this assignment was preventing overselling.

I used Prisma transactions so the stock check and reservation creation happen together instead of as separate operations.

This helps avoid inconsistent inventory updates when multiple requests come at the same time.

### 2. Reservation expiry handling

I did not add a cron job or background worker for cleanup.

Instead, I used a simpler approach where expired reservations are cleaned during reservation-related requests.

For this assignment, this kept the implementation simpler while still solving the problem.

### 3. Database choice

Since the project already uses PostgreSQL, handling concurrency at the database level made more sense than adding Redis or extra infrastructure.

For larger distributed systems, a different approach might make sense, but for this scope PostgreSQL transactions were sufficient.

### 4. Next.js implementation

I used Next.js App Router for both frontend pages and API routes.

During development, I also had to fix issues related to dynamic route params and deployment configuration while deploying on Vercel.

## Current Limitations

Things I intentionally did not include:

- Authentication
- Payment flow
- Order management
- Background scheduler
- Audit logging

The focus was mainly on inventory reservation logic.

## Author

Raman Kumar

GitHub: https://github.com/Raman-954
LinkedIn: https://www.linkedin.com/in/raman-kumar-webdev/
