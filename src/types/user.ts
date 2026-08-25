/**
 * ADMIN (Administración): acceso total — torre de control, finanzas UF, gestión
 * de usuarios, y es el ÚNICO rol autorizado para cargar una OC y generar la OT.
 * OPERATOR: taller/oficina — opera el Fast Checklist y avanza estaciones; no crea OTs.
 * VENDEDOR: recibe la venta del cliente y emite una Solicitud de Venta con prioridad,
 * que Administración revisa para cargarla como OC.
 * CLIENT: solo lectura B2B, acotado a las OTs de su propia empresa (ver `clientName`).
 */
export type UserRole = 'ADMIN' | 'OPERATOR' | 'VENDEDOR' | 'CLIENT';

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
