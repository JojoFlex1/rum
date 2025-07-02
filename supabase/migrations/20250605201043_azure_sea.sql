/*
  # Payment System Schema

  1. New Tables
    - `transactions`
      - Stores all payment transactions
      - Includes amounts, fees, status, and wallet addresses
    - `transaction_history`
      - Stores detailed transaction history with status changes
    - `fee_configurations`
      - Stores configurable fee rates for different payment methods

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  amount_ars numeric NOT NULL,
  amount_crypto numeric NOT NULL,
  crypto_symbol text NOT NULL,
  service_fee numeric NOT NULL,
  atm_fee numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  wallet_address text,
  merchant_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transaction history table
CREATE TABLE IF NOT EXISTS transaction_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id),
  status text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create fee configurations table
CREATE TABLE IF NOT EXISTS fee_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_method text NOT NULL UNIQUE,
  service_fee_rate numeric NOT NULL,
  atm_fee_rate numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transaction history"
  ON transaction_history
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM transactions 
    WHERE transactions.id = transaction_history.transaction_id 
    AND transactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can view fee configurations"
  ON fee_configurations
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default fee configurations
INSERT INTO fee_configurations 
  (payment_method, service_fee_rate, atm_fee_rate) 
VALUES 
  ('scan-to-pay', 0.03, 0),
  ('tap-to-pay', 0.03, 0),
  ('cash-to-pay', 0.03, 0.05);