-- Create users table for extended user information
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  coins INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  last_daily_reward TIMESTAMP WITH TIME ZONE,
  last_spin_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table for tracking coin movements
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'earn' or 'spend'
  source TEXT NOT NULL, -- 'video', 'ad1', 'ad2', 'ad3', 'ad4', 'ad5', 'daily_reward', 'spin', 'redeem', 'admin'
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create redeem_codes table
CREATE TABLE public.redeem_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_name TEXT NOT NULL, -- 'redeem1', 'redeem2', etc.
  code_value TEXT NOT NULL,
  coin_cost INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad_cooldowns table to track ad button cooldowns
CREATE TABLE public.ad_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ad_type TEXT NOT NULL, -- 'ad1', 'ad2', 'ad3', 'ad4', 'ad5'
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ad_type)
);

-- Create spin_wheel_segments table
CREATE TABLE public.spin_wheel_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_name TEXT NOT NULL,
  coins INTEGER NOT NULL,
  weight INTEGER DEFAULT 1, -- for probability weighting
  is_fake BOOLEAN DEFAULT FALSE -- for the fake RS.100 segment
);

-- Insert default spin wheel segments
INSERT INTO public.spin_wheel_segments (segment_name, coins, weight, is_fake) VALUES
('10 Coins', 10, 30, false),
('25 Coins', 25, 20, false),
('50 Coins', 50, 15, false),
('75 Coins', 75, 10, false),
('100 Coins', 100, 8, false),
('RS.100', 0, 1, true); -- This will never actually be awarded

-- Insert default redeem codes
INSERT INTO public.redeem_codes (code_name, code_value, coin_cost) VALUES
('redeem1', 'GAME2024-001', 100),
('redeem2', 'GAME2024-002', 200),
('redeem3', 'GAME2024-003', 300),
('redeem4', 'GAME2024-004', 400),
('redeem5', 'GAME2024-005', 500);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redeem_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_cooldowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_wheel_segments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users 
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON public.users 
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- RLS Policies for transactions table
CREATE POLICY "Users can view own transactions" ON public.transactions 
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "System can insert transactions" ON public.transactions 
  FOR INSERT WITH CHECK (true); -- Will be controlled by edge functions

-- RLS Policies for redeem_codes table (read-only for users)
CREATE POLICY "Users can view redeem codes" ON public.redeem_codes 
  FOR SELECT USING (true);

-- RLS Policies for ad_cooldowns table
CREATE POLICY "Users can view own cooldowns" ON public.ad_cooldowns 
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "System can manage cooldowns" ON public.ad_cooldowns 
  FOR ALL USING (true); -- Will be controlled by edge functions

-- RLS Policies for spin_wheel_segments table (read-only)
CREATE POLICY "Everyone can view spin segments" ON public.spin_wheel_segments 
  FOR SELECT USING (true);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_redeem_codes_updated_at BEFORE UPDATE ON public.redeem_codes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();