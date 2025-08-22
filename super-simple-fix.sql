-- Super Simple Fix - No Function Conflicts
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
-- 2. TRIGGER BALANCE RECALCULATION
-- =============================================

-- Update user balances to reflect the new completed investment
SELECT public.update_user_balances(
  (SELECT id FROM public.profiles WHERE email = 'raphandy007@gmail.com')
);

-- =============================================
-- 3. VERIFICATION
-- =============================================

-- Show current balance after the test investment
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
  amount_invested + expected_return_amount as total_value,
  status,
  maturity_date
FROM public.investments
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'raphandy007@gmail.com')
  AND investment_name = 'Test Completed Investment';

SELECT 'Test investment created! Check your available_balance above.' as message;
SELECT 'If available_balance shows $1000, the balance calculation is working!' as status;