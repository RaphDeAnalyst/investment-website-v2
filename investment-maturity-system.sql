-- Investment Maturity Processing System
-- This SQL file creates all functions needed for the cron job to work properly

-- =============================================
-- 1. HELPER FUNCTIONS
-- =============================================

-- Function to calculate total returns for a matured investment
CREATE OR REPLACE FUNCTION public.calculate_investment_returns(investment_id uuid)
RETURNS numeric AS $$
DECLARE
  investment_record RECORD;
  total_return numeric;
BEGIN
  -- Get investment details
  SELECT 
    amount_invested,
    expected_return_amount,
    investment_date,
    maturity_date,
    status
  INTO investment_record
  FROM public.investments
  WHERE id = investment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Investment with ID % not found', investment_id;
  END IF;

  IF investment_record.status != 'active' THEN
    RAISE EXCEPTION 'Investment % is not active (status: %)', investment_id, investment_record.status;
  END IF;

  -- Calculate total return (principal + expected returns)
  total_return := investment_record.amount_invested + investment_record.expected_return_amount;

  RETURN total_return;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create transaction record for matured investment
CREATE OR REPLACE FUNCTION public.create_maturity_transaction(
  p_user_id uuid,
  p_investment_id uuid,
  p_amount numeric,
  p_investment_name text
)
RETURNS uuid AS $$
DECLARE
  transaction_id uuid;
BEGIN
  -- Create transaction record
  INSERT INTO public.transactions (
    user_id,
    transaction_type,
    amount,
    description,
    investment_id,
    status,
    transaction_date,
    created_at
  )
  VALUES (
    p_user_id,
    'return',
    p_amount,
    'Investment matured: ' || p_investment_name,
    p_investment_id,
    'completed',
    NOW(),
    NOW()
  )
  RETURNING id INTO transaction_id;

  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user balance when investment matures
CREATE OR REPLACE FUNCTION public.update_user_balance_on_maturity(
  p_user_id uuid,
  p_return_amount numeric
)
RETURNS boolean AS $$
DECLARE
  current_balance RECORD;
BEGIN
  -- Get current balance
  SELECT * INTO current_balance
  FROM public.user_balances
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User balance record not found for user %', p_user_id;
  END IF;

  -- Update user balance
  UPDATE public.user_balances
  SET
    available_balance = available_balance + p_return_amount,
    total_balance = total_balance + p_return_amount,
    expected_returns = expected_returns - (p_return_amount - 
      (SELECT amount_invested FROM public.investments WHERE user_id = p_user_id AND status = 'active' LIMIT 1)
    ),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update balance for user %', p_user_id;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. MAIN MATURITY PROCESSING FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.process_matured_investments()
RETURNS TABLE(
  processed_count integer,
  total_amount_processed numeric,
  success_count integer,
  error_count integer,
  processing_summary text
) AS $$
DECLARE
  matured_investment RECORD;
  total_return numeric;
  transaction_id uuid;
  processed integer := 0;
  successful integer := 0;
  errors integer := 0;
  total_amount numeric := 0;
  error_details text := '';
BEGIN
  RAISE NOTICE 'Starting investment maturity processing at %', NOW();

  -- Find all matured investments that are still active
  FOR matured_investment IN
    SELECT 
      i.id,
      i.user_id,
      i.investment_name,
      i.amount_invested,
      i.expected_return_amount,
      i.maturity_date,
      p.email as user_email,
      p.full_name as user_name
    FROM public.investments i
    JOIN public.profiles p ON i.user_id = p.id
    WHERE i.status = 'active'
    AND i.maturity_date <= CURRENT_DATE
    ORDER BY i.maturity_date ASC
  LOOP
    processed := processed + 1;
    
    BEGIN
      RAISE NOTICE 'Processing matured investment: % for user %', 
        matured_investment.investment_name, matured_investment.user_email;

      -- Calculate total return
      total_return := calculate_investment_returns(matured_investment.id);
      
      -- Update investment status to completed
      UPDATE public.investments
      SET 
        status = 'completed',
        updated_at = NOW()
      WHERE id = matured_investment.id;

      -- Update user balance
      PERFORM update_user_balance_on_maturity(
        matured_investment.user_id, 
        total_return
      );

      -- Create transaction record
      transaction_id := create_maturity_transaction(
        matured_investment.user_id,
        matured_investment.id,
        total_return,
        matured_investment.investment_name
      );

      -- Log successful processing
      RAISE NOTICE 'Successfully processed investment % - Amount: $%, Transaction: %',
        matured_investment.investment_name, total_return, transaction_id;

      successful := successful + 1;
      total_amount := total_amount + total_return;

    EXCEPTION
      WHEN OTHERS THEN
        errors := errors + 1;
        error_details := error_details || 
          format('Error processing investment %s for user %s: %s; ', 
            matured_investment.investment_name, 
            matured_investment.user_email, 
            SQLERRM);
        
        RAISE WARNING 'Failed to process investment % for user %: %',
          matured_investment.investment_name, 
          matured_investment.user_email, 
          SQLERRM;
    END;
  END LOOP;

  -- Log final summary
  RAISE NOTICE 'Investment maturity processing completed. Processed: %, Successful: %, Errors: %, Total Amount: $%',
    processed, successful, errors, total_amount;

  -- Return summary
  RETURN QUERY SELECT 
    processed as processed_count,
    total_amount as total_amount_processed,
    successful as success_count,
    errors as error_count,
    format('Processed %s investments. Success: %s, Errors: %s, Total: $%s. %s', 
      processed, successful, errors, total_amount::text, 
      CASE WHEN errors > 0 THEN 'Errors: ' || error_details ELSE 'All successful.' END
    ) as processing_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. ADDITIONAL UTILITY FUNCTIONS
