import { useState, useEffect } from 'react';
import { Client, Appointment, MessageTemplate, ServiceType, AppointmentStatus } from './types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_TEMPLATES 
} from './initialData';
import { 
  formatDateToBR, 
  formatCurrency, 
  parseTemplate, 
  generateWhatsAppLink 
} from './utils';
import { 
  Scissors, 
  Users, 
  Calendar, 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ExternalLink, 
  Clock, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Phone,
  Mail,
  Sliders,
  Dog,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardStats from './components/DashboardStats';
import ClientForm from './components/ClientForm';
import AppointmentForm from './components/AppointmentForm';
import TemplateManager from './components/TemplateManager';

export default function App() {
  // --- Persistent States ---
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  // --- UI Navigation / Filter States ---
  const [activeTab, setActiveTab] = useState<'scheduler' | 'crm' | 'templates'>('scheduler');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // --- Modals States ---
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // --- WhatsApp Send Flow Modal States ---
  const [selectedAppointmentForReminder, setSelectedAppointmentForReminder] = useState<Appointment | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [editedReminderText, setEditedReminderText] = useState('');

  // --- Seeding Database on First Use ---
  useEffect(() => {
    const storedClients = localStorage.getItem('petglow_clients');
    const storedAppointments = localStorage.getItem('petglow_appointments');
    const storedTemplates = localStorage.getItem('petglow_templates');

    if (storedClients) {
      setClients(JSON.parse(storedClients));
    } else {
      setClients(INITIAL_CLIENTS);
      localStorage.setItem('petglow_clients', JSON.stringify(INITIAL_CLIENTS));
    }

    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    } else {
      setAppointments(INITIAL_APPOINTMENTS);
      localStorage.setItem('petglow_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
    }

    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    } else {
      setTemplates(INITIAL_TEMPLATES);
      localStorage.setItem('petglow_templates', JSON.stringify(INITIAL_TEMPLATES));
    }
  }, []);

  // Set default template for reminder modal
  useEffect(() => {
    if (selectedAppointmentForReminder && templates.length > 0) {
      const defaultTpl = templates[0];
      setSelectedTemplateId(defaultTpl.id);
      
      const client = clients.find(c => c.id === selectedAppointmentForReminder.clientId);
      if (client) {
        setEditedReminderText(parseTemplate(defaultTpl.content, client, selectedAppointmentForReminder));
      }
    }
  }, [selectedAppointmentForReminder, templates, clients]);

  // Update dynamic preview when selected template changes inside reminder modal
  const handleTemplateChangeInModal = (tplId: string) => {
    setSelectedTemplateId(tplId);
    if (!selectedAppointmentForReminder) return;
    
    const tpl = templates.find(t => t.id === tplId);
    const client = clients.find(c => c.id === selectedAppointmentForReminder.clientId);
    
    if (tpl && client) {
      setEditedReminderText(parseTemplate(tpl.content, client, selectedAppointmentForReminder));
    }
  };

  // --- Persistence helpers ---
  const saveClientsToStorage = (newClients: Client[]) => {
    setClients(newClients);
    localStorage.setItem('petglow_clients', JSON.stringify(newClients));
  };

  const saveAppointmentsToStorage = (newApps: Appointment[]) => {
    setAppointments(newApps);
    localStorage.setItem('petglow_appointments', JSON.stringify(newApps));
  };

  const saveTemplatesToStorage = (newTpls: MessageTemplate[]) => {
    setTemplates(newTpls);
    localStorage.setItem('petglow_templates', JSON.stringify(newTpls));
  };


  // --- Client Actions ---
  const handleSaveClient = (clientData: Omit<Client, 'id' | 'createdAt'> & { id?: string }) => {
    if (clientData.id) {
      // Editing
      const idx = clients.findIndex(c => c.id === clientData.id);
      if (idx !== -1) {
        const updatedClients = [...clients];
        updatedClients[idx] = {
          ...clients[idx],
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email,
          petName: clientData.petName,
          petBreed: clientData.petBreed,
          petSize: clientData.petSize,
          observations: clientData.observations,
        };
        saveClientsToStorage(updatedClients);
      }
    } else {
      // Creating New
      const newClient: Client = {
        id: 'client_' + Date.now(),
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email,
        petName: clientData.petName,
        petBreed: clientData.petBreed,
        petSize: clientData.petSize,
        observations: clientData.observations,
        createdAt: new Date().toISOString()
      };
      saveClientsToStorage([...clients, newClient]);
    }
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm('Deseja realmente excluir este cliente? Isso não apagará os agendamentos existentes, mas eles ficarão órfãos.')) {
      const filtered = clients.filter(c => c.id !== clientId);
      saveClientsToStorage(filtered);
    }
  };


  // --- Appointment Actions ---
  const handleSaveAppointment = (appData: Omit<Appointment, 'id' | 'reminderSent'> & { id?: string; reminderSent?: boolean }) => {
    if (appData.id) {
      // Editing
      const idx = appointments.findIndex(a => a.id === appData.id);
      if (idx !== -1) {
        const updatedApps = [...appointments];
        updatedApps[idx] = {
          ...appointments[idx],
          clientId: appData.clientId,
          date: appData.date,
          time: appData.time,
          service: appData.service,
          price: appData.price,
          status: appData.status,
          notes: appData.notes,
          reminderSent: appData.reminderSent ?? appointments[idx].reminderSent
        };
        saveAppointmentsToStorage(updatedApps);
      }
    } else {
      // Creating New
      const newApp: Appointment = {
        id: 'app_' + Date.now(),
        clientId: appData.clientId,
        date: appData.date,
        time: appData.time,
        service: appData.service,
        price: appData.price,
        status: 'Agendado',
        notes: appData.notes,
        reminderSent: false
      };
      saveAppointmentsToStorage([...appointments, newApp]);
    }
    setIsAppointmentModalOpen(false);
    setEditingAppointment(null);
  };

  const handleDeleteAppointment = (appId: string) => {
    if (window.confirm('Tem certeza de que deseja remover este agendamento?')) {
      const filtered = appointments.filter(a => a.id !== appId);
      saveAppointmentsToStorage(filtered);
    }
  };

  const handleToggleStatus = (appId: string, currentStatus: AppointmentStatus) => {
    const nextStatus: AppointmentStatus = currentStatus === 'Agendado' ? 'Concluído' : currentStatus === 'Concluído' ? 'Cancelado' : 'Agendado';
    const updated = appointments.map(a => {
      if (a.id === appId) {
        return { ...a, status: nextStatus };
      }
      return a;
    });
    saveAppointmentsToStorage(updated);
  };


  // --- Template Actions ---
  const handleSaveTemplate = (tpl: MessageTemplate) => {
    const updated = templates.map(t => t.id === tpl.id ? tpl : t);
    saveTemplatesToStorage(updated);
  };

  const handleDeleteTemplate = (id: string) => {
    if (templates.length <= 1) {
      alert('Você precisa manter pelo menos 1 modelo de mensagem registrado!');
      return;
    }
    if (window.confirm('Deletar este modelo permanentemente?')) {
      const filtered = templates.filter(t => t.id !== id);
      saveTemplatesToStorage(filtered);
    }
  };

  const handleAddTemplate = (title: string, content: string) => {
    const newTpl: MessageTemplate = {
      id: 'template_' + Date.now(),
      title,
      content
    };
    saveTemplatesToStorage([...templates, newTpl]);
  };


  // --- Reminder Flow Trigger ---
  const handleTriggerSendWhatsApp = () => {
    if (!selectedAppointmentForReminder) return;

    const client = clients.find(c => c.id === selectedAppointmentForReminder.clientId);
    if (!client) return;

    // Open link in WhatsApp
    const link = generateWhatsAppLink(client.phone, editedReminderText);
    window.open(link, '_blank');

    // Mark as sent in database
    const updated = appointments.map(a => {
      if (a.id === selectedAppointmentForReminder.id) {
        return { ...a, reminderSent: true };
      }
      return a;
    });
    saveAppointmentsToStorage(updated);
    setSelectedAppointmentForReminder(null);
  };


  // --- Filters Application ---
  const filteredClients = clients.filter(c => {
    const searchLow = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(searchLow) ||
      c.petName.toLowerCase().includes(searchLow) ||
      c.phone.includes(searchLow) ||
      c.petBreed.toLowerCase().includes(searchLow)
    );
  });

  const filteredAppointments = appointments.filter(a => {
    const client = clients.find(c => c.id === a.clientId);
    const clientName = client ? client.name.toLowerCase() : '';
    const petName = client ? client.petName.toLowerCase() : '';
    const searchLow = searchQuery.toLowerCase();

    // Text search matches client, pet, service, or notes
    const matchesSearch = 
      clientName.includes(searchLow) ||
      petName.includes(searchLow) ||
      a.service.toLowerCase().includes(searchLow) ||
      (a.notes && a.notes.toLowerCase().includes(searchLow));

    // Date filter match
    const matchesDate = dateFilter ? a.date === dateFilter : true;

    // Service filter match
    const matchesService = serviceFilter === 'todos' ? true : a.service === serviceFilter;

    // Status filter match
    const matchesStatus = statusFilter === 'todos' ? true : a.status === statusFilter;

    return matchesSearch && matchesDate && matchesService && matchesStatus;
  }).sort((a, b) => {
    // Sort by date then by time descending (next soonest)
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FBF9F6]">
      
      {/* Upper Salon Header */}
      <header className="bg-stone-950 text-[#F5F2EB] shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-brand-500 text-stone-950 rounded-2xl shadow-inner inline-flex items-center justify-center">
              <Scissors className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl md:text-2xl font-black font-display tracking-tight text-white">CRM Pet Groomer</h1>
                <span className="text-[10px] bg-brand-500/20 text-brand-500 px-2 py-0.5 rounded-full border border-brand-500/30 uppercase font-black tracking-widest font-mono">BETA</span>
              </div>
              <p className="text-xs text-stone-400">Ambiente de Controle & Disparos para Banho e Tosa</p>
            </div>
          </div>

          {/* Tab Selection Navigation Bar */}
          <div className="flex bg-stone-900 border border-stone-800 p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => { setActiveTab('scheduler'); setSearchQuery(''); }}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'scheduler' 
                  ? 'bg-brand-500 text-stone-950 shadow-xs' 
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Agenda & Lembretes</span>
            </button>
            <button
              onClick={() => { setActiveTab('crm'); setSearchQuery(''); }}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'crm' 
                  ? 'bg-brand-500 text-stone-950 shadow-xs' 
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Fichas de Clientes (CRM)</span>
            </button>
            <button
              onClick={() => { setActiveTab('templates'); setSearchQuery(''); }}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'templates' 
                  ? 'bg-brand-500 text-stone-950 shadow-xs' 
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Modelos WhatsApp</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Work Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        
        {/* Real-time stats indicators */}
        <DashboardStats appointments={appointments} clients={clients} />

        {/* Dynamic Display Search and Actions row */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-xs p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Dynamic text search & live filter updates */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'crm' 
                  ? "Buscar cliente pelo nome, pet, telefone ou raça..." 
                  : "Buscar agendamento por tutor, nome do pet, cuidados..."
              }
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 bg-stone-50 transition-all font-sans"
            />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            
            {/* Quick Filter Info Tag if any is selected */}
            {activeTab === 'scheduler' && (
              <div className="flex items-center space-x-2 overflow-x-auto py-1 max-w-full">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 cursor-pointer focus:outline-hidden focus:border-brand-500"
                  title="Filtro de Data"
                />
                
                {dateFilter && (
                  <button 
                    onClick={() => setDateFilter('')}
                    className="p-1 px-2 text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg flex items-center space-x-1"
                  >
                    <span>Limpar data</span>
                    <X className="w-3 h-3" />
                  </button>
                )}

                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="px-2 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-hidden"
                >
                  <option value="todos">Todos Serviços</option>
                  <option value="Banho">Banho</option>
                  <option value="Tosa">Tosa</option>
                  <option value="Banho & Tosa">Banho & Tosa</option>
                  <option value="Hidratação">Hidratação</option>
                  <option value="Outro">Outro</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-hidden"
                >
                  <option value="todos">Todos Status</option>
                  <option value="Agendado">Agendados</option>
                  <option value="Concluído">Concluídos</option>
                  <option value="Cancelado">Cancelados</option>
                </select>
              </div>
            )}

            {/* Principal Action Buttons */}
            {activeTab === 'scheduler' ? (
              <button
                onClick={() => { setEditingAppointment(null); setIsAppointmentModalOpen(true); }}
                className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 font-bold px-4 py-2.5 rounded-xl text-stone-950 text-xs transition-colors shadow-xs hover:shadow-md h-[40px] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Agendamento</span>
              </button>
            ) : activeTab === 'crm' ? (
              <button
                onClick={() => { setEditingClient(null); setIsClientModalOpen(true); }}
                className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 font-bold px-4 py-2.5 rounded-xl text-stone-950 text-xs transition-colors shadow-xs hover:shadow-md h-[40px] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Cliente</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Dynamic Inner Tab Views */}
        <AnimatePresence mode="wait">
          
          {/* Tab 1: Scheduler Appointments View */}
          {activeTab === 'scheduler' && (
            <motion.div
              key="scheduler"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="bg-stone-50/70 border-b border-stone-100 px-6 py-4 flex items-center justify-between">
                  <h3 className="font-display font-bold text-stone-800 text-sm">Próximos Agendamentos</h3>
                  <div className="text-xs text-stone-400 font-mono">
                    Mostrando {filteredAppointments.length} agendamentos filtrados
                  </div>
                </div>

                {filteredAppointments.length === 0 ? (
                  <div className="p-12 text-center max-w-md mx-auto space-y-3">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-400">
                      <Scissors className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-stone-800">Nenhum agendamento encontrado</h4>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Não existem registros para os critérios selecionados nesta página. Tente redefinir seus filtros acima ou cadastre um novo agendamento!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {filteredAppointments.map((app) => {
                      const client = clients.find(c => c.id === app.clientId);
                      
                      return (
                        <div key={app.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-stone-50/40">
                          
                          {/* Pet Info & Tutor Info Group */}
                          <div className="flex items-start space-x-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-brand-100">
                              <Dog className="w-5 h-5" />
                            </div>
                            
                            <div className="space-y-1">
                              {/* Customer and Pet details */}
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="font-display font-extrabold text-stone-800 text-base">
                                  {client ? client.petName : 'Pet não encontrado'}
                                </span>
                                <span className="text-xs bg-stone-100 text-stone-600 font-medium px-2 py-0.5 rounded-md font-mono">
                                  {client ? client.petBreed : 'Dócil'}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                  client?.petSize === 'G' ? 'bg-orange-100 text-orange-850' : client?.petSize === 'M' ? 'bg-amber-100 text-amber-850' : 'bg-stone-100 text-stone-800'
                                }`}>
                                  Porte {client ? client.petSize : 'P'}
                                </span>
                              </div>

                              {/* Owner client name */}
                              <p className="text-xs text-stone-500 font-medium flex items-center gap-1">
                                Tutor(a): <strong className="text-stone-700">{client ? client.name : 'Sem Nome'}</strong>
                                <span className="text-stone-300">|</span>
                                <Phone className="w-3 h-3 text-stone-400 inline" /> {client ? client.phone : ''}
                              </p>

                              {/* Micro instructions */}
                              {app.notes && (
                                <p className="text-xs text-amber-700 bg-amber-50/50 rounded-sm py-1 px-2 border border-amber-100 italic inline-block mt-1 max-w-sm">
                                  Nota: "{app.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Time, Price & Service Details Column */}
                          <div className="flex flex-wrap items-center gap-4 md:gap-8 justify-between md:justify-end">
                            
                            {/* Service tag & Price */}
                            <div className="text-left md:text-right">
                              <div className="flex items-center md:justify-end space-x-1.5 text-xs text-stone-800 font-bold mb-0.5">
                                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                                <span>{app.service}</span>
                              </div>
                              <span className="text-sm font-bold font-mono text-stone-800">
                                {formatCurrency(app.price)}
                              </span>
                            </div>

                            {/* Date & Time block */}
                            <div className="flex flex-col text-left md:text-right">
                              <span className="text-stone-800 font-bold text-sm flex items-center md:justify-end space-x-1">
                                <Clock className="w-3.5 h-3.5 text-stone-400" />
                                <span>{app.time}</span>
                              </span>
                              <span className="text-[11px] text-stone-400 font-semibold font-mono">
                                {formatDateToBR(app.date)}
                              </span>
                            </div>

                            {/* Appointment Status Control Pill */}
                            <div>
                              <button
                                onClick={() => handleToggleStatus(app.id, app.status)}
                                title="clique para alterar status do atendimento"
                                className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                                  app.status === 'Concluído'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : app.status === 'Cancelado'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-stone-100'
                                }`}
                              >
                                {app.status}
                              </button>
                            </div>

                            {/* Communication Reminder Tracker Box */}
                            <div className="flex items-center space-x-2">
                              {app.reminderSent ? (
                                <div className="inline-flex items-center space-x-1 text-emerald-600 bg-emerald-50 rounded-full py-1 px-2.5 text-xs border border-emerald-100">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Enviado</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center space-x-1 text-stone-400 bg-stone-50 rounded-full py-1 px-2.5 text-xs border border-stone-100">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Pendente</span>
                                </div>
                              )}

                              {/* Send Reminder Action Button */}
                              <button
                                onClick={() => setSelectedAppointmentForReminder(app)}
                                className={`p-2 rounded-xl border flex items-center space-x-1 text-xs font-semibold transition-all cursor-pointer ${
                                  app.reminderSent
                                    ? 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                                    : 'bg-brand-500 border-brand-500 hover:bg-brand-600 text-[#1C1917] shadow-xs'
                                }`}
                                title="Enviar lembrete WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Lembrete</span>
                              </button>
                            </div>

                            {/* Delete/Edit Action menu */}
                            <div className="flex space-x-1 border-l border-stone-100 pl-3">
                              <button
                                onClick={() => { setEditingAppointment(app); setIsAppointmentModalOpen(true); }}
                                className="p-1 px-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAppointment(app.id)}
                                className="p-1 px-2 text-stone-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Tab 2: Client Base Registration View */}
          {activeTab === 'crm' && (
            <motion.div
              key="crm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden col-span-3">
                <div className="bg-stone-50/70 border-b border-stone-100 px-6 py-4 flex items-center justify-between">
                  <h3 className="font-display font-bold text-stone-800 text-sm">CRM de Clientes & Pets</h3>
                  <div className="text-xs text-stone-400 font-mono">
                    {filteredClients.length} Tutores Registrados
                  </div>
                </div>

                {filteredClients.length === 0 ? (
                  <div className="p-12 text-center max-w-md mx-auto space-y-3">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-400">
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-stone-800">Nenhum cliente cadastrado</h4>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Não encontramos clientes correspondentes ao termo digitado ou cadastrados no sistema. Clique em "Cadastrar Cliente" acima para começar!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {filteredClients.map((cl) => {
                      // Count client total appointments
                      const clientApps = appointments.filter(a => a.clientId === cl.id);
                      const totalApps = clientApps.length;
                      const lastApp = clientApps.length > 0 ? clientApps.sort((a,b) => b.date.localeCompare(a.date))[0] : null;

                      return (
                        <div key={cl.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-stone-50/40 transition-all">
                          
                          {/* Left Panel: Tutor and Dog main specifications */}
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex flex-col items-center justify-center font-bold text-xs uppercase border border-brand-200">
                              <span>PET</span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center flex-wrap gap-2">
                                <h3 className="font-display font-extrabold text-stone-800 text-lg leading-tight">
                                  {cl.name}
                                </h3>
                                <span className="text-[10px] bg-brand-500/10 text-stone-800 border border-brand-200/50 font-bold px-2 py-0.5 rounded">
                                  Tutor(a)
                                </span>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-stone-500">
                                <span className="flex items-center gap-1 font-medium text-stone-600">
                                  <Phone className="w-3.5 h-3.5 text-stone-400" /> {cl.phone}
                                </span>
                                {cl.email && (
                                  <span className="flex items-center gap-1 text-stone-600">
                                    <Mail className="w-3.5 h-3.5 text-stone-400" /> {cl.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Center Panel: Associated Pet card indicator */}
                          <div className="bg-[#FAF9F6] border border-stone-150 p-3 rounded-xl flex items-center space-x-3.5 max-w-sm w-full lg:w-auto">
                            <div className="p-2 bg-white rounded-lg text-amber-600 border border-stone-100">
                              <Dog className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-display font-extrabold text-stone-800 text-sm">{cl.petName}</span>
                                <span className="text-[10px] bg-stone-100 text-stone-600 font-mono rounded px-1">{cl.petBreed}</span>
                              </div>
                              <p className="text-[11px] text-stone-500 mt-0.5">Porte: {cl.petSize === 'G' ? 'Grande' : cl.petSize === 'M' ? 'Médio' : 'Pequeno'}</p>
                            </div>
                          </div>

                          {/* Right Panel: Business stats and interactive menu */}
                          <div className="flex flex-wrap items-center gap-4 lg:gap-6 justify-between lg:justify-end">
                            {/* Service metrics */}
                            <div className="text-left lg:text-right space-y-0.5">
                              <span className="text-xs text-stone-400 block font-semibold uppercase tracking-wider">Histórico</span>
                              <span className="text-xs font-bold text-stone-700">
                                {totalApps} {totalApps === 1 ? 'atendimento realizado' : 'atendimentos realizados'} 🐾
                              </span>
                              {lastApp && (
                                <p className="text-[10px] text-stone-450 font-mono">Último em: {formatDateToBR(lastApp.date)}</p>
                              )}
                            </div>

                            {/* Client observations note */}
                            {cl.observations && (
                              <div className="max-w-[180px] bg-amber-50/50 border border-amber-100 rounded-lg p-2 text-left">
                                <span className="text-[9px] font-bold text-amber-800 uppercase block">Cuidado</span>
                                <span className="text-[10px] text-stone-600 line-clamp-2">{cl.observations}</span>
                              </div>
                            )}

                            {/* Action edit row */}
                            <div className="flex space-x-1 border-t sm:border-t-0 sm:border-l border-stone-100 pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto justify-end">
                              {/* Create Quick Appointment Button for this specific Client */}
                              <button
                                onClick={() => {
                                  setEditingAppointment(null);
                                  // Open with pre-selected client
                                  setIsAppointmentModalOpen(true);
                                  setTimeout(() => {
                                    const selectEl = document.querySelector('select');
                                    if (selectEl) {
                                      selectEl.value = cl.id;
                                      const event = new Event('change', { bubbles: true });
                                      selectEl.dispatchEvent(event);
                                    }
                                  }, 50);
                                }}
                                className="px-3 py-1.5 bg-brand-50 border border-brand-200 text-stone-850 rounded-lg hover:bg-brand-500 hover:text-stone-950 font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer"
                                title="Fazer novo agendamento rápido"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Agendar</span>
                              </button>

                              <button
                                onClick={() => { setEditingClient(cl); setIsClientModalOpen(true); }}
                                className="p-1 px-2 text-stone-400 hover:text-stone-850 hover:bg-stone-105 rounded-lg transition-colors border border-stone-105"
                                title="Editar Cadastro"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClient(cl.id)}
                                className="p-1 px-2 text-stone-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors border border-stone-105"
                                title="Excluir Tutor"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Tab 3: Personalized Messaging Templates */}
          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TemplateManager
                templates={templates}
                onSaveTemplate={handleSaveTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                onAddTemplate={handleAddTemplate}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- CUSTOM MODALS IMPLEMENTATION --- */}

        {/* Client Form Modal overlay */}
        <AnimatePresence>
          {isClientModalOpen && (
            <ClientForm
              client={editingClient}
              onClose={() => { setIsClientModalOpen(false); setEditingClient(null); }}
              onSave={handleSaveClient}
            />
          )}
        </AnimatePresence>

        {/* Appointment Form Modal overlay */}
        <AnimatePresence>
          {isAppointmentModalOpen && (
            <AppointmentForm
              appointment={editingAppointment}
              clients={clients}
              onClose={() => { setIsAppointmentModalOpen(false); setEditingAppointment(null); }}
              onSave={handleSaveAppointment}
            />
          )}
        </AnimatePresence>

        {/* WhatsApp Send Confirmation dynamic drawer/modal */}
        <AnimatePresence>
          {selectedAppointmentForReminder && (
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-stone-100"
              >
                <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                      <MessageSquare className="w-5 h-5 text-stone-950" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-stone-800">Disparo de Lembrete WhatsApp</h3>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSelectedAppointmentForReminder(null)} 
                    className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 p-1.5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Select Template dynamically */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Escolha o Modelo de Disparo</label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => handleTemplateChangeInModal(e.target.value)}
                      className="w-full text-sm px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Recipient summary overview */}
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Tutor & Pet</span>
                      <strong className="text-stone-700">
                        {(() => {
                          const cl = clients.find(c => c.id === selectedAppointmentForReminder.clientId);
                          return cl ? `${cl.name} (${cl.petName})` : '';
                        })()}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-stone-400 font-semibold uppercase tracking-wider text-[10px]">WhatsApp Tutor</span>
                      <strong className="text-stone-700">
                        {(() => {
                          const cl = clients.find(c => c.id === selectedAppointmentForReminder.clientId);
                          return cl ? cl.phone : '';
                        })()}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Data e Horário</span>
                      <strong className="text-stone-700">
                        {formatDateToBR(selectedAppointmentForReminder.date)} às {selectedAppointmentForReminder.time}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Serviço & Preço</span>
                      <strong className="text-stone-700">
                        {selectedAppointmentForReminder.service} ({formatCurrency(selectedAppointmentForReminder.price)})
                      </strong>
                    </div>
                  </div>

                  {/* Message body preview editor */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-stone-600">Revisão do Lembrete</label>
                      <span className="text-[10px] text-stone-400 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Edição livre habilitada ✍️</span>
                    </div>
                    <textarea
                      rows={5}
                      value={editedReminderText}
                      onChange={(e) => setEditedReminderText(e.target.value)}
                      className="w-full text-sm p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-700 focus:outline-hidden focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-sans resize-none"
                    />
                  </div>

                  {/* Warning advice */}
                  <p className="text-[11px] text-stone-500 leading-normal flex items-start gap-1">
                    <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    Como o WhatsApp é aberto em nova aba do navegador para envio seguro, ao clicar em "Disparar WhatsApp", o status do agendamento mudará para <strong>Enviado</strong> no painel de controle.
                  </p>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setSelectedAppointmentForReminder(null)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-stone-200 text-stone-600 hover:bg-stone-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleTriggerSendWhatsApp}
                      className="px-6 py-2.5 rounded-xl text-sm font-black bg-emerald-500 hover:bg-emerald-600 text-stone-950 flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Abrir WhatsApp</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer copyright */}
      <footer className="bg-stone-900 border-t border-stone-850 py-4 py-6 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; 2026 CRM Banho e Tosa. Organização e produtividade para o pet shop.</p>
          <div className="flex space-x-4">
            <span className="text-stone-500">Sem limite de disparos</span>
            <span className="text-stone-500">Persistência local segura</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
