import { useState, useEffect, FormEvent } from 'react';
import { Appointment, Client, ServiceType, AppointmentStatus } from '../types';
import { X, Calendar, Clock, DollarSign, Tag, FileText, User } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../utils';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  clients: Client[];
  onClose: () => void;
  onSave: (appointmentData: Omit<Appointment, 'id' | 'reminderSent'> & { id?: string; reminderSent?: boolean }) => void;
}

const SERVICES: ServiceType[] = ['Banho', 'Tosa', 'Banho & Tosa', 'Hidratação', 'Outro'];
const DEFAULT_PRICES: Record<ServiceType, Record<'P' | 'M' | 'G', number>> = {
  'Banho': { P: 50, M: 70, G: 100 },
  'Tosa': { P: 60, M: 80, G: 110 },
  'Banho & Tosa': { P: 80, M: 100, G: 140 },
  'Hidratação': { P: 40, M: 50, G: 70 },
  'Outro': { P: 30, M: 40, G: 60 }
};

export default function AppointmentForm({ appointment, clients, onClose, onSave }: AppointmentFormProps) {
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [service, setService] = useState<ServiceType>('Banho');
  const [price, setPrice] = useState<number>(50);
  const [status, setStatus] = useState<AppointmentStatus>('Agendado');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // When a clientId or service changes, we can suggest a default price based on the selected pet's size
  useEffect(() => {
    if (!appointment) {
      const selectedClient = clients.find(c => c.id === clientId);
      if (selectedClient) {
        const size = selectedClient.petSize;
        const suggestedPrice = DEFAULT_PRICES[service][size];
        setPrice(suggestedPrice);
      }
    }
  }, [clientId, service, clients, appointment]);

  useEffect(() => {
    if (appointment) {
      setClientId(appointment.clientId);
      setDate(appointment.date);
      setTime(appointment.time);
      setService(appointment.service);
      setPrice(appointment.price);
      setStatus(appointment.status);
      setNotes(appointment.notes || '');
    } else {
      // Default to today
      const todayStr = new Date().toISOString().split('T')[0];
      setDate(todayStr);
      setTime('09:00');
      if (clients.length > 0) {
        setClientId(clients[0].id);
      }
    }
  }, [appointment, clients]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!clientId) newErrors.clientId = 'Selecione um cliente';
    if (!date) newErrors.date = 'Selecione uma data';
    if (!time) newErrors.time = 'Selecione um horário';
    if (price <= 0) newErrors.price = 'Insira um valor válido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: appointment?.id,
      clientId,
      date,
      time,
      service,
      price,
      status,
      notes: notes.trim(),
      reminderSent: appointment ? appointment.reminderSent : false
    });
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-stone-100"
      >
        <div className="bg-brand-50 border-b border-brand-100 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-brand-500 rounded-lg text-white">
              <Calendar className="w-5 h-5 text-stone-900" />
            </div>
            <h3 className="font-display font-bold text-lg text-stone-800">
              {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selecionar Cliente */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-stone-400" /> Cliente / Pet *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={!!appointment}
              className={`w-full text-sm px-3 py-2.5 rounded-xl border ${errors.clientId ? 'border-red-300 focus:ring-red-500/20' : 'border-stone-200 focus:ring-brand-500/20'} ${appointment ? 'bg-stone-100' : 'bg-stone-50'} focus:outline-hidden focus:ring-4 focus:border-brand-500 transition-all`}
            >
              <option value="">-- Escolha um Cliente / Pet --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} &rarr; {c.petName} ({c.petBreed} - {c.petSize})
                </option>
              ))}
            </select>
            {errors.clientId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.clientId}</p>}
            {clients.length === 0 && (
              <p className="text-amber-600 text-xs mt-1 bg-amber-50 p-2 rounded-lg border border-amber-100">
                Não há clientes cadastrados. Cadastre um cliente primeiro para poder agendar!
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Data */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Data *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border ${errors.date ? 'border-red-300' : 'border-stone-200'} focus:outline-hidden focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 bg-stone-50 transition-all`}
                />
              </div>
              {errors.date && <p className="text-red-500 text-xs mt-1 font-medium">{errors.date}</p>}
            </div>

            {/* Horário */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Horário *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border ${errors.time ? 'border-red-300' : 'border-stone-200'} focus:outline-hidden focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 bg-stone-50 transition-all`}
                />
              </div>
              {errors.time && <p className="text-red-500 text-xs mt-1 font-medium">{errors.time}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Serviço */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-stone-400" /> Serviço *
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as ServiceType)}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 bg-stone-50 transition-all"
              >
                {SERVICES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Preço */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-stone-400" /> Preço (R$) *
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 80.00"
                className={`w-full text-sm px-4 py-2.5 rounded-xl border ${errors.price ? 'border-red-300' : 'border-stone-200'} focus:outline-hidden focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 bg-stone-50 transition-all`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1 font-medium">{errors.price}</p>}
            </div>
          </div>

          {/* Status (Editable only on edit) */}
          {appointment && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Status do Agendamento</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Agendado', 'Concluído', 'Cancelado'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      status === st 
                        ? st === 'Concluído' ? 'bg-emerald-500 border-emerald-500 text-stone-950'
                          : st === 'Cancelado' ? 'bg-rose-500 border-rose-500 text-stone-950'
                          : 'bg-amber-500 border-amber-500 text-stone-950'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Observações do serviço */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-stone-400" /> Notas Específicas do Atendimento (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Quer enfeite azul / Mandar buscar com táxi dog..."
              rows={2}
              className="w-full text-sm px-4 py-2 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 bg-stone-50 transition-all resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={clients.length === 0}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-stone-950 transition-colors hover:shadow-md cursor-pointer ${
                clients.length === 0 ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600'
              }`}
            >
              {appointment ? 'Salvar Alterações' : 'Agendar Banho / Tosa'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
