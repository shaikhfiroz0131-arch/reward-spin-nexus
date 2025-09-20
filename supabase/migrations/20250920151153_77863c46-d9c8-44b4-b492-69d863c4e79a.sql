-- Fix security warnings by setting search_path on functions
DROP FUNCTION IF EXISTS create_demo_user(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recreate the update function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Recreate demo user function with proper search_path
CREATE OR REPLACE FUNCTION public.create_demo_user(
  p_username TEXT,
  p_email TEXT,
  p_password TEXT
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Insert into our users table
  INSERT INTO public.users (username, coins, daily_streak)
  VALUES (p_username, 1000, 5)
  RETURNING id INTO user_id;
  
  RETURN user_id;
END;
$$;