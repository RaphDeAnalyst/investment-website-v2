-- Debug script for signup issues
-- Run this in Supabase SQL Editor to check database setup

-- 1. Check if trigger functions exist
SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname IN ('handle_new_user', 'handle_new_user_balance');

-- 2. Check if triggers exist
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name,
    t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname IN ('on_auth_user_created', 'on_profile_created');

-- 3. Check profiles table structure and constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Check for existing profiles that might conflict
SELECT 
    id, 
    email, 
    full_name, 
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check user_balances table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_balances'
ORDER BY ordinal_position;

-- 6. Check RLS policies on profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 7. Test the trigger function manually (safe test)
-- This will show if the function works without actually creating a user
DO $$
BEGIN
    -- Test if we can access the function
    RAISE NOTICE 'Testing handle_new_user function exists: %', 
        (SELECT COUNT(*) FROM pg_proc WHERE proname = 'handle_new_user');
    
    -- Test if we can access the trigger
    RAISE NOTICE 'Testing on_auth_user_created trigger exists: %',
        (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'on_auth_user_created');
END $$;