-- Balance Update Triggers for Investment Platform
-- Run this SQL in your Supabase SQL editor to fix user_balances not updating

-- =============================================
-- 1. BALANCE UPDATE FUNCTION
-- =============================================

-- Function to recalculate and update all balance fields for a specific user
CREATE OR REPLACE FUNCTION public.update_user_balances(target_user_id uuid)
RETURNS void AS $$
DECLARE
  active_investments numeric := 0;
  completed_investments numeric := 0;
  calculated_total_invested numeric := 0;
  calculated_total_withdrawn numeric := 0;
  calculated_expected_returns numeric := 0;
  calculated_available_balance numeric := 0;
  completed_returns numeric := 0;
  completed_principal_and_returns numeric := 0;
BEGIN
  -- Calculate active investments (money currently locked)
  SELECT COALESCE(SUM(amount_invested), 0)
  INTO active_investments
  FROM public.investments
  WHERE user_id = target_user_id AND status = 'active';

  -- Calculate completed investments (principal that was returned)
  SELECT COALESCE(SUM(amount_invested), 0)
  INTO completed_investments
  FROM public.investments
  WHERE user_id = target_user_id AND status = 'completed';

  -- Calculate total invested (active + completed)
  calculated_total_invested := active_investments + completed_investments;

  -- Calculate total withdrawn (from approved withdrawals)
  SELECT COALESCE(SUM(amount), 0)
  INTO calculated_total_withdrawn
  FROM public.withdrawal_requests
  WHERE user_id = target_user_id AND status = 'approved';

  -- Calculate expected returns (from active investments only)
  SELECT COALESCE(SUM(expected_return_amount), 0)
  INTO calculated_expected_returns
  FROM public.investments
  WHERE user_id = target_user_id AND status = 'active';

  -- Calculate completed returns (profit from completed investments)
  SELECT COALESCE(SUM(expected_return_amount), 0)
  INTO completed_returns
  FROM public.investments
  WHERE user_id = target_user_id AND status = 'completed';

  -- Calculate total money returned from completed investments (principal + profit)
  completed_principal_and_returns := completed_investments + completed_returns;

  -- Calculate available balance (total returned from completed investments minus withdrawals)
  calculated_available_balance := completed_principal_and_returns - calculated_total_withdrawn;

  -- Ensure available balance is not negative
  IF calculated_available_balance < 0 THEN
    calculated_available_balance := 0;
  END IF;

  -- Update the user_balances table
  UPDATE public.user_balances
  SET 
    total_invested = calculated_total_invested,
    total_withdrawn = calculated_total_withdrawn,
    expected_returns = calculated_expected_returns,
    available_balance = calculated_available_balance,
    total_balance = active_investments + calculated_available_balance,
    updated_at = NOW()
  WHERE user_id = target_user_id;

  -- If no record exists, create one
  IF NOT FOUND THEN
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
      target_user_id,
      calculated_total_invested + calculated_available_balance,
      calculated_total_invested,
      calculated_total_withdrawn,
      calculated_expected_returns,
      calculated_available_balance,
      NOW(),
      NOW()
    );
  END IF;

  RAISE NOTICE 'Updated balances for user %: invested=%, withdrawn=%, available=%', 
    target_user_id, calculated_total_invested, calculated_total_withdrawn, calculated_available_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. INVESTMENT APPROVAL TRIGGER
-- =============================================

-- Function to handle investment insertions (when admin approves)
CREATE OR REPLACE FUNCTION public.handle_investment_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update balances when investment is inserted
  IF TG_OP = 'INSERT' THEN
    PERFORM public.update_user_balances(NEW.user_id);
    RETURN NEW;
  END IF;

  -- Update balances when investment status changes
  IF TG_OP = 'UPDATE' THEN
    -- Only update if status changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM public.update_user_balances(NEW.user_id);
    END IF;
    RETURN NEW;
  END IF;

  -- Update balances when investment is deleted
  IF TG_OP = 'DELETE' THEN
    PERFORM public.update_user_balances(OLD.user_id);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on investments table
DROP TRIGGER IF EXISTS on_investment_change ON public.investments;
CREATE TRIGGER on_investment_change
  AFTER INSERT OR UPDATE OR DELETE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.handle_investment_change();

-- =============================================
-- 3. WITHDRAWAL APPROVAL TRIGGER
-- =============================================

-- Function to handle withdrawal status changes
CREATE OR REPLACE FUNCTION public.handle_withdrawal_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update balances when withdrawal is inserted
  IF TG_OP = 'INSERT' THEN
    PERFORM public.update_user_balances(NEW.user_id);
    RETURN NEW;
  END IF;

  -- Update balances when withdrawal status changes
  IF TG_OP = 'UPDATE' THEN
    -- Only update if status changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM public.update_user_balances(NEW.user_id);
    END IF;
    RETURN NEW;
  END IF;

  -- Update balances when withdrawal is deleted
  IF TG_OP = 'DELETE' THEN
    PERFORM public.update_user_balances(OLD.user_id);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on withdrawal_requests table
