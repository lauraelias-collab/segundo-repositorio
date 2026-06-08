import { useState, useEffect, FormEvent } from 'react';
import { Client } from '../types';
import { X, User, Phone, Mail, Award, Info, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface ClientFormProps {
  client?: Client | null;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id' | 'createdAt'> & { id?: string }) => void;
}

export default function ClientForm({ client, onClose, onSave }: ClientFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petSize, setPetSize] = useState<'P' | 'M' | 'G'>('P');
  const [observations, setObservations] = useState('');
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone);
      setEmail(client.email);
      setPetName(client.petName);
      setPetBreed(client.petBreed);
      setPetSize(client.petSize);
      setObservations(client.observations || '');
    }
  }, [client]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Simple verification
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Nome do cliente é obrigatório';
    if (!phone.trim()) newErrors.phone = 'Telefone do cliente é obrigatório';
    if (!petName.trim()) newErrors.petName = 'Nome do pet é obrigatório';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: client?.id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      petName: petName.trim(),
      petBreed: petBreed.trim() || 'SRD (Sem raça definida)',
      petSize,
      observations: observations.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-stone-100"
      >
        <div className="bg-brand-50 border-b border-brand-100 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-brand-500 rounded-lg text-white">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h3 className="font-display font-bold text-lg text-stone-800">
              {client ? 'Editar Cadastro de Cliente' : 'Novo Cadastro de Cliente'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Seção Dono */}
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 border-b border-stone-100 pb-1">🐾 Dados do Tutor</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Nome Completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Ana Carolina Mendonça"
                    className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-300 focus:ring-red-500/20' : 'border-stone-200 focus:ring-brand-500/20'} focus:outline-hidden focus:ring-4 focus:border-brand-500 bg-stone-50 transition-all`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">WhatsApp / Telefone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: 11987654321"
                      className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border ${errors.phone ? 'border-red-300 focus:ring-red-500/20' : 'border-stone-200 focus:ring-brand-500/20'} focus:outline-hidden focus:ring-4 focus:border-brand-500 bg-stone-50 transition-all`}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">Apenas números com DDD para disparo</span>
                  {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: tutor@exemplo.com"
                      className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 bg-stone-50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Pet */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 border-b border-stone-100 pb-1">🐶 Dados do Pet</h4>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Nome do Pet *</label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Ex: Pipoca"
                    className={`w-full text-sm px-4 py-2.5 rounded-xl border ${errors.petName ? 'border-red-300 focus:ring-red-500/20' : 'border-stone-200 focus:ring-brand-500/20'} focus:outline-hidden focus:ring-4 focus:border-brand-500 bg-stone-50 transition-all`}
                  />
                  {errors.petName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.petName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Raça do Pet</label>
                  <input
                    type="text"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    placeholder="Ex: Shih Tzu, Poodle, SRD"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 bg-stone-50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-2">Porte do Pet</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['P', 'M', 'G'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setPetSize(size)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        petSize === size 
                          ? 'bg-brand-500 border-brand-500 text-white shadow-xs' 
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {size === 'P' ? 'Pequeno (P)' : size === 'M' ? 'Médio (M)' : 'Grande (G)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-stone-400" /> Observações Veterinárias / Cuidados Especiais (Opcional)
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ex: Tem alergia a tal produto, medo de soprador, não gosta que toque na pata traseira..."
                  rows={3}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 bg-stone-50 transition-all resize-none"
                />
              </div>
            </div>
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
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-stone-950 transition-colors hover:shadow-md cursor-pointer"
            >
              Confirmar Cadastro
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
