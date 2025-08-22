-- Final Balance Function Fix
-- This will make admin panel validation work correctly
-- Run this SQL in your Supabase SQL editor

-- =============================================
-- FIX get_user_balance FUNCTION
-- =============================================

-- Replace the function to use the corrected user_balances table
-- This keeps the same signature to avoid parameter conflicts
CREATE OR REPLACE FUNCTION public.get_user_balance(user_id uuid)
RETURNS numeric AS $$
BEGIN
  -- Simply return the value from user_balances table (which is now correct)
  -- Use table alias to avoid ambiguity with parameter name
  RETURN COALESCE(
    (SELECT ub.available_balance 
     FROM public.user_balances ub 
     WHERE ub.user_id = $1),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- VERIFICATION
-- =============================================

-- Test that both methods now return the same value
SELECT 
  'get_user_balance() function' as source,
  public.get_user_balance(
    (SELECT id FROM public.profiles WHERE email = 'raphandy007@gmail.com')
  ) as balance

UNION ALL

SELECT 
  'user_balances table' as source,
  ub.available_balance as balance
FROM public.user_balances ub
JOIN public.profiles p ON ub.user_id = p.id
WHERE p.email = 'raphandy007@gmail.com';

-- Show the values should both be $1000
SELECT 'Both values above should be 1000 (from the test completed investment)' as message;
SELECT 'Admin panel withdrawal validation should now work correctly!' as status;