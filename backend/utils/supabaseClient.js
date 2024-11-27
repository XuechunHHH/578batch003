import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://oqahytxjdkdtipmqxdgi.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYWh5dHhqZGtkdGlwbXF4ZGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MDkxNjcsImV4cCI6MjA0ODA4NTE2N30.LYRltCjnnkWyBWvsgVxpxa75EkLYl0664m9VRGxyNj8';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is missing in the environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
