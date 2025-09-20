import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tv, Clock } from 'lucide-react';

interface AdButtonState {
  available: boolean;
  cooldownEnd?: number;
}

export function AdSection() {
  const [adButtons, setAdButtons] = useState<Record<string, AdButtonState>>({
    ad1: { available: true },
    ad2: { available: true },
    ad3: { available: true },
    ad4: { available: true },
    ad5: { available: true },
  });

  const [cooldownTimers, setCooldownTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    // Update cooldown timers every second
    const interval = setInterval(() => {
      const now = Date.now();
      setCooldownTimers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key] > 0) {
            updated[key] = Math.max(0, updated[key] - 1);
            if (updated[key] === 0) {
              setAdButtons(prevButtons => ({
                ...prevButtons,
                [key]: { available: true }
              }));
            }
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleWatchAd = (adType: string) => {
    // Simulate ad watching
    const cooldownTime = 5 * 60; // 5 minutes in seconds
    
    setAdButtons(prev => ({
      ...prev,
      [adType]: { available: false }
    }));
    
    setCooldownTimers(prev => ({
      ...prev,
      [adType]: cooldownTime
    }));

    // TODO: Call backend to award coins and set cooldown
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="card-gaming">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tv className="w-6 h-6 text-secondary" />
          Watch Ads
        </CardTitle>
        <CardDescription>
          Watch ads to earn coins. Each ad has a 5-minute cooldown.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(adButtons).map(([adType, state], index) => (
            <div key={adType} className="flex flex-col">
              <Button
                variant={state.available ? "gaming-secondary" : "outline"}
                disabled={!state.available}
                onClick={() => handleWatchAd(adType)}
                className="h-20 flex-col gap-2"
              >
                <Tv className="w-5 h-5" />
                <span>Ad {index + 1}</span>
                <span className="text-xs">+25 Coins</span>
              </Button>
              
              {cooldownTimers[adType] > 0 && (
                <Badge variant="outline" className="mt-2 justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(cooldownTimers[adType])}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}