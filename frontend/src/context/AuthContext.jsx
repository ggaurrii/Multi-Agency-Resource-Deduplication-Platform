import React, { createContext, useContext, useState, useEffect } from 'react';
import sahayogApi, { DEV_MODE } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sahayog_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [devMode] = useState(DEV_MODE);
  const [loading, setLoading] = useState(true);

  // Validate active JWT session on startup
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('sahayog_access_token');
      if (token && token !== 'mock-dev-jwt-token') {
        const me = await sahayogApi.getMe();
        if (me && !me.error) {
          setUser(me);
          localStorage.setItem('sahayog_user', JSON.stringify(me));
        } else {
          // Token invalid or expired
          localStorage.removeItem('sahayog_access_token');
          localStorage.removeItem('sahayog_refresh_token');
          localStorage.removeItem('sahayog_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    setUser(userData);
    localStorage.setItem('sahayog_user', JSON.stringify(userData));
    if (accessToken) {
      localStorage.setItem('sahayog_access_token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('sahayog_refresh_token', refreshToken);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('sahayog_refresh_token');
    if (refreshToken) {
      await sahayogApi.logout(refreshToken);
    }
    localStorage.removeItem('sahayog_access_token');
    localStorage.removeItem('sahayog_refresh_token');
    localStorage.removeItem('sahayog_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, devMode, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
