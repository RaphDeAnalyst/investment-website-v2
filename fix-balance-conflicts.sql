-- Fix Balance Function Conflicts and Create Test Data
-- Run this SQL in your Supabase SQL editor

-- =============================================
-- 1. CREATE TEST COMPLETED INVESTMENT DATA
-- =============================================

-- First, let's create a completed investment for testing
INSERT INTO public.investments (
  user_id,
  investment_name,
  investment_type,
  amount_invested,
  current_value,
  expected_return_rate,
  expected_return_amount,
  investment_date,
  maturity_date,
  status,
  risk_level,
  description
) VALUES (
  -- Get user ID by email
  (SELECT id FROM public.profiles WHERE email = 'raphandy007@gmail.com'),
  'Test Completed Investment',
  'plan',
  800.00,   -- Principal invested
  1000.00,  -- Final value (principal + returns)
  25.0,     -- 25% return rate
  200.00,   -- Profit (expected return amount)
  NOW() - INTERVAL '30 days',  -- Investment was made 30 days ago
  NOW() - INTERVAL '1 day',    -- Matured yesterday
  'completed',  -- Status: completed (available for withdrawal)
  'medium',
  'Test investment for withdrawal testing - Principal: $800, Profit: $200, Total: $1000'
);

-- =============================================
-- 2. UPDATE get_user_balance FUNCTION TO MATCH NEW LOGIC
-- =============================================

-- Drop existing function first (due to parameter name change)
DROP FUNCTION IF EXISTS public.get_user_balance(uuid);

-- Fix the original get_user_balance function to use the same logic as update_user_balances
CREATE OR REPLACE FUNCTION public.get_user_balance(target_user_id uuid)
RETURNS numeric AS $$
DECLARE
  completed_investments numeric := 0;
  completed_returns numeric := 0;
  total_withdrawn numeric := 0;
  available_balance numeric := 0;
BEGIN
  -- Get principal from completed investments
  SELECT COALESCE(SUM(amount_invested), 0)
  INTO completed_investments
  FROM public.investments
  WHERE user_id = target_user_id AND status = 'completed';

  -- Get profit from completed investments  
  SELECT COALESCE(SUM(expected_return_amount), 0)
  INTO completed_returns
  FROM public.investments
  WHERE user_id = target_user_id AND status = 'completed';

  -- Get total withdrawn amount
  SELECT COALESCE(SUM(amount), 0)
  INTO total_withdrawn
  FROM public.withdrawal_requests
  WHERE user_id = target_user_id AND status = 'approved';

  -- Calculate available balance: (principal + profit) - withdrawn
  available_balance := (completed_investments + completed_returns) - total_withdrawn;

  -- Ensure balance is not negative
  IF available_balance < 0 THEN
    available_balance := 0;
  END IF;

  RETURN available_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. TRIGGER BALANCE RECALCULATION
-- =============================================

-- Update user balances to reflect the new completed investment
SELECT public.update_user_balances(
  (SELECT id FROM public.profiles WHERE email = 'raphandy007@gmail.com')
);

-- =============================================
-- 4. VERIFICATION QUERIES
-- =============================================

-- Test both functions return the same value
SELECT 
  'get_user_balance' as function_name,
  public.get_user_balance(
    (SELECT id FROM public.profiles WHERE email = 'raphandy007@gmail.com')
  ) as balance

UNION ALL

SELECT 
  'user_balances.available_balance' as function_name,
  ub.available_balance as balance
FROM public.user_balances ub
JOIN public.profiles p ON ub.user_id = p.id
WHERE p.email = 'raphandy007@gmail.com';

-- Show detailed breakdown for verification
SELECT * FROM public.get_user_balance_breakdown(
  (SELECT id FROM public.profiles WHERE email = 'raphandy007@gmail.com')
);

-- Show current user balance record
SELECT 
  p.email,
  ub.total_invested,
  ub.available_balance,
  ub.expected_returns,
  ub.total_withdrawn,
  ub.total_balance
FROM public.user_balances ub
JOIN public.profiles p ON ub.user_id = p.id
WHERE p.email = 'raphandy007@gmail.com';

-- Show the test investment we created
SELECT 
  investment_name,
  amount_invested,
  expected_return_amount,
  status,
  investment_date,
  maturity_date,
  description
FROM public.investments
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'raphandy007@gmail.com')
ORDER BY created_at DESC
LIMIT 1;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT 'Balance function conflicts fixed! You should now have $1000 available balance from the test completed investment.' as message;
SELECT 'Both get_user_balance() and user_balances.available_balance should now return the same value.' as status;