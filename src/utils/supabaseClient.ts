import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oqahytxjdkdtipmqxdgi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYWh5dHhqZGtkdGlwbXF4ZGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MDkxNjcsImV4cCI6MjA0ODA4NTE2N30.LYRltCjnnkWyBWvsgVxpxa75EkLYl0664m9VRGxyNj8';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;