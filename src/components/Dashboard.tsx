import React, { useEffect, useState, useCallback } from 'react';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMarketNavigation } from '../contexts/MarketNavigationContext';
import { getCryptoData, getGlobalData, CryptoData, GlobalData } from '../services/api';
import PriceCard from './PriceCard';
import StatsCard from './StatsCard';

export const Dashboard = () => {
  const { setLastVisitedPath } = useMarketNavigation();
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setLastVisitedPath('/');
  }, [setLastVisitedPath]);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [cryptoResponse, globalResponse] = await Promise.all([
        getCryptoData(),
        getGlobalData()
      ]);
      setCryptoData(cryptoResponse);
      setGlobalData(globalResponse);
      setRetryCount(0); // Reset retry count on successful fetch
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchData();
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center space-x-2 text-cyber-blue"
        >
          <Activity className="w-6 h-6 animate-spin" />
          <span>Loading market data...</span>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cyber-dark rounded-lg p-6 border border-red-500/20">
          <p className="text-red-500 text-center mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setRetryCount(0);
              fetchData();
            }}
            className="mx-auto block px-4 py-2 bg-cyber-darker text-cyber-blue border border-cyber-blue/20 rounded-lg hover:shadow-neon-blue transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cryptoData.map((crypto) => (
          <PriceCard key={crypto.id} crypto={crypto} />
        ))}
        {globalData && <StatsCard globalData={globalData} />}
      </div>
    </div>
  );
};