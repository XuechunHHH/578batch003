import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api-dot-ass2-test-2024.wl.r.appspot.com/api'
  : 'http://localhost:5001/api';

const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;

// Configure axios defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add retry interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    config.retryCount = config.retryCount || 0;

    if (config.retryCount >= MAX_RETRIES) {
      const serializedError = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      return Promise.reject(serializedError);
    }

    config.retryCount += 1;
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return api(config);
  }
);

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
}

export interface GlobalData {
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_percentage: { btc: number };
}

export interface MentionsData {
  dates: string[];
  datasets: {
    name: string;
    data: number[];
  }[];
}

export const getCryptoData = async (): Promise<CryptoData[]> => {
  try {
    const response = await api.get('/crypto');
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid data format received from server');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error fetching crypto data:', error.message);
    throw new Error(error.data?.message || 'Failed to fetch cryptocurrency data. Please try again later.');
  }
};

export const getGlobalData = async (): Promise<GlobalData> => {
  try {
    const response = await api.get('/global');
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid data format received from server');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error fetching global data:', error.message);
    throw new Error(error.data?.message || 'Failed to fetch global market data. Please try again later.');
  }
};

export const getCryptoHistory = async (id: string) => {
  try {
    const response = await api.get(`/crypto/${id}/history`);
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid data format received from server');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error fetching history data:', error.message);
    throw new Error(error.data?.message || 'Failed to fetch historical data. Please try again later.');
  }
};

export const getMentionsData = async (id: string): Promise<MentionsData> => {
  try {
    const response = await api.get(`/crypto/${id}/mentions`);
    if (!response.data || !response.data.dates || !response.data.datasets) {
      throw new Error('Invalid data format received from server');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error fetching mentions data:', error.message);
    throw new Error(error.data?.message || 'Failed to fetch mentions data. Please try again later.');
  }
};