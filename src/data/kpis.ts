export interface KPIInfo {
  id: string;
  name: string;
  description: string;
  category: 'growth' | 'finance' | 'operations' | 'product';
  mentors: string[];
}

export const BUSINESS_KPIS: Record<string, KPIInfo> = {
  CAC: {
    id: 'CAC',
    name: 'Costo de Adquisición de Clientes',
    description: 'Cuánto te cuesta conseguir un nuevo cliente pagando marketing y ventas.',
    category: 'growth',
    mentors: ['HORMOZI', 'PG']
  },
  LTV: {
    id: 'LTV',
    name: 'Lifetime Value',
    description: 'El valor total que un cliente aporta a tu negocio durante toda su relación contigo.',
    category: 'finance',
    mentors: ['HORMOZI', 'BUFFETT']
  },
  CHURN: {
    id: 'CHURN',
    name: 'Tasa de Cancelación',
    description: 'Porcentaje de clientes que dejan de usar tu servicio en un periodo determinado.',
    category: 'product',
    mentors: ['ALTMAN', 'PG']
  },
  MRR: {
    id: 'MRR',
    name: 'Ingresos Mensuales Recurrentes',
    description: 'La cantidad de ingresos predecibles que tu negocio recibe cada mes.',
    category: 'finance',
    mentors: ['ALTMAN', 'THIEL']
  },
  BURN_RATE: {
    id: 'BURN_RATE',
    name: 'Tasa de Consumo de Caja',
    description: 'La velocidad a la que tu empresa gasta su capital antes de generar flujo positivo.',
    category: 'finance',
    mentors: ['MUSK', 'ALTMAN']
  },
  CONVERSION_RATE: {
    id: 'CONVERSION_RATE',
    name: 'Tasa de Conversión',
    description: 'Porcentaje de prospectos que realizan la acción deseada (compra, registro).',
    category: 'growth',
    mentors: ['HORMOZI', 'SARA']
  },
  NPS: {
    id: 'NPS',
    name: 'Net Promoter Score',
    description: 'Métrica que mide la lealtad y satisfacción de tus clientes.',
    category: 'product',
    mentors: ['PG', 'SARA']
  },
  ROAS: {
    id: 'ROAS',
    name: 'Retorno de la Inversión Publicitaria',
    description: 'Cuántos pesos generas por cada peso invertido en publicidad.',
    category: 'growth',
    mentors: ['HORMOZI']
  },
  PAYBACK_PERIOD: {
    id: 'PAYBACK_PERIOD',
    name: 'Periodo de Recuperación',
    description: 'Tiempo que tardas en recuperar el CAC de un cliente.',
    category: 'finance',
    mentors: ['BUFFETT', 'HORMOZI']
  },
  SALES_VELOCITY: {
    id: 'SALES_VELOCITY',
    name: 'Velocidad de Ventas',
    description: 'Qué tan rápido estás moviendo prospectos a través de tu embudo.',
    category: 'operations',
    mentors: ['SARA', 'ALTMAN']
  }
};
