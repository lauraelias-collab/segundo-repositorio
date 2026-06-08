import { Client, Appointment, MessageTemplate } from './types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Ana Carolina Mendonça',
    phone: '11987654321',
    email: 'carol.mendonca@email.com',
    petName: 'Pipoca',
    petBreed: 'Shih Tzu',
    petSize: 'P',
    observations: 'Pele sensível na barriga, usar shampoo hipoalergênico.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'c2',
    name: 'Roberto de Souza',
    phone: '11977665544',
    email: 'roberto.souza@email.com',
    petName: 'Max',
    petBreed: 'Golden Retriever',
    petSize: 'G',
    observations: 'Bastante dócil, mas tem medo do soprador muito forte.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'c3',
    name: 'Mariana Lima',
    phone: '11966554433',
    email: 'mariana.lima@email.com',
    petName: 'Mel',
    petBreed: 'Poodle',
    petSize: 'M',
    observations: 'Tosa higiênica e tosa bebê no corpo.',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_TEMPLATES: MessageTemplate[] = [
  {
    id: 't1',
    title: 'Confirmar Agendamento',
    content: 'Olá, {cliente}! 🐾 Confirmamos o agendamento de *{servico}* para o(a) *{pet}* ({raca}) no dia *{data}* às *{hora}*. Valor aproximado: R${preco}. Ficamos no aguardo de vocês! Grooming Salon 🧼🐾'
  },
  {
    id: 't2',
    title: 'Lembrete (Véspera)',
    content: 'Olá, {cliente}! 🌟 Passando para lembrar que amanhã (*{data}*) às *{hora}*, o(a) *{pet}* tem um horário agendado de *{servico}*. Se precisar desmarcar ou alterar, por favor nos avise com antecedência. Até logo! 🐾🐩'
  },
  {
    id: 't3',
    title: 'Aviso de Retirada (Pet Pronto)',
    content: 'Olá, {cliente}! Boas notícias: o banho e tosa de *{pet}* já terminou! O seu pet está limpo, cheiroso e pronto para ir para casa. 🧴🚿 Pode vir retirá-lo quando desejar!'
  }
];

// Generates simple appointments relative to today
const today = new Date().toISOString().split('T')[0];
const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrow = tomorrowDate.toISOString().split('T')[0];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    clientId: 'c1',
    date: today,
    time: '09:00',
    service: 'Banho & Tosa',
    price: 110,
    status: 'Agendado',
    notes: 'Solicitar tosa bebê',
    reminderSent: false
  },
  {
    id: 'a2',
    clientId: 'c2',
    date: today,
    time: '14:30',
    service: 'Banho',
    price: 140,
    status: 'Agendado',
    notes: 'Secagem cuidadosa',
    reminderSent: true
  },
  {
    id: 'a3',
    clientId: 'c3',
    date: tomorrow,
    time: '10:00',
    service: 'Banho & Tosa',
    price: 95,
    status: 'Agendado',
    notes: 'Tosa higiênica inclusa',
    reminderSent: false
  }
];
