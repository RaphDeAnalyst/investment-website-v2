-- Drop existing functions to fix return type conflicts
-- Run this FIRST, then run the investment-maturity-system.sql

-- Drop the main function that's causing the conflict
DROP FUNCTION IF EXISTS public.process_matured_investments();

-- Drop all related functions to ensure clean setup
DROP FUNCTION IF EXISTS public.calculate_investment_returns(uuid);
DROP FUNCTION IF EXISTS public.create_maturity_transaction(uuid, uuid, numeric, text);
DROP FUNCTION IF EXISTS public.update_user_balance_on_maturity(uuid, numeric);
DROP FUNCTION IF EXISTS public.get_investments_maturing_soon(integer);
DROP FUNCTION IF EXISTS public.process_specific_investment(uuid);

SELECT 'All existing maturity processing functions dropped successfully!' as message;