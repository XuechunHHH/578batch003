import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://oqahytxjdkdtipmqxdgi.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYWh5dHhqZGtkdGlwbXF4ZGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MDkxNjcsImV4cCI6MjA0ODA4NTE2N30.LYRltCjnnkWyBWvsgVxpxa75EkLYl0664m9VRGxyNj8';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is missing in the environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple check if the database is accessible
const getDatabaseClient = async () => {
  try {
    const { error } = await supabase.from('users').select('count');
    if (error) {
      console.error('Database access error:', error);
      throw new Error('Failed to access database');
    }
    return supabase;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export { getDatabaseClient };
export default supabase;