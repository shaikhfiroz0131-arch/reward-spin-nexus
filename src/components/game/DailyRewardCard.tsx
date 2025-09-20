import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, Clock } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export function DailyRewardCard() {
  const { userProfile } = useAuth();
  const [claiming, setClaiming] = useState(false);
  
  // Calculate if daily reward is available
  const lastReward = userProfile?.last_daily_reward;
  const now = new Date();
  const lastRewardDate = lastReward ? new Date(lastReward) : null;
  
  const canClaim = !lastRewardDate || 
    (now.getTime() - lastRewardDate.getTime()) >= 24 * 60 * 60 * 1000;

  const streak = userProfile?.daily_streak || 0;
  const nextReward = Math.min(50 + (streak * 10), 200); // Caps at 200 coins

  const handleClaim = async () => {
    setClaiming(true);
    // TODO: Call backend to claim daily reward
    setTimeout(() => setClaiming(false), 1000);
  };

  const getTimeUntilNext = () => {
    if (!lastRewardDate) return null;
    const nextAvailable = new Date(lastRewardDate.getTime() + 24 * 60 * 60 * 1000);
    const diff = nextAvailable.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const timeUntilNext = getTimeUntilNext();

  return (
    <Card className="card-gaming">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-accent" />
            Daily Reward
          </div>
          <Badge variant="outline" className="gap-1">
            <Star className="w-3 h-3" />
            {streak} days
          </Badge>
        </CardTitle>
        <CardDescription>
          Claim your daily reward to maintain your streak!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold coin-glow mb-2">
            +{nextReward} Coins
          </div>
          <div className="text-sm text-muted-foreground">
            Streak Bonus: +{streak * 10} coins
          </div>
        </div>

        {canClaim ? (
          <Button
            variant="gaming"
            onClick={handleClaim}
            disabled={claiming}
            className="w-full text-lg py-6"
          >
            {claiming ? 'Claiming...' : 'Claim Daily Reward'}
          </Button>
        ) : (
          <div className="text-center space-y-2">
            <div className="text-muted-foreground flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Next reward in: {timeUntilNext}
            </div>
            <Button variant="outline" disabled className="w-full">
              Already Claimed Today
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}