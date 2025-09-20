import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SpinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SpinDialog({ open, onOpenChange }: SpinDialogProps) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [spinning, setSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    if (open && userProfile) {
      checkSpinAvailability();
    }
  }, [open, userProfile]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeUntilNextSpin > 0) {
      interval = setInterval(() => {
        setTimeUntilNextSpin(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setCanSpin(true);
          }
          return Math.max(0, newTime);
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeUntilNextSpin]);

  const checkSpinAvailability = () => {
    if (!userProfile?.last_spin_date) {
      setCanSpin(true);
      return;
    }

    const lastSpin = new Date(userProfile.last_spin_date);
    const now = new Date();
    const hoursSinceLastSpin = (now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastSpin >= 24) {
      setCanSpin(true);
    } else {
      setCanSpin(false);
      const timeLeft = 24 * 60 * 60 - (hoursSinceLastSpin * 60 * 60);
      setTimeUntilNextSpin(Math.floor(timeLeft));
    }
  };

  const handleSpin = async () => {
    if (!userProfile || !canSpin) return;

    setSpinning(true);
    setResult(null);

    try {
      // Simulate server-side spin result
      const possibleRewards = [10, 25, 50, 75, 100, 150, 200, 250];
      const randomReward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];

      // Update user coins and last spin date
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          coins: userProfile.coins + randomReward,
          last_spin_date: new Date().toISOString()
        })
        .eq('auth_user_id', userProfile.auth_user_id);

      if (userError) throw userError;

      // Add transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: userProfile.id,
          type: 'credit',
          amount: randomReward,
          source: 'spin',
          description: `Spin Wheel Reward: ${randomReward} coins`
        });

      // Simulate spinning animation
      setTimeout(() => {
        setResult(randomReward);
        setSpinning(false);
        setCanSpin(false);
        setTimeUntilNextSpin(24 * 60 * 60); // 24 hours
        
        toast({
          title: "Spin Complete!",
          description: `You won ${randomReward} coins! 🎉`,
        });
      }, 3000);

    } catch (error) {
      console.error('Spin error:', error);
      setSpinning(false);
      toast({
        title: "Spin Failed",
        description: "There was an error processing your spin.",
        variant: "destructive"
      });
    }
  };

  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Spin Wheel
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-6">
          {/* Wheel Visualization */}
          <div className="relative mx-auto w-48 h-48">
            <div className={`w-full h-full rounded-full border-8 border-primary bg-gradient-to-br from-primary to-secondary ${
              spinning ? 'animate-spin' : ''
            }`} style={{
              background: spinning 
                ? 'conic-gradient(from 0deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff, #5f27cd)'
                : 'conic-gradient(from 0deg, #ff6b6b 0deg 45deg, #4ecdc4 45deg 90deg, #45b7d1 90deg 135deg, #96ceb4 135deg 180deg, #feca57 180deg 225deg, #ff9ff3 225deg 270deg, #54a0ff 270deg 315deg, #5f27cd 315deg 360deg)'
            }}>
              <div className="absolute inset-4 rounded-full bg-background border-4 border-card flex items-center justify-center">
                {spinning ? (
                  <div className="text-lg font-bold animate-pulse">SPINNING...</div>
                ) : result ? (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-coin-gold">{result}</div>
                    <div className="text-sm">COINS!</div>
                  </div>
                ) : (
                  <div className="text-lg font-bold">SPIN</div>
                )}
              </div>
            </div>
            
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary"></div>
            </div>
          </div>

          {/* Segments Info */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <Badge variant="outline">10 coins</Badge>
            <Badge variant="outline">25 coins</Badge>
            <Badge variant="outline">50 coins</Badge>
            <Badge variant="outline">75 coins</Badge>
            <Badge variant="outline">100 coins</Badge>
            <Badge variant="outline">150 coins</Badge>
            <Badge variant="outline">200 coins</Badge>
            <Badge variant="outline" className="bg-red-500/20">₹100 (Display)</Badge>
          </div>

          {/* Action Button */}
          {canSpin ? (
            <Button
              variant="gaming"
              onClick={handleSpin}
              disabled={spinning}
              className="w-full text-lg py-6"
            >
              {spinning ? 'Spinning...' : 'SPIN NOW! (Free)'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button variant="outline" disabled className="w-full">
                Next Spin Available In:
              </Button>
              <Badge variant="outline" className="gap-2">
                <Clock className="w-4 h-4" />
                {formatTimeLeft(timeUntilNextSpin)}
              </Badge>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            * ₹100 segment is for display only and cannot be won
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}