import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { motion } from 'motion/react';
import { Brain, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { setUserProfile } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const storedProfile = localStorage.getItem('founder_board_profile');
    if (!storedProfile) {
      setError('No se encontró ninguna cuenta. Por favor, regístrate primero.');
      return;
    }

    try {
      const profile = JSON.parse(storedProfile);
      if (profile.data.founderEmail === email && profile.data.password === password) {
        setUserProfile(profile);
        navigate('/dashboard');
      } else {
        setError('Email o contraseña incorrectos.');
      }
    } catch (e) {
      setError('Error al procesar los datos de la cuenta.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mx-auto mb-4">
            <Brain className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Bienvenido de vuelta</h1>
          <p className="text-zinc-400 text-sm">Ingresa tus credenciales para acceder a tu directorio.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-500" />
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              Contraseña
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            Ingresar al Directorio
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="text-center pt-4">
            <p className="text-sm text-zinc-500">
              ¿No tienes una cuenta? {' '}
              <button 
                type="button"
                onClick={() => navigate('/onboarding')}
                className="text-emerald-500 hover:text-emerald-400 font-medium"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