-- =============================================

-- Function to get investments that will mature soon (for notifications)
CREATE OR REPLACE FUNCTION public.get_investments_maturing_soon(days_ahead integer DEFAULT 7)
RETURNS TABLE(
  investment_id uuid,
  user_id uuid,
  user_email text,
  user_name text,
  investment_name text,
  amount_invested numeric,
  expected_return_amount numeric,
  maturity_date date,
  days_until_maturity integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id as investment_id,
    i.user_id,
    p.email as user_email,
    p.full_name as user_name,
    i.investment_name,
    i.amount_invested,
    i.expected_return_amount,
    i.maturity_date,
    (i.maturity_date - CURRENT_DATE)::integer as days_until_maturity
  FROM public.investments i
  JOIN public.profiles p ON i.user_id = p.id
  WHERE i.status = 'active'
  AND i.maturity_date > CURRENT_DATE
  AND i.maturity_date <= CURRENT_DATE + INTERVAL '%s days' % days_ahead
  ORDER BY i.maturity_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually process a specific investment (admin tool)
CREATE OR REPLACE FUNCTION public.process_specific_investment(investment_id uuid)
RETURNS text AS $$
DECLARE
  investment_record RECORD;
  total_return numeric;
  transaction_id uuid;
BEGIN
  -- Get investment details
  SELECT 
    i.id,
    i.user_id,
    i.investment_name,
    i.amount_invested,
    i.expected_return_amount,
    i.status,
    p.email as user_email
  INTO investment_record
  FROM public.investments i
  JOIN public.profiles p ON i.user_id = p.id
  WHERE i.id = investment_id;

  IF NOT FOUND THEN
    RETURN format('Investment with ID %s not found', investment_id);
  END IF;

  IF investment_record.status != 'active' THEN
    RETURN format('Investment %s is not active (status: %s)', 
      investment_record.investment_name, investment_record.status);
  END IF;

  -- Process the investment
  total_return := calculate_investment_returns(investment_id);
  
  -- Update investment status
  UPDATE public.investments
  SET 
    status = 'completed',
    updated_at = NOW()
  WHERE id = investment_id;

  -- Update user balance
  PERFORM update_user_balance_on_maturity(
    investment_record.user_id, 
    total_return
  );

  -- Create transaction record
  transaction_id := create_maturity_transaction(
    investment_record.user_id,
    investment_id,
    total_return,
    investment_record.investment_name
  );

  RETURN format('Successfully processed investment %s for user %s. Amount: $%s, Transaction: %s',
    investment_record.investment_name,
    investment_record.user_email,
    total_return,
    transaction_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. GRANT PERMISSIONS
-- =============================================

-- Grant permissions to execute these functions
GRANT EXECUTE ON FUNCTION public.process_matured_investments() TO postgres;
GRANT EXECUTE ON FUNCTION public.calculate_investment_returns(uuid) TO postgres;
GRANT EXECUTE ON FUNCTION public.create_maturity_transaction(uuid, uuid, numeric, text) TO postgres;
GRANT EXECUTE ON FUNCTION public.update_user_balance_on_maturity(uuid, numeric) TO postgres;
GRANT EXECUTE ON FUNCTION public.get_investments_maturing_soon(integer) TO postgres;
GRANT EXECUTE ON FUNCTION public.process_specific_investment(uuid) TO postgres;

-- Grant to authenticated users for admin functions
GRANT EXECUTE ON FUNCTION public.get_investments_maturing_soon(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_specific_investment(uuid) TO authenticated;

SELECT 'Investment maturity processing system created successfully!' as message;