import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Gift, History, Zap } from 'lucide-react';

interface ActionButtonsProps {
  onShopClick: () => void;
  onRedeemClick: () => void;
  onHistoryClick: () => void;
  onSpinClick: () => void;
}

export function ActionButtons({ 
  onShopClick, 
  onRedeemClick, 
  onHistoryClick,
  onSpinClick 
}: ActionButtonsProps) {
  return (
    <Card className="card-gaming">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="gaming"
            onClick={onShopClick}
            className="h-20 flex-col gap-2"
          >
            <ShoppingBag className="w-6 h-6" />
            Shop
          </Button>
          
          <Button
            variant="gaming-accent"
            onClick={onRedeemClick}
            className="h-20 flex-col gap-2"
          >
            <Gift className="w-6 h-6" />
            Redeem Code
          </Button>
          
          <Button
            variant="gaming-secondary"
            onClick={onSpinClick}
            className="h-20 flex-col gap-2"
          >
            <Zap className="w-6 h-6" />
            Spin Wheel
          </Button>
          
          <Button
            variant="gaming-outline"
            onClick={onHistoryClick}
            className="h-20 flex-col gap-2"
          >
            <History className="w-6 h-6" />
            History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}