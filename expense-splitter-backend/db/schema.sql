-- ExpenseMate — PostgreSQL schema
-- Apply once (new database or empty DB):
--   psql -U postgres -h localhost -d expense_splitter -f db/schema.sql
--
-- Requires: CREATE DATABASE expense_splitter; (if it does not exist)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Customers live here. Admin signs in with fixed credentials (not stored in this table).
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_fake BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Shared bills (implement API when ready).
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  paid_by_user_id UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses (paid_by_user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses (created_at DESC);

-- Each person’s share of an expense.
CREATE TABLE IF NOT EXISTS expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  share NUMERIC(12, 2) NOT NULL CHECK (share >= 0),
  UNIQUE (expense_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_expense_splits_user ON expense_splits (user_id);
