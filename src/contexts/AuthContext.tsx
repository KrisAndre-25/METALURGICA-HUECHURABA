import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { User } from '../types/user';
import { mockDataService } from '../services/mockDataService';
import { storageService } from '../services/storageService';

const users = mockDataService.getUsers();

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = storageService.get<User | null>('auth.user', null);
    // Revalida contra el catálogo actual: descarta sesiones cacheadas de un esquema de roles anterior.
    return stored ? (users.find((u) => u.id === stored.id) ?? null) : null;
  });

  const login = (email: string): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.active);
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
