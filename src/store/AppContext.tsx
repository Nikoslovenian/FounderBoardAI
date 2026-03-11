import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { UserProfile, UserLevel, OnboardingData, Message, KPI, Milestone } from '../types';

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
  isBoardSession: boolean;
  selectedMentor?: string;
}

interface AppContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  updateMetrics: (metrics: Record<string, string | number>) => void;
  sessions: ChatSession[];
  saveSession: (session: ChatSession) => void;
  loadSession: (id: string) => ChatSession | undefined;
  kpis: KPI[];
  addKPI: (kpi: KPI) => void;
  updateKPIData: (kpiId: string, dataPoint: { date: string; value: number }) => void;
  updateKPITarget: (kpiId: string, target: number) => void;
  milestones: Milestone[];
  addMilestone: (milestone: Milestone) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    const storedProfile = localStorage.getItem('founder_board_profile');
    if (storedProfile) {
      try {
        setUserProfile(JSON.parse(storedProfile));
      } catch (e) {
        console.error('Failed to parse profile', e);
      }
    }

    const storedSessions = localStorage.getItem('founder_board_sessions');
    if (storedSessions) {
      try {
        setSessions(JSON.parse(storedSessions));
      } catch (e) {
        console.error('Failed to parse sessions', e);
      }
    }

    const storedKPIs = localStorage.getItem('founder_board_kpis');
    if (storedKPIs) {
      try {
        setKpis(JSON.parse(storedKPIs));
      } catch (e) {
        console.error('Failed to parse KPIs', e);
      }
    }

    const storedMilestones = localStorage.getItem('founder_board_milestones');
    if (storedMilestones) {
      try {
        setMilestones(JSON.parse(storedMilestones));
      } catch (e) {
        console.error('Failed to parse milestones', e);
      }
    }
  }, []);

  const handleSetUserProfile = useCallback((profile: UserProfile | null) => {
    setUserProfile(profile);
    if (profile) {
      localStorage.setItem('founder_board_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('founder_board_profile');
    }
  }, []);

  const saveSession = useCallback((session: ChatSession) => {
    setSessions((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === session.id);
      let newSessions;
      if (existingIndex >= 0) {
        newSessions = [...prev];
        newSessions[existingIndex] = session;
      } else {
        newSessions = [session, ...prev];
      }
      localStorage.setItem('founder_board_sessions', JSON.stringify(newSessions));
      return newSessions;
    });
  }, []);

  const sessionsRef = React.useRef(sessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  const loadSession = useCallback((id: string) => {
    return sessionsRef.current.find((s) => s.id === id);
  }, []);

  const updateMetrics = useCallback((metrics: Record<string, string | number>) => {
    setUserProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        metrics: { ...prev.metrics, ...metrics },
      };
    });
  }, []);

  const addKPI = useCallback((kpi: KPI) => {
    setKpis((prev) => {
      const newKpis = [...prev, kpi];
      localStorage.setItem('founder_board_kpis', JSON.stringify(newKpis));
      return newKpis;
    });
  }, []);

  const updateKPIData = useCallback((kpiId: string, dataPoint: { date: string; value: number }) => {
    setKpis((prev) => {
      const newKpis = prev.map((kpi) => {
        if (kpi.id === kpiId) {
          return {
            ...kpi,
            data: [...kpi.data, dataPoint].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          };
        }
        return kpi;
      });
      localStorage.setItem('founder_board_kpis', JSON.stringify(newKpis));
      return newKpis;
    });
  }, []);

  const updateKPITarget = useCallback((kpiId: string, target: number) => {
    setKpis((prev) => {
      const newKpis = prev.map((kpi) => {
        if (kpi.id === kpiId) {
          return { ...kpi, target };
        }
        return kpi;
      });
      localStorage.setItem('founder_board_kpis', JSON.stringify(newKpis));
      return newKpis;
    });
  }, []);

  const addMilestone = useCallback((milestone: Milestone) => {
    setMilestones((prev) => {
      const newMilestones = [...prev, milestone].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      localStorage.setItem('founder_board_milestones', JSON.stringify(newMilestones));
      return newMilestones;
    });
  }, []);

  return (
    <AppContext.Provider value={{ 
      userProfile, 
      setUserProfile: handleSetUserProfile, 
      updateMetrics, 
      sessions, 
      saveSession, 
      loadSession,
      kpis,
      addKPI,
      updateKPIData,
      updateKPITarget,
      milestones,
      addMilestone
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
