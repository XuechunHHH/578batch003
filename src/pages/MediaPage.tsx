import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { getNewsData, NewsData } from '../services/api';
import { NewsGrid } from '../components/NewsGrid';

export const MediaPage = () => {
  const [news, setNews] = useState<NewsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [source, setSource] = useState('hackernews');
  const [type, setType] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchNews = async (pageNum: number) => {
    try {
      setLoading(true);
      const data = await getNewsData(pageNum, source, type);
      setNews(data);
      setHasMore(data.length === 9); // 9 is our page size
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchNews(page);
    return () => controller.abort();
  }, [page, source, type]);

  const handleSourceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSource(event.target.value);
    setPage(1);
    setHasMore(true);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value);
    setPage(1);
    setHasMore(true);
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
    setHasMore(true);
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full">
      {/* Controls Container */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <select
              value={source}
              onChange={handleSourceChange}
              className="w-full bg-cyber-darker text-white border border-cyber-blue/20 rounded-lg px-4 py-2 focus:outline-none focus:border-cyber-blue"
            >
              <option value="hackernews">Hacker News</option>
              <option value="devto">Dev.to</option>
              <option value="latimes">LA Times</option>
              <option value="reddit">Reddit</option>
            </select>
          </div>

          <div className="flex-1">
            <select
              value={type || ''}
              onChange={handleTypeChange}
              className="w-full bg-cyber-darker text-white border border-cyber-blue/20 rounded-lg px-4 py-2 focus:outline-none focus:border-cyber-blue"
            >
              <option value="">All Cryptocurrencies</option>
              <option value="bitcoin">Bitcoin</option>
              <option value="ethereum">Ethereum</option>
              <option value="dogecoin">Dogecoin</option>
              <option value="bnb">Binance Coin</option>
              <option value="xrp">Ripple</option>
              <option value="usdc">USD Coin</option>
              <option value="avalanche">Avalanche</option>
              <option value="tether">Tether</option>
              <option value="solana">Solana</option>
              <option value="cardano">Cardano</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1 || loading}
            className="px-6 py-2 bg-cyber-darker text-cyber-blue border border-cyber-blue/20 rounded-lg hover:shadow-neon-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={loading || !hasMore}
            className="px-6 py-2 bg-cyber-darker text-cyber-blue border border-cyber-blue/20 rounded-lg hover:shadow-neon-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[400px]">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-cyber-darker/50 backdrop-blur-sm z-10 rounded-lg"
          >
            <div className="flex items-center space-x-2 text-cyber-blue">
              <Activity className="w-6 h-6 animate-spin" />
              <span>Loading news...</span>
            </div>
          </motion.div>
        )}

        {error ? (
          <div className="bg-cyber-dark rounded-lg p-6 border border-red-500/20">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        ) : news.length === 0 || !hasMore ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No news articles found.</p>
          </div>
        ) : (
          <NewsGrid news={news} />
        )}
      </div>
    </div>
  );
};