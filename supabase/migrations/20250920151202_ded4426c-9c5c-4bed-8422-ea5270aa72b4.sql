-- Fix security warnings by properly updating the function with search_path
-- Drop the demo user function first (it's not used by triggers)
DROP FUNCTION IF EXISTS create_demo_user(TEXT, TEXT, TEXT);

-- Replace the update function properly
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

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

-- Recreate the triggers that were dropped
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_redeem_codes_updated_at BEFORE UPDATE ON public.redeem_codes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();