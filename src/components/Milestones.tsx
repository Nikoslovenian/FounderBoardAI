import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Milestone } from '../types';
import { Plus, Rocket, Globe, Users, Award, Calendar, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Milestones() {
  const { milestones, addMilestone } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'launch' as Milestone['type']
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.title) return;

    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title,
      description: newMilestone.description,
      date: newMilestone.date,
      type: newMilestone.type
    };

    addMilestone(milestone);
    setIsAdding(false);
    setNewMilestone({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'launch'
    });
  };

  const getIcon = (type: Milestone['type']) => {
    switch (type) {
      case 'launch': return <Rocket className="w-5 h-5 text-orange-400" />;
      case 'expansion': return <Globe className="w-5 h-5 text-blue-400" />;
      case 'hiring': return <Users className="w-5 h-5 text-emerald-400" />;
      default: return <Award className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full custom-scrollbar">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Hitos de Crecimiento</h2>
          <p className="text-zinc-400 text-sm">Registra y celebra los logros clave de tu empresa.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Hito
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl"
          >
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase">Título del Hito</label>
                  <input 
                    required
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                    placeholder="Ej: Lanzamiento v1.0, Expansión a México"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase">Fecha</label>
                  <input 
                    type="date"
                    required
                    value={newMilestone.date}
                    onChange={(e) => setNewMilestone({...newMilestone, date: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase">Tipo</label>
                  <select 
                    value={newMilestone.type}
                    onChange={(e) => setNewMilestone({...newMilestone, type: e.target.value as any})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="launch">Lanzamiento</option>
                    <option value="expansion">Expansión</option>
                    <option value="hiring">Contratación</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase">Descripción (Opcional)</label>
                  <input 
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                    placeholder="Breve detalle del logro..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl transition-colors text-sm font-medium"
                >
                  Guardar Hito
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {milestones.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
              <Award className="w-8 h-8 text-zinc-700" />
            </div>
            <p className="text-zinc-500">Aún no has registrado hitos. ¡Celebra tus avances!</p>
          </div>
        ) : (
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
            {milestones.map((milestone, idx) => (
              <motion.div 
                key={milestone.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
              >
                {/* Dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {getIcon(milestone.type)}
                </div>
                
                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors shadow-sm">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-white">{milestone.title}</div>
                    <time className="font-mono text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {new Date(milestone.date).toLocaleDateString()}
                    </time>
                  </div>
                  <div className="text-zinc-400 text-sm">{milestone.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
