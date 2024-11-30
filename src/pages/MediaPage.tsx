import React, { useEffect, useState } from 'react';
import { Activity, Frown, Meh, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import { getNewsData, NewsData } from '../services/api';

export const MediaPage = () => {
  const [news, setNews] = useState<NewsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [source, setSource] = useState('hackernews');
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
  };

  const handlePreviousPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => prev + 1);

  const getSentimentColor = (sentiment: number): string => {
    if (sentiment < 4) return 'text-red-500';
    if (sentiment < 7) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment < 4) return <Frown className="w-5 h-5 text-red-500" />;
    if (sentiment < 7) return <Meh className="w-5 h-5 text-yellow-500" />;
    return <Smile className="w-5 h-5 text-green-500" />;
  };

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
      <div className="bg-cyber-dark rounded-lg p-6 border border-cyber-blue/20 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <select
              value={source}
              onChange={handleSourceChange}
              className="bg-cyber-darker text-white border border-cyber-blue/20 rounded-lg px-4 py-2 focus:outline-none focus:border-cyber-blue w-full sm:w-auto"
            >
              <option value="hackernews">Hacker News</option>
              <option value="devto">Dev.to</option>
              <option value="latimes">LA Times</option>
            </select>

            <select
              value={type || ''}
              onChange={handleTypeChange}
              className="bg-cyber-darker text-white border border-cyber-blue/20 rounded-lg px-4 py-2 focus:outline-none focus:border-cyber-blue w-full sm:w-auto"
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

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="flex-1 sm:flex-none bg-cyber-darker text-cyber-blue border border-cyber-blue/20 rounded-lg px-6 py-2 hover:shadow-neon-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              className="flex-1 sm:flex-none bg-cyber-darker text-cyber-blue border border-cyber-blue/20 rounded-lg px-6 py-2 hover:shadow-neon-blue transition-all duration-300"
            >
              Next
            </button>
          </div>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No news articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-cyber-darker rounded-lg p-6 border border-cyber-blue/20 hover:shadow-neon-blue transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-white mb-3">{article.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-cyber-blue font-medium">
                      {article.type.charAt(0).toUpperCase() + article.type.slice(1)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400 text-sm">
                      {new Date(article.time).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {getSentimentIcon(Number(article.ai_sentiment))}
                    <span className={`font-medium ${getSentimentColor(Number(article.ai_sentiment))}`}>
                      Sentiment: {article.ai_sentiment}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-cyber-blue hover:text-white transition-colors duration-200"
                    >
                      Read More
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};