DROP TRIGGER IF EXISTS on_withdrawal_change ON public.withdrawal_requests;
CREATE TRIGGER on_withdrawal_change
  AFTER INSERT OR UPDATE OR DELETE ON public.withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_withdrawal_change();

-- =============================================
-- 4. TRANSACTION TRIGGER (for additional balance tracking)
-- =============================================

-- Function to handle transaction insertions
CREATE OR REPLACE FUNCTION public.handle_transaction_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update balances when transaction is inserted
  IF TG_OP = 'INSERT' THEN
    PERFORM public.update_user_balances(NEW.user_id);
    RETURN NEW;
  END IF;

  -- Update balances when transaction is updated
  IF TG_OP = 'UPDATE' THEN
    PERFORM public.update_user_balances(NEW.user_id);
    RETURN NEW;
  END IF;

  -- Update balances when transaction is deleted
  IF TG_OP = 'DELETE' THEN
    PERFORM public.update_user_balances(OLD.user_id);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on transactions table
DROP TRIGGER IF EXISTS on_transaction_change ON public.transactions;
CREATE TRIGGER on_transaction_change
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_change();

-- =============================================
-- 5. RECALCULATE ALL EXISTING USER BALANCES
-- =============================================

-- Update balances for all existing users
DO $$
DECLARE
  user_record RECORD;
  user_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting balance recalculation for all users...';
  
  -- Loop through all users who have profiles
  FOR user_record IN 
    SELECT DISTINCT id FROM public.profiles
  LOOP
    -- Update balances for each user
    PERFORM public.update_user_balances(user_record.id);
    user_count := user_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Balance recalculation completed for % users', user_count;
END $$;

-- =============================================
-- 6. UTILITY FUNCTIONS
-- =============================================

-- Function to manually recalculate balances for all users (can be called anytime)
CREATE OR REPLACE FUNCTION public.recalculate_all_balances()
RETURNS TABLE(user_id uuid, total_invested numeric, available_balance numeric) AS $$
DECLARE
  user_record RECORD;
  result_record RECORD;
BEGIN
  -- Loop through all users and recalculate their balances
  FOR user_record IN 
    SELECT DISTINCT id FROM public.profiles
  LOOP
    PERFORM public.update_user_balances(user_record.id);
    
    -- Get the updated balance for this user
    SELECT ub.user_id, ub.total_invested, ub.available_balance
    INTO result_record
    FROM public.user_balances ub
    WHERE ub.user_id = user_record.id;
    
    -- Return the result
    user_id := result_record.user_id;
    total_invested := result_record.total_invested;
    available_balance := result_record.available_balance;
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing function if it exists (due to changed return type)
DROP FUNCTION IF EXISTS public.get_user_balance_breakdown(uuid);

-- Function to get detailed balance breakdown for a user
CREATE OR REPLACE FUNCTION public.get_user_balance_breakdown(target_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  active_investments numeric,
  completed_investments numeric,
  total_invested numeric,
  pending_returns numeric,
  completed_returns numeric,
  completed_principal_and_returns numeric,
  total_withdrawn numeric,
  available_balance numeric
) AS $$
DECLARE
  active_inv numeric := 0;
  completed_inv numeric := 0;
  completed_ret numeric := 0;
BEGIN
  -- Get the values we need for calculation
  SELECT COALESCE(SUM(amount_invested), 0) INTO active_inv 
  FROM public.investments WHERE user_id = target_user_id AND status = 'active';
  
  SELECT COALESCE(SUM(amount_invested), 0) INTO completed_inv 
  FROM public.investments WHERE user_id = target_user_id AND status = 'completed';
  
  SELECT COALESCE(SUM(expected_return_amount), 0) INTO completed_ret 
  FROM public.investments WHERE user_id = target_user_id AND status = 'completed';

  RETURN QUERY
  SELECT 
    target_user_id as user_id,
    active_inv as active_investments,
    completed_inv as completed_investments,
    (active_inv + completed_inv) as total_invested,
    COALESCE((SELECT SUM(expected_return_amount) FROM public.investments WHERE user_id = target_user_id AND status = 'active'), 0) as pending_returns,
    completed_ret as completed_returns,
    (completed_inv + completed_ret) as completed_principal_and_returns,
    COALESCE((SELECT SUM(amount) FROM public.withdrawal_requests WHERE user_id = target_user_id AND status = 'approved'), 0) as total_withdrawn,
    COALESCE((SELECT available_balance FROM public.user_balances WHERE user_id = target_user_id), 0) as available_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SETUP COMPLETE
-- =============================================

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_user_balances(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_all_balances() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_balance_breakdown(uuid) TO authenticated;

SELECT 'Balance update triggers setup completed successfully!' as message;
SELECT 'All existing user balances have been recalculated.' as status;

-- Show summary of all user balances
SELECT 
  p.email,
  ub.total_invested,
  ub.available_balance,
  ub.expected_returns,
  ub.total_withdrawn
FROM public.user_balances ub
JOIN public.profiles p ON ub.user_id = p.id
ORDER BY p.email;