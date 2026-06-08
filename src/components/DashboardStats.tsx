import { Appointment, Client } from '../types';
import { Calendar, CheckCircle, Clock, DollarSign, MessageSquare } from 'lucide-react';
import { formatCurrency } from '../utils';

interface DashboardStatsProps {
  appointments: Appointment[];
  clients: Client[];
}

export default function DashboardStats({ appointments, clients }: DashboardStatsProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Stats filtering
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const totalToday = todayAppointments.length;
  
  const completedToday = todayAppointments.filter(a => a.status === 'Concluído').length;
  const activeToday = todayAppointments.filter(a => a.status === 'Agendado').length;
  
  const totalRevenue = todayAppointments
    .filter(a => a.status === 'Concluído')
    .reduce((sum, a) => sum + a.price, 0);
    
  const projectedRevenue = todayAppointments
    .reduce((sum, a) => sum + a.price, 0);

  const pendingRemindersCount = todayAppointments.filter(a => !a.reminderSent && a.status === 'Agendado').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Cards with elegant geometric layout */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4 transition-all hover:shadow-md">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agendados de Hoje</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-800 font-display">{totalToday}</span>
            <span className="text-xs text-slate-505">({activeToday} pendentes)</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4 transition-all hover:shadow-md">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Concluídos Hoje</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-800 font-display">{completedToday}</span>
            <span className="text-xs text-slate-505">de {totalToday} total</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4 transition-all hover:shadow-md">
        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faturamento Hoje</p>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-800 font-display">{formatCurrency(totalRevenue)}</span>
            <span className="text-[11px] text-slate-400">Projetado: {formatCurrency(projectedRevenue)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4 transition-all hover:shadow-md">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disparos Pendentes</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-800 font-display">{pendingRemindersCount}</span>
            <span className="text-xs text-slate-505 font-mono">pendentes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
