import React, { createContext, useContext, useState } from 'react';
import { DEV_MODE } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'u1000000-0000-0000-0000-000000000002',
    name: 'Chief Control Officer',
    email: 'operator@sahayog.gov.in',
    role: 'STATE_OPERATOR',
    agency_id: null,
    agency_name: 'State Disaster Operations Center (SDOC)',
  });

  const [devMode] = useState(DEV_MODE);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('sahayog_access_token', token);
  };

  const logout = () => {
    localStorage.removeItem('sahayog_access_token');
    if (!devMode) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, devMode, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
