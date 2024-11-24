import axios from 'axios';
import cron from 'node-cron';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const API_ENDPOINTS = {
  hackernews: 'https://hn.algolia.com/api/v1/search',
  devto: 'https://dev.to/api/articles',
  stackexchange: 'https://api.stackexchange.com/2.3/search'
};

const CACHE_TTL = 86400; // 1 day in seconds
const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;

export class MentionsService {
  constructor(cache) {
    this.cache = cache;
    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoBoard/1.0'
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
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, config.retryCount)));
      return this.axiosInstance(config);
    });

    // Schedule data collection once per day at midnight
    cron.schedule('0 0 * * *', () => this.collectMentionsData());
    
    // Initial data collection
    this.collectMentionsData();
  }

  async collectMentionsData() {
    console.log('Starting daily mentions data collection...');
    const cryptos = ['bitcoin', 'ethereum', 'tether', 'solana', 'binancecoin', 'ripple', 'usd-coin', 'cardano', 'avalanche-2', 'dogecoin'];
    
    for (const crypto of cryptos) {
      try {
        const mentions = await this.fetchMentionsForCrypto(crypto);
        this.cache.set(`mentions_${crypto}`, mentions, CACHE_TTL);
        console.log(`Updated mentions data for ${crypto}`);
      } catch (error) {
        console.error(`Error collecting mentions for ${crypto}:`, error.message);
      }
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('Daily mentions data collection completed');
  }

  getLast12Months() {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = startOfMonth(subMonths(new Date(), i));
      months.push(date);
    }
    return months;
  }

  async fetchMentionsForCrypto(cryptoId) {
    const months = this.getLast12Months();
    const [hnData, devtoData, stackData] = await Promise.allSettled([
      this.fetchHackerNewsMentions(cryptoId, months),
      this.fetchDevToMentions(cryptoId, months),
      this.fetchStackExchangeMentions(cryptoId, months)
    ]);

    return {
      dates: months.map(date => format(date, 'MMM yyyy')),
      datasets: [
        { name: 'HackerNews', data: hnData.status === 'fulfilled' ? hnData.value : months.map(() => 0) },
        { name: 'Dev.to', data: devtoData.status === 'fulfilled' ? devtoData.value : months.map(() => 0) },
        { name: 'StackExchange', data: stackData.status === 'fulfilled' ? stackData.value : months.map(() => 0) }
      ]
    };
  }

  async fetchHackerNewsMentions(cryptoId, months) {
    try {
      const monthlyMentions = await Promise.all(months.map(async (monthDate) => {
        const startTime = Math.floor(startOfMonth(monthDate).getTime() / 1000);
        const endTime = Math.floor(endOfMonth(monthDate).getTime() / 1000);
        
        const response = await this.axiosInstance.get(API_ENDPOINTS.hackernews, {
          params: {
            query: cryptoId,
            tags: '(story,comment)',
            numericFilters: `created_at_i>${startTime},created_at_i<${endTime}`,
            hitsPerPage: 1000
          }
        });

        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return response.data.nbHits || 0;
      }));

      return monthlyMentions;
    } catch (error) {
      console.error('Error fetching HackerNews mentions:', error.message);
      throw error;
    }
  }

  async fetchDevToMentions(cryptoId, months) {
    try {
      const response = await this.axiosInstance.get(API_ENDPOINTS.devto, {
        params: {
          tag: cryptoId,
          per_page: 1000
        }
      });

      return this.aggregateMonthlyMentions(response.data || [], months, article => new Date(article.published_at));
    } catch (error) {
      console.error('Error fetching Dev.to mentions:', error.message);
      throw error;
    }
  }

  async fetchStackExchangeMentions(cryptoId, months) {
    try {
      const response = await this.axiosInstance.get(API_ENDPOINTS.stackexchange + '/questions', {
        params: {
          tagged: cryptoId,
          site: 'bitcoin',
          pagesize: 100,
          fromdate: Math.floor(months[0].getTime() / 1000),
          order: 'desc',
          sort: 'creation',
          filter: 'total'
        },
        headers: {
          'Accept-Encoding': 'gzip'
        }
      });

      return this.aggregateMonthlyMentions(
        response.data?.items || [], 
        months, 
        question => new Date(question.creation_date * 1000)
      );
    } catch (error) {
      console.error('Error fetching StackExchange mentions:', error.message);
      throw error;
    }
  }

  aggregateMonthlyMentions(items, months, getDate) {
    return months.map(monthDate => {
      const monthInterval = {
        start: startOfMonth(monthDate),
        end: endOfMonth(monthDate)
      };

      return items.filter(item => {
        const itemDate = getDate(item);
        return isWithinInterval(itemDate, monthInterval);
      }).length;
    });
  }

  async getMentionsData(cryptoId) {
    const cacheKey = `mentions_${cryptoId}`;
    const cachedData = this.cache.get(cacheKey);

    if (cachedData) {
      console.log('Returning cached mentions data');
      return cachedData;
    }

    console.log('Fetching fresh mentions data');
    const data = await this.fetchMentionsForCrypto(cryptoId);
    this.cache.set(cacheKey, data, CACHE_TTL);
    return data;
  }
}