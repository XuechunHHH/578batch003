import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { getNewsData, NewsData } from '../services/api';

export const MediaPage = () => {
  const [news, setNews] = useState<NewsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [source, setSource] = useState('latimes');
  const [type, setType] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await getNewsData(page, source, type);
      setNews(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchNews();
  }, [page, source, type]);

  const handleSourceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSource(event.target.value);
    setPage(1);
  };
  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value);
    setPage(1);
  }

  const handlePreviousPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => prev + 1);

  const getSentimentColor = (sentiment: number): string => {
    if (sentiment < 4) return 'text-red-500'; // Negative
    if (sentiment < 7) return 'text-yellow-500'; // Neutral
    return 'text-green-500'; // Positive
  }


  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center space-x-2 text-cyber-blue"
        >
          <Activity className="w-6 h-6 animate-spin" />
          <span>Loading news...</span>
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          {/* Source Selection */}
          <select
            value={source}
            onChange={handleSourceChange}
            className="bg-cyber-dark border border-cyber-blue/20 rounded-lg p-2 text-gray-400"
          >
            <option value="latimes">LA Times</option>
            <option value="hackernews">Hacker News</option>
          </select>

          {/* Type Selection */}
          <select
            value={type || ''}
            onChange={handleTypeChange}
            className="bg-cyber-dark border border-cyber-blue/20 rounded-lg p-2 text-gray-400"
          >
            <option value="">All Types</option>
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
        <div className="flex space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className="bg-cyber-dark text-cyber-blue border border-cyber-blue/20 rounded-lg px-4 py-2"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            className="bg-cyber-dark text-cyber-blue border border-cyber-blue/20 rounded-lg px-4 py-2"
          >
            Next
          </button>
        </div>
      </div>

      {/* Conditional rendering for news or state messages */}
      {loading ? (
        <div className="flex items-center justify-center space-x-2 text-cyber-blue">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center space-x-2 text-cyber-blue"
          >
            <Activity className="w-6 h-6 animate-spin" />
            <span>Loading news...</span>
          </motion.div>
        </div>
      ) : error ? (
        <div className="bg-cyber-dark rounded-lg p-6 border border-red-500/20">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      ) : news.length === 0 ? (
        <div className="bg-cyber-dark rounded-lg p-6 border border-cyber-blue/20 text-center">
          <p className="text-gray-400">No news articles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {news.map((article) => (
            <div
              key={article.id}
              className="bg-cyber-dark rounded-lg p-4 border border-cyber-blue/20"
            >
              <h3 className="text-cyber-blue text-lg font-semibold">{article.title}</h3>
              <p className={`text-sm font-semibold}`}>
                Crypto: {article.type}
              </p>
              <p className="text-gray-400 text-sm">{new Date(article.time).toLocaleDateString()}</p>
              <p className={`text-sm font-semibold ${getSentimentColor(Number(article.ai_sentiment))}`}>
                Sentiment: {article.ai_sentiment}
              </p>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyber-blue underline mt-2 block"
              >
                Read More
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
