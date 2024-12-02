import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { cache } from '../utils/cache';

const RETRY_DELAY = 1000;
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 1000; // 1 seconds timeout

// Configure axios defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
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
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_supply: number;
  max_supply: number;
  circulating_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
  description?: string;
  categories?: string[];
  links?: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    telegram_channel_identifier: string;
    subreddit_url: string;
  };
}

export interface NewsData {
  id: string;
  title: string;
  link: string;
  type: string;
  source: string;
  ai_sentiment: string;
  time: string;
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

const fetchWithCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  try {
    // Try to get data from cache first
    const cachedData = cache.get<T>(key);
    
    // Start the fetch regardless of cache status
    const fetchPromise = fetchFn().then(data => {
      // Update cache with new data
      cache.set(key, data);
      return data;
    });

    // If we have cached data, use it while waiting for fresh data
    if (cachedData) {
      return Promise.race([
        fetchPromise,
        new Promise<T>((resolve) => {
          setTimeout(() => resolve(cachedData), REQUEST_TIMEOUT);
        })
      ]);
    }

    // If no cache, wait for the fetch
    return fetchPromise;
  } catch (error) {
    // If we have cached data and there's an error, return cached data
    const cachedData = cache.get<T>(key);
    if (cachedData) {
      return cachedData;
    }
    throw error;
  }
};

export const getCryptoData = async (): Promise<CryptoData[]> => {
  return fetchWithCache('crypto_data', async () => {
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
  });
};

export const getCryptoDetails = async (id: string): Promise<CryptoData> => {
  return fetchWithCache(`crypto_details_${id}`, async () => {
    try {
      const response = await api.get(`/crypto/${id}`);
      if (!response.data) {
        throw new Error('Invalid data format received from server');
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching crypto details:', error.message);
      throw new Error(error.data?.message || 'Failed to fetch cryptocurrency details. Please try again later.');
    }
  });
};

export const getGlobalData = async (): Promise<GlobalData> => {
  return fetchWithCache('global_data', async () => {
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
  });
};

export const getCryptoHistory = async (id: string) => {
  return fetchWithCache(`crypto_history_${id}`, async () => {
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
  });
};

export const getMentionsData = async (id: string): Promise<MentionsData> => {
  return fetchWithCache(`mentions_data_${id}`, async () => {
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
  });
};

export const updateUserLikes = async (userId: string, likes: string[]): Promise<string[]> => {
  try {
    const response = await api.post(`/auth/likes/${userId}`, { likes });
    if (!response.data) {
      throw new Error('Invalid response format');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error updating likes:', error.message);
    throw new Error(error.data?.message || 'Failed to update likes. Please try again later.');
  }
};

export const getNewsData = async (page: number, source: String, type: String | null): Promise<NewsData[]> => {
  return fetchWithCache(`news_data_${source}_${type}_${page}`, async () => {
    try {
      let url = `/news?page=${page}&source=${source}`;
      if (type) {
        url += `&type=${type}`;
      }
      const response = await api.get(url);
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid data format received from server');
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching news data:', error.message);
      throw new Error(error.data?.message || 'Failed to fetch news data. Please try again later.');
    }
  });
};