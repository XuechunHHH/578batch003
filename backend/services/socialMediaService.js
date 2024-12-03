import supabase from '../utils/supabaseClient.js';

export class SocialMediaService {

  async getNewsFeed(page = 1, pageSize = 9, source = 'latimes', type = null) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    let query = supabase
    .from('news')
    .select('*')
    .eq('source', source)
    .order('time', { ascending: false })
    .range(start, end);
    if (type) {
      query = query.eq('type', type);
    }
    if (source === 'reddit') {
      query = supabase
          .from('reddit_sentiment')
          .select('*')
          .order('time', { ascending: false })
          .range(start, end);
      if (type) {
        const anotherTypeIdMapping = {
          binancecoin: 'BNB',
          ripple: 'XRP',
          'usd-coin': 'USDC',
          'avalanche-2': 'Avalanche',
          bitcoin: 'Bitcoin',
          ethereum: 'Ethereum',
          tether: 'Tether',
          solana: 'Solana',
          dogecoin: 'Dogecoin',
          cardano: 'Cardano',
        };
        const dbType = anotherTypeIdMapping[type];
        query = query.eq('type', dbType);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
