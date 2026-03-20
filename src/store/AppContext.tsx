import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { 
  UserProfile, UserRole, Company, Invitation, 
  UserLevel, OnboardingData, Message, KPI, 
  Milestone, TaxDocument, TaxData, Employee 
} from '../types';

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
  isBoardSession: boolean;
  selectedMentor?: string;
}

interface AppContextType {
  user: User | null;
  profile: UserProfile | null;
  company: Company | null;
  loading: boolean;
  role: UserRole | null;
  
  // Portfolio management (for KAM/Admin)
  portfolio: Company[];
  invitations: Invitation[];
  
  // Company specific data
  sessions: ChatSession[];
  kpis: KPI[];
  milestones: Milestone[];
  taxDocuments: TaxDocument[];
  employees: Employee[];
  
  // Actions
  login: (email: string, pass: string) => Promise<void>;
  register: (data: OnboardingData) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<ChatSession | null>;
  saveSession: (session: ChatSession) => Promise<void>;
  addKPI: (kpi: KPI) => Promise<void>;
  updateKPIData: (kpiId: string, dataPoint: { date: string; value: number }) => Promise<void>;
  updateKPITarget: (kpiId: string, target: number) => Promise<void>;
  addMilestone: (milestone: Milestone) => Promise<void>;
  addTaxDocument: (doc: TaxDocument) => Promise<void>;
  updateTaxDocument: (id: string, updates: Partial<TaxDocument>) => Promise<void>;
  addEmployee: (employee: Employee) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  
  // KAM Actions
  createCompany: (name: string, rut: string) => Promise<string>;
  sendInvitation: (email: string, companyId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [portfolio, setPortfolio] = useState<Company[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [taxDocuments, setTaxDocuments] = useState<TaxDocument[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch profile
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setProfile(userData);
          
          // If company role, fetch company
          if (userData.role === 'company' && userData.companyId) {
            const companyDoc = await getDoc(doc(db, 'companies', userData.companyId));
            if (companyDoc.exists()) {
              setCompany(companyDoc.data() as Company);
            }
          }
        } else {
          // New user or legacy? Handle accordingly
          setProfile(null);
        }
      } else {
        setProfile(null);
        setCompany(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Data Syncing based on role and company
  useEffect(() => {
    if (!user || !profile) return;

    const unsubscribers: (() => void)[] = [];

    // If KAM or Admin, sync portfolio
    if (profile.role === 'kam' || profile.role === 'admin') {
      const q = profile.role === 'admin' 
        ? query(collection(db, 'companies'), orderBy('createdAt', 'desc'))
        : query(collection(db, 'companies'), where('kamId', '==', user.uid), orderBy('createdAt', 'desc'));
      
      unsubscribers.push(onSnapshot(q, (snapshot) => {
        setPortfolio(snapshot.docs.map(doc => doc.data() as Company));
      }));

      const invQ = profile.role === 'admin'
        ? query(collection(db, 'invitations'), orderBy('createdAt', 'desc'))
        : query(collection(db, 'invitations'), where('kamId', '==', user.uid), orderBy('createdAt', 'desc'));

      unsubscribers.push(onSnapshot(invQ, (snapshot) => {
        setInvitations(snapshot.docs.map(doc => doc.data() as Invitation));
      }));
    }

    // If Company (or Admin/KAM viewing a specific company), sync company data
    const activeCompanyId = profile.role === 'company' ? profile.companyId : null;
    
    if (activeCompanyId) {
      const base = doc(db, 'companies', activeCompanyId);
      
      unsubscribers.push(onSnapshot(collection(base, 'sessions'), (snapshot) => {
        setSessions(snapshot.docs.map(doc => doc.data() as ChatSession));
      }));

      unsubscribers.push(onSnapshot(collection(base, 'kpis'), (snapshot) => {
        setKpis(snapshot.docs.map(doc => doc.data() as KPI));
      }));

      unsubscribers.push(onSnapshot(collection(base, 'milestones'), (snapshot) => {
        setMilestones(snapshot.docs.map(doc => doc.data() as Milestone));
      }));

      unsubscribers.push(onSnapshot(collection(base, 'taxDocuments'), (snapshot) => {
        setTaxDocuments(snapshot.docs.map(doc => doc.data() as TaxDocument));
      }));

      unsubscribers.push(onSnapshot(collection(base, 'employees'), (snapshot) => {
        setEmployees(snapshot.docs.map(doc => doc.data() as Employee));
      }));
    }

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user, profile]);

  const login = async (email: string, pass: string) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (data: OnboardingData) => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const { classifyUser } = await import('../services/geminiService');
    
    if (!data.password) throw new Error('Password is required');
    
    const classification = await classifyUser(data);
    const userCredential = await createUserWithEmailAndPassword(auth, data.founderEmail, data.password);
    const uid = userCredential.user.uid;
    
    // Create company first
    const companyId = doc(collection(db, 'companies')).id;
    const newCompany: Company = {
      id: companyId,
      name: data.companyName,
      rut: data.companyRut,
      kamId: 'admin', // Default to admin if not invited
      onboardingData: {
        level: classification.level,
        data: data,
        scores: classification.scores,
        metrics: {}
      },
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'companies', companyId), newCompany);
    
    // Create user profile
    const newProfile: UserProfile = {
      uid,
      email: data.founderEmail,
      role: 'company',
      displayName: data.founderName,
      companyId,
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', uid), newProfile);
  };

  const logout = async () => {
    await auth.signOut();
  };

  const loadSession = async (sessionId: string) => {
    const companyRef = getCompanyPath();
    const sessionDoc = await getDoc(doc(companyRef, 'sessions', sessionId));
    if (sessionDoc.exists()) {
      return sessionDoc.data() as ChatSession;
    }
    return null;
  };

  const getCompanyPath = () => {
    if (!profile?.companyId) throw new Error('No company ID found');
    return doc(db, 'companies', profile.companyId);
  };

  const saveSession = async (session: ChatSession) => {
    const companyRef = getCompanyPath();
    await setDoc(doc(companyRef, 'sessions', session.id), session);
  };

  const addKPI = async (kpi: KPI) => {
    const companyRef = getCompanyPath();
    await setDoc(doc(companyRef, 'kpis', kpi.id), kpi);
  };

  const updateKPIData = async (kpiId: string, dataPoint: { date: string; value: number }) => {
    const companyRef = getCompanyPath();
    const kpiRef = doc(companyRef, 'kpis', kpiId);
    const kpiDoc = await getDoc(kpiRef);
    if (kpiDoc.exists()) {
      const kpi = kpiDoc.data() as KPI;
      const newData = [...kpi.data, dataPoint].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      await updateDoc(kpiRef, { data: newData });
    }
  };

  const updateKPITarget = async (kpiId: string, target: number) => {
    const companyRef = getCompanyPath();
    await updateDoc(doc(companyRef, 'kpis', kpiId), { target });
  };

  const addMilestone = async (milestone: Milestone) => {
    const companyRef = getCompanyPath();
    await setDoc(doc(companyRef, 'milestones', milestone.id), milestone);
  };

  const addTaxDocument = async (docData: TaxDocument) => {
    const companyRef = getCompanyPath();
    await setDoc(doc(companyRef, 'taxDocuments', docData.id), docData);
  };

  const updateTaxDocument = async (id: string, updates: Partial<TaxDocument>) => {
    const companyRef = getCompanyPath();
    await updateDoc(doc(companyRef, 'taxDocuments', id), updates);
  };

  const addEmployee = async (employee: Employee) => {
    const companyRef = getCompanyPath();
    await setDoc(doc(companyRef, 'employees', employee.id), employee);
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    const companyRef = getCompanyPath();
    await updateDoc(doc(companyRef, 'employees', id), updates);
  };

  const deleteEmployee = async (id: string) => {
    const companyRef = getCompanyPath();
    await deleteDoc(doc(companyRef, 'employees', id));
  };

  // KAM Actions
  const createCompany = async (name: string, rut: string) => {
    if (!user) throw new Error('Not authenticated');
    const companyId = doc(collection(db, 'companies')).id;
    const newCompany: Company = {
      id: companyId,
      name,
      rut,
      kamId: user.uid,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'companies', companyId), newCompany);
    return companyId;
  };

  const sendInvitation = async (email: string, companyId: string) => {
    if (!user) throw new Error('Not authenticated');
    const invitationId = doc(collection(db, 'invitations')).id;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const invitation: Invitation = {
      id: invitationId,
      email,
      companyId,
      kamId: user.uid,
      code,
      status: 'sent',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'invitations', invitationId), invitation);
    // In a real app, this would trigger a Cloud Function to send an email
    console.log(`Invitation sent to ${email} with code ${code}`);
  };

  return (
    <AppContext.Provider value={{ 
      user,
      profile,
      company,
      loading,
      role: profile?.role || null,
      portfolio,
      invitations,
      sessions, 
      saveSession, 
      kpis,
      addKPI,
      updateKPIData,
      updateKPITarget,
      milestones,
      addMilestone,
      taxDocuments,
      addTaxDocument,
      updateTaxDocument,
      employees,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      login,
      register,
      logout,
      loadSession,
      createCompany,
      sendInvitation
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
