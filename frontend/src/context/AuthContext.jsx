import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate session on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('adminToken');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get('/admin/me');
        if (response.data.success) {
          setAdmin(response.data.admin);
          localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
        } else {
          // Token invalid
          handleLogoutCleanup();
        }
      } catch (err) {
        console.error('Initial session validation failed:', err.message);
        handleLogoutCleanup();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogoutCleanup = () => {
    setAdmin(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/admin/login', { email, password });
      if (response.data.success) {
        const { token, admin: loggedAdmin } = response.data;
        
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(loggedAdmin));
        
        setAdmin(loggedAdmin);
        setLoading(false);
        return { success: true };
      }
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/admin/logout');
    } catch (err) {
      console.error('Logout API callback failed:', err.message);
    } finally {
      handleLogoutCleanup();
      setLoading(false);
      window.location.href = '/admin/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        error,
        login,
        logout,
        setAdmin,
        isAuthenticated: !!admin,
        isSuperAdmin: admin?.role === 'superadmin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be executed within an AuthProvider');
  }
  return context;
};
