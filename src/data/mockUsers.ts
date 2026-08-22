import type { User } from '../types/user';

export const mockUsers: User[] = [
  { id: 'u-001', name: 'Sergio Núñez', email: 'sergio@metalurgicahuechuraba.cl', role: 'ADMIN', rut: '11.222.333-4', position: 'Gerente de Planta', active: true },
  { id: 'u-002', name: 'Paulina Reyes', email: 'preyes@metalurgicahuechuraba.cl', role: 'OPERATOR', rut: '15.333.444-5', position: 'Jefa de Oficina Técnica', active: true },
  { id: 'u-003', name: 'Juan Carlos Soto', email: 'jsoto@metalurgicahuechuraba.cl', role: 'OPERATOR', station: 'CORTE', rut: '16.444.555-6', position: 'Operador Corte', active: true },
  { id: 'u-004', name: 'Ignacio Peña', email: 'ipena@metalurgicahuechuraba.cl', role: 'OPERATOR', station: 'ARMADO_SOLDADURA', rut: '17.555.666-7', position: 'Soldador', active: true },
  { id: 'u-005', name: 'Fernanda Muñoz', email: 'fmunoz@metalurgicahuechuraba.cl', role: 'OPERATOR', station: 'PINTURA', rut: '18.666.777-8', position: 'Operadora Pintura', active: true },
  { id: 'u-006', name: 'Rodrigo Álvarez', email: 'ralvarez@metalurgicahuechuraba.cl', role: 'OPERATOR', station: 'CONTROL_CALIDAD', rut: '19.777.888-9', position: 'Supervisor de Calidad', active: true },
  { id: 'u-007', name: 'Camila Torres', email: 'ctorres@metalurgicahuechuraba.cl', role: 'OPERATOR', station: 'DESPACHO', rut: '20.888.999-0', position: 'Encargada de Despacho', active: false },
  { id: 'u-008', name: 'Andrea Bello', email: 'contacto@constructoraandes.cl', role: 'CLIENT', clientName: 'Constructora Andes SpA', active: true },
  { id: 'u-009', name: 'Felipe Iturra', email: 'compras@mineraelcobre.cl', role: 'CLIENT', clientName: 'Minera El Cobre Ltda.', active: true },
];
