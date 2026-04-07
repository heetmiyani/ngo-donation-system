/*
  # Donation Management System Schema

  ## Overview
  Creates the database schema for an NGO donation management system with donor tracking and donation records.

  ## New Tables
  
  ### `donors`
  - `id` (uuid, primary key) - Unique identifier for each donor
  - `name` (text, required) - Donor's full name
  - `phone` (text, unique) - Donor's phone number (primary identifier)
  - `email` (text) - Donor's email address
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record last update timestamp

  ### `donations`
  - `id` (uuid, primary key) - Unique identifier for each donation
  - `donor_id` (uuid, foreign key) - References donors table
  - `amount` (numeric, required) - Donation amount
  - `category` (text, required) - Category: 'Khichdi Ghar', 'Tiffin Seva', or 'Other'
  - `receipt_id` (text, unique) - Auto-generated unique receipt ID
  - `donation_date` (timestamptz) - Date of donation
  - `notes` (text) - Optional notes about the donation
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on both tables
  - Authenticated users can read all donor and donation data
  - Authenticated users can insert donors and donations
  - Authenticated users can update donor information
  
  ## Indexes
  - Index on donors.phone for fast phone-based lookup
  - Index on donors.name for autocomplete search
  - Index on donations.donor_id for fast donor history queries
  - Index on donations.donation_date for date-based queries
*/

-- Create donors table
CREATE TABLE IF NOT EXISTS donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  category text NOT NULL CHECK (category IN ('Khichdi Ghar', 'Tiffin Seva', 'Other')),
  receipt_id text UNIQUE NOT NULL,
  donation_date timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donors_phone ON donors(phone);
CREATE INDEX IF NOT EXISTS idx_donors_name ON donors(name);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(donation_date);
CREATE INDEX IF NOT EXISTS idx_donations_receipt_id ON donations(receipt_id);

-- Enable Row Level Security
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donors table
CREATE POLICY "Authenticated users can view all donors"
  ON donors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert donors"
  ON donors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update donors"
  ON donors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for donations table
CREATE POLICY "Authenticated users can view all donations"
  ON donations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update donations"
  ON donations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_donors_updated_at
  BEFORE UPDATE ON donors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate receipt ID
CREATE OR REPLACE FUNCTION generate_receipt_id()
RETURNS text AS $$
DECLARE
  new_id text;
  counter int;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_id FROM 5) AS INTEGER)), 0) + 1
  INTO counter
  FROM donations
  WHERE receipt_id LIKE 'RCP-%';
  
  new_id := 'RCP-' || LPAD(counter::text, 6, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;