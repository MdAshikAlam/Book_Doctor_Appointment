"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = Cookies.get('accessToken');
        
        if (token) {
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && typeof parsedUser === 'object' && parsedUser.email) {
              setUser(parsedUser);
            } else {
              // Fetch fresh user data if stored data is invalid
              const response = await authApi.getMe();
              setUser(response.data.user);
              localStorage.setItem('user', JSON.stringify(response.data.user));
            }
          } else {
            // Token exists but no user info, fetch it
            const response = await authApi.getMe();
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } else {
          // Token missing, clear state
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth Init Error:', err);
        logout();
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
      const { user, accessToken } = response.data;
      
      // Store in Cookies for Middleware access - added path: '/'
      Cookies.set('accessToken', accessToken, { expires: 7, secure: true, sameSite: 'strict', path: '/' });
      Cookies.set('userRole', user.role, { expires: 7, secure: true, sameSite: 'strict', path: '/' });
      
      // Store in LocalStorage for Client-Side state
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      
      setUser(user);
      router.push('/dashboard');
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('userRole');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
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
