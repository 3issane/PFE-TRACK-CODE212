import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if token is valid on initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // For mock tokens, just check if user data exists
          const userStr = localStorage.getItem('user');
          if (userStr && storedToken.startsWith('mock-jwt-token-')) {
            setCurrentUser(JSON.parse(userStr));
            setToken(storedToken);
          } else {
            // Invalid token or user data
            logout();
          }
        } catch (error) {
          console.error('Invalid token or user data', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // Import authAPI here to avoid circular dependency
      const { authAPI } = await import('../services/api');
      
      const response = await authAPI.login({ username, password });
      
      if (response.accessToken) {
        // Store token and user data
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        setToken(response.accessToken);
        setCurrentUser(response.user);
        
        return { success: true };
      } else {
        return {
          success: false,
          message: 'Nom d\'utilisateur ou mot de passe incorrect'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de la connexion'
      };
    }
  };

  const register = async (userData) => {
    try {
      // Import authAPI here to avoid circular dependency
      const { authAPI } = await import('../services/api');
      
      const response = await authAPI.register(userData);
      
      return { 
        success: true, 
        data: {
          message: 'Inscription réussie. Vous pouvez maintenant vous connecter.'
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de l\'inscription'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    currentUser,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};