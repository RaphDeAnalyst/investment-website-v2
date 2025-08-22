-- Complete Database Setup for Investment Platform
-- Run this SQL in your Supabase SQL editor to restore missing functionality

-- =============================================
-- 1. PROFILE CREATION FUNCTION AND TRIGGER
-- =============================================

-- Function to create profile when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. USER BALANCE FUNCTIONS
-- =============================================

-- Function to create initial user balance record
CREATE OR REPLACE FUNCTION public.handle_new_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_balances (
    user_id,
    total_balance,
    total_invested,
    total_withdrawn,
    expected_returns,
    available_balance,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    0,
    0,
    0,
    0,
    0,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user balance on profile creation
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_balance();

-- Function to calculate user's available balance
CREATE OR REPLACE FUNCTION public.get_user_balance(user_id uuid)
RETURNS numeric AS $$
DECLARE
  total_invested numeric := 0;
  total_withdrawn numeric := 0;
  total_returns numeric := 0;
  available_balance numeric := 0;
BEGIN
  -- Get total invested amount from active investments
  SELECT COALESCE(SUM(amount_invested), 0)
  INTO total_invested
  FROM public.investments
  WHERE user_id = $1 AND status = 'active';

  -- Get total withdrawn amount from completed withdrawals
  SELECT COALESCE(SUM(amount), 0)
  INTO total_withdrawn
  FROM public.withdrawal_requests
  WHERE user_id = $1 AND status = 'approved';

  -- Get total returns from completed investments
  SELECT COALESCE(SUM(expected_return_amount), 0)
  INTO total_returns
  FROM public.investments
  WHERE user_id = $1 AND status = 'completed';

  -- Calculate available balance
  available_balance := total_returns - total_withdrawn;

  -- Ensure balance is not negative
  IF available_balance < 0 THEN
    available_balance := 0;
  END IF;

  RETURN available_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. WITHDRAWAL MANAGEMENT FUNCTIONS
-- =============================================

-- Function to approve withdrawal
CREATE OR REPLACE FUNCTION public.approve_withdrawal(
  withdrawal_id uuid,
  admin_user_id uuid,
  notes text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  withdrawal_amount numeric;
  user_id_val uuid;
  user_balance numeric;
BEGIN
  -- Get withdrawal details
  SELECT amount, user_id INTO withdrawal_amount, user_id_val
  FROM public.withdrawal_requests
  WHERE id = withdrawal_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal request not found or already processed';
  END IF;

  -- Check user balance
  SELECT public.get_user_balance(user_id_val) INTO user_balance;

  IF user_balance < withdrawal_amount THEN
    RAISE EXCEPTION 'Insufficient balance for withdrawal';
  END IF;

  -- Update withdrawal request
  UPDATE public.withdrawal_requests
  SET 
    status = 'approved',
    approved_by = admin_user_id,
    approved_at = NOW(),
    notes = COALESCE(approve_withdrawal.notes, 'Approved by admin')
  WHERE id = withdrawal_id;

  -- Create transaction record
  INSERT INTO public.transactions (
    user_id,
    transaction_type,
    amount,
    description,
    status,
    transaction_date,
    created_at
  )
  VALUES (
    user_id_val,
    'withdrawal',
    -withdrawal_amount,
    'Withdrawal approved - ' || (SELECT payment_method FROM public.withdrawal_requests WHERE id = withdrawal_id),
    'completed',
    NOW(),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject withdrawal
CREATE OR REPLACE FUNCTION public.reject_withdrawal(
  withdrawal_id uuid,
  admin_user_id uuid,
  notes text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Update withdrawal request
  UPDATE public.withdrawal_requests
  SET 
    status = 'rejected',
    approved_by = admin_user_id,
    approved_at = NOW(),
    notes = COALESCE(reject_withdrawal.notes, 'Rejected by admin')
  WHERE id = withdrawal_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal request not found or already processed';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables (skip if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin users can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (
      'raphandy007@gmail.com',
      'admin@investmentpro.com',
      'support@investmentpro.com'
    )
  );

-- =============================================
-- INVESTMENTS TABLE POLICIES
-- =============================================

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view own investments" ON public.investments;
DROP POLICY IF EXISTS "Admins can view all investments" ON public.investments;
DROP POLICY IF EXISTS "Admins can insert investments" ON public.investments;

-- Users can view their own investments
CREATE POLICY "Users can view own investments" ON public.investments
  FOR SELECT USING (auth.uid() = user_id);

-- Admin users can view all investments
CREATE POLICY "Admins can view all investments" ON public.investments
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (
      'raphandy007@gmail.com',
      'admin@investmentpro.com',
      'support@investmentpro.com'
    )
  );

-- Admin users can insert investments (for approvals)
CREATE POLICY "Admins can insert investments" ON public.investments
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'raphandy007@gmail.com',
      'admin@investmentpro.com',
      'support@investmentpro.com'
    )
  );

