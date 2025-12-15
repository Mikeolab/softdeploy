// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial session + live subscription
  useEffect(() => {
    let mounted = true;
    let timeoutId;

    // Set a timeout to ensure loading never hangs forever
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Auth check timeout - proceeding without auth');
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    (async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.warn('getSession error:', error.message);
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          clearTimeout(timeoutId);
        }
      } catch (e) {
        console.error('getSession threw:', e);
        if (mounted) {
          setUser(null);
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
        clearTimeout(timeoutId);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
  };

  const signup = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) throw error;
    // If email confirmation is ON, data.user may be null until confirmed
    setUser(data.user ?? null);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
