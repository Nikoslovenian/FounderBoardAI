import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { motion } from 'motion/react';
import { Rocket, Target, Users, Megaphone, Zap, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";

export default function AcquisitionStrategy() {
  const { company } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  const generateAcquisitionPlan = async () => {
    if (!company?.onboardingData) return;
    setLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Como un experto en crecimiento (Growth Expert) siguiendo la metodología de Alex Hormozi (Core 4), propón un plan de acción de adquisición para esta empresa.
        
        DATOS DE LA EMPRESA:
        - Nombre: ${company.onboardingData.data.companyName}
        - Industria: ${company.onboardingData.data.industry}
        - Canal de Adquisición Actual: ${company.onboardingData.data.acquisition}
        - Ingresos: ${company.onboardingData.data.revenue}
        - Clientes actuales: ${company.onboardingData.data.customers}
        - Meta: ${company.onboardingData.data.goal}
        
        METODOLOGÍA CORE 4 DE HORMOZI:
        1. Warm Outreach (Contactos conocidos)
        2. Cold Outreach (Contactos desconocidos)
        3. Content (Contenido orgánico)
        4. Paid Ads (Publicidad pagada)
        
        TAREAS:
        - Analiza el canal actual y por qué está funcionando o fallando.
        - Propón acciones específicas para CADA UNO de los Core 4 adaptadas a su industria y etapa.
        - Define una "Grand Slam Offer" (Oferta Irresistible) para mejorar la conversión.
        - Establece métricas de éxito (KPIs) para este plan.
        
        Responde en formato Markdown estructurado y profesional en español.`,
      });

      const response = await model;
      setPlan(response.text);
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company?.onboardingData && !plan) {
      generateAcquisitionPlan();
    }
  }, [company]);

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <header className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Estrategia de Adquisición (Core 4)</h2>
            <p className="text-zinc-400">Basado en la metodología de Alex Hormozi para escalar tu base de clientes.</p>
          </div>
          <button
            onClick={generateAcquisitionPlan}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {plan ? 'Regenerar Plan' : 'Generar Plan'}
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-zinc-400 animate-pulse">Analizando tus métricas y diseñando tu estrategia Core 4...</p>
          </div>
        ) : plan ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-8"
          >
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
              <div className="prose prose-invert prose-emerald max-w-none">
                <ReactMarkdown>{plan}</ReactMarkdown>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Warm Outreach', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { title: 'Cold Outreach', icon: Target, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                { title: 'Content', icon: Megaphone, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                { title: 'Paid Ads', icon: Rocket, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              ].map((item, idx) => (
                <div key={idx} className={`p-6 rounded-2xl border border-zinc-800 ${item.bg}`}>
                  <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
                  <h4 className="font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-zinc-400">Pilar {idx + 1} del Core 4</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <Rocket className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-bold text-white mb-2">Diseña tu Máquina de Adquisición</h3>
              <p className="text-zinc-400 mb-8">
                Utilizaremos tus datos actuales para proponer un plan de acción basado en Warm Outreach, Cold Outreach, Contenido y Ads.
              </p>
              <button
                onClick={generateAcquisitionPlan}
                className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all mx-auto"
              >
                <Zap className="w-5 h-5" />
                Comenzar Análisis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