-- =============================================
-- PENDING INVESTMENTS TABLE POLICIES
-- =============================================

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can insert own pending investments" ON public.pending_investments;
DROP POLICY IF EXISTS "Users can view own pending investments" ON public.pending_investments;
DROP POLICY IF EXISTS "Admins can view all pending investments" ON public.pending_investments;
DROP POLICY IF EXISTS "Admins can update pending investments" ON public.pending_investments;

-- Users can insert their own pending investments
CREATE POLICY "Users can insert own pending investments" ON public.pending_investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own pending investments
CREATE POLICY "Users can view own pending investments" ON public.pending_investments
  FOR SELECT USING (auth.uid() = user_id);

-- Admin users can view all pending investments
CREATE POLICY "Admins can view all pending investments" ON public.pending_investments
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (
      'raphandy007@gmail.com',
      'admin@investmentpro.com',
      'support@investmentpro.com'
    )
  );

-- Admin users can update pending investments (for approval/rejection)
CREATE POLICY "Admins can update pending investments" ON public.pending_investments
  FOR UPDATE USING (
    auth.jwt() ->> 'email' IN (
      'raphandy007@gmail.com',
      'admin@investmentpro.com',
      'support@investmentpro.com'
    )
  );

-- =============================================
-- TRANSACTIONS TABLE POLICIES
-- =============================================

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can insert transactions" ON public.transactions;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Admin users can view all transactions
CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (
      'raphandy007@gmail.com',
      'admin@investmentpro.com',
      'support@investmentpro.com'
    )
  );

-- Admin users can insert transactions
CREATE POLICY "Admins can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'raphandy007@gmail.com',
      'admin@investmentpro.com',
      'support@investmentpro.com'
    )
  );

-- =============================================
-- USER BALANCES TABLE POLICIES
-- =============================================

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view own balance" ON public.user_balances;
DROP POLICY IF EXISTS "Admins can view all balances" ON public.user_balances;
DROP POLICY IF EXISTS "System can insert user balances" ON public.user_balances;

-- Users can view their own balance
CREATE POLICY "Users can view own balance" ON public.user_balances
  FOR SELECT USING (auth.uid() = user_id);

-- Admin users can view all balances
CREATE POLICY "Admins can view all balances" ON public.user_balances
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (
      'raphandy007@gmail.com',
      'admin@investmentpro.com',
      'support@investmentpro.com'
    )
  );

-- System can insert new user balances
CREATE POLICY "System can insert user balances" ON public.user_balances
  FOR INSERT WITH CHECK (true);

-- =============================================
-- WITHDRAWAL REQUESTS TABLE POLICIES
-- =============================================

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can insert own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can view own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins can view all withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update withdrawal requests" ON public.withdrawal_requests;

-- Users can insert their own withdrawal requests
CREATE POLICY "Users can insert own withdrawal requests" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own withdrawal requests
CREATE POLICY "Users can view own withdrawal requests" ON public.withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Admin users can view all withdrawal requests
CREATE POLICY "Admins can view all withdrawal requests" ON public.withdrawal_requests
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (
      'raphandy007@gmail.com',
      'admin@investmentpro.com',
      'support@investmentpro.com'
    )
  );

-- Admin users can update withdrawal requests
CREATE POLICY "Admins can update withdrawal requests" ON public.withdrawal_requests
  FOR UPDATE USING (
    auth.jwt() ->> 'email' IN (
      'raphandy007@gmail.com',
      'admin@investmentpro.com',
      'support@investmentpro.com'
    )
  );

-- =============================================
-- 5. CREATE PROFILES FOR EXISTING USERS
-- =============================================

-- Create profiles for any existing users who don't have them
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Create user_balances for any existing users who don't have them
INSERT INTO public.user_balances (user_id, total_balance, total_invested, total_withdrawn, expected_returns, available_balance, created_at, updated_at)
SELECT 
  p.id,
  0,
  0,
  0,
  0,
  0,
  NOW(),
  NOW()
FROM public.profiles p
LEFT JOIN public.user_balances ub ON p.id = ub.user_id
WHERE ub.user_id IS NULL;

-- =============================================
-- SETUP COMPLETE
-- =============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

SELECT 'Database setup completed successfully!' as message;