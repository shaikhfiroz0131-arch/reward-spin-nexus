import { useState } from 'react';
import { GameHeader } from '@/components/game/GameHeader';
import { YouTubeSection } from '@/components/game/YouTubeSection';
import { AdSection } from '@/components/game/AdSection';
import { ActionButtons } from '@/components/game/ActionButtons';
import { DailyRewardCard } from '@/components/game/DailyRewardCard';
import { ShopDialog } from '@/components/game/ShopDialog';
import { HistoryDialog } from '@/components/game/HistoryDialog';
import { RedeemDialog } from '@/components/game/RedeemDialog';
import { SpinDialog } from '@/components/game/SpinDialog';

export default function Dashboard() {
  const [shopOpen, setShopOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [spinOpen, setSpinOpen] = useState(false);

  const handleShopClick = () => {
    setShopOpen(true);
  };

  const handleRedeemClick = () => {
    setRedeemOpen(true);
  };

  const handleHistoryClick = () => {
    setHistoryOpen(true);
  };

  const handleSpinClick = () => {
    setSpinOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <GameHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <YouTubeSection />
            <AdSection />
            <ActionButtons
              onShopClick={handleShopClick}
              onRedeemClick={handleRedeemClick}
              onHistoryClick={handleHistoryClick}
              onSpinClick={handleSpinClick}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <DailyRewardCard />
            
            {/* Placeholder for future components */}
            <div className="card-gaming p-6 text-center text-muted-foreground">
              More features coming soon...
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <ShopDialog open={shopOpen} onOpenChange={setShopOpen} />
      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
      <RedeemDialog open={redeemOpen} onOpenChange={setRedeemOpen} />
      <SpinDialog open={spinOpen} onOpenChange={setSpinOpen} />
    </div>
  );
}