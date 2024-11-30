import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createChart, ColorType, UTCTimestamp } from 'lightweight-charts';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Activity, 
  ArrowLeft, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Twitter, 
  Facebook, 
  MessageCircle,
  FileText,
  Github,
  Book,
  Code,
  Link as LinkIcon,
  Info,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getCryptoHistory, getCryptoDetails, CryptoData } from '../services/api';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import { useLikes } from '../contexts/LikesContext';

interface ChartData {
  time: UTCTimestamp;
  value: number;
}

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-cyber-dark rounded-lg p-6 border border-cyber-blue/20">
    <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
    {children}
  </div>
);

const ExternalLink2 = ({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center space-x-2 text-cyber-blue hover:text-white transition-colors duration-200"
  >
    {icon}
    <span>{children}</span>
  </a>
);

export const CryptoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { likes, toggleLike } = useLikes();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [cryptoDetails, setCryptoDetails] = useState<CryptoData | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const isLiked = id ? likes.includes(id) : false;

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!id || user?.id === 'guest') return;
    await toggleLike(id);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const [historyData, details] = await Promise.all([
          getCryptoHistory(id),
          getCryptoDetails(id)
        ]);
        setChartData(historyData);
        setCryptoDetails(details);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!chartContainerRef.current || loading || error || chartData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0f' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const lineSeries = chart.addLineSeries({
      color: '#00fff5',
      lineWidth: 2,
    });

    lineSeries.setData(chartData);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartData, loading, error]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center space-x-2 text-cyber-blue"
        >
          <Activity className="w-6 h-6 animate-spin" />
          <span>Loading data...</span>
        </motion.div>
      </div>
    );
  }

  if (error || !cryptoDetails) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-cyber-dark rounded-lg p-6 border border-red-500/20 text-center">
          <p className="text-red-500">{error || 'Failed to load cryptocurrency details'}</p>
          <Link 
            to="/"
            className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-cyber-darker text-cyber-blue border border-cyber-blue/20 rounded-lg hover:shadow-neon-blue transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const isPositive = cryptoDetails.price_change_percentage_24h > 0;
  const description = cryptoDetails.description || 'No description available.';

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyber-dark border border-cyber-blue/20 hover:shadow-neon-blue transition-all duration-300 text-cyber-blue hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center space-x-4">
          {user?.id !== 'guest' && (
            <button
              onClick={handleLikeClick}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyber-dark border border-cyber-blue/20 hover:shadow-neon-blue transition-all duration-300"
            >
              <Star
                className={`w-5 h-5 ${
                  isLiked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                }`}
              />
              <span className={isLiked ? 'text-yellow-400' : 'text-gray-400'}>
                Add to Portfolio
              </span>
            </button>
          )}

          {cryptoDetails.links?.homepage[0] && (
            <a
              href={cryptoDetails.links.homepage[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyber-dark border border-cyber-blue/20 hover:shadow-neon-blue transition-all duration-300 text-cyber-blue hover:text-white"
            >
              <Globe className="w-4 h-4" />
              <span>Website</span>
            </a>
          )}
          
          <a
            href={`https://www.coingecko.com/en/coins/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyber-dark border border-cyber-pink/20 hover:shadow-neon-pink transition-all duration-300 text-cyber-pink hover:text-white"
          >
            <span>View on CoinGecko</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Rest of the component remains unchanged */}
      {/* Crypto Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-cyber-dark rounded-lg p-6 border border-cyber-blue/20">
          <div className="flex items-center space-x-4 mb-6">
            <img src={cryptoDetails.image} alt={cryptoDetails.name} className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                {cryptoDetails.name} ({cryptoDetails.symbol.toUpperCase()})
              </h1>
              <p className="text-gray-400">
                Rank #{cryptoDetails.market_cap_rank}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-3xl font-bold text-white mb-2">
                {formatCurrency(cryptoDetails.current_price)}
              </p>
              <div className="flex items-center space-x-2">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                  {formatPercentage(cryptoDetails.price_change_percentage_24h)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Market Cap</span>
                <span className="text-white">{formatCurrency(cryptoDetails.market_cap)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">24h Volume</span>
                <span className="text-white">{formatCurrency(cryptoDetails.total_volume)}</span>
              </div>
            </div>
          </div>
        </div>

        <InfoCard title="Supply Information">
          <div className="space-y-4">
            {cryptoDetails.max_supply && (
              <div className="flex justify-between">
                <span className="text-gray-400">Max Supply</span>
                <span className="text-white">{formatNumber(cryptoDetails.max_supply)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Circulating Supply</span>
              <span className="text-white">{formatNumber(cryptoDetails.circulating_supply)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Supply</span>
              <span className="text-white">{formatNumber(cryptoDetails.total_supply)}</span>
            </div>
          </div>
        </InfoCard>
      </div>

      {/* About Section */}
      <div className="bg-cyber-dark rounded-lg p-6 border border-cyber-blue/20 mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">About {cryptoDetails.name}</h2>
        <div className={`prose prose-invert max-w-none ${!showFullDescription && 'line-clamp-4'}`}
             dangerouslySetInnerHTML={{ __html: description }}
        />
        {description.length > 300 && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="mt-4 text-cyber-blue hover:text-white transition-colors duration-200"
          >
            {showFullDescription ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Price Chart */}
      <div className="bg-cyber-dark rounded-lg p-6 border border-cyber-blue/20 mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Price Chart (Last 30 days)</h2>
          <p className="text-gray-400">
            Last updated: {formatDistanceToNow(new Date(cryptoDetails.last_updated), { addSuffix: true })}
          </p>
        </div>
        <div ref={chartContainerRef} className="w-full" />
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Price Statistics">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">All Time High</span>
              <div className="text-right">
                <div className="text-white">{formatCurrency(cryptoDetails.ath)}</div>
                <div className={cryptoDetails.ath_change_percentage >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatPercentage(cryptoDetails.ath_change_percentage)}
                </div>
                <div className="text-sm text-gray-400">
                  {format(new Date(cryptoDetails.ath_date), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">All Time Low</span>
              <div className="text-right">
                <div className="text-white">{formatCurrency(cryptoDetails.atl)}</div>
                <div className={cryptoDetails.atl_change_percentage >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatPercentage(cryptoDetails.atl_change_percentage)}
                </div>
                <div className="text-sm text-gray-400">
                  {format(new Date(cryptoDetails.atl_date), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </div>
        </InfoCard>

        <InfoCard title="Links & Resources">
          <div className="grid grid-cols-2 gap-4">
            {cryptoDetails.links?.blockchain_site?.[0] && (
              <ExternalLink2
                href={cryptoDetails.links.blockchain_site[0]}
                icon={<Code className="w-5 h-5" />}
              >
                Explorer
              </ExternalLink2>
            )}
            
            {cryptoDetails.links?.twitter_screen_name && (
              <ExternalLink2
                href={`https://twitter.com/${cryptoDetails.links.twitter_screen_name}`}
                icon={<Twitter className="w-5 h-5" />}
              >
                Twitter
              </ExternalLink2>
            )}
            
            {cryptoDetails.links?.facebook_username && (
              <ExternalLink2
                href={`https://facebook.com/${cryptoDetails.links.facebook_username}`}
                icon={<Facebook className="w-5 h-5" />}
              >
                Facebook
              </ExternalLink2>
            )}
            
            {cryptoDetails.links?.telegram_channel_identifier && (
              <ExternalLink2
                href={`https://t.me/${cryptoDetails.links.telegram_channel_identifier}`}
                icon={<MessageCircle className="w-5 h-5" />}
              >
                Telegram
              </ExternalLink2>
            )}

            {cryptoDetails.links?.subreddit_url && (
              <ExternalLink2
                href={cryptoDetails.links.subreddit_url}
                icon={<MessageCircle className="w-5 h-5" />}
              >
                Reddit
              </ExternalLink2>
            )}

            {cryptoDetails.links?.announcement_url?.[0] && (
              <ExternalLink2
                href={cryptoDetails.links.announcement_url[0]}
                icon={<Info className="w-5 h-5" />}
              >
                Announcements
              </ExternalLink2>
            )}
          </div>
        </InfoCard>
      </div>
    </div>
  );
};