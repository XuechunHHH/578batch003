import React, { memo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CryptoData } from '../services/api';

interface PriceCardProps {
  crypto: CryptoData;
}

const formatVolume = (volume: number): string => {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(1)}B`;
  }
  if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(1)}M`;
  }
  return volume.toLocaleString();
};

const PriceCard = memo(({ crypto }: PriceCardProps) => {
  const navigate = useNavigate();
  const isPositive = crypto.price_change_percentage_24h > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/crypto/${crypto.id}`)}
      className="bg-cyber-dark rounded-lg p-6 border border-cyber-blue/20 hover:shadow-neon-blue transition-all duration-300 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-cyber font-bold text-white">{crypto.name}</h3>
            <span className="text-sm text-gray-400">{crypto.symbol.toUpperCase()}/USD</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <span className="text-3xl font-bold text-white">
            ${crypto.current_price.toLocaleString()}
          </span>
          <div className="flex items-center space-x-2 mt-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
              {isPositive ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Market Cap</span>
            <span className="text-white">${formatVolume(crypto.market_cap)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">24h Volume</span>
            <span className="text-white">${formatVolume(crypto.total_volume)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

PriceCard.displayName = 'PriceCard';

export default PriceCard;