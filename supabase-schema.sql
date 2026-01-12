-- Create API Keys table in Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS) on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID, -- Optional: if you want to associate keys with users
  CONSTRAINT api_keys_key_unique UNIQUE (key)
);

-- Create an index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at DESC);

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for now
-- In production, you should restrict this based on user authentication
CREATE POLICY "Allow all operations for authenticated users" ON api_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Or if you want to allow all operations without authentication (for development):
-- DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON api_keys;
-- CREATE POLICY "Allow all operations" ON api_keys
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

