# ExpenseMate

**Split shared costs fairly without the spreadsheet chaos.**

A full-stack web app where roommates, travel groups, and small teams can record who paid what, split bills, and see who owes whom at a glance.

---

##  Description

### What the project does

ExpenseMate lets people **register**, **log in**, **add expenses** with custom splits among participants, **edit or remove** their expenses, and view **balance summaries** so shared money stays transparent. Operators can use a dedicated **admin** dashboard for overview stats and light data management.

### Problem it solves

Shared spending often lives in messy chats and ad-hoc math. ExpenseMate centralizes bills in one place, keeps a clear audit of who paid and who owes, and reduces arguments about “who owes what.”

### Who it’s for

- **Friends & roommates** splitting rent, groceries, or trips  
- **Small teams** tracking informal IOUs  
- **Developers & learners** who want a clear full-stack reference (Next.js + Express + PostgreSQL)

---

## Features

### User (customer)

- **Account** — Register, log in, JWT-based session  
- **Expenses** — List “my” expenses, add new bills with amount, description, payer, and per-person splits  
- **Edit & delete** — Update or remove expenses you control  
- **Balances** — See summarized balances (who owes / is owed)  
- **Dashboard** — Overview of activity  
- **Profile** — View account info  

### Admin

- **Dashboard / stats** — Aggregate statistics for the system  
- **Users & balances** — Inspect users and balance-related views  
- **Expenses** — List expenses across the system  
- **Fake users** — Create demo users (`POST /api/admin/fake-user`) for testing  
- **Cleanup** — Delete fake users or expenses when needed (with safe handling of related data)

> Admin signs in with credentials configured in the backend (`ADMIN_USERNAME` / `ADMIN_PASSWORD`), not as a row in the customers table.

---

## Tech stack

| Layer | Technology |
| ----- | ---------- |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express 5, REST API |
| **Auth & security** | JSON Web Tokens (JWT), bcrypt password hashing |
| **Database** | PostgreSQL (`pg` driver), UUID primary keys |

---

## Project structure

```
ExpenseMate/
├── expense-splitter-backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL pool / connection
│   ├── controllers/              # Route handlers (auth, expenses, admin, …)
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT + admin checks
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── expenseRoutes.js      # /api/expenses
│   │   ├── balanceRoutes.js      # /api/balance
│   │   └── adminRoutes.js        # /api/admin
│   ├── db/
│   │   └── schema.sql            # Database schema (run once)
│   ├── server.js                 # Express entry + /api/health
│   └── package.json
│
└── expense-splitter-frontend/
    ├── src/
    │   ├── app/                  # Next.js App Router (pages & layouts)
    │   │   ├── page.tsx          # Home
    │   │   ├── login/ | register/
    │   │   ├── dashboard/ | my-expenses/ | add-expense/ | edit-expense/
    │   │   ├── balances/ | profile/
    │   │   └── admin/
    │   ├── components/           # Shared UI (Navbar, Footer, forms, …)
    │   ├── services/
    │   │   └── api.ts            # API client + auth helpers
    │   └── types/                # TypeScript types
    ├── next.config.ts            # Rewrites /api → Express (local dev)
    └── package.json
```

---

## Installation & setup

### Prerequisites

- **Node.js** (LTS recommended)  
- **PostgreSQL** installed and running  
- **npm** (comes with Node)

### 1. Clone the repository

```bash
git clone https://github.com/Nethmikaveesha/personal-expense-splitter
cd ExpenseMate
```

### 2. Create the database

Create a database named `expense_splitter` (or pick a name and set `PGDATABASE` / `DB_NAME` later).

**Option A — command line:**

```bash
createdb -U postgres expense_splitter
```

**Option B — in `psql`:**

```sql
CREATE DATABASE expense_splitter;
```

### 3. Apply the schema

From the repo root (adjust `-U` / `-h` if needed):

```bash
psql -U postgres -h localhost -d expense_splitter -f expense-splitter-backend/db/schema.sql
```

### 4. Backend environment

Inside `expense-splitter-backend/`, create a `.env` file:

```env
PORT=5000

PGUSER=postgres
PGHOST=localhost
PGDATABASE=expense_splitter
PGPASSWORD=your_postgres_password
PGPORT=5432

JWT_SECRET=change-this-in-production

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

> Use a strong `JWT_SECRET` and `ADMIN_PASSWORD` in production.

### 5. Install and run the backend

```bash
cd expense-splitter-backend
npm install
npm run dev
```

The API should listen on **http://localhost:5000**. Check **http://localhost:5000/api/health** for database name and row counts.

**Tip:** If `psql` shows empty tables but the app has data, you may be connected to the wrong database. In `psql`, run `\c expense_splitter` to match the app.

### 6. Install and run the frontend

Open a **second** terminal:

```bash
cd expense-splitter-frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

The Next.js app rewrites `/api/*` to `http://127.0.0.1:5000` by default, so you usually **do not** need `NEXT_PUBLIC_API_URL` for local development.

### 7. Optional frontend environment

| Variable | Purpose |
| -------- | ------- |
| `API_PROXY_TARGET` | Where `/api/*` is proxied (default `http://127.0.0.1:5000`) |
| `NEXT_PUBLIC_API_URL` | Full API URL for the browser when frontend and API are on different hosts (e.g. production) |

### 8. Production build (frontend)

```bash
cd expense-splitter-frontend
npm run build
npm start
```

Set `NEXT_PUBLIC_API_URL` to your deployed API URL if the UI and API are not on the same origin.

---

## API overview

| Prefix | Purpose |
| ------ | ------- |
| `/api/auth` | Register, login, current user (`/me`) |
| `/api/expenses` | List, create, update, delete expenses (authenticated) |
| `/api/balance` | Balance summary (authenticated) |
| `/api/admin` | Admin-only stats, lists, fake user, deletes |

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

**Nethmi Kaveesha**

---


