export type MentorType = 'hormozi' | 'naval' | 'pg';

export interface Concept {
  id: string;
  term: string;
  regex: RegExp;
  mentor: MentorType;
  definition: string;
  colorClass: string;
}

export const CONCEPTS: Record<string, Concept> = {
  'gso': {
    id: 'gso',
    term: 'Grand Slam Offer',
    regex: /Grand Slam Offer/gi,
    mentor: 'hormozi',
    definition: 'Una oferta tan buena que la gente se siente estúpida al decir que no. Combina alto valor percibido con bajo esfuerzo/tiempo para el cliente.',
    colorClass: 'text-blue-400 border-blue-400',
  },
  'ecuacion-valor': {
    id: 'ecuacion-valor',
    term: 'Ecuación de Valor',
    regex: /Ecuación de Valor/gi,
    mentor: 'hormozi',
    definition: '(Resultado Soñado * Probabilidad de Éxito) / (Retraso de Tiempo * Esfuerzo). Maximiza lo de arriba, minimiza lo de abajo.',
    colorClass: 'text-blue-400 border-blue-400',
  },
  'core-4': {
    id: 'core-4',
    term: 'Core 4',
    regex: /Core 4/gi,
    mentor: 'hormozi',
    definition: 'Los 4 canales de adquisición: 1:1 Cálido, 1:1 Frío, 1:Muchos Cálido (Contenido), 1:Muchos Frío (Ads).',
    colorClass: 'text-blue-400 border-blue-400',
  },
  'regla-100': {
    id: 'regla-100',
    term: 'Regla del 100',
    regex: /Regla del 100/gi,
    mentor: 'hormozi',
    definition: 'Haz 100 acciones primarias (DMs, llamadas, minutos de contenido, $ en ads) al día por 100 días antes de rendirte.',
    colorClass: 'text-blue-400 border-blue-400',
  },
  'ltv': {
    id: 'ltv',
    term: 'LTV',
    regex: /\bLTV\b/g,
    mentor: 'hormozi',
    definition: 'Life Time Value. El valor total que un cliente gasta en tu negocio durante toda su relación contigo.',
    colorClass: 'text-blue-400 border-blue-400',
  },
  'cac': {
    id: 'cac',
    term: 'CAC',
    regex: /\bCAC\b/g,
    mentor: 'hormozi',
    definition: 'Customer Acquisition Cost. Cuánto te cuesta adquirir un nuevo cliente.',
    colorClass: 'text-blue-400 border-blue-400',
  },
  'apalancamiento': {
    id: 'apalancamiento',
    term: 'Apalancamiento',
    regex: /Apalancamiento/gi,
    mentor: 'naval',
    definition: 'Multiplicador de tu esfuerzo. Puede ser con permiso (capital, trabajo) o sin permiso (código, medios).',
    colorClass: 'text-purple-400 border-purple-400',
  },
  'conocimiento-especifico': {
    id: 'conocimiento-especifico',
    term: 'Conocimiento Específico',
    regex: /Conocimiento Específico/gi,
    mentor: 'naval',
    definition: 'Conocimiento que no se puede enseñar fácilmente. Si te pueden entrenar para hacerlo, te pueden reemplazar.',
    colorClass: 'text-purple-400 border-purple-400',
  },
  'juegos-largo-plazo': {
    id: 'juegos-largo-plazo',
    term: 'Juegos a Largo Plazo',
    regex: /Juegos a Largo Plazo/gi,
    mentor: 'naval',
    definition: 'Todos los retornos en la vida (riqueza, relaciones, conocimiento) provienen del interés compuesto en juegos iterados.',
    colorClass: 'text-purple-400 border-purple-400',
  },
  'cosas-que-no-escalan': {
    id: 'cosas-que-no-escalan',
    term: 'Cosas que no escalan',
    regex: /Cosas que no escalan/gi,
    mentor: 'pg',
    definition: 'Al principio, recluta usuarios manualmente y dales un servicio insosteniblemente bueno para aprender de ellos.',
    colorClass: 'text-orange-400 border-orange-400',
  },
  'default-alive': {
    id: 'default-alive',
    term: 'Default Alive',
    regex: /Default Alive/gi,
    mentor: 'pg',
    definition: 'Con tus gastos y crecimiento actuales, llegarás a la rentabilidad antes de quedarte sin dinero.',
    colorClass: 'text-orange-400 border-orange-400',
  },
  'default-dead': {
    id: 'default-dead',
    term: 'Default Dead',
    regex: /Default Dead/gi,
    mentor: 'pg',
    definition: 'Con tus gastos y crecimiento actuales, te quedarás sin dinero antes de ser rentable. Requiere acción drástica.',
    colorClass: 'text-orange-400 border-orange-400',
  },
  'schlep-blindness': {
    id: 'schlep-blindness',
    term: 'Schlep Blindness',
    regex: /Schlep Blindness/gi,
    mentor: 'pg',
    definition: 'Ceguera ante tareas tediosas. Ignorar grandes oportunidades porque implican un trabajo duro y poco glamuroso.',
    colorClass: 'text-orange-400 border-orange-400',
  }
};
