-- Enhanced Investment Maturity Processing with Email Notifications
-- This builds upon the basic system and adds email notification integration

-- =============================================
-- ENHANCED MAIN PROCESSING FUNCTION WITH EMAIL NOTIFICATIONS
-- =============================================

CREATE OR REPLACE FUNCTION public.process_matured_investments_with_emails()
RETURNS TABLE(
  processed_count integer,
  total_amount_processed numeric,
  success_count integer,
  error_count integer,
  processing_summary text,
  matured_investments_json text
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
  matured_investments_array text[] := '{}';
  investment_json text;
BEGIN
  RAISE NOTICE 'Starting investment maturity processing with email notifications at %', NOW();

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

      -- Prepare investment data for email (as JSON string for Next.js API call)
      investment_json := json_build_object(
        'id', matured_investment.id,
        'user_id', matured_investment.user_id,
        'user_email', matured_investment.user_email,
        'user_name', matured_investment.user_name,
        'investment_name', matured_investment.investment_name,
        'amount_invested', matured_investment.amount_invested,
        'expected_return_amount', matured_investment.expected_return_amount,
        'total_return', total_return,
        'maturity_date', matured_investment.maturity_date::text
      )::text;

      -- Add to array for batch email processing
      matured_investments_array := array_append(matured_investments_array, investment_json);

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

  -- Return summary including JSON data for email processing
  RETURN QUERY SELECT 
    processed as processed_count,
    total_amount as total_amount_processed,
    successful as success_count,
    errors as error_count,
    format('Processed %s investments. Success: %s, Errors: %s, Total: $%s. %s', 
      processed, successful, errors, total_amount::text, 
      CASE WHEN errors > 0 THEN 'Errors: ' || error_details ELSE 'All successful.' END
    ) as processing_summary,
    array_to_string(matured_investments_array, '|||') as matured_investments_json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- WRAPPER FUNCTION FOR EXISTING CRON JOB
-- =============================================

-- This function maintains backward compatibility with your existing cron job
-- while adding the new email functionality
CREATE OR REPLACE FUNCTION public.process_matured_investments()
RETURNS TABLE(
  processed_count integer,
  total_amount_processed numeric,
  success_count integer,
  error_count integer,
  processing_summary text
) AS $$
DECLARE
  result_record RECORD;
  matured_investments_data text;
  api_url text;
  api_payload text;
BEGIN
  -- Call the enhanced function
  SELECT * INTO result_record 
  FROM public.process_matured_investments_with_emails()
  LIMIT 1;

  -- Extract the matured investments data
  matured_investments_data := result_record.matured_investments_json;

  -- If there are matured investments, trigger email notifications
  IF result_record.success_count > 0 AND matured_investments_data IS NOT NULL AND matured_investments_data != '' THEN
    BEGIN
      -- Log that we're about to send email notifications
      RAISE NOTICE 'Triggering email notifications for % matured investments', result_record.success_count;
      
      -- Note: In a real implementation, you would make an HTTP request to your Next.js API
      -- For now, we'll just log that emails should be sent
      RAISE NOTICE 'Email payload ready: %', matured_investments_data;
      
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to trigger email notifications: %', SQLERRM;
    END;
  END IF;

  -- Return the basic summary (maintaining backward compatibility)
  RETURN QUERY SELECT 
    result_record.processed_count,
    result_record.total_amount_processed,
    result_record.success_count,
    result_record.error_count,
    result_record.processing_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- UTILITY FUNCTION FOR MANUAL EMAIL TESTING
-- =============================================

-- Function to get matured investment data in email-ready format
CREATE OR REPLACE FUNCTION public.get_recent_matured_investments(days_back integer DEFAULT 1)
RETURNS TABLE(
  investment_data_json text
) AS $$
DECLARE
  matured_investment RECORD;
  investment_json text;
  investments_array text[] := '{}';
BEGIN
  -- Get recently matured investments
  FOR matured_investment IN
    SELECT 
      i.id,
      i.user_id,
      i.investment_name,
      i.amount_invested,
      i.expected_return_amount,
      (i.amount_invested + i.expected_return_amount) as total_return,
      i.maturity_date,
      p.email as user_email,
      p.full_name as user_name
    FROM public.investments i
    JOIN public.profiles p ON i.user_id = p.id
    WHERE i.status = 'completed'
    AND i.updated_at >= CURRENT_DATE - INTERVAL '%s days' % days_back
    ORDER BY i.updated_at DESC
  LOOP
    investment_json := json_build_object(
      'id', matured_investment.id,
      'user_id', matured_investment.user_id,
      'user_email', matured_investment.user_email,
      'user_name', matured_investment.user_name,
      'investment_name', matured_investment.investment_name,
      'amount_invested', matured_investment.amount_invested,
      'expected_return_amount', matured_investment.expected_return_amount,
      'total_return', matured_investment.total_return,
      'maturity_date', matured_investment.maturity_date::text
    )::text;
    
    investments_array := array_append(investments_array, investment_json);
  END LOOP;

  RETURN QUERY SELECT array_to_string(investments_array, '|||') as investment_data_json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.process_matured_investments_with_emails() TO postgres;
GRANT EXECUTE ON FUNCTION public.get_recent_matured_investments(integer) TO postgres, authenticated;

SELECT 'Enhanced investment maturity processing with email support created successfully!' as message;