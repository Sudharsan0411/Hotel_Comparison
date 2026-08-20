import React, { createContext, useContext, useMemo, useState } from 'react';
import { TOKEN_STORAGE_KEY, login, signup } from "../services/hotelApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(null);

  async function loginUser(payload) {
    const data = await login(payload);
    const nextToken = data.token || data.jwt || data.accessToken;
    setToken(nextToken || localStorage.getItem(TOKEN_STORAGE_KEY));
    setUser(data.user || null);
    return data;
  }

  async function signupUser(payload) {
    const data = await signup(payload);
    const nextToken = data.token || data.jwt || data.accessToken;
    setToken(nextToken || localStorage.getItem(TOKEN_STORAGE_KEY));
    setUser(data.user || null);
    return data;
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      token,
      user,
      loginUser,
      signupUser,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
