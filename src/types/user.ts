export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'OPERARIO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  station?: import('./order').Station;
  active: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
