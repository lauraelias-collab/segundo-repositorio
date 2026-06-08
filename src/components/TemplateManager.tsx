import { useState, FormEvent } from 'react';
import { MessageTemplate } from '../types';
import { Sparkles, Save, Info, Plus, Trash2, Edit2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TemplateManagerProps {
  templates: MessageTemplate[];
  onSaveTemplate: (template: MessageTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onAddTemplate: (title: string, content: string) => void;
}

export default function TemplateManager({ templates, onSaveTemplate, onDeleteTemplate, onAddTemplate }: TemplateManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Variables list
  const variables = [
    { tag: '{cliente}', desc: 'Nome do tutor do pet' },
    { tag: '{pet}', desc: 'Nome do cachorro / gato' },
    { tag: '{raca}', desc: 'Raça do bichinho' },
    { tag: '{data}', desc: 'Data no formato DD/MM/AAAA' },
    { tag: '{hora}', desc: 'Horário do atendimento' },
    { tag: '{servico}', desc: 'Serviço contratado' },
    { tag: '{preco}', desc: 'Preço em Reais (R$)' },
  ];

  const handleStartEdit = (t: MessageTemplate) => {
    setEditingId(t.id);
    setEditedTitle(t.title);
    setEditedContent(t.content);
  };

  const handleSaveEdit = (id: string) => {
    if (!editedTitle.trim() || !editedContent.trim()) return;
    onSaveTemplate({ id, title: editedTitle.trim(), content: editedContent.trim() });
    setEditingId(null);
  };

  const handleAddNew = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddTemplate(newTitle.trim(), newContent.trim());
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const handleVariableClick = (tag: string, target: 'edit' | 'new') => {
    if (target === 'edit') {
      setEditedContent(prev => prev + ' ' + tag);
    } else {
      setNewContent(prev => prev + ' ' + tag);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-xs p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-stone-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-current" /> Modelos de Mensagem do WhatsApp
          </h2>
          <p className="text-sm text-stone-500">
            Personalize as mensagens automatizadas que envia com um clique.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 font-semibold px-4 py-2 rounded-xl text-stone-950 text-sm transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Modelo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {/* Adding Box Form */}
            {isAdding && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddNew}
                className="bg-brand-50/50 p-4 rounded-xl border border-brand-100 space-y-3 overflow-hidden"
              >
                <h4 className="font-bold text-xs text-brand-700 uppercase tracking-widest flex items-center gap-1.5">
                  ✨ Criar Novo Modelo de Mensagem
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Título do Modelo</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Lembrete de Recorrencia"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-stone-600">Conteúdo do Disparo</label>
                    <span className="text-[10px] text-stone-400">Clique nas tags ao lado para inserir</span>
                  </div>
                  <textarea
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Olá, {cliente}! Prontos para dar um trato no(a) {pet}?..."
                    rows={4}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                  />
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {variables.map(v => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => handleVariableClick(v.tag, 'new')}
                      className="text-[10px] bg-amber-100/70 text-amber-800 hover:bg-amber-100 font-mono px-2 py-1 rounded-sm border border-amber-200 transition-colors"
                    >
                      {v.tag}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-stone-950 rounded-lg cursor-pointer"
                  >
                    Salvar Modelo
                  </button>
                </div>
              </motion.form>
            )}

            {templates.map((template) => (
              <motion.div
                key={template.id}
                layout
                className="p-4 rounded-xl border border-stone-100 bg-stone-50 hover:bg-stone-50/80 transition-all flex flex-col space-y-3"
              >
                {editingId === template.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full font-display font-medium text-sm text-stone-800 border-b border-stone-300 bg-transparent py-1 focus:outline-hidden focus:border-brand-500"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                    />
                    <textarea
                      rows={4}
                      className="w-full text-sm p-2 bg-white rounded-lg border border-stone-200 text-stone-700 font-sans focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    {/* Tags inserter */}
                    <div className="flex flex-wrap gap-1.5">
                      {variables.map(v => (
                        <button
                          key={v.tag}
                          type="button"
                          onClick={() => handleVariableClick(v.tag, 'edit')}
                          className="text-[10px] bg-amber-100/70 text-amber-800 hover:bg-amber-100 font-mono px-2 py-1 rounded-sm border border-amber-200"
                        >
                          {v.tag}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-200 hover:bg-stone-100"
                      >
                        Descartar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(template.id)}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-stone-950 flex items-center space-x-1 cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        <span>Salvar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-bold text-stone-800">{template.title}</h4>
                      </div>
                      <div className="flex space-x-1 opacity-60 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(template)}
                          className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-white rounded-md transition-colors"
                          title="Editar modelo"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTemplate(template.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir modelo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Message Preview bubble */}
                    <div className="p-3 bg-white border border-stone-100 rounded-lg text-sm text-stone-600 font-sans whitespace-pre-wrap leading-relaxed relative">
                      <span className="absolute -top-2 left-3 bg-stone-100 border border-stone-200 text-[9px] px-1 font-mono text-stone-500 rounded">
                        Conteúdo
                      </span>
                      {template.content}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Variables Reference Sidebar */}
        <div className="bg-stone-50 border border-stone-100 rounded-xl p-5 self-start">
          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-brand-600" /> Variáveis Dinâmicas
          </h4>
          <p className="text-xs text-stone-500 mb-4 leading-relaxed">
            Ao incluir essas chaves exatas em seu texto, o sistema substitui automaticamente pelas informações corretas de cada cliente e pet ao disparar!
          </p>

          <div className="space-y-3 font-sans">
            {variables.map((variable) => (
              <div key={variable.tag} className="border-b border-stone-100 pb-2 last:border-none">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                  {variable.tag}
                </span>
                <p className="text-xs text-stone-600 mt-1 pl-1">{variable.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-brand-50 border border-brand-100 rounded-lg text-xs text-brand-800 leading-relaxed">
            <strong>Dica de Formatação:</strong> Use asteriscos no WhatsApp para deixar palavras em negrito! Por exemplo: *{'{pet}'}* aparecerá como <strong>Pipoca</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
