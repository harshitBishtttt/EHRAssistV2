import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as authLogin, logout as authLogout, getStoredUser, getStoredToken } from '../services/auth';
import { STORAGE_KEYS } from '../constants/config';
import { formatDisplayName } from '../utils/format';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      setUser({ name: formatDisplayName(storedUser), raw: storedUser });
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const name = await authLogin(email, password);
    const displayName = formatDisplayName(name);
    setUser({ name: displayName, raw: name });
    return displayName;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  const hasOpenAIKey = useCallback(() => {
    return !!localStorage.getItem(STORAGE_KEYS.OPENAI_KEY);
  }, []);

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    hasOpenAIKey,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
