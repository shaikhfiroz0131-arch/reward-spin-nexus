import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Gift, ArrowDown, Clock } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RedeemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RedeemDialog({ open, onOpenChange }: RedeemDialogProps) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [selectedRedeem, setSelectedRedeem] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemCodes, setRedeemCodes] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchRedeemCodes();
    }
  }, [open]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && currentStep > 0 && currentStep < 3) {
      // Auto advance to next step when countdown finishes
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        if (currentStep < 2) {
          setCountdown(10); // Reset countdown for next step
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown, currentStep]);

  const fetchRedeemCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('redeem_codes')
        .select('*')
        .order('coin_cost', { ascending: true });

      if (error) throw error;
      setRedeemCodes(data || []);
    } catch (error) {
      console.error('Error fetching redeem codes:', error);
    }
  };

  const handleStartRedeem = async (index: number) => {
    const selectedCode = redeemCodes[index];
    
    if (!userProfile || userProfile.coins < selectedCode.coin_cost) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${selectedCode.coin_cost} coins to redeem this code.`,
        variant: "destructive"
      });
      return;
    }

    setSelectedRedeem(index);
    setCurrentStep(1);
    setCountdown(10);

    // Deduct coins immediately
    try {
      const { error } = await supabase
        .from('users')
        .update({ coins: userProfile.coins - selectedCode.coin_cost })
        .eq('auth_user_id', userProfile.auth_user_id);

      if (error) throw error;

      // Add transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: userProfile.id,
          type: 'debit',
          amount: selectedCode.coin_cost,
          source: 'redeem',
          description: `Redeemed: ${selectedCode.code_name}`
        });
    } catch (error) {
      console.error('Error processing redeem:', error);
      toast({
        title: "Error",
        description: "Failed to process redeem request.",
        variant: "destructive"
      });
      setSelectedRedeem(null);
      setCurrentStep(0);
      setCountdown(0);
    }
  };

  const handleComplete = () => {
    if (selectedRedeem !== null) {
      setRedeemCode(redeemCodes[selectedRedeem].code_value);
      setCurrentStep(4);
    }
  };

  const resetRedeem = () => {
    setSelectedRedeem(null);
    setCurrentStep(0);
    setCountdown(0);
    setRedeemCode('');
  };

  if (selectedRedeem !== null) {
    return (
      <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) resetRedeem(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-6 h-6" />
              Redeem Process
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Progress value={(currentStep / 4) * 100} className="h-2" />

            {currentStep < 4 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    Step {currentStep} of 3
                  </CardTitle>
                  <CardDescription className="text-center">
                    {countdown > 0 ? (
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        Wait {countdown} seconds...
                      </div>
                    ) : (
                      "Ready for next step"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="text-6xl animate-bounce">
                    <ArrowDown className="w-16 h-16 mx-auto text-primary" />
                  </div>
                  <p className="text-lg font-semibold">Scroll down and wait</p>
                  <p className="text-sm text-muted-foreground">
                    Ad is loading... Please wait for the timer to complete
                  </p>
                  
                  {countdown === 0 && currentStep === 3 && (
                    <Button onClick={handleComplete} variant="gaming" className="w-full">
                      Claim Your Code!
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="card-gaming">
                <CardHeader>
                  <CardTitle className="text-center text-green-500">
                    🎉 Redeem Code Ready!
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="p-4 bg-card rounded-lg border-2 border-primary">
                    <p className="text-lg font-bold font-mono">{redeemCode}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Copy this code and use it on the gaming platform
                  </p>
                  <Button 
                    onClick={() => navigator.clipboard.writeText(redeemCode)}
                    variant="gaming"
                    className="w-full"
                  >
                    Copy Code
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6" />
            Redeem Codes
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {redeemCodes.map((code, index) => (
            <Card key={code.id} className="card-gaming">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Redeem {index + 1}</span>
                  <span className="text-sm text-accent">{code.coin_cost} Coins</span>
                </CardTitle>
                <CardDescription>{code.code_name}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="gaming-accent"
                  onClick={() => handleStartRedeem(index)}
                  disabled={!userProfile || userProfile.coins < code.coin_cost}
                  className="w-full"
                >
                  Start Redeem Process
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}