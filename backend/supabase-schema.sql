-- The Backroom Inventory Management Schema
-- Run this in Supabase SQL Editor

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'units',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table for audit log
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  user_id TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_item_name ON transactions(item_name);

-- Enable Row Level Security (RLS)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on inventory" ON inventory;
DROP POLICY IF EXISTS "Allow all operations on transactions" ON transactions;

-- Create policies to allow all operations (since this is a single-user app)
CREATE POLICY "Enable all access for inventory" ON inventory
  FOR ALL 
  TO anon, authenticated
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Enable all access for transactions" ON transactions
  FOR ALL 
  TO anon, authenticated
  USING (true) 
  WITH CHECK (true);

-- Insert a test item
INSERT INTO inventory (name, quantity, unit, updated_by)
VALUES ('test item', 0, 'units', 'system')
ON CONFLICT DO NOTHING;
