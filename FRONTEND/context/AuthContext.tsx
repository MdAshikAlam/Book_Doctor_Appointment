'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  googleLogin: (email: string, fullName: string, googleId: string, profilePicture?: string, token?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers,
        credentials: 'include' // Important for cookies
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setUser(data.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Intercept all fetch requests globally to inject token and detect token expiration
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
      let newInit = init ? { ...init } : {};
      
      if (token && typeof input === 'string') {
        if (newInit.headers) {
          if (newInit.headers instanceof Headers) {
            newInit.headers.set('Authorization', `Bearer ${token}`);
          } else if (Array.isArray(newInit.headers)) {
            newInit.headers.push(['Authorization', `Bearer ${token}`]);
          } else {
            const recordHeaders = newInit.headers as Record<string, string>;
            recordHeaders['Authorization'] = `Bearer ${token}`;
          }
        } else {
          const recordHeaders: Record<string, string> = {};
          recordHeaders['Authorization'] = `Bearer ${token}`;
          newInit.headers = recordHeaders;
        }
      }

      const response = await originalFetch(input, newInit);
      
      let url = "";
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.href;
      } else if (input && typeof input === 'object' && 'url' in input) {
        url = (input as Request).url;
      }

      if (response.status === 401 && !url.includes('/auth/logout') && !url.includes('/auth/login') && !url.includes('/auth/me')) {
        try {
          const clone = response.clone();
          const data = await clone.json();
          if (data.message && (
            data.message.toLowerCase().includes('expired') || 
            data.message.toLowerCase().includes('token') ||
            data.message.toLowerCase().includes('jwt') ||
            data.message.toLowerCase().includes('unauthorized') ||
            data.message.toLowerCase().includes('log in again')
          )) {
            logout();
          }
        } catch (e) {
          logout();
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setUser(data.data.user);
        localStorage.setItem("accessToken", data.data.accessToken);
        return { success: true };
      } else {
        return { success: false, status: response.status, code: data.code, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Connection error' };
    }
  };

  const googleLogin = async (email: string, fullName: string, googleId: string, profilePicture?: string, token?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, googleId, profilePicture, token }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setUser(data.data.user);
        localStorage.setItem("accessToken", data.data.accessToken);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Google Login failed' };
      }
    } catch (error) {
      console.error('Google Login error:', error);
      return { success: false, message: 'Connection error' };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           name: userData.fullName,
           fullName: userData.fullName,
           email: userData.email,
           password: userData.password,
           phone: userData.phone,
           role: 'patient' 
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Automatically log in after registration
        setUser(data.data.user);
        localStorage.setItem("accessToken", data.data.accessToken);
        return { success: true, message: 'Registration successful!' };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Connection error' };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("accessToken");
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
