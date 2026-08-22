/**
 * ADMIN: acceso total (torre de control, finanzas UF, gestión de usuarios).
 * OPERATOR: taller/oficina — crea OTs desde OC y opera el Fast Checklist.
 * CLIENT: solo lectura B2B, acotado a las OTs de su propia empresa (ver `clientName`).
 */
export type UserRole = 'ADMIN' | 'OPERATOR' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  station?: import('./order').Station;
  /** Solo aplica a CLIENT: nombre de la empresa cuyas OTs puede ver. */
  clientName?: string;
  /** Solo trabajadores internos (ADMIN/OPERATOR): RUT y cargo dentro de la planta. */
  rut?: string;
  /** Cargo textual libre (ej. "Operador Corte", "Supervisor de Planta"), distinto del `role` de permisos. */
  position?: string;
  active: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface ProfileUpdateInput {
  name: string;
  email: string;
}

export interface WorkerInput {
  name: string;
  rut: string;
  email: string;
  position: string;
  station?: import('./order').Station;
}
