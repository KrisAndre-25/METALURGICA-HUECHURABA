import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ProfileUpdateInput, User, WorkerInput } from '../types/user';
import { mockDataService } from '../services/mockDataService';
import { storageService } from '../services/storageService';

const AUTH_USER_KEY = 'auth.user';
const USERS_KEY = 'users.v1';

const VALID_ROLES = new Set(['ADMIN', 'OPERATOR', 'CLIENT']);

function isValidUsers(value: unknown): value is User[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every((raw) => {
    if (typeof raw !== 'object' || raw === null) return false;
    const u = raw as Partial<User>;
    return typeof u.id === 'string' && typeof u.email === 'string' && VALID_ROLES.has(u.role as string);
  });
}

export interface ProfileUpdateResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string) => boolean;
  logout: () => void;
  updateProfile: (input: ProfileUpdateInput) => ProfileUpdateResult;
  addWorker: (input: WorkerInput) => User | null;
  updateWorker: (id: string, patch: Partial<WorkerInput>) => void;
  toggleWorkerActive: (id: string) => void;
  deleteWorker: (id: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = storageService.get<User[] | null>(USERS_KEY, null);
    return isValidUsers(stored) ? stored : mockDataService.getUsers();
  });

  const [user, setUser] = useState<User | null>(() => {
    const stored = storageService.get<User | null>(AUTH_USER_KEY, null);
    if (!stored) return null;
    const storedRoster = storageService.get<User[] | null>(USERS_KEY, null);
    const roster = isValidUsers(storedRoster) ? storedRoster : mockDataService.getUsers();
    // Revalida contra el catálogo actual: descarta sesiones cacheadas de un esquema anterior
    // y siempre toma la versión más fresca del usuario (por si su perfil cambió).
    return roster.find((u) => u.id === stored.id) ?? null;
  });

  const persistUsers = (next: User[]) => {
    storageService.set(USERS_KEY, next);
    return next;
  };

  // Sincronización cross-tab: si un ADMIN edita/crea/borra un trabajador en otra
  // pestaña, o cualquier usuario edita su perfil, esta pestaña se actualiza sola.
  useEffect(() => {
    return storageService.subscribe<User[]>(USERS_KEY, (value) => {
      if (!value || !isValidUsers(value)) return;
      setUsers(value);
      setUser((current) => {
        if (!current) return current;
        return value.find((u) => u.id === current.id) ?? current;
      });
    });
  }, []);

  const login = (email: string): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.active);
    if (!found) return false;
    setUser(found);
    storageService.set(AUTH_USER_KEY, found);
    return true;
  };

  const logout = () => {
    setUser(null);
    storageService.remove(AUTH_USER_KEY);
  };

  const updateProfile = (input: ProfileUpdateInput): ProfileUpdateResult => {
    if (!user) return { ok: false, error: 'No hay sesión activa.' };
    const name = input.name.trim();
    const email = input.email.trim();
    if (!name) return { ok: false, error: 'El nombre no puede estar vacío.' };
    if (!EMAIL_RE.test(email)) return { ok: false, error: 'Correo inválido.' };
    if (users.some((u) => u.id !== user.id && u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'Ese correo ya lo usa otra cuenta.' };
    }

    const updatedUser: User = { ...user, name, email };
    const nextUsers = persistUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));
    setUsers(nextUsers);
    setUser(updatedUser);
    storageService.set(AUTH_USER_KEY, updatedUser);
    return { ok: true };
  };

  /** CRUD de trabajadores (taller/oficina) — exclusivo ADMIN, verificado también aquí como segunda barrera. */
  const addWorker = (input: WorkerInput): User | null => {
    if (user?.role !== 'ADMIN') return null;
    const newWorker: User = {
      id: `worker-${Date.now()}`,
      name: input.name.trim(),
      email: input.email.trim(),
      role: 'OPERATOR',
      rut: input.rut.trim(),
      position: input.position.trim(),
      station: input.station,
      active: true,
    };
    setUsers((prev) => persistUsers([...prev, newWorker]));
    return newWorker;
  };

  const updateWorker = (id: string, patch: Partial<WorkerInput>) => {
    if (user?.role !== 'ADMIN') return;
    setUsers((prev) => persistUsers(prev.map((u) => {
      if (u.id !== id) return u;
      return {
        ...u,
        ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
        ...(patch.email !== undefined ? { email: patch.email.trim() } : {}),
        ...(patch.rut !== undefined ? { rut: patch.rut.trim() } : {}),
        ...(patch.position !== undefined ? { position: patch.position.trim() } : {}),
        ...(patch.station !== undefined ? { station: patch.station } : {}),
      };
    })));
  };

  const toggleWorkerActive = (id: string) => {
    if (user?.role !== 'ADMIN') return;
    setUsers((prev) => persistUsers(prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))));
  };

  const deleteWorker = (id: string): boolean => {
    if (user?.role !== 'ADMIN' || id === user.id) return false;
    setUsers((prev) => persistUsers(prev.filter((u) => u.id !== id)));
    return true;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      users,
      isAuthenticated: user !== null,
      login,
      logout,
      updateProfile,
      addWorker,
      updateWorker,
      toggleWorkerActive,
      deleteWorker,
    }),
    [user, users],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return ctx;
}
