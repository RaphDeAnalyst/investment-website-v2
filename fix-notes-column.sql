-- Fix Notes Column Reference in Withdrawal Functions
-- Run this SQL in your Supabase SQL editor

-- =============================================
-- FIX approve_withdrawal FUNCTION
-- =============================================

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

  -- Update withdrawal request (use admin_notes instead of notes)
  UPDATE public.withdrawal_requests
  SET 
    status = 'approved',
    approved_by = admin_user_id,
    approved_at = NOW(),
    admin_notes = COALESCE(approve_withdrawal.notes, 'Approved by admin')
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

-- =============================================
-- FIX reject_withdrawal FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.reject_withdrawal(
  withdrawal_id uuid,
  admin_user_id uuid,
  notes text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Update withdrawal request (use admin_notes instead of notes)
  UPDATE public.withdrawal_requests
  SET 
    status = 'rejected',
    approved_by = admin_user_id,
    approved_at = NOW(),
    admin_notes = COALESCE(reject_withdrawal.notes, 'Rejected by admin')
  WHERE id = withdrawal_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal request not found or already processed';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- VERIFICATION
-- =============================================

SELECT 'Withdrawal functions fixed! admin_notes column will now be used correctly.' as message;
SELECT 'Try approving or rejecting a withdrawal request now.' as status;