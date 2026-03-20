import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, Video, Paperclip, Loader2, Play, Square, Volume2, Layers, MessageSquare, X, Image as ImageIcon, Target, Brain, Rocket, TrendingUp, Zap, Crown, FileText, Cpu, Landmark, Sparkles, Info, Activity, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithMentor, transcribeAudio, analyzeVideo, generateSpeech, generateBoardRoomImage } from '../services/geminiService';
import { Message, UserLevel, KPI } from '../types';
import { CONCEPTS } from '../data/concepts';
import { BUSINESS_KPIS } from '../data/kpis';

import { useAppContext } from '../store/AppContext';

const parseMetrics = (content: string) => {
  const regex = /\[METRICS\]([\s\S]*?)\[\/METRICS\]/g;
  const match = regex.exec(content);
  if (!match) return [];
  
  return match[1]
    .split(',')
    .map(id => id.trim().toUpperCase())
    .filter(id => BUSINESS_KPIS[id])
    .map(id => BUSINESS_KPIS[id]);
};

const cleanContent = (content: string) => {
  return content.replace(/\[METRICS\][\s\S]*?\[\/METRICS\]/g, '').trim();
};

const highlightConcepts = (text: string) => {
  let processed = text;
  Object.values(CONCEPTS).forEach(concept => {
    processed = processed.replace(concept.regex, (match) => `[${match}](#concept-${concept.id})`);
  });
  return processed;
};

const parseMentorTags = (content: string, defaultMentor: string = 'BOARD') => {
  const regex = /\[(HORMOZI|NAVAL|PG|THIEL|ALTMAN|MUSK|BUFFETT|SARA|BOARD)\]([\s\S]*?)\[\/\1\]/g;
  const segments: { mentor: string; text: string }[] = [];
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(content)) !== null) {
    // If there's text before the first tag or between tags, add it as generic
    if (match.index > lastIndex) {
      const text = content.substring(lastIndex, match.index).trim();
      if (text) segments.push({ mentor: defaultMentor, text });
    }
    segments.push({ mentor: match[1], text: match[2].trim() });
    lastIndex = regex.lastIndex;
  }

  // Add any remaining text after the last tag
  if (lastIndex < content.length) {
    const text = content.substring(lastIndex).trim();
    if (text) segments.push({ mentor: defaultMentor, text });
  }

  // If no tags were found, treat the whole content as defaultMentor
  if (segments.length === 0) {
    segments.push({ mentor: defaultMentor, text: content });
  }

  return segments;
};

