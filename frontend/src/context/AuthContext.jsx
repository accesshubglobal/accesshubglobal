import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/me`);
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      const detail = error.response?.data?.detail;
      let errorMsg = 'Erreur de connexion';
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail.map(e => e.msg || JSON.stringify(e)).join(', ');
      }
      return { success: false, error: errorMsg };
    }
  };

  const register = async (data) => {
    try {
      const response = await axios.post(`${API}/auth/register`, data);
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      const detail = error.response?.data?.detail;
      let errorMsg = 'Erreur d\'inscription';
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail.map(e => e.msg || JSON.stringify(e)).join(', ');
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const addToFavorites = async (offerId) => {
    if (!user) return { success: false, error: 'Non connecté' };
    
    try {
      const response = await axios.post(`${API}/user/favorites/${offerId}`);
      setUser(prev => ({ ...prev, favorites: response.data.favorites }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail };
    }
  };

  const removeFromFavorites = async (offerId) => {
    if (!user) return { success: false, error: 'Non connecté' };
    
    try {
      const response = await axios.delete(`${API}/user/favorites/${offerId}`);
      setUser(prev => ({ ...prev, favorites: response.data.favorites }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'admin_principal' || user?.role === 'admin_secondary',
    isPrincipalAdmin: user?.role === 'admin' || user?.role === 'admin_principal',
    isAgent: user?.role === 'agent',
    login,
    register,
    logout,
    addToFavorites,
    removeFromFavorites
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
