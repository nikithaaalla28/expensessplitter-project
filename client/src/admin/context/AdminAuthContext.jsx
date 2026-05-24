import React, { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken } from '../../api/api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState('');
  const [adminTheme, setAdminTheme] = useState('Light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const applyAdminTheme = (mode) => {
    const isDark = mode === 'Dark';
    document.documentElement.classList.toggle('dark', isDark);
    setAdminTheme(mode);
    localStorage.setItem('adminTheme', mode);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
    const storedToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    const storedAuth = localStorage.getItem('adminAuthenticated') || sessionStorage.getItem('adminAuthenticated');
    const storedTheme = localStorage.getItem('adminTheme') || 'Light';

    if (storedUser && storedToken && storedAuth === 'true') {
      setAdminUser(JSON.parse(storedUser));
      setAdminToken(storedToken);
      setAuthToken(storedToken);
      setIsAuthenticated(true);
    }

    applyAdminTheme(storedTheme);
    setLoading(false);
  }, []);

  const loginAdmin = async ({ email, password }, remember = true) => {
    const credentials = {
      email: 'nikithaaalla0628@gmail.com',
      password: 'nikitha12'
    };

    if (email === credentials.email && password === credentials.password) {
      const adminProfile = {
        name: 'Expense Admin',
        email: credentials.email,
        role: 'admin'
      };
      const token = 'admin-dashboard-token-2026';
      const storage = remember ? localStorage : sessionStorage;
      const altStorage = remember ? sessionStorage : localStorage;

      storage.setItem('adminUser', JSON.stringify(adminProfile));
      storage.setItem('adminToken', token);
      storage.setItem('adminAuthenticated', 'true');
      altStorage.removeItem('adminUser');
      altStorage.removeItem('adminToken');
      altStorage.removeItem('adminAuthenticated');
      setAuthToken(token);

      setAdminUser(adminProfile);
      setAdminToken(token);
      setIsAuthenticated(true);
      const storedTheme = localStorage.getItem('adminTheme') || 'Light';
      applyAdminTheme(storedTheme);
      return { success: true };
    }

    return { success: false, message: 'Invalid admin credentials. Please try again.' };
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setAdminToken('');
    setIsAuthenticated(false);
    setAuthToken(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminAuthenticated');
  };

  return (
    <AdminAuthContext.Provider
      value={{ adminUser, adminToken, adminTheme, applyAdminTheme, isAuthenticated, loading, loginAdmin, logoutAdmin }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
