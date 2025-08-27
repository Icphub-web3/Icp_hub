// testSupabase.js

import 'dotenv/config';
import { supabase } from './supabaseClient.js';

async function testConnection() {
  const { data, error } = await supabase.from('test_table').select('*');
  if (error) {
    console.error('Supabase error:', error);
  } else {
    console.log('Supabase data:', data);
  }
}

testConnection();
