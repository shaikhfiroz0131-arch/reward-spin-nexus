-- Create demo accounts for testing
-- Note: These will be created in auth.users and linked to our users table

-- First, let's create a function to create demo users
CREATE OR REPLACE FUNCTION create_demo_user(
  p_username TEXT,
  p_email TEXT,
  p_password TEXT
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- This is just to set up demo data
  -- In production, admin would use Supabase dashboard or admin panel
  
  -- Insert into our users table (we'll manually link to auth later)
  INSERT INTO public.users (username, coins, daily_streak)
  VALUES (p_username, 1000, 5)
  RETURNING id INTO user_id;
  
  RETURN user_id;
END;
$$;

-- Create demo users
SELECT create_demo_user('player1', 'player1@rngaming.local', 'demo123');
SELECT create_demo_user('player2', 'player2@rngaming.local', 'demo123');
SELECT create_demo_user('admin', 'admin@rngaming.local', 'admin123');

-- Let's also add some sample transaction history
INSERT INTO public.transactions (user_id, type, source, amount, description) 
SELECT 
  u.id,
  'earn',
  'daily_reward',
  50,
  'Daily login reward'
FROM public.users u 
WHERE u.username = 'player1';

INSERT INTO public.transactions (user_id, type, source, amount, description) 
SELECT 
  u.id,
  'earn',
  'video',
  100,
  'Watched featured video'
FROM public.users u 
WHERE u.username = 'player1';