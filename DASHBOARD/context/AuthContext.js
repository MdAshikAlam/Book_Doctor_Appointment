"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, apiCall } from '@/lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();



  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authApi.getMe();
        const freshUser = response.data.user;
        
        if (freshUser.role === 'patient') {
          logout();
          return;
        }
        
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch (err) {
        if (err.status === 401 || (err.message && (err.message.includes('not logged in') || err.message.includes('Please log in') || err.message.includes('unauthorized') || err.message.includes('Unauthorized')))) {
          console.warn('Auth Init: User is not logged in.');
        } else {
          console.error('Auth Init Error:', err);
        }
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authApi.login(credentials);
      const { user } = response.data;
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      router.push('/dashboard');
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (email, fullName, googleId, profilePicture, token) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiCall('/auth/google-login', {
        method: 'POST',
        body: JSON.stringify({ email, fullName, googleId, profilePicture, token, isDashboard: true })
      });
      const { user } = response.data;
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      router.push('/dashboard');
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout API Error:', err);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      // Add a query param to signal to the middleware/proxy that we shouldn't auto-redirect back
      router.push('/?auth=failed');
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, error, login, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
