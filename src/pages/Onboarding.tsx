import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { classifyUser } from '../services/geminiService';
import { OnboardingData } from '../types';
import { motion } from 'motion/react';
import { Loader2, TrendingUp, Users, Target, DollarSign, Briefcase, Globe, Building2 } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUserProfile } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    founderName: '',
    founderEmail: '',
    founderPhone: '',
    password: '',
    companyName: '',
    companyRut: '',
    stage: 'Ideación',
    revenue: '',
    margin: '',
    customers: '',
    acquisition: '',
    team: '',
    goal: '',
    industry: '',
    countries: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await classifyUser(formData);
      setUserProfile({
        level: result.level,
        data: formData,
        scores: result.scores,
        metrics: {},
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error during classification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl my-8"
      >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Founder Board AI</h1>
            <p className="text-zinc-400">Diagnóstico inicial para asignar tu nivel operativo.</p>
            <p className="mt-4 text-sm text-zinc-500">
              ¿Ya tienes una cuenta? {' '}
              <button 
                type="button"
                onClick={() => navigate('/login')}
                className="text-emerald-500 hover:text-emerald-400 font-medium"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Founder Info */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                Nombre del Fundador
              </label>
              <input
                required
                name="founderName"
                type="text"
                placeholder="Ej: Juan Pérez"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                Email
              </label>
              <input
                required
                name="founderEmail"
                type="email"
                placeholder="ejemplo@correo.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                Crea una Contraseña
              </label>
              <input
                required
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                Teléfono
              </label>
              <input
                required
                name="founderPhone"
                type="text"
                placeholder="+56 9 1234 5678"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            {/* Company Info */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500" />
                Nombre de la Empresa
              </label>
              <input
                required
                name="companyName"
                type="text"
                placeholder="Ej: Tech Solutions SpA"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500" />
                RUT de la Empresa
              </label>
              <input
                required
                name="companyRut"
                type="text"
                placeholder="Ej: 76.123.456-7"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                Etapa del Negocio
              </label>
              <select
                name="stage"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              >
                <option value="Ideación">Ideación</option>
                <option value="Validación">Validación</option>
                <option value="Crecimiento">Crecimiento</option>
                <option value="Escala">Escala</option>
                <option value="Consolidación">Consolidación</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500" />
                Industria / Nicho
              </label>
              <input
                required
                name="industry"
                type="text"
                placeholder="Ej: SaaS B2B, E-commerce"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                Países Objetivo
              </label>
              <input
                required
                name="countries"
                type="text"
                placeholder="Ej: Chile, México"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Facturación Mensual (CLP)
              </label>
              <input
                required
                name="revenue"
                type="text"
                placeholder="Ej: 5.000.000"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Margen Estimado (%)
              </label>
              <input
                required
                name="margin"
                type="text"
                placeholder="Ej: 30%"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                Clientes Activos
              </label>
              <input
                required
                name="customers"
                type="text"
                placeholder="Ej: 50"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                Canal de Adquisición
              </label>
              <input
                required
                name="acquisition"
                type="text"
                placeholder="Ej: Ads, Referidos"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-500" />
                Equipo Actual
              </label>
              <input
                required
                name="team"
                type="text"
                placeholder="Ej: Solo yo, 3 personas"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                Meta a 12 Meses
              </label>
              <input
                required
                name="goal"
                type="text"
                placeholder="Ej: Facturar 10M/mes con 40% margen"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analizando Diagnóstico...
              </>
            ) : (
              'Iniciar Diagnóstico'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
