import type { User } from '../types/user';

export const mockUsers: User[] = [
  { id: 'u-001', name: 'Marcelo Vidal', email: 'mvidal@metalurgicahuechuraba.cl', role: 'ADMIN', active: true },
  { id: 'u-002', name: 'Paulina Reyes', email: 'preyes@metalurgicahuechuraba.cl', role: 'SUPERVISOR', active: true },
  { id: 'u-003', name: 'Juan Carlos Soto', email: 'jsoto@metalurgicahuechuraba.cl', role: 'OPERARIO', station: 'CORTE', active: true },
  { id: 'u-004', name: 'Ignacio Peña', email: 'ipena@metalurgicahuechuraba.cl', role: 'OPERARIO', station: 'ARMADO_SOLDADURA', active: true },
  { id: 'u-005', name: 'Fernanda Muñoz', email: 'fmunoz@metalurgicahuechuraba.cl', role: 'OPERARIO', station: 'PINTURA', active: true },
  { id: 'u-006', name: 'Rodrigo Álvarez', email: 'ralvarez@metalurgicahuechuraba.cl', role: 'OPERARIO', station: 'CONTROL_CALIDAD', active: true },
  { id: 'u-007', name: 'Camila Torres', email: 'ctorres@metalurgicahuechuraba.cl', role: 'OPERARIO', station: 'DESPACHO', active: false },
];
