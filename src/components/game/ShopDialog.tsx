import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Gift, Coins } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShopDialog({ open, onOpenChange }: ShopDialogProps) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const shopItems = [
    { id: 'code1', name: 'Gaming Gift Card ₹100', cost: 1000, description: 'Steam/Google Play gift card' },
    { id: 'code2', name: 'Gaming Gift Card ₹200', cost: 2000, description: 'Steam/Google Play gift card' },
    { id: 'code3', name: 'Gaming Gift Card ₹500', cost: 5000, description: 'Steam/Google Play gift card' },
    { id: 'bonus1', name: 'Coin Multiplier 2x', cost: 1500, description: '2x coins for 24 hours' },
    { id: 'bonus2', name: 'Ad Skip Pass', cost: 800, description: 'Skip ad cooldowns 5 times' },
  ];

  const handlePurchase = async (item: any) => {
    if (!userProfile || userProfile.coins < item.cost) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${item.cost} coins to purchase this item.`,
        variant: "destructive"
      });
      return;
    }

    setPurchasing(item.id);
    
    try {
      // Deduct coins from user
      const { error } = await supabase
        .from('users')
        .update({ coins: userProfile.coins - item.cost })
        .eq('auth_user_id', userProfile.auth_user_id);

      if (error) throw error;

      // Add transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: userProfile.id,
          type: 'debit',
          amount: item.cost,
          source: 'shop',
          description: `Purchased: ${item.name}`
        });

      toast({
        title: "Purchase Successful!",
        description: `You have purchased ${item.name}`,
      });

      // Refresh user profile
      window.location.reload();
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            Shop - Redeem Your Coins
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-coin-gold" />
              <span className="text-lg font-semibold">Your Balance:</span>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {userProfile?.coins || 0} Coins
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shopItems.map((item) => (
              <Card key={item.id} className="card-gaming">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      {item.name}
                    </div>
                    <Badge variant="outline">{item.cost} Coins</Badge>
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="gaming"
                    onClick={() => handlePurchase(item)}
                    disabled={
                      !userProfile || 
                      userProfile.coins < item.cost || 
                      purchasing === item.id
                    }
                    className="w-full"
                  >
                    {purchasing === item.id ? 'Purchasing...' : 'Purchase'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}