import { Coins } from 'lucide-react';

interface CoinDisplayProps {
  coins: number;
  className?: string;
}

export function CoinDisplay({ coins, className = "" }: CoinDisplayProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Coins className="w-6 h-6 text-coin-gold animate-bounce-gentle" />
      <span className="text-2xl font-bold coin-glow">
        {coins.toLocaleString()}
      </span>
    </div>
  );
}