import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLikes } from '../contexts/LikesContext';
import { getCryptoData, CryptoData } from '../services/api';
import PriceCard from '../components/PriceCard';

export const LikesPage = () => {
  const { likes } = useLikes();
  const [likedCryptos, setLikedCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikedCryptos = async () => {
      try {
        setLoading(true);
        const allCryptos = await getCryptoData();
        const filtered = allCryptos.filter(crypto => likes.includes(crypto.id));
        setLikedCryptos(filtered);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch liked cryptocurrencies');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedCryptos();
  }, [likes]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center space-x-2 text-cyber-blue"
        >
          <Activity className="w-6 h-6 animate-spin" />
          <span>Loading liked cryptocurrencies...</span>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cyber-dark rounded-lg p-6 border border-red-500/20">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (likedCryptos.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cyber-dark rounded-lg p-6 border border-cyber-blue/20 text-center">
          <p className="text-gray-400">No liked cryptocurrencies yet.</p>
          <p className="text-cyber-blue mt-2">Click the star icon on any cryptocurrency to add it to your likes!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {likedCryptos.map((crypto) => (
          <PriceCard key={crypto.id} crypto={crypto} />
        ))}
      </div>
    </div>
  );
};