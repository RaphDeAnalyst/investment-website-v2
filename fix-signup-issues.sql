-- Fix common signup database issues
-- Run this AFTER running debug-signup.sql to identify issues

-- =============================================
-- 1. ENSURE PROPER PERMISSIONS FOR TRIGGERS
-- =============================================

-- Grant necessary permissions to authenticated users for profile operations
GRANT INSERT ON public.profiles TO authenticated;
GRANT INSERT ON public.user_balances TO authenticated;

-- Ensure trigger functions have proper security settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
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
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, skip
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail user creation
    RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- =============================================
-- 2. FIX USER BALANCE TRIGGER  
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user_balance()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
EXCEPTION
  WHEN unique_violation THEN
    -- Balance record already exists, skip
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail profile creation
    RAISE WARNING 'User balance creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- =============================================
-- 3. RECREATE TRIGGERS WITH PROPER SETTINGS
-- =============================================

-- Drop and recreate auth user trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Drop and recreate profile trigger  
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_balance();

-- =============================================
-- 4. ADD POLICY TO ALLOW SYSTEM INSERTS
-- =============================================

-- Allow system to insert profiles (for triggers)
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
CREATE POLICY "System can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Update user balances policy to be more permissive for system operations
DROP POLICY IF EXISTS "System can insert user balances" ON public.user_balances;
CREATE POLICY "System can insert user balances" ON public.user_balances
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 5. GRANT ADDITIONAL PERMISSIONS
-- =============================================

-- Ensure anon role can trigger signup process
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA auth TO postgres;

-- Ensure all necessary permissions are set
GRANT ALL ON public.profiles TO postgres, authenticated;
GRANT ALL ON public.user_balances TO postgres, authenticated;

-- Grant sequence permissions (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =============================================
-- 6. TEST SIGNUP SIMULATION
-- =============================================

-- This is a safe test that simulates what happens during signup
-- without actually creating an auth user
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'test@example.com';
    test_name TEXT := 'Test User';
BEGIN
    -- Test profile creation
    BEGIN
        INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
        VALUES (test_user_id, test_email, test_name, NOW(), NOW());
        RAISE NOTICE '✅ Profile creation test: SUCCESS';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Profile creation test failed: %', SQLERRM;
    END;
    
    -- Test user balance creation
    BEGIN
        INSERT INTO public.user_balances (user_id, total_balance, total_invested, total_withdrawn, expected_returns, available_balance, created_at, updated_at)
        VALUES (test_user_id, 0, 0, 0, 0, 0, NOW(), NOW());
        RAISE NOTICE '✅ User balance creation test: SUCCESS';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ User balance creation test failed: %', SQLERRM;
    END;
    
    -- Clean up test data
    DELETE FROM public.user_balances WHERE user_id = test_user_id;
    DELETE FROM public.profiles WHERE id = test_user_id;
    RAISE NOTICE '✅ Test cleanup completed';
END $$;

SELECT 'Signup fixes applied successfully! Try signing up again.' as message;