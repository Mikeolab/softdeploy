// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szzycvciwdxbmeyggdwh.supabase.co';           // ← from Supabase dashboard
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6enljdmNpd2R4Ym1leWdnZHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NjcwNjIsImV4cCI6MjA3MTU0MzA2Mn0.b5SvPfNz4wcBHn3aUZOWnnvILsc6kqt1Qkm89RmdfpM';                     // ← from Supabase Project → Settings → API

// Determine environment
const getEnvironment = () => {
  if (typeof window !== 'undefined') {
    // Client-side: check URL
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'development';
    }
    return 'production';
  }
  // Server-side: check NODE_ENV
  return process.env.NODE_ENV === 'development' ? 'development' : 'production';
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Environment helper
export const ENVIRONMENT = getEnvironment();
export const isDevelopment = ENVIRONMENT === 'development';
export const isProduction = ENVIRONMENT === 'production';