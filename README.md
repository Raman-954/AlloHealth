# Allo Inventory - Reservation System 📦

Hi there! This is my submission for the Allo Engineering Take-Home Exercise. I've built a functional inventory reservation system using **Next.js 15** that prevents "overselling" during high-traffic checkout windows.

## 🎯 The Problem
When a customer reaches checkout, there's a risk of a race condition: multiple users might try to buy the last item simultaneously.
- **My Solution**: A 10-minute temporary reservation (hold) that ensures stock is locked for a specific user while they complete their payment.

---

## 🚀 Quick Start

### 1. Environment Setup
Create a `.env` file in the root directory and add your PostgreSQL connection string (Supabase/Neon):
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

2. Install & Sync

# Install dependencies
npm install

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed the database (Important: Creates 3 products & 2 warehouses)
npx prisma db seed

3. Run Locally

npm run dev

🧠 Technical Deep Dive
1. Handling Concurrency (Race Conditions) 🏎️
The most critical part of this exercise was ensuring that if two users click "Reserve" at the same time for the last unit, exactly one succeeds.
Implementation: I used Prisma Interactive Transactions.
Logic: Inside the transaction, the database locks the specific inventory row. We check if available stock > requested quantity. If yes, we increment reservedUnits and commit.
Result: Because this happens in a transaction, the database forces requests to be processed one-by-one. The second request will see 0 stock and return a 409 Conflict error.

2. Expiry Mechanism: "Lazy Cleanup" ⏳
Instead of using complex Cron jobs or background workers, I implemented a Lazy Cleanup on Read strategy.
How it works: In the POST /api/reservations endpoint, before we check for available stock, we first look for any PENDING reservations for that item that have expired.
Effect: It automatically releases the "stale" reserved units back into the inventory. This ensures that stock is never "stuck" in abandoned carts for more than 10 minutes.

3. Frontend Error Handling 🛡️
409 Conflict: If stock runs out, the user gets a clear alert on the home page, and the product list refreshes to show the latest stock levels.
410 Gone: If the timer hits zero on the checkout page, the "Confirm" button is disabled, and the user is notified that their window has expired.

⚖️ Trade-offs & Decisions
Simple Validation over Zod: I kept the request validation simple using standard conditional checks. This keeps the codebase lightweight and easy to follow for this specific scope.

Database Transactions over Redis: For a single-database setup, SQL transactions are the most reliable way to handle race conditions. I avoided Redis to keep the infrastructure simple and "human-readable," as per the project requirements.

Next.js 15 Handling: I used await params in dynamic API routes and the use(params) hook in client components to adhere to the new asynchronous requirements of Next.js 15.


🛠️ Tech Stack
Framework: Next.js 15 (App Router)
Language: TypeScript
Database: PostgreSQL + Prisma ORM
Styling: Tailwind CSS
