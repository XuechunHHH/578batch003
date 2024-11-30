import React from 'react';
import { Frown, Meh, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NewsData } from '../services/api';

interface NewsGridProps {
  news: NewsData[];
}

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

export const NewsGrid: React.FC<NewsGridProps> = ({ news }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="wait">
        {news.map((article) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-cyber-darker rounded-lg p-6 border border-cyber-blue/20 hover:shadow-neon-blue transition-all duration-300"
          >
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
                {article.title}
              </h3>
              
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
      </AnimatePresence>
    </div>
  );
};