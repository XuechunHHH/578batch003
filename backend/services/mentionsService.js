import axios from 'axios';
import cron from 'node-cron';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import supabase from '../utils/supabaseClient.js';
import puppeteer from 'puppeteer';
import {model} from '../utils/llmClient.js';


const API_ENDPOINTS = {
  hackernews: 'https://hn.algolia.com/api/v1/search',
  devto: 'https://dev.to/api/articles',
  stackexchange: 'https://api.stackexchange.com/2.3/search',
  guardian: 'https://content.guardianapis.com/search'
};

const CACHE_TTL = 86400; // 1 day in seconds
const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;

export class MentionsService {


  constructor(cache) {
    this.supabase = supabase;
    this.typeIdMapping = {
      bnb: 'binancecoin',
      xrp: 'ripple',
      usdc: 'usd-coin',
      avalanche: 'avalanche-2',
      bitcoin: 'bitcoin',
      ethereum: 'ethereum',
      tether: 'tether',
      solana: 'solana',
      dogecoin: 'dogecoin',
      cardano: 'cardano',

    };
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
    this.scheduleDailyScraping();
    
    // Initial data collection
    this.collectMentionsData();
  }

  async scrapeAndSaveLaTimes(type, query) {
    const url = `https://www.latimes.com/search?q=${query}&s=1&p=1`;
    const newsType = type;
  
    try {
      const today = new Date().toISOString().split('T')[0];
  
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
  
      await page.goto(url, { waitUntil: 'domcontentloaded' });
  
      const articles = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('ul > li > ps-promo').forEach((promo) => {
          const titleElement = promo.querySelector('div > div.promo-content > div > h3 > a');
          const timeElement = promo.querySelector('div > div.promo-content > time');
  
          if (titleElement && timeElement) {
            const title = titleElement.textContent.trim();
            const link = titleElement.href.trim();
            const time = timeElement.getAttribute('datetime') || timeElement.textContent.trim();
            items.push({ title, link, time });
          }
        });
        return items;
      });
  
      await browser.close();
      console.log(`Scraped ${articles.length} articles for type "${newsType}"`);
  
      // Filter articles by today's date
      const normalizedArticles = articles
        .map((article) => ({
          title: article.title,
          link: article.link,
          time: article.time,
          type: newsType,
          ai_sentiment: 5,
          source: 'latimes',
        }))
        .filter((article) => {
          const articleDate = new Date(article.time).toISOString().split('T')[0];
          return articleDate === today;
        });
      
      for (let i = 0; i < normalizedArticles.length; i++) {
        const article = normalizedArticles[i];
        const prompt = `You are an expert in cryptocurrency. I will show you the latest news topic about a specific cryptocurrency, and you will only generate a number between 0-10 no more else, which count as the sentiment of this news to the cryptocurrency, 0 means completely negative and 10 means completely positive, and 5 means netural or irrelevant try to avoid 5, at least have some preference. Here is the news topic: ${article.title}`;
        const result = await model.generateContent(prompt);
        const sentiment = result.response.text();
        console.log(`Sentiment for article ${i + 1}: ${sentiment}`);
        sentiment = isNaN(sentiment) ? 5 : sentiment;
        article.ai_sentiment = sentiment;
      }
      
      if (normalizedArticles.length === 0) {
        console.log(`No articles found for today's date for type "${newsType}"`);
        return;
      }
  
      // Save to database
      const { data, error } = await this.supabase
        .from('news')
        .upsert(normalizedArticles);
  
      if (error) {
        throw new Error(`Failed to insert articles: ${error.message}`);
      }
  
      console.log(`Successfully saved ${normalizedArticles.length} articles for type "${newsType}"`);
    } catch (error) {
      console.error(`Error in scrapeAndSaveNews for type "${newsType}": ${error.message}`);
      throw error;
    }
  }
  

  scheduleDailyScraping() {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    console.log('Scheduling daily scraping job...');
  
    cron.schedule('0 0 * * *', async () => {
      console.log('Starting daily scraping job...');
      for (const [type, query] of Object.entries(this.typeIdMapping)) {
        try {
          await this.scrapeAndSaveLaTimes(type, query);
          console.log(`Completed scraping for type "${type}". Applying cooldown...`);
          await delay(30000);
        } catch (error) {
          console.error(`Failed to scrape news for type "${type}": ${error.message}`);
        }
      }
      console.log('Daily scraping job completed.');
    });
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
    const [hnData, devtoData, stackData, laTimesData] = await Promise.allSettled([
      this.fetchHackerNewsMentions(cryptoId, months),
      this.fetchDevToMentions(cryptoId, months),
      this.fetchStackExchangeMentions(cryptoId, months),
      this.fetchLaTimesMentions(cryptoId, months)
    ]);

    return {
      dates: months.map(date => format(date, 'MMM yyyy')),
      datasets: [
        { name: 'HackerNews', data: hnData.status === 'fulfilled' ? hnData.value : months.map(() => 0) },
        { name: 'Dev.to', data: devtoData.status === 'fulfilled' ? devtoData.value : months.map(() => 0) },
        { name: 'StackExchange', data: stackData.status === 'fulfilled' ? stackData.value : months.map(() => 0) },
        { name: 'LaTimes', data: laTimesData.status === 'fulfilled' ? laTimesData.value : months.map(() => 0) }
      ]
    };
  }
  async fetchLaTimesMentions(cryptoId, months) {
    try {
      const dbType = Object.keys(this.typeIdMapping).find(
        (key) => this.typeIdMapping[key] === cryptoId
      );
      const monthlyMentions = await Promise.all(months.map(async (monthDate) => {
        const startTime = startOfMonth(monthDate).toISOString();
        const endTime = endOfMonth(monthDate).toISOString();

        const { data, error } = await this.supabase
          .from('news')
          .select('id') // Only select the id for counting mentions
          .eq('type', dbType)
          .gte('time', startTime)
          .lte('time', endTime);
        if (error) {
          throw new Error(`Error querying Supabase: ${error.message}`);
        }

        // Return the number of mentions for this month
        return data.length || 0;
      }));

      return monthlyMentions;
    } catch (error) {
      console.error('Error fetching Supabase mentions:', error.message);
      throw error;
    }
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