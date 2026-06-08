export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  petName: string;
  petBreed: string;
  petSize: 'P' | 'M' | 'G';
  observations?: string;
  createdAt: string;
}

export type ServiceType = 'Banho' | 'Tosa' | 'Banho & Tosa' | 'Hidratação' | 'Outro';

export type AppointmentStatus = 'Agendado' | 'Concluído' | 'Cancelado';

export interface Appointment {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  service: ServiceType;
  price: number;
  status: AppointmentStatus;
  notes?: string;
  reminderSent: boolean;
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
}
