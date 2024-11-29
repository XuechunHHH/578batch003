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
    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
