export type UserRole = 'admin' | 'kam' | 'company';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  companyId?: string;
  kamId?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  rut: string;
  kamId: string;
  onboardingData?: CompanyProfile;
  status: 'pending' | 'active' | 'archived';
  createdAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  companyId: string;
  kamId: string;
  code: string;
  status: 'sent' | 'accepted' | 'expired';
  createdAt: string;
}

export type UserLevel = 'A' | 'B' | 'D' | null;

export interface OnboardingData {
  founderName: string;
  founderEmail: string;
  founderPhone: string;
  password?: string;
  companyName: string;
  companyRut: string;
  stage: string;
  revenue: string;
  margin: string;
  customers: string;
  acquisition: string;
  team: string;
  goal: string;
  industry: string;
  countries: string;
}

export interface CompanyProfile {
  level: UserLevel;
  data: OnboardingData;
  scores: Record<string, number>;
  metrics: Record<string, string | number>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  fileUrl?: string;
  isBoardSession?: boolean;
  mentor?: string;
}

export interface KPIDataPoint {
  date: string;
  value: number;
}

export interface KPI {
  id: string;
  name: string;
  unit: string;
  chartType: 'line' | 'bar' | 'area';
  data: KPIDataPoint[];
  color: string;
  target?: number;
}

export interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'launch' | 'expansion' | 'hiring' | 'other';
}

export interface TaxDocument {
  id: string;
  name: string;
  date: string;
  period: string;
  fileUrl: string;
  status: 'pending' | 'analyzed' | 'error';
  extractedData?: TaxData;
}

export interface Employee {
  id: string;
  rut: string;
  fullName: string;
  startDate: string;
  contractType: 'indefinido' | 'plazo_fijo' | 'obra_faena';
  workday: 'completa' | 'parcial';
  baseSalary: number;
  position: string;
  status: 'active' | 'terminated';
}

export interface TaxData {
  revenue: number;
  profit: number;
  taxesPaid: number;
  employees: number;
  lastUpdated: string;
  period: string;
  f22Data?: {
    baseImponible: number;
    impuestoDeterminado: number;
    gastosRechazados: number;
  };
  f29Data?: {
    ivaDebito: number;
    ivaCredito: number;
    ppm: number;
  };
  summaryText: string;
}
