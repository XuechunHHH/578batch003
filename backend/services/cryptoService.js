import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const CACHE_TTL = 120; // 120 seconds
const RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 3;

export class CryptoService {
  constructor(cache) {
    this.cache = cache;
    this.axiosInstance = axios.create({
      baseURL: COINGECKO_API,
      timeout: 30000,
      headers: {
        'Accept': 'application/json'
      }
    });

    // Add retry interceptor
    this.axiosInstance.interceptors.response.use(null, async (error) => {
      const config = error.config;
      config.retryCount = config.retryCount || 0;

      if (config.retryCount >= MAX_RETRIES) {
        return Promise.reject(error);
      }

      config.retryCount += 1;

      if (error.response?.status === 429) {
        const delay = error.response.headers['retry-after'] 
          ? parseInt(error.response.headers['retry-after']) * 1000 
          : RETRY_DELAY;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.axiosInstance(config);
      }

      return Promise.reject(error);
    });
  }

  async getCryptoData() {
    const cacheKey = 'crypto_data';
    const cachedData = this.cache.get(cacheKey);

    if (cachedData && (this.cache.getTtl(cacheKey)>Date.now())) {
      console.log('Returning cached crypto data');
      return cachedData;
    }

    try {
      const response = await this.axiosInstance.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          ids: 'bitcoin,ethereum,tether,solana,binancecoin,ripple,usd-coin,cardano,avalanche-2,dogecoin',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
          sparkline: false
        }
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from CoinGecko API');
      }

      const data = response.data;
      this.cache.set(cacheKey, data, CACHE_TTL);
      console.log('Fetched fresh crypto data from CoinGecko');
      return data;
    } catch (error) {
      console.error('Error fetching crypto data:', error.message);
      
      // Return cached data if available, even if expired
      const staleData = this.cache.get(cacheKey);
      if (staleData) {
        console.log('Returning stale crypto data due to API error');
        return staleData;
      }

      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch cryptocurrency data');
    }
  }

  async getCryptoDetails(id) {
    const cacheKey = `crypto_details_${id}`;
    const cachedData = this.cache.get(cacheKey);

    if (cachedData && (this.cache.getTtl(cacheKey)>Date.now())) {
      console.log('Returning cached crypto details');
      return cachedData;
    }

    try {
      const response = await this.axiosInstance.get(`/coins/${id}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false
        }
      });

      if (!response.data) {
        throw new Error('Invalid response format from CoinGecko API');
      }

      const data = {
        id: response.data.id,
        symbol: response.data.symbol,
        name: response.data.name,
        image: response.data.image.large,
        current_price: response.data.market_data.current_price.usd,
        market_cap: response.data.market_data.market_cap.usd,
        market_cap_rank: response.data.market_cap_rank,
        fully_diluted_valuation: response.data.market_data.fully_diluted_valuation?.usd,
        total_volume: response.data.market_data.total_volume.usd,
        price_change_percentage_24h: response.data.market_data.price_change_percentage_24h,
        circulating_supply: response.data.market_data.circulating_supply,
        total_supply: response.data.market_data.total_supply,
        max_supply: response.data.market_data.max_supply,
        ath: response.data.market_data.ath.usd,
        ath_change_percentage: response.data.market_data.ath_change_percentage.usd,
        ath_date: response.data.market_data.ath_date.usd,
        atl: response.data.market_data.atl.usd,
        atl_change_percentage: response.data.market_data.atl_change_percentage.usd,
        atl_date: response.data.market_data.atl_date.usd,
        roi: response.data.market_data.roi,
        last_updated: response.data.last_updated,
        description: response.data.description?.en,
        categories: response.data.categories,
        links: {
          homepage: response.data.links.homepage,
          blockchain_site: response.data.links.blockchain_site,
          official_forum_url: response.data.links.official_forum_url,
          chat_url: response.data.links.chat_url,
          announcement_url: response.data.links.announcement_url,
          twitter_screen_name: response.data.links.twitter_screen_name,
          facebook_username: response.data.links.facebook_username,
          telegram_channel_identifier: response.data.links.telegram_channel_identifier,
          subreddit_url: response.data.links.subreddit_url
        }
      };

      this.cache.set(cacheKey, data, CACHE_TTL);
      console.log('Fetched fresh crypto details from CoinGecko');
      return data;
    } catch (error) {
      console.error('Error fetching crypto details:', error.message);
      
      // Return cached data if available, even if expired
      const staleData = this.cache.get(cacheKey);
      if (staleData) {
        console.log('Returning stale crypto details due to API error');
        return staleData;
      }

      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch cryptocurrency details');
    }
  }

  async getGlobalData() {
    const cacheKey = 'global_data';
    const cachedData = this.cache.get(cacheKey);

    if (cachedData && (this.cache.getTtl(cacheKey)>Date.now())) {
      console.log('Returning cached global data');
      return cachedData;
    }

    try {
      const response = await this.axiosInstance.get('/global');
      
      if (!response.data?.data) {
        throw new Error('Invalid response format from CoinGecko API');
      }

      const data = response.data.data;
      this.cache.set(cacheKey, data, CACHE_TTL);
      console.log('Fetched fresh global data from CoinGecko');
      return data;
    } catch (error) {
      console.error('Error fetching global data:', error.message);
      
      // Return cached data if available, even if expired
      const staleData = this.cache.get(cacheKey);
      if (staleData) {
        console.log('Returning stale global data due to API error');
        return staleData;
      }

      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch global market data');
    }
  }

  async getCryptoHistory(id) {
    const cacheKey = `history_${id}`;
    const cachedData = this.cache.get(cacheKey);

    if (cachedData && (this.cache.getTtl(cacheKey)>Date.now())) {
      console.log('Returning cached historical data');
      return cachedData;
    }

    try {
      const response = await this.axiosInstance.get(`/coins/${id}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: '30',
          interval: 'daily'
        }
      });

      if (!response.data?.prices || !Array.isArray(response.data.prices)) {
        throw new Error('Invalid response format from CoinGecko API');
      }

      const prices = response.data.prices.map(([timestamp, price]) => ({
        time: timestamp / 1000,
        value: price
      }));

      this.cache.set(cacheKey, prices, CACHE_TTL);
      console.log('Fetched fresh historical data from CoinGecko');
      return prices;
    } catch (error) {
      console.error('Error fetching historical data:', error.message);
      
      // Return cached data if available, even if expired
      const staleData = this.cache.get(cacheKey);
      if (staleData) {
        console.log('Returning stale historical data due to API error');
        return staleData;
      }

      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch historical data');
    }
  }
}