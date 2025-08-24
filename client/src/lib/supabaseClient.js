// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szzycvciwdxbmeyggdwh.supabase.co';           // ← from Supabase dashboard
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6enljdmNpd2R4Ym1leWdnZHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NjcwNjIsImV4cCI6MjA3MTU0MzA2Mn0.b5SvPfNz4wcBHn3aUZOWnnvILsc6kqt1Qkm89RmdfpM';                     // ← from Supabase Project → Settings → API

export const supabase = createClient(supabaseUrl, supabaseAnonKey);