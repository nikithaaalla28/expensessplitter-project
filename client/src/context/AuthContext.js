import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const storedAuth = localStorage.getItem('isAuthenticated') || sessionStorage.getItem('isAuthenticated');
    const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (storedUser && storedAuth === 'true' && storedToken) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAdmin(userData.isAdmin || false);
      setIsAuthenticated(true);
      setAuthToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }, remember = true) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token } = response.data;
      setUser(userData);
      setIsAdmin(userData.isAdmin || false);
      setIsAuthenticated(true);
      setAuthToken(token);

      const storage = remember ? localStorage : sessionStorage;
      const otherStorage = remember ? sessionStorage : localStorage;

      storage.setItem('user', JSON.stringify(userData));
      storage.setItem('isAuthenticated', 'true');
      storage.setItem('authToken', token);

      otherStorage.removeItem('user');
      otherStorage.removeItem('isAuthenticated');
      otherStorage.removeItem('authToken');

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  };

  const register = async ({ fullName, email, password }) => {
    try {
      const response = await api.post('/auth/register', { fullName, email, password });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    setAuthToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('authToken');
  };

  const setAdminUser = (userData) => {
    const adminUser = { ...userData, isAdmin: true };
    setUser(adminUser);
    setIsAdmin(true);
    setIsAuthenticated(true);
    setAuthToken(userData.token || null);
    localStorage.setItem('user', JSON.stringify(adminUser));
    localStorage.setItem('isAuthenticated', 'true');
    if (userData.token) localStorage.setItem('authToken', userData.token);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isAuthenticated, login, logout, register, setAdminUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
