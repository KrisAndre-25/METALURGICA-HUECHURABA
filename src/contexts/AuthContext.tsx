import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { User } from '../types/user';
import { mockUsers } from '../data/mockUsers';
import { storageService } from '../services/storageService';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => storageService.get<User | null>('auth.user', null));

  const login = (email: string): boolean => {
    const found = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.active);
    if (!found) return false;
    setUser(found);
    storageService.set('auth.user', found);
    return true;
  };

  const logout = () => {
    setUser(null);
    storageService.remove('auth.user');
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return ctx;
}
