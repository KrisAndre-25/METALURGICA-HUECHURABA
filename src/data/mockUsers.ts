import type { User } from '../types/user';

export const mockUsers: User[] = [
  { id: 'u-001', name: 'Sergio Núñez', email: 'sergio@metalurgicahuechuraba.cl', role: 'ADMIN', active: true },
  { id: 'u-002', name: 'Paulina Reyes', email: 'preyes@metalurgicahuechuraba.cl', role: 'OPERATOR', active: true },
  { id: 'u-003', name: 'Juan Carlos Soto', email: 'jsoto@metalurgicahuechuraba.cl', role: 'OPERATOR', station: 'CORTE', active: true },
  { id: 'u-004', name: 'Ignacio Peña', email: 'ipena@metalurgicahuechuraba.cl', role: 'OPERATOR', station: 'ARMADO_SOLDADURA', active: true },
  { id: 'u-005', name: 'Fernanda Muñoz', email: 'fmunoz@metalurgicahuechuraba.cl', role: 'OPERATOR', station: 'PINTURA', active: true },
  { id: 'u-006', name: 'Rodrigo Álvarez', email: 'ralvarez@metalurgicahuechuraba.cl', role: 'OPERATOR', station: 'CONTROL_CALIDAD', active: true },
  { id: 'u-007', name: 'Camila Torres', email: 'ctorres@metalurgicahuechuraba.cl', role: 'OPERATOR', station: 'DESPACHO', active: false },
  { id: 'u-008', name: 'Andrea Bello', email: 'contacto@constructoraandes.cl', role: 'CLIENT', clientName: 'Constructora Andes SpA', active: true },
  { id: 'u-009', name: 'Felipe Iturra', email: 'compras@mineraelcobre.cl', role: 'CLIENT', clientName: 'Minera El Cobre Ltda.', active: true },
];
