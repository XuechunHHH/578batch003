import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLaTimesData, NewsData } from '../services/api';

export const MediaPage = () => {
  const [news, setNews] = useState<NewsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [source, setSource] = useState('LaTimes'); // Placeholder for future source selection

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await getLaTimesData(page);
        setNews(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [page]);

  const handleSourceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSource(event.target.value);
    setPage(1);
  };

  const handlePreviousPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => prev + 1);

  const getSentimentColor = (sentiment: number): string => {
    if (sentiment < 4) return 'text-red-500'; // Negative
    if (sentiment < 7) return 'text-yellow-500'; // Neutral
    return 'text-green-500'; // Positive
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

  if (news.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cyber-dark rounded-lg p-6 border border-cyber-blue/20 text-center">
          <p className="text-gray-400">No news articles found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-4">
        <select
          value={source}
          onChange={handleSourceChange}
          className="bg-cyber-dark border border-cyber-blue/20 rounded-lg p-2 text-gray-400"
        >
          <option value="LaTimes">LA Times</option>
          {/* TODO: Add more sources here in the future */}
        </select>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {news.map((article) => (
          <div
            key={article.id}
            className="bg-cyber-dark rounded-lg p-4 border border-cyber-blue/20"
          >
            <h3 className="text-cyber-blue text-lg font-semibold">{article.title}</h3>
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
    </div>
  );
};
