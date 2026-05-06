import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { me, type AuthUser } from '../services/auth.service';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (user: AuthUser, access: string, refresh: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const stored = localStorage.getItem('auth_user');
    const bootstrap = async () => {
      if (token && stored) {
        try {
          setAccessToken(token);
          setUser(JSON.parse(stored) as AuthUser);
          const fresh = await me(token);
          setUser(fresh);
          localStorage.setItem('auth_user', JSON.stringify(fresh));
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth_user');
          setAccessToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    void bootstrap();
  }, []);

  const login = (user: AuthUser, access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setUser(user);
    setAccessToken(access);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setAccessToken(null);
  };

  const refreshUser = async () => {
    if (!accessToken) return;
    const fresh = await me(accessToken);
    setUser(fresh);
    localStorage.setItem('auth_user', JSON.stringify(fresh));
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
