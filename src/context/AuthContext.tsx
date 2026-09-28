import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types.js';
import { apiRequest, ApiError, getStoredToken, getStoredUser, setStoredAuth, clearStoredAuth } from '../api/client.js';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  login: (role: 'admin' | 'student', loginId: string, pass: string) => Promise<UserSession>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      return;
    }

    // Verify token with backend silently to sync session
    apiRequest<{ user: UserSession }>('/api/auth/me')
      .then((res) => {
        if (res && res.user) {
          setUser(res.user);
          setStoredAuth(token, res.user);
        }
      })
      .catch((err: any) => {
        // ONLY clear session if server explicitly returned 401 (token is actually invalid/expired)
        if (err instanceof ApiError && err.status === 401) {
          clearStoredAuth();
          setUser(null);
        }
        // If it's a temporary network failure or server reboot, keep current user state intact
      });
  }, []);

  const login = async (role: 'admin' | 'student', loginId: string, pass: string): Promise<UserSession> => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: UserSession }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ role, loginId, password: pass }),
      });

      if (!res || !res.token || !res.user) {
        throw new Error('Invalid authentication response from server.');
      }

      setStoredAuth(res.token, res.user);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await apiRequest<{ user: UserSession }>('/api/auth/me');
      if (res && res.user) {
        setUser(res.user);
        const token = getStoredToken();
        if (token) setStoredAuth(token, res.user);
      }
    } catch {
      // Ignore
    }
  };

  const isAuthenticated = Boolean(user && user.id && (user.role === 'admin' || user.role === 'student'));

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        loading: isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
