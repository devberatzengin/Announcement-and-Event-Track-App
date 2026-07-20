import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthResponse, UserType } from '../types';
import { getMe } from '../api/users';

interface AuthUser {
  id?: string;
  email: string;
  type: UserType;
  userName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAdmin: boolean;
  login: (response: AuthResponse) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const isAdmin = user?.type === 'Admin';

  const loginHandler = (response: AuthResponse) => {
    localStorage.setItem('token', response.token);
    const authUser: AuthUser = { email: response.email, type: response.type };
    localStorage.setItem('user', JSON.stringify(authUser));
    setToken(response.token);
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await getMe();
      const authUser: AuthUser = {
        id: res.data.id,
        email: res.data.email,
        type: res.data.type,
        userName: res.data.userName,
      };
      localStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login: loginHandler, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
