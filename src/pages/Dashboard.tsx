import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, Activity, BarChart3, ShieldAlert, Zap, Layers, 
  MessageSquare, Video, Mic, History, Plus, TrendingUp, Award, Target, Landmark, Users, Rocket
} from 'lucide-react';
import Chat from '../components/Chat';
import KPIDashboard from '../components/KPIDashboard';
import Milestones from '../components/Milestones';
import StrategicPlanning from '../components/StrategicPlanning';
import TaxCenter from '../components/TaxCenter';
import HumanCapital from '../components/HumanCapital';

import AcquisitionStrategy from '../components/AcquisitionStrategy';

type DashboardTab = 'chat' | 'kpis' | 'milestones' | 'strategy' | 'tax' | 'human-capital' | 'acquisition';

export default function Dashboard() {
  const { profile, company, loading, logout, kpis, milestones, sessions } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>('chat');
  const [isBoardSession, setIsBoardSession] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!loading && !profile) {
      navigate('/login');
    }
  }, [profile, loading, navigate]);

  if (loading || !profile) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNewSession = () => {
    setCurrentSessionId(null);
    setActiveTab('chat');
  };

  const getLevelInfo = () => {
    switch (company?.onboardingData?.level) {
      case 'A': return { title: 'Nivel A - Sistema de Validación y Cierre', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'B': return { title: 'Nivel B - Sistema de Escala', color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'D': return { title: 'Nivel D - Sistema de Directorio Estratégico', color: 'text-rose-500', bg: 'bg-rose-500/10' };
      default: return { title: 'Nivel Desconocido', color: 'text-zinc-500', bg: 'bg-zinc-500/10' };
    }
  };

  const info = getLevelInfo();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold tracking-tight mb-2">Founder Board AI</h2>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${info.bg} ${info.color}`}>
            {info.title}
          </div>
        </div>

        <div className="p-6 flex-1 space-y-8">
          {/* Navigation Tabs */}
          <div className="space-y-1">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'chat' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Consultoría AI
            </button>
            <button 
              onClick={() => setActiveTab('kpis')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'kpis' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              KPI Tracking
              {kpis.length > 0 && (
                <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                  {kpis.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('milestones')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'milestones' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Award className="w-4 h-4" />
              Hitos de Crecimiento
              {milestones.length > 0 && (
                <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                  {milestones.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('strategy')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'strategy' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Target className="w-4 h-4" />
              Planeación Estratégica
            </button>
            <button 
              onClick={() => setActiveTab('acquisition')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'acquisition' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Rocket className="w-4 h-4" />
              Adquisición (Core 4)
            </button>
            <button 
              onClick={() => setActiveTab('tax')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'tax' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Landmark className="w-4 h-4" />
              Centro Tributario
            </button>
            <button 
              onClick={() => setActiveTab('human-capital')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'human-capital' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Capital Humano
            </button>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Diagnóstico Actual
            </h3>
            <div className="space-y-4">
              {Object.entries(company?.onboardingData?.scores || {}).map(([key, value]) => (
                <div key={key} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-zinc-300">{key}</span>
                    <span className="text-lg font-bold text-white">{value as number}</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4" />
                Historial de Chat
              </h3>
              <button 
                onClick={handleNewSession}
                className="p-1 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
                title="Nueva Sesión"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {sessions.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No hay sesiones guardadas.</p>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => {
                      setCurrentSessionId(session.id);
                      setIsBoardSession(session.isBoardSession);
                      setActiveTab('chat');
                    }}
                    className={`w-full text-left p-3 rounded-lg text-xs transition-all border ${
                      currentSessionId === session.id && activeTab === 'chat'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-medium truncate mb-1">{session.title}</div>
                    <div className="flex justify-between items-center opacity-60">
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                      <span className="uppercase text-[10px]">{session.isBoardSession ? 'Board' : 'Mentor'}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 space-y-4">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-400 transition-colors w-full"
          >
            <ShieldAlert className="w-4 h-4" />
            Panel Admin
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen bg-zinc-950 relative">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            {activeTab === 'chat' ? (
              <>
                <button
                  onClick={() => {
                    setIsBoardSession(false);
                    setCurrentSessionId(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    !isBoardSession && !currentSessionId ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Modo Mentor (1:1)
                </button>
                <button
                  onClick={() => {
                    setIsBoardSession(true);
                    setCurrentSessionId(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isBoardSession && !currentSessionId ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Sesión de Directorio
                </button>
                {currentSessionId && (
                  <div className="h-6 w-px bg-zinc-800 mx-2" />
                )}
                {currentSessionId && (
                  <div className="text-sm font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Sesión Cargada
                  </div>
                )}
              </>
            ) : (
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                {activeTab === 'kpis' ? 'KPI Tracking System' : 
                 activeTab === 'milestones' ? 'Growth Milestones' : 
                 activeTab === 'tax' ? 'Centro Tributario SII' :
                 activeTab === 'human-capital' ? 'Gestión de Capital Humano' :
                 activeTab === 'acquisition' ? 'Estrategia de Adquisición Core 4' :
                 'Strategic Planning'}
              </h2>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <Chat 
                  key={currentSessionId || 'new'} 
                  isBoardSession={isBoardSession} 
                  level={company?.onboardingData?.level!} 
                  initialSessionId={currentSessionId}
                />
              </motion.div>
            )}
            {activeTab === 'kpis' && (
              <motion.div 
                key="kpis"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <KPIDashboard />
              </motion.div>
            )}
            {activeTab === 'milestones' && (
              <motion.div 
                key="milestones"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <Milestones />
              </motion.div>
            )}
            {activeTab === 'strategy' && (
              <motion.div 
                key="strategy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <StrategicPlanning />
              </motion.div>
            )}
            {activeTab === 'tax' && (
              <motion.div 
                key="tax"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <TaxCenter />
              </motion.div>
            )}
            {activeTab === 'human-capital' && (
              <motion.div 
                key="human-capital"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <HumanCapital />
              </motion.div>
            )}
            {activeTab === 'acquisition' && (
              <motion.div 
                key="acquisition"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <AcquisitionStrategy />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
