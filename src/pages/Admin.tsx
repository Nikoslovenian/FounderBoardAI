import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { motion } from 'motion/react';
import { 
  Users, Building2, MessageSquare, ArrowLeft, Search, 
  Filter, Download, ExternalLink, ShieldCheck, Calendar,
  TrendingUp, Target, Zap
} from 'lucide-react';

export default function Admin() {
  const { userProfile, sessions } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock users for demo purposes
  const mockUsers = [
    {
      id: '1',
      founderName: 'Nik',
      email: 'nikogenetic@gmail.com',
      industry: 'Tech/SaaS',
      revenue: '10M CLP/mes',
      level: 'B',
      sessionsCount: sessions.length,
      lastActive: 'Hoy'
    },
    {
      id: '2',
      founderName: 'Javiera',
      email: 'javiera@startup.cl',
      industry: 'E-commerce',
      revenue: '2M CLP/mes',
      level: 'A',
      sessionsCount: 3,
      lastActive: 'Ayer'
    },
    {
      id: '3',
      founderName: 'Roberto',
      email: 'roberto@empresa.com',
      industry: 'Servicios B2B',
      revenue: '120M CLP/año',
      level: 'D',
      sessionsCount: 12,
      lastActive: 'Hace 3 días'
    }
  ];

  const filteredUsers = mockUsers.filter(user => 
    user.founderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Panel de Administración
            </h1>
            <p className="text-zinc-400 mt-2">Gestiona usuarios, empresas y sesiones estratégicas.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Buscar fundador o industria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-64"
              />
            </div>
            <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-bold text-zinc-300">Total Usuarios</h3>
            </div>
            <p className="text-4xl font-bold">1,248</p>
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% este mes
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-bold text-zinc-300">Empresas Nivel D</h3>
            </div>
            <p className="text-4xl font-bold">84</p>
            <p className="text-xs text-zinc-500 mt-2">Facturando +100M CLP/año</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="font-bold text-zinc-300">Sesiones Totales</h3>
            </div>
            <p className="text-4xl font-bold">5,612</p>
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              <Zap className="w-3 h-3" /> 142 activas hoy
            </p>
          </div>

          {/* Users Table */}
          <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Usuarios Recientes</h2>
              <span className="text-xs text-zinc-500 font-mono">Mostrando {filteredUsers.length} resultados</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-950 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Fundador</th>
                    <th className="px-6 py-4 font-semibold">Empresa / Industria</th>
                    <th className="px-6 py-4 font-semibold">Nivel</th>
                    <th className="px-6 py-4 font-semibold">Facturación</th>
                    <th className="px-6 py-4 font-semibold">Sesiones</th>
                    <th className="px-6 py-4 font-semibold">Última Actividad</th>
                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-200">{user.founderName}</div>
                        <div className="text-xs text-zinc-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-300">{user.industry}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                          user.level === 'D' ? 'bg-rose-500/10 text-rose-500' :
                          user.level === 'B' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          NIVEL {user.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {user.revenue}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {user.sessionsCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {user.lastActive}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-emerald-400 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
