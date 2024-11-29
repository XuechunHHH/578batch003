import supabase from '../utils/supabaseClient.js';

export class SocialMediaService {
  async getLaTimesNewsFeed(page = 1, pageSize = 9) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('time', { ascending: false })
      .range(start, end);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
