import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { GlobalData } from '../services/api';

interface StatsCardProps {
  globalData: GlobalData;
}

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400">{label}</span>
    <span className="text-white font-semibold">{value}</span>
  </div>
);

const StatsCard = memo(({ globalData }: StatsCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-cyber-dark rounded-lg p-6 border border-cyber-pink/20 hover:shadow-neon-pink transition-all duration-300"
  >
    <h3 className="text-xl font-cyber font-bold text-white mb-4">Market Stats</h3>
    <div className="space-y-4">
      <StatItem 
        label="Global Market Cap" 
        value={`$${(globalData.total_market_cap.usd / 1e12).toFixed(2)}T`} 
      />
      <StatItem 
        label="24h Volume" 
        value={`$${(globalData.total_volume.usd / 1e9).toFixed(2)}B`} 
      />
      <StatItem 
        label="BTC Dominance" 
        value={`${globalData.market_cap_percentage.btc.toFixed(1)}%`} 
      />
    </div>
  </motion.div>
));

StatsCard.displayName = 'StatsCard';

export default StatsCard;