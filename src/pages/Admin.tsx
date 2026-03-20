import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Building2, MessageSquare, ArrowLeft, Search, 
  Filter, Download, ExternalLink, ShieldCheck, Calendar,
  TrendingUp, Target, Zap, Mail
} from 'lucide-react';

export default function Admin() {
  const { portfolio, invitations, createCompany, sendInvitation, role } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyRut, setNewCompanyRut] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCompany(newCompanyName, newCompanyRut);
      setNewCompanyName('');
      setNewCompanyRut('');
      setIsCreatingCompany(false);
    } catch (err) {
      console.error('Error creating company:', err);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendInvitation(inviteEmail, selectedCompanyId);
      setInviteEmail('');
      setSelectedCompanyId('');
    } catch (err) {
      console.error('Error sending invitation:', err);
    }
  };

  const filteredPortfolio = portfolio.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.onboardingData?.data.founderEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </button>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
              {role === 'admin' ? 'Panel de Administración' : 'Mi Portafolio (KAM)'}
            </h1>
            <p className="text-zinc-400 mt-2">Gestiona empresas, invitaciones y sesiones estratégicas.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Buscar empresa, RUT o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-64"
              />
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-sm text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activos</option>
              <option value="pending">Pendientes</option>
              <option value="archived">Archivados</option>
            </select>

            <button 
              onClick={() => setIsCreatingCompany(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Nueva Empresa
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Stats Cards */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-bold text-zinc-300">Total Empresas</h3>
            </div>
            <p className="text-4xl font-bold">{portfolio.length}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-bold text-zinc-300">Invitaciones Enviadas</h3>
            </div>
            <p className="text-4xl font-bold">{invitations.length}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="font-bold text-zinc-300">Empresas Activas</h3>
            </div>
            <p className="text-4xl font-bold">{portfolio.filter(c => c.status === 'active').length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Companies Table */}
          <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Portafolio de Empresas</h2>
              <span className="text-xs text-zinc-500 font-mono">Mostrando {filteredPortfolio.length} resultados</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-950 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Empresa / RUT</th>
                    <th className="px-6 py-4 font-semibold">Fundador</th>
                    <th className="px-6 py-4 font-semibold">Estado</th>
                    <th className="px-6 py-4 font-semibold">Fecha Creación</th>
                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredPortfolio.map((company) => (
                    <tr key={company.id} className="hover:bg-zinc-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-200">{company.name}</div>
                        <div className="text-xs text-zinc-500">{company.rut}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-300">{company.onboardingData?.data.founderName || 'Sin asignar'}</div>
                        <div className="text-xs text-zinc-500">{company.onboardingData?.data.founderEmail || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          company.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                          company.status === 'pending' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-zinc-500/10 text-zinc-500'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedUser(company)}
                          className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-emerald-400 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPortfolio.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                        No se encontraron empresas en el portafolio.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invitations Panel */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-500" />
              Invitaciones
            </h2>
            
            <form onSubmit={handleSendInvitation} className="space-y-4 mb-8">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-widest">Email Invitado</label>
                <input 
                  type="email" 
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@empresa.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-widest">Empresa</label>
                <select 
                  required
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">Seleccionar empresa...</option>
                  {portfolio.filter(c => c.status === 'pending').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-zinc-800 hover:bg-emerald-600 text-white py-2 rounded-xl text-sm font-bold transition-all"
              >
                Enviar Invitación
              </button>
            </form>

            <div className="space-y-4">
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Recientes</h3>
              {invitations.map(inv => (
                <div key={inv.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-zinc-200 truncate pr-2">{inv.email}</p>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      inv.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-zinc-500">Código: <span className="text-zinc-300 font-mono">{inv.code}</span></p>
                    <p className="text-[10px] text-zinc-600">{new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {invitations.length === 0 && (
                <p className="text-sm text-zinc-600 text-center py-4 italic">No hay invitaciones enviadas.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Company Modal */}
      <AnimatePresence>
        {isCreatingCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreatingCompany(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-emerald-500" />
                Nueva Empresa
              </h2>
              <form onSubmit={handleCreateCompany} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Nombre de la Empresa</label>
                  <input 
                    required
                    type="text"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="Ej: Tech Solutions SpA"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">RUT de la Empresa</label>
                  <input 
                    required
                    type="text"
                    value={newCompanyRut}
                    onChange={(e) => setNewCompanyRut(e.target.value)}
                    placeholder="Ej: 76.123.456-7"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsCreatingCompany(false)}
                    className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all"
                  >
                    Crear Empresa
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Company Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
                    <p className="text-zinc-400 text-sm">{selectedUser.rut}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-all"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {selectedUser.onboardingData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Company Details */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-500" />
                        Detalles de la Empresa
                      </h3>
                      <div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-800 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Fundador</p>
                            <p className="text-sm text-zinc-200">{selectedUser.onboardingData.data.founderName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Email</p>
                            <p className="text-sm text-zinc-200">{selectedUser.onboardingData.data.founderEmail}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Etapa</p>
                            <p className="text-sm text-zinc-200">{selectedUser.onboardingData.data.stage}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Industria</p>
                            <p className="text-sm text-zinc-200">{selectedUser.onboardingData.data.industry}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Facturación</p>
                            <p className="text-sm text-emerald-400 font-semibold">{selectedUser.onboardingData.data.revenue}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Margen</p>
                            <p className="text-sm text-zinc-200">{selectedUser.onboardingData.data.margin}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Clientes</p>
                            <p className="text-sm text-zinc-200">{selectedUser.onboardingData.data.customers}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Equipo</p>
                            <p className="text-sm text-zinc-200">{selectedUser.onboardingData.data.team}</p>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-zinc-800">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Canal de Adquisición</p>
                          <p className="text-sm text-zinc-200">{selectedUser.onboardingData.data.acquisition}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Meta 12 Meses</p>
                          <p className="text-sm text-emerald-400 italic">"{selectedUser.onboardingData.data.goal}"</p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Summary */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        Resumen de Actividad
                      </h3>
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          Esta empresa se encuentra en estado <span className="text-emerald-500 font-bold uppercase">{selectedUser.status}</span>. 
                          Fue creada el {new Date(selectedUser.createdAt).toLocaleDateString()}.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-zinc-500" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-300">Sin datos de onboarding</h3>
                    <p className="text-zinc-500 max-w-xs mt-2">
                      Esta empresa aún no ha completado su proceso de registro inicial.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-4">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-2 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all"
                >
                  Cerrar
                </button>
                <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20">
                  Exportar Reporte
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
