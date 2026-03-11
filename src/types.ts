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

export interface UserProfile {
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
