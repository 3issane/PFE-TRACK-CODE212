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

  const login = async (username, password) => {
    try {
      // Import authAPI here to avoid circular dependency
      const { authAPI } = await import('../services/api');
      
      const response = await authAPI.login({ username, password });
      
      if (response.token) {
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.id,
          firstName: response.firstName,
          lastName: response.lastName,
          username: response.username,
          email: response.email,
          roles: response.roles
        }));
        
        setToken(response.token);
        setCurrentUser({
          id: response.id,
          firstName: response.firstName,
          lastName: response.lastName,
          username: response.username,
          email: response.email,
          roles: response.roles
        });
        
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

  // Check if token is valid on initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Check if user data exists and token is valid
          const userStr = localStorage.getItem('user');
          if (userStr) {
            // For real JWT tokens, we could decode and check expiration
            // For now, just validate that user data exists
            const userData = JSON.parse(userStr);
            setCurrentUser(userData);
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