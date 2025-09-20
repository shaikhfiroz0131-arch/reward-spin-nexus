import { useState } from 'react';
import { GameHeader } from '@/components/game/GameHeader';
import { YouTubeSection } from '@/components/game/YouTubeSection';
import { AdSection } from '@/components/game/AdSection';
import { ActionButtons } from '@/components/game/ActionButtons';
import { DailyRewardCard } from '@/components/game/DailyRewardCard';

export default function Dashboard() {
  const handleShopClick = () => {
    console.log('Shop clicked');
  };

  const handleRedeemClick = () => {
    console.log('Redeem clicked');
  };

  const handleHistoryClick = () => {
    console.log('History clicked');
  };

  const handleSpinClick = () => {
    console.log('Spin clicked');
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
    </div>
  );
}