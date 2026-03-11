import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Brain, TrendingUp, Target, ArrowRight, Zap, Rocket, Crown, Cpu, Landmark, Layers, Sparkles } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const mentors = [
    {
      name: 'Alex Hormozi',
      role: 'Ofertas & Adquisición',
      icon: Target,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      description: '"¿Tu oferta es tan buena que la gente se sentiría estúpida al decir que no? Analizaremos tu modelo de precios, garantías y embudos de venta para maximizar tu LTV."'
    },
    {
      name: 'Naval Ravikant',
      role: 'Apalancamiento & Riqueza',
      icon: Brain,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      description: '"Buscaremos formas de desacoplar tu tiempo de tus ingresos. Evaluaremos tu uso de código, capital, medios y trabajo para crear riqueza a largo plazo."'
    },
    {
      name: 'Paul Graham (YC)',
      role: 'Producto & Escala',
      icon: Rocket,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      description: '"Haz cosas que no escalen al principio. Nos enfocaremos en hablar con tus usuarios, encontrar el Product-Market Fit y construir algo que la gente realmente ame."'
    },
    {
      name: 'Peter Thiel',
      role: 'Monopolio & Secretos',
      icon: Crown,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      description: '"La competencia es para perdedores. Buscaremos el secreto de tu industria que nadie más ve para construir una ventaja competitiva injusta y duradera."'
    },
    {
      name: 'Sam Altman',
      role: 'Ambición & Talento',
      icon: Zap,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      description: '"La velocidad de ejecución es tu mayor ventaja. Nos enfocaremos en reclutar talento A-Player y escalar tu visión de forma agresiva y sostenible."'
    },
    {
      name: 'Elon Musk',
      role: 'Ingeniería & Costos',
      icon: Cpu,
      color: 'text-zinc-400',
      bg: 'bg-zinc-500/10',
      description: '"Primeros principios: desglosa todo hasta sus verdades fundamentales. Optimizaremos tus procesos, reduciremos costos y automatizaremos lo innecesario."'
    },
    {
      name: 'Warren Buffett',
      role: 'Fosos & Capital',
      icon: Landmark,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      description: '"Protege tu castillo con un foso económico profundo. Analizaremos tu asignación de capital y la durabilidad de tu ventaja competitiva a largo plazo."'
    },
    {
      name: 'Sara Blakely',
      role: 'Ventas & Resiliencia',
      icon: Sparkles,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      description: '"No aceptes un no por respuesta. El marketing de guerrilla y la conexión emocional con tu cliente son las claves para construir una marca billonaria desde cero."'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Brain className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="font-bold text-lg tracking-tight">Founder Board AI</span>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950 -z-10" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Tu Directorio Estratégico 24/7
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
              Los mejores mentores del mundo, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                en tu bolsillo.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Founder Board AI es un directorio virtual impulsado por inteligencia artificial. 
              Obtén consejos accionables basados en los modelos mentales de titanes como Alex Hormozi, Naval Ravikant y más.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() => navigate('/onboarding')}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.7)]"
            >
              Cuéntame de tu empresa
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-24 px-6 bg-zinc-900/30 border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tu Board de Clase Mundial</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Nuestra IA ha sido entrenada con los frameworks, libros y entrevistas de los mejores emprendedores para darte respuestas precisas a tus problemas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl hover:border-emerald-500/30 transition-all hover:-translate-y-1 group"
              >
                <div className={`w-12 h-12 rounded-full ${mentor.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <mentor.icon className={`w-6 h-6 ${mentor.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{mentor.name}</h3>
                <p className="text-sm text-emerald-400 font-medium mb-4">{mentor.role}</p>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {mentor.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo funciona?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Un proceso simple diseñado para darte claridad estratégica en minutos, no en meses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            
            <div className="relative text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-500 relative z-10">
                1
              </div>
              <h3 className="text-xl font-bold">Diagnóstico Profundo</h3>
              <p className="text-zinc-400 text-sm">Responde preguntas clave sobre tu facturación, márgenes y equipo para entender tu nivel actual.</p>
            </div>

            <div className="relative text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-500 relative z-10">
                2
              </div>
              <h3 className="text-xl font-bold">Análisis de IA</h3>
              <p className="text-zinc-400 text-sm">Nuestro motor clasifica tu empresa y detecta los cuellos de botella exactos que frenan tu crecimiento.</p>
            </div>

            <div className="relative text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-500 relative z-10">
                3
              </div>
              <h3 className="text-xl font-bold">Sesión de Directorio</h3>
              <p className="text-zinc-400 text-sm">Interactúa con tus mentores virtuales mediante texto, audio o video para resolver tus problemas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/10" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Deja de adivinar. Empieza a escalar.</h2>
          <p className="text-xl text-zinc-400 mb-10">
            Únete a los fundadores que ya están tomando decisiones respaldadas por los mejores modelos mentales del mundo.
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="px-8 py-4 bg-white text-zinc-950 hover:bg-zinc-200 rounded-full font-bold text-lg transition-all"
          >
            Cuéntame de tu empresa
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-zinc-800/50 text-zinc-500 text-sm">
        <p>© {new Date().getFullYear()} Founder Board AI. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
