const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://szzycvciwdxbmeyggdwh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6enljdmNpd2R4Ym1leWdnZHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NjcwNjIsImV4cCI6MjA3MTU0MzA2Mn0.b5SvPfNz4wcBHn3aUZOWnnvILsc6kqt1Qkm89RmdfpM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabase() {
  try {
    console.log('🔍 Checking Supabase connection...');
    
    // Check if test_runs table exists
    const { data, error } = await supabase
      .from('test_runs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Table does not exist or error:', error.message);
      console.log('📋 You need to run the SQL setup script in Supabase');
      return false;
    } else {
      console.log('✅ Table exists, found', data.length, 'records');
      return true;
    }
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

checkSupabase();
