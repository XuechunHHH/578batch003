import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createChart, ColorType, UTCTimestamp } from 'lightweight-charts';
import { format } from 'date-fns';
import { Activity, ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCryptoHistory } from '../services/api';

interface ChartData {
  time: UTCTimestamp;
  value: number;
}

export const CryptoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getCryptoHistory(id);
        setChartData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
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
          <span>Loading chart data...</span>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-cyber-dark rounded-lg p-6 border border-red-500/20 text-center">
          <p className="text-red-500">{error}</p>
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

      <div className="bg-cyber-dark rounded-lg p-6 border border-cyber-blue/20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            Price Chart
          </h2>
          <p className="text-gray-400">
            Last updated: {format(new Date(), 'PPp')}
          </p>
        </div>
        
        <div ref={chartContainerRef} className="w-full" />
      </div>
    </div>
  );
};