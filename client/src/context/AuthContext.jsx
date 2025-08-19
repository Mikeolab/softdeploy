import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("sd_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("sd_user", JSON.stringify(user));
    else localStorage.removeItem("sd_user");
  }, [user]);

  // Demo auth: accept any email/pw; store email only
  const login = async (email, _password) => {
    setUser({ email });
    return true;
  };

  const signup = async (email, _password) => {
    setUser({ email });
    return true;
  };

  const logout = async () => setUser(null);

  const value = useMemo(() => ({ user, login, signup, logout }), [user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}