const MENTOR_UI = {
  HORMOZI: { 
    name: 'Alex Hormozi', 
    icon: Target, 
    avatar: 'https://picsum.photos/seed/hormozi/400/400', 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/20',
    theme: {
      font: 'font-sans',
      accent: 'emerald',
      gradient: 'from-blue-900/20 via-zinc-950 to-zinc-950',
      messageBg: 'bg-blue-500/5',
      messageBorder: 'border-blue-500/10'
    }
  },
  NAVAL: { 
    name: 'Naval Ravikant', 
    icon: Brain, 
    avatar: 'https://picsum.photos/seed/naval/400/400', 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/10', 
    border: 'border-purple-500/20',
    theme: {
      font: 'font-serif',
      accent: 'purple',
      gradient: 'from-purple-900/20 via-zinc-950 to-zinc-950',
      messageBg: 'bg-purple-500/5',
      messageBorder: 'border-purple-500/10'
    }
  },
  PG: { 
    name: 'Paul Graham', 
    icon: Rocket, 
    avatar: 'https://picsum.photos/seed/pg/400/400', 
    color: 'text-orange-400', 
    bg: 'bg-orange-500/10', 
    border: 'border-orange-500/20',
    theme: {
      font: 'font-sans',
      accent: 'orange',
      gradient: 'from-orange-900/20 via-zinc-950 to-zinc-950',
      messageBg: 'bg-orange-500/5',
      messageBorder: 'border-orange-500/10'
    }
  },
  THIEL: { 
    name: 'Peter Thiel', 
    icon: Crown, 
    avatar: 'https://picsum.photos/seed/thiel/400/400', 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/20',
    theme: {
      font: 'font-mono',
      accent: 'emerald',
      gradient: 'from-emerald-900/20 via-zinc-950 to-zinc-950',
      messageBg: 'bg-emerald-500/5',
      messageBorder: 'border-emerald-500/10'
    }
  },
  ALTMAN: { 
    name: 'Sam Altman', 
    icon: Zap, 
    avatar: 'https://picsum.photos/seed/altman/400/400', 
    color: 'text-red-400', 
    bg: 'bg-red-500/10', 
    border: 'border-red-500/20',
    theme: {
      font: 'font-sans',
      accent: 'red',
      gradient: 'from-red-900/20 via-zinc-950 to-zinc-950',
      messageBg: 'bg-red-500/5',
      messageBorder: 'border-red-500/10'
    }
  },
  MUSK: { 
    name: 'Elon Musk', 
    icon: Cpu, 
    avatar: 'https://picsum.photos/seed/musk/400/400', 
    color: 'text-zinc-400', 
    bg: 'bg-zinc-500/10', 
    border: 'border-zinc-500/20',
    theme: {
      font: 'font-mono',
      accent: 'zinc',
      gradient: 'from-zinc-800/20 via-zinc-950 to-zinc-950',
      messageBg: 'bg-zinc-500/5',
      messageBorder: 'border-zinc-500/10'
    }
  },
  BUFFETT: { 
    name: 'Warren Buffett', 
    icon: Landmark, 
    avatar: 'https://picsum.photos/seed/buffett/400/400', 
    color: 'text-teal-400', 
    bg: 'bg-teal-500/10', 
    border: 'border-teal-500/20',
    theme: {
      font: 'font-serif',
      accent: 'teal',
      gradient: 'from-teal-900/20 via-zinc-950 to-zinc-950',
      messageBg: 'bg-teal-500/5',
      messageBorder: 'border-teal-500/10'
    }
  },
  SARA: { 
    name: 'Sara Blakely', 
    icon: Sparkles, 
    avatar: 'https://picsum.photos/seed/sara/400/400', 
    color: 'text-rose-400', 
    bg: 'bg-rose-500/10', 
    border: 'border-rose-500/20',
    theme: {
      font: 'font-sans',
      accent: 'rose',
      gradient: 'from-rose-900/20 via-zinc-950 to-zinc-950',
      messageBg: 'bg-rose-500/5',
      messageBorder: 'border-rose-500/10'
    }
  },
  BOARD: { 
    name: 'Board Memo', 
    icon: Layers, 
    avatar: null, 
    color: 'text-zinc-300', 
    bg: 'bg-zinc-800/50', 
    border: 'border-zinc-700',
    theme: {
      font: 'font-sans',
      accent: 'emerald',
      gradient: 'from-emerald-900/10 via-zinc-950 to-zinc-950',
      messageBg: 'bg-zinc-800/20',
      messageBorder: 'border-zinc-800'
    }
  },
};

const LOADING_MESSAGES = [
  "Hormozi está analizando tu oferta...",
  "Naval está evaluando tu apalancamiento...",
  "Paul Graham está revisando tus métricas...",
  "Peter Thiel está buscando tu monopolio...",
  "Sam Altman está evaluando tu escala...",
  "Elon Musk está cuestionando tus primeros principios...",
  "Warren Buffett está analizando tu foso económico...",
  "Sara Blakely está evaluando tu resiliencia y ventas...",
  "Consolidando el Board Memo..."
];

interface ChatProps {
  isBoardSession: boolean;
  level: UserLevel;
  initialSessionId?: string | null;
}

