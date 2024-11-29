import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMentionsData, CryptoData, getCryptoData } from '../services/api';

const COLORS = {
  HackerNews: '#FF6600',
  'Dev.to': '#3B49DF',
  LaTimes: '#FDB927',
  Reddit: '#9370DB'
};

export const Analytics = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [mentionsData, setMentionsData] = useState<any>(null);
  const [cryptoList, setCryptoList] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptoList = async () => {
      try {
        setLoading(true);
        const data = await getCryptoData();
        setCryptoList(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch crypto list');
      }
    };
    fetchCryptoList();
  }, []);

  useEffect(() => {
    const fetchMentionsData = async () => {
      if (cryptoList.length === 0) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getMentionsData(selectedCrypto);

        const chartData = data.dates.map((date, index) => ({
          date,
          ...data.datasets.reduce((acc, dataset) => ({
            ...acc,
            [dataset.name]: dataset.data[index]
          }), {})
        }));

        setMentionsData(chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mentions data');
      } finally {
        setLoading(false);
      }
    };

    fetchMentionsData();
  }, [selectedCrypto, cryptoList]);

  if (loading) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center space-x-2 text-cyber-blue"
          >
            <Activity className="w-6 h-6 animate-spin" />
            <span>Loading analytics data...</span>
          </motion.div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-cyber-dark rounded-lg p-6 border border-red-500/20">
            <p className="text-red-500 text-center">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 mx-auto block px-4 py-2 bg-cyber-darker text-cyber-blue border border-cyber-blue/20 rounded-lg hover:shadow-neon-blue transition-all duration-300"
            >
              Retry
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cyber-dark rounded-lg p-4 sm:p-6 border border-cyber-blue/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Mentions Analysis (Last 12 Months)</h2>
            <select
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="w-full sm:w-auto bg-cyber-darker text-white border border-cyber-blue/20 rounded-lg px-4 py-2 focus:outline-none focus:border-cyber-blue"
            >
              {cryptoList.map((crypto) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name}
                  </option>
              ))}
            </select>
          </div>

          <div className="h-[400px] sm:h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mentionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                    dataKey="date"
                    stroke="#d1d5db"
                    tick={{ fill: '#d1d5db' }}
                    tickLine={{ stroke: '#d1d5db' }}
                    interval={window.innerWidth < 768 ? 2 : 1}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={window.innerWidth < 768 ? 10 : 12}
                />
                <YAxis
                    stroke="#d1d5db"
                    tick={{ fill: '#d1d5db' }}
                    tickLine={{ stroke: '#d1d5db' }}
                    fontSize={window.innerWidth < 768 ? 10 : 12}
                    label={{
                      value: 'Mentions Count',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#d1d5db' }
                    }}
                />
                <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0a0f',
                      border: '1px solid rgba(0, 255, 245, 0.2)',
                      borderRadius: '8px'
                    }}
                />
                <Legend />
                {Object.entries(COLORS).map(([name, color]) => (
                    <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
  );
};