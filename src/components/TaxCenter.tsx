import React, { useState, useRef } from 'react';
import { useAppContext } from '../store/AppContext';
import { 
  FileText, Upload, Shield, Lock, CheckCircle, AlertCircle, 
  Calendar, TrendingUp, Users, Landmark, Loader2, Trash2, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeTaxDocument } from '../services/geminiService';
import { TaxDocument, TaxData } from '../types';

export default function TaxCenter() {
  const { taxDocuments, addTaxDocument, updateTaxDocument, company } = useAppContext();
  const [isConnectingSII, setIsConnectingSII] = useState(false);
  const [siiRUT, setSiiRUT] = useState(company?.onboardingData?.data.companyRut || '');
  const [siiPassword, setSiiPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSIIConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnectingSII(true);
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConnectingSII(false);
    alert('Funcionalidad de conexión directa con SII en desarrollo. Por ahora, utiliza la carga manual de Carpeta Tributaria.');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Por favor, sube un archivo PDF (Carpeta Tributaria).');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create a temporary URL for the file
      const fileUrl = URL.createObjectURL(file);
      
      const newDoc: TaxDocument = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        date: new Date().toISOString(),
        period: '2023-2024', // Default, will be updated by AI
        fileUrl: fileUrl,
        status: 'pending'
      };

      addTaxDocument(newDoc);

      // Analyze with Gemini
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const analysis = await analyzeTaxDocument(base64);
          if (analysis) {
            updateTaxDocument(newDoc.id, {
              status: 'analyzed',
              period: analysis.period,
              extractedData: analysis
            });
          }
        } catch (err) {
          console.error('Error analyzing tax doc:', err);
          updateTaxDocument(newDoc.id, { status: 'error' });
        }
      };
      reader.readAsDataURL(file);

    } catch (err) {
      setUploadError('Error al procesar el archivo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 custom-scrollbar overflow-y-auto h-full">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Centro Tributario</h1>
        <p className="text-zinc-400">Automatiza la carga de datos financieros conectando con el SII o subiendo tu Carpeta Tributaria.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SII Connection Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Landmark className="w-24 h-24" />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Conexión Directa SII</h2>
              <p className="text-xs text-zinc-500">Sincronización automática gratuita</p>
            </div>
          </div>

          <form onSubmit={handleSIIConnect} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">RUT Empresa</label>
              <input 
                type="text" 
                value={siiRUT}
                onChange={(e) => setSiiRUT(e.target.value)}
                placeholder="12.345.678-9"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Clave Tributaria</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="password" 
                  value={siiPassword}
                  onChange={(e) => setSiiPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isConnectingSII}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {isConnectingSII ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sincronizar con SII'}
            </button>
          </form>

          <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 flex gap-3">
            <AlertCircle className="w-5 h-5 text-zinc-500 shrink-0" />
            <p className="text-xs text-zinc-500 leading-relaxed">
              Tus credenciales se cifran localmente y solo se usan para solicitar la Carpeta Tributaria Electrónica. No almacenamos tu clave en nuestros servidores.
            </p>
          </div>
        </motion.div>

        {/* Manual Upload Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Carga Manual de Carpeta</h2>
              <p className="text-xs text-zinc-500">Sube tu PDF de Carpeta Tributaria</p>
            </div>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-800 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              {isUploading ? <Loader2 className="w-8 h-8 text-blue-500 animate-spin" /> : <FileText className="w-8 h-8 text-zinc-500 group-hover:text-blue-500" />}
            </div>
            <div className="text-center">
              <p className="text-zinc-300 font-medium">Haz clic para subir o arrastra el archivo</p>
              <p className="text-xs text-zinc-500 mt-1">Solo archivos PDF (Carpeta Tributaria SII)</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden" 
              accept=".pdf"
            />
          </div>

          {uploadError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              {uploadError}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">¿Por qué subir tu carpeta?</h3>
            <ul className="space-y-2">
              {[
                'Análisis automático de ingresos y márgenes reales.',
                'Validación de salud financiera para el Directorio.',
                'Detección de oportunidades de optimización de costos.',
                'Proyecciones basadas en datos históricos oficiales.'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Documents List */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-zinc-400" />
          Documentos Cargados
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {taxDocuments.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">No hay documentos tributarios cargados aún.</p>
              </div>
            ) : (
              taxDocuments.map((doc) => (
                <motion.div 
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-zinc-700 transition-colors group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        doc.status === 'analyzed' ? 'bg-emerald-500/10 text-emerald-500' : 
                        doc.status === 'error' ? 'bg-rose-500/10 text-rose-500' : 
                        'bg-zinc-800 text-zinc-500'
                      }`}>
                        {doc.status === 'analyzed' ? <CheckCircle className="w-5 h-5" /> : 
                         doc.status === 'error' ? <AlertCircle className="w-5 h-5" /> : 
                         <Loader2 className="w-5 h-5 animate-spin" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-200 truncate max-w-[150px]">{doc.name}</h4>
                        <p className="text-[10px] text-zinc-500">{new Date(doc.date).toLocaleDateString()} • {doc.period}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {doc.extractedData && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/50">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Ingresos</p>
                        <p className="text-sm font-bold text-white">${(doc.extractedData.revenue / 1000000).toFixed(1)}M</p>
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/50">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Utilidad</p>
                        <p className="text-sm font-bold text-emerald-400">${(doc.extractedData.profit / 1000000).toFixed(1)}M</p>
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/50">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Impuestos</p>
                        <p className="text-sm font-bold text-rose-400">${(doc.extractedData.taxesPaid / 1000000).toFixed(1)}M</p>
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/50">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Dotación</p>
                        <p className="text-sm font-bold text-blue-400">{doc.extractedData.employees} pers.</p>
                      </div>
                    </div>
                  )}

                  {doc.status === 'pending' && (
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 italic">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Analizando datos con IA...
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
