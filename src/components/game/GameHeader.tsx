import { LogOut, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { CoinDisplay } from './CoinDisplay';

export function GameHeader() {
  const { userProfile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-neon">RN GAMING</div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-6">
            {/* Coins Display */}
            <CoinDisplay coins={userProfile?.coins || 0} />
            
            {/* Daily Streak */}
            <div className="flex items-center gap-2 text-accent">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">{userProfile?.daily_streak || 0} days</span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="font-medium">{userProfile?.username}</span>
              </div>
              
              <Button 
                variant="gaming-outline" 
                size="sm"
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}