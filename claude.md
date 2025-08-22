Here is my database Schema

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.investments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  investment_name text NOT NULL,
  investment_type text NOT NULL,
  amount_invested numeric NOT NULL,
  current_value numeric NOT NULL,
  expected_return_rate numeric NOT NULL,
  expected_return_amount numeric NOT NULL,
  investment_date timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  maturity_date timestamp with time zone,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'completed'::text, 'cancelled'::text])),
  risk_level text DEFAULT 'medium'::text CHECK (risk_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  description text,
  icon_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT investments_pkey PRIMARY KEY (id),
  CONSTRAINT investments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.pending_investments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id text NOT NULL,
  plan_name text NOT NULL,
  amount_usd numeric NOT NULL,
  expected_return numeric NOT NULL,
  duration_days integer NOT NULL,
  interest_rate numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['btc'::text, 'usdt_bep20'::text, 'usdt_erc20'::text])),
  transaction_hash text,
  maturity_date timestamp with time zone NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  admin_notes text,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT pending_investments_pkey PRIMARY KEY (id),
  CONSTRAINT pending_investments_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id),
  CONSTRAINT pending_investments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  wallet_address_btc text,
  wallet_address_usdt_erc20 text,
  wallet_address_usdt_bep20 text,
  profile_complete boolean,
  phone_number text,
  country text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type = ANY (ARRAY['deposit'::text, 'withdrawal'::text, 'investment'::text, 'return'::text, 'dividend'::text])),
  amount numeric NOT NULL,
  description text NOT NULL,
  investment_id uuid,
  status text DEFAULT 'completed'::text CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])),
  transaction_date timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT transactions_investment_id_fkey FOREIGN KEY (investment_id) REFERENCES public.investments(id)
);
CREATE TABLE public.user_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_balance numeric NOT NULL,
  total_invested numeric NOT NULL,
  total_withdrawn numeric NOT NULL,
  expected_returns numeric NOT NULL,
  available_balance numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_balances_pkey PRIMARY KEY (id),
  CONSTRAINT user_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.withdrawal_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 200::numeric),
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['btc'::text, 'usdt_bep20'::text, 'usdt_erc20'::text])),
  wallet_address text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'completed'::text])),
  admin_notes text,
  transaction_hash text,
  approved_by uuid,
  approved_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT withdrawal_requests_pkey PRIMARY KEY (id),
  CONSTRAINT withdrawal_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT withdrawal_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id)
);

# SendGrid Configuration 

SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=raphandy007@gmail.com
ADMIN_EMAIL=raphandy007@gmail.com