export default function Chat({ isBoardSession, level, initialSessionId }: ChatProps) {
  const { profile, company, saveSession, sessions, loadSession, taxDocuments, employees, addKPI, kpis } = useAppContext();
  const [sessionId, setSessionId] = useState<string>(() => initialSessionId || Date.now().toString());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [isAnalyzingDocument, setIsAnalyzingDocument] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [boardRoomImage, setBoardRoomImage] = useState<string | null>(null);
  const [isGeneratingBoardImage, setIsGeneratingBoardImage] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ file: File, url: string, type: 'audio' | 'video' | 'image' | 'document' } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPitchRules, setShowPitchRules] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<string>('HORMOZI');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const initSession = async () => {
      if (initialSessionId) {
        const session = await loadSession(initialSessionId);
        if (session) {
          setMessages(session.messages);
          if (session.selectedMentor && !isBoardSession) {
            setSelectedMentor(session.selectedMentor);
          }
        }
      }
    };
    initSession();
  }, [initialSessionId, loadSession, isBoardSession]);

  useEffect(() => {
    if (messages.length > 0) {
      const title = messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? '...' : '');
      saveSession({
        id: sessionId,
        title: title || (isBoardSession ? 'Sesión de Directorio' : `Mentor: ${selectedMentor}`),
        date: new Date().toISOString(),
        messages,
        isBoardSession,
        selectedMentor: isBoardSession ? undefined : selectedMentor,
      });
    }
  }, [messages, sessionId, isBoardSession, selectedMentor, saveSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const initBoardRoom = async () => {
      if (isBoardSession && company?.onboardingData && !boardRoomImage && !isGeneratingBoardImage) {
        setIsGeneratingBoardImage(true);
        const img = await generateBoardRoomImage(company.onboardingData.data.founderName, company.onboardingData.data.companyName);
        setBoardRoomImage(img);
        setIsGeneratingBoardImage(false);
      }
    };
    initBoardRoom();
  }, [isBoardSession, company?.onboardingData, boardRoomImage, isGeneratingBoardImage]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTyping || isAnalyzingVideo || isAnalyzingDocument) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isTyping, isAnalyzingVideo]);

  const handleSend = async (text: string, directFileData?: { mimeType: string; data: string }, directFileUrl?: string, directType?: 'audio' | 'video' | 'image' | 'document') => {
    if (!text.trim() && !directFileData && !attachedFile) return;

    let fileData = directFileData;
    let fileUrl = directFileUrl;
    let type = directType;

    if (attachedFile && !directFileData) {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(attachedFile.file);
      });
      const base64String = await base64Promise;
      fileData = { mimeType: attachedFile.file.type, data: base64String };
      fileUrl = attachedFile.url;
      type = attachedFile.type as any;
      setAttachedFile(null);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      audioUrl: type === 'audio' ? fileUrl : undefined,
      videoUrl: type === 'video' ? fileUrl : undefined,
      imageUrl: type === 'image' ? fileUrl : undefined,
      fileUrl: type === 'document' ? fileUrl : undefined,
      isBoardSession,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    if (type === 'video') {
      setIsAnalyzingVideo(true);
    } else if (type === 'document') {
      setIsAnalyzingDocument(true);
    }

    try {
      let responseText = '';
      
      if (type === 'video' && fileData) {
        responseText = await analyzeVideo(fileData.data, fileData.mimeType, text || 'Analiza este video y dame un diagnóstico.', company?.onboardingData?.data);
      } else if (type === 'audio' && fileData) {
        const transcription = await transcribeAudio(fileData.data, fileData.mimeType);
        responseText = await chatWithMentor(`Audio transcrito: "${transcription}". ${text}`, level, isBoardSession, undefined, company?.onboardingData?.data, selectedMentor, taxDocuments, employees);
      } else {
        responseText = await chatWithMentor(text, level, isBoardSession, fileData, company?.onboardingData?.data, selectedMentor, taxDocuments, employees);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        isBoardSession,
        mentor: isBoardSession ? 'BOARD' : selectedMentor,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.',
          isBoardSession,
          mentor: isBoardSession ? 'BOARD' : selectedMentor,
        },
      ]);
    } finally {
      setIsTyping(false);
      setIsAnalyzingVideo(false);
      setIsAnalyzingDocument(false);
    }
  };

  const processFile = (file: File) => {
    const url = URL.createObjectURL(file);
    let type: 'audio' | 'video' | 'image' | 'document' = 'image';
    if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else if (file.type === 'application/pdf' || file.type.includes('presentation')) type = 'document';

    if (type === 'video') {
      // Auto-analyze video pitch
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        handleSend('Por favor, evalúa mi pitch en este video.', { mimeType: file.type, data: base64String }, url, 'video');
      };
      reader.readAsDataURL(file);
    } else if (type === 'document') {
      // Auto-analyze document
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        handleSend('Por favor, revisa mi deck/presentación de forma muy honesta tal como lo harían estos mentores. Dime qué falta, qué hay que corregir, qué hay que eliminar, y evalúa los colores, UX, etc.', { mimeType: file.type, data: base64String }, url, 'document');
      };
      reader.readAsDataURL(file);
    } else {
      setAttachedFile({ file, url, type });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          const fileUrl = URL.createObjectURL(audioBlob);
          handleSend('Analiza este audio.', { mimeType: 'audio/webm', data: base64String }, fileUrl, 'audio');
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const currentTheme = isBoardSession ? MENTOR_UI.BOARD.theme : MENTOR_UI[selectedMentor as keyof typeof MENTOR_UI].theme;

  const playTTS = async (text: string, messageId: string) => {
    if (playingAudioId === messageId) return;
    
    try {
      setPlayingAudioId(messageId);
      const base64Audio = await generateSpeech(text);
      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.onended = () => setPlayingAudioId(null);
        audio.play();
      } else {
        setPlayingAudioId(null);
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      setPlayingAudioId(null);
    }
  };

  const handleTrackKPI = (kpiInfo: any) => {
    const alreadyTracking = kpis.some(k => k.id === kpiInfo.id);
    if (alreadyTracking) return;

    const newKPI: KPI = {
      id: kpiInfo.id,
      name: kpiInfo.name,
      unit: kpiInfo.id === 'CONVERSION_RATE' || kpiInfo.id === 'CHURN' || kpiInfo.id === 'NPS' ? '%' : '$',
      chartType: 'line',
      data: [],
      color: '#10b981', // emerald-500
    };
    addKPI(newKPI);
  };

  return (
    <div 
      className={`flex flex-col h-full bg-zinc-950 relative overflow-hidden transition-all duration-500 ${currentTheme.font}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Dynamic Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${currentTheme.gradient} -z-10 transition-all duration-700`} />
      
      {/* Board Room Visual */}
      <AnimatePresence>
        {isBoardSession && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-zinc-900 border-b border-zinc-800 overflow-hidden relative"
          >
            <div className="aspect-video w-full max-h-[300px] relative">
              {boardRoomImage ? (
                <img 
                  src={boardRoomImage} 
                  alt="Board Room" 
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-zinc-900">
                  <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-xs text-zinc-500 font-medium animate-pulse uppercase tracking-widest">
                    Preparando Sala de Directorio...
                  </p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Sesión de Directorio Activa</h3>
                  <p className="text-xs text-zinc-400">Estás exponiendo ante el consejo asesor.</p>
                </div>
                <div className="flex -space-x-3">
                  {Object.values(MENTOR_UI).filter(m => m.avatar).map((mentor, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 overflow-hidden bg-zinc-800">
                      <img src={mentor.avatar!} alt={mentor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thinking Status Bar */}
      <AnimatePresence>
        {(isTyping || isAnalyzingVideo || isAnalyzingDocument) && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-20 px-6 py-3 bg-emerald-600/90 backdrop-blur-md text-white flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 bg-white rounded-full" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 bg-white rounded-full" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 bg-white rounded-full" 
                />
              </div>
              <span className="text-sm font-bold tracking-wide uppercase">
                {LOADING_MESSAGES[loadingMessageIndex]}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-mono opacity-80 uppercase tracking-tighter">
                Análisis en tiempo real • {isBoardSession ? 'Modo Directorio' : 'Modo Mentor'}
              </div>
              <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-full h-full bg-white"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isDragging && (
        <div className="absolute inset-0 z-50 bg-emerald-900/20 backdrop-blur-sm border-2 border-dashed border-emerald-500 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="bg-zinc-900 p-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl border border-zinc-800">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <Video className="w-10 h-10 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">Suelta tu Pitch</p>
            <div className="space-y-2 text-center">
              <p className="text-sm text-zinc-300">Reglas del Pitch:</p>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li>• Duración máxima: 2 minutos</li>
                <li>• Contenido: Problema, Solución, Modelo y Métricas</li>
                <li>• Audio claro y buena iluminación</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showPitchRules && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowPitchRules(false)}
                className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Reglas del Video Pitch</h2>
              </div>

              <div className="space-y-6 text-zinc-300">
                <div className="space-y-3">
                  <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Estructura Sugerida
                  </h3>
                  <ul className="text-sm space-y-2 ml-6 list-disc text-zinc-400">
                    <li><strong>0:00 - 0:20:</strong> El problema real que resuelves.</li>
                    <li><strong>0:20 - 0:50:</strong> Tu solución y por qué es única.</li>
                    <li><strong>0:50 - 1:20:</strong> Modelo de negocio y tracción actual.</li>
                    <li><strong>1:20 - 1:45:</strong> Equipo y por qué son los indicados.</li>
                    <li><strong>1:45 - 2:00:</strong> El "Ask" o siguiente paso.</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Duración</p>
                    <p className="text-sm font-medium">Máximo 2 minutos</p>
                  </div>
                  <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Calidad</p>
                    <p className="text-sm font-medium">Audio claro {'>'} Video 4K</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowPitchRules(false)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all mt-4"
                >
                  Entendido, ¡vamos!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-8">
            <div className="text-center space-y-4">
              {isBoardSession ? (
                <div className="flex justify-center -space-x-4 mb-6">
                  {Object.entries(MENTOR_UI).filter(([key]) => key !== 'BOARD').map(([key, ui]) => (
                    <img 
                      key={key}
                      src={ui.avatar || ''} 
                      alt={ui.name} 
                      className={`w-16 h-16 rounded-full border-4 border-zinc-950 relative z-10 hover:z-20 transition-transform hover:scale-110`} 
                      referrerPolicy="no-referrer"
                      title={ui.name}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                  <img src={MENTOR_UI[selectedMentor as keyof typeof MENTOR_UI].avatar || ''} alt="Mentor" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              
              <p className="text-center max-w-md text-lg">
                {isBoardSession 
                  ? "El directorio está reunido. Presenta tu situación actual, métricas o cuello de botella para iniciar el debate estratégico."
                  : `Hablando con ${MENTOR_UI[selectedMentor as keyof typeof MENTOR_UI].name}. ¿Qué desafío operativo o de ventas enfrentas hoy?`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {level === 'A' && (
                <>
                  <button onClick={() => handleSend('Ayúdame a estructurar una Grand Slam Offer. Mi producto actual es...')} className="text-left p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors group">
                    <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-emerald-400" /><span className="font-semibold text-zinc-300 group-hover:text-emerald-400 transition-colors">Crear Oferta Irresistible</span></div>
                    <p className="text-xs text-zinc-500">Aplica la ecuación de valor de Hormozi.</p>
                  </button>
                  <button onClick={() => handleSend('¿Cómo consigo mis primeros 10 clientes haciendo "cosas que no escalan"?')} className="text-left p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors group">
                    <div className="flex items-center gap-2 mb-2"><Rocket className="w-4 h-4 text-orange-400" /><span className="font-semibold text-zinc-300 group-hover:text-orange-400 transition-colors">Primeros Clientes</span></div>
                    <p className="text-xs text-zinc-500">Estrategias manuales de Paul Graham.</p>
                  </button>
                  <button onClick={() => handleSend('¿Cómo puedo aplicar el pensamiento de primeros principios para simplificar mi producto y reducir costos?')} className="text-left p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors group">
                    <div className="flex items-center gap-2 mb-2"><Cpu className="w-4 h-4 text-zinc-400" /><span className="font-semibold text-zinc-300 group-hover:text-zinc-400 transition-colors">Primeros Principios</span></div>
                    <p className="text-xs text-zinc-500">Ingeniería de negocios con Elon Musk.</p>
                  </button>
                </>
              )}
              {level === 'B' && (
                <>
                  <button onClick={() => handleSend('Ayúdame a estructurar mi proceso de reclutamiento para atraer talento A-Player y escalar el equipo.')} className="text-left p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors group">
                    <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-red-400" /><span className="font-semibold text-zinc-300 group-hover:text-red-400 transition-colors">Escalar Talento</span></div>
                    <p className="text-xs text-zinc-500">Estrategias de escala de Sam Altman.</p>
                  </button>
                  <button onClick={() => handleSend('¿Cuál es el "secreto" de mi industria que nadie más ve y cómo puedo construir un monopolio sobre él?')} className="text-left p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors group">
                    <div className="flex items-center gap-2 mb-2"><Crown className="w-4 h-4 text-emerald-400" /><span className="font-semibold text-zinc-300 group-hover:text-emerald-400 transition-colors">Construir Monopolio</span></div>
                    <p className="text-xs text-zinc-500">Estrategia Zero to One de Peter Thiel.</p>
                  </button>
                  <button onClick={() => handleSend('Ayúdame a estructurar mi "Core 4" de adquisición para tener un flujo predecible de leads.')} className="text-left p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors group">
                    <div className="flex items-center gap-2 mb-2"><Layers className="w-4 h-4 text-purple-400" /><span className="font-semibold text-zinc-300 group-hover:text-purple-400 transition-colors">Sistematizar Adquisición</span></div>
                    <p className="text-xs text-zinc-500">Crea canales predecibles de leads.</p>
                  </button>
                </>
              )}
              {level === 'D' && (
                <>
                  <button onClick={() => handleSend('¿Cómo aplico mayor apalancamiento (código/medios) para salir de la operación diaria de mi empresa?')} className="text-left p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors group">
                    <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-purple-400" /><span className="font-semibold text-zinc-300 group-hover:text-purple-400 transition-colors">Apalancamiento Máximo</span></div>
                    <p className="text-xs text-zinc-500">Estrategias de Naval Ravikant.</p>
                  </button>
                  <button onClick={() => handleSend('Analiza mi foso económico (moat). ¿Cómo puedo mejorar la asignación de capital para proteger mi negocio a largo plazo?')} className="text-left p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors group">
                    <div className="flex items-center gap-2 mb-2"><Landmark className="w-4 h-4 text-teal-400" /><span className="font-semibold text-zinc-300 group-hover:text-teal-400 transition-colors">Foso Económico</span></div>
                    <p className="text-xs text-zinc-500">Inversión y Moats con Warren Buffett.</p>
                  </button>
                  <button onClick={() => handleSend('Necesito estrategias avanzadas para maximizar el LTV y reducir el churn de mis clientes actuales.')} className="text-left p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors group">
                    <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-emerald-400" /><span className="font-semibold text-zinc-300 group-hover:text-emerald-400 transition-colors">Optimizar LTV</span></div>
                    <p className="text-xs text-zinc-500">Aumenta el valor de vida del cliente.</p>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-2xl ${
                  msg.role === 'user'
                    ? 'max-w-[85%] md:max-w-[70%] p-4 bg-zinc-800 text-zinc-100 rounded-br-sm ml-auto'
                    : 'w-full md:max-w-[95%] p-2 bg-transparent'
                }`}
              >
                {msg.role === 'user' ? (
                  <>
                    {msg.videoUrl && (
                      <video src={msg.videoUrl} controls className="w-full max-w-sm rounded-lg mb-3 border border-zinc-800" />
                    )}
                    {msg.audioUrl && (
                      <audio src={msg.audioUrl} controls className="w-full max-w-sm mb-3" />
                    )}
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Attached image" className="w-full max-w-sm rounded-lg mb-3 border border-zinc-800" referrerPolicy="no-referrer" />
                    )}
                    {msg.fileUrl && (
                      <div className="flex items-center gap-2 mb-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 w-fit">
                        <Paperclip className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-zinc-300">Documento adjunto</span>
                      </div>
                    )}
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        {msg.isBoardSession ? 'Board Response' : 'Mentor AI'}
                      </span>
                      <button 
                        onClick={() => playTTS(msg.content, msg.id)}
                        className={`p-1.5 rounded-md transition-colors ${playingAudioId === msg.id ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                        title="Escuchar respuesta"
                      >
                        {playingAudioId === msg.id ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>

                    {parseMentorTags(cleanContent(msg.content), msg.mentor || (msg.isBoardSession ? 'BOARD' : selectedMentor)).map((segment, idx) => {
                      const mentorKey = segment.mentor as keyof typeof MENTOR_UI;
                      const ui = MENTOR_UI[mentorKey] || MENTOR_UI.BOARD;
                      const Icon = ui.icon;
                      
                      return (
                        <div 
                          key={idx} 
                          className={`p-6 rounded-2xl border shadow-lg transition-all duration-300 ${
                            isBoardSession 
                              ? `${ui.bg} ${ui.border}` 
                              : `${currentTheme.messageBg} ${currentTheme.messageBorder}`
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            {ui.avatar ? (
                              <img src={ui.avatar} alt={ui.name} className={`w-8 h-8 rounded-full border ${ui.border}`} referrerPolicy="no-referrer" />
                            ) : (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-zinc-950/50 border ${ui.border}`}>
                                <Icon className={`w-4 h-4 ${ui.color}`} />
                              </div>
                            )}
                            <span className={`font-bold text-sm ${ui.color}`}>{ui.name}</span>
                          </div>
                          <div className="prose prose-invert prose-base max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800">
                            <ReactMarkdown
                              components={{
                                a: ({ node, href, children, ...props }) => {
                                  if (href?.startsWith('#concept-')) {
                                    const conceptId = href.replace('#concept-', '');
                                    const concept = CONCEPTS[conceptId];
                                    if (concept) {
                                      return (
                                        <span className="relative group inline-block cursor-help">
                                          <span className={`border-b-2 border-dashed ${concept.colorClass} font-semibold`}>
                                            {children}
                                          </span>
                                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-800 text-zinc-200 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                            <strong className={`block mb-1 ${concept.colorClass.split(' ')[0]}`}>{concept.term}</strong>
                                            {concept.definition}
                                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 rotate-45"></span>
                                          </span>
                                        </span>
                                      );
                                    }
                                  }
                                  return <a href={href} className="text-emerald-400 hover:underline" {...props}>{children}</a>;
                                }
                              }}
                            >
                              {highlightConcepts(segment.text)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      );
                    })}

                    {msg.role === 'assistant' && parseMetrics(msg.content).length > 0 && (
                      <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Métricas Sugeridas</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {parseMetrics(msg.content).map((kpi) => {
                            const isTracking = kpis.some(k => k.id === kpi.id);
                            return (
                              <div key={kpi.id} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-sm font-bold text-zinc-200">{kpi.name}</span>
                                  {isTracking ? (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Traking
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => handleTrackKPI(kpi)}
                                      className="text-[10px] font-bold text-zinc-500 hover:text-emerald-400 uppercase transition-colors"
                                    >
                                      + Trackear
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed">{kpi.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {msg.isBoardSession && (
                      <div className="mt-4 pt-4 border-t border-zinc-800/50 flex flex-wrap gap-2">
                        <span className="text-xs text-zinc-500 w-full mb-1">Profundizar con:</span>
                        <button
                          onClick={() => handleSend("Profundiza en tu última respuesta, pero asume ÚNICAMENTE la perspectiva de Alex Hormozi. Ignora a los demás y dame un plan hiper-táctico sobre la oferta, precios y adquisición de clientes.")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                        >
                          <Target className="w-3.5 h-3.5" />
                          Hormozi (Ventas)
                        </button>
                        <button
                          onClick={() => handleSend("Profundiza en tu última respuesta, pero asume ÚNICAMENTE la perspectiva de Naval Ravikant. Ignora a los demás y enfócate en cómo puedo aplicar apalancamiento, conocimiento específico y pensar a largo plazo en esta situación.")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-colors"
                        >
                          <Brain className="w-3.5 h-3.5" />
                          Naval (Estrategia)
                        </button>
                        <button
                          onClick={() => handleSend("Profundiza en tu última respuesta, pero asume ÚNICAMENTE la perspectiva de Paul Graham. Ignora a los demás y enfócate en el producto, en hablar con los usuarios y en hacer cosas que no escalen.")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium hover:bg-orange-500/20 transition-colors"
                        >
                          <Rocket className="w-3.5 h-3.5" />
                          Paul Graham (Producto)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm p-4 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
              <span className="text-sm text-zinc-400 font-mono">
                {isAnalyzingVideo 
                  ? 'Subiendo y analizando video con Founder Board AI...' 
                  : isAnalyzingDocument
                    ? 'Analizando documento con Founder Board AI...'
                  : isBoardSession 
                    ? LOADING_MESSAGES[loadingMessageIndex]
                    : 'Estructurando diagnóstico...'}
              </span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-zinc-950 border-t border-zinc-800 relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-end justify-center gap-2 z-10">
          {Object.entries(MENTOR_UI).filter(([key]) => key !== 'BOARD').map(([key, ui]) => (
            <button
              key={key}
              onClick={() => !isBoardSession && setSelectedMentor(key)}
              className={`relative transition-all duration-300 group flex flex-col items-center ${
                isBoardSession 
                  ? 'hover:-translate-y-2' 
                  : selectedMentor === key 
                    ? '-translate-y-2 z-10' 
                    : 'opacity-50 hover:opacity-100 hover:-translate-y-1'
              }`}
              title={isBoardSession ? ui.name : `Hablar con ${ui.name}`}
            >
              <div className="relative">
                <img
                  src={ui.avatar || ''}
                  alt={ui.name}
                  className={`w-10 h-10 rounded-full border-2 shadow-lg ${
                    isBoardSession || selectedMentor === key ? ui.border : 'border-zinc-800'
                  }`}
                  referrerPolicy="no-referrer"
                />
                {!isBoardSession && selectedMentor === key && (
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${ui.color.replace('text-', 'bg-')}`} />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {/* Pitch Button */}
          <div className="flex justify-center">
            <button
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-900/10"
            >
              <Video className="w-4 h-4" />
              Sube tu pitch de 1 minuto para ser analizado
            </button>
          </div>

          <div className="relative flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="audio/*,image/*"
            />
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="video/*"
            />
            <input
              type="file"
              ref={docInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.ppt,.pptx"
            />
            
            <div className="flex gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-800"
                title="Adjuntar imagen o audio"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={() => docInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-800"
                title="Adjuntar documento (PDF/PPT) para análisis de Deck"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2.5 rounded-xl transition-colors border ${
                  isRecording 
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-500 animate-pulse' 
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
                title={isRecording ? "Detener grabación" : "Grabar audio"}
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
              {attachedFile && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 flex items-center gap-2 w-fit">
                  {attachedFile.type === 'video' ? (
                    <Video className="w-4 h-4 text-emerald-500" />
                  ) : attachedFile.type === 'audio' ? (
                    <Mic className="w-4 h-4 text-emerald-500" />
                  ) : attachedFile.type === 'image' ? (
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Paperclip className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className="text-xs text-zinc-300 truncate max-w-[150px]">{attachedFile.file.name}</span>
                  <button 
                    onClick={() => setAttachedFile(null)}
                    className="text-zinc-500 hover:text-rose-500 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(input);
                    }
                  }}
                  placeholder={isRecording ? "Grabando audio..." : "Escribe tu situación..."}
                  className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 pr-10 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500/50 resize-none min-h-[40px] max-h-24 transition-all`}
                  rows={1}
                  disabled={isRecording}
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={(!input.trim() && !isRecording && !attachedFile) || isTyping}
                  className={`absolute right-1.5 bottom-1.5 p-1.5 rounded-lg bg-${currentTheme.accent}-600 hover:bg-${currentTheme.accent}-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-colors`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
