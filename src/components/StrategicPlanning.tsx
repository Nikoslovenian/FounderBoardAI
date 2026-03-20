import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { motion } from 'motion/react';
import { Target, Zap, TrendingUp, Shield, Rocket, Brain, Layers } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";

export default function StrategicPlanning() {
  const { company } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  const generatePlan = async () => {
    if (!company?.onboardingData) return;
    setLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = 'gemini-3.1-pro-preview';
      
      const prompt = `
        Como un experto estratega de negocios y mentor de startups, ayuda a este fundador a definir su plan estratégico.
        
        DATOS DEL FUNDADOR:
        - Nombre: ${company.onboardingData.data.founderName}
        - Empresa: ${company.onboardingData.data.companyName}
        - Industria: ${company.onboardingData.data.industry}
        - Etapa: ${company.onboardingData.data.stage}
        - Ingresos actuales: ${company.onboardingData.data.revenue}
        - Meta a 12 meses: ${company.onboardingData.data.goal}
        - Diagnóstico (Scores): ${JSON.stringify(company.onboardingData.scores)}
        
        TAREAS:
        1. Define OKRs (Objectives and Key Results) trimestrales utilizando la metodología SMART.
        2. Aplica la perspectiva de Sam Altman sobre escala y velocidad de ejecución.
        3. Propón una estrategia de "Apalancamiento sin Permiso" (Código y Medios) según Naval Ravikant para desacoplar el tiempo de los ingresos.
        
        Formato: Markdown profesional con secciones claras.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      setPlan(response.text);
    } catch (error) {
      console.error('Error generating plan:', error);
      setPlan("Error al generar el plan estratégico. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full custom-scrollbar">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Planeación Estratégica</h2>
          <p className="text-zinc-400 text-sm">OKRs, Escala y Apalancamiento.</p>
        </div>
        {!plan && !loading && (
          <button 
            onClick={generatePlan}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl transition-colors text-sm font-medium shadow-lg shadow-emerald-900/20"
          >
            <Brain className="w-4 h-4" />
            Generar Plan Estratégico
          </button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <Brain className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-zinc-400 animate-pulse">Consultando con Sam Altman y Naval Ravikant...</p>
        </div>
      )}

      {plan && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-sm"
        >
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{plan}</ReactMarkdown>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-800 flex justify-between items-center">
            <p className="text-xs text-zinc-500 italic">Este plan fue generado por AI basado en tu perfil actual.</p>
            <button 
              onClick={() => setPlan(null)}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Regenerar Plan
            </button>
          </div>
        </motion.div>
      )}

      {!plan && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-bold text-white">Metodología SMART</h3>
            <p className="text-sm text-zinc-400">Objetivos Específicos, Medibles, Alcanzables, Relevantes y con Tiempo definido.</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-bold text-white">Escala Altman</h3>
            <p className="text-sm text-zinc-400">Enfoque en velocidad de ejecución y sistemas que permiten crecimiento exponencial.</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-bold text-white">Apalancamiento Naval</h3>
            <p className="text-sm text-zinc-400">Uso de código y medios para crear riqueza mientras duermes, sin necesidad de permiso.</p>
          </div>
        </div>
      )}
    </div>
  );
}
