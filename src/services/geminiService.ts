import { GoogleGenAI, Modality } from "@google/genai";
import { OnboardingData, UserLevel } from "../types";
import { MENTOR_KNOWLEDGE_BASE } from "../data/knowledgeBase";

const SYSTEM_PROMPT = `Eres "Founder Board AI", el sistema operativo empresarial avanzado diseñado para emprendedores, pymes en crecimiento y dueños de negocios que facturan más de 100M CLP al año.

Tu función no es motivar. Tu función es diagnosticar, estructurar, decidir y medir.
Operas como un consejo asesor compuesto por múltiples modelos mentales inspirados en empresarios de alto nivel.

Dependiendo de la pregunta del usuario, debes adoptar la perspectiva de uno o varios de estos mentores:
- Alex Hormozi: Para temas de ofertas, precios, ventas, adquisición de clientes y LTV. Enfoque hiper-lógico, matemáticas de negocios, "haz una oferta tan buena que se sientan estúpidos al decir que no".
- Naval Ravikant: Para temas de apalancamiento (código, capital, medios, trabajo), creación de riqueza a largo plazo, paz mental y toma de decisiones fundamentales.
- Y Combinator (Paul Graham): Para temas de Product-Market Fit, hablar con usuarios, hacer cosas que no escalan al principio, y crecimiento rápido.
- Peter Thiel: Para temas de monopolio, competencia (la competencia es para perdedores), secretos, y ventajas competitivas injustas.
- Sam Altman: Para temas de escala, ambición, velocidad de ejecución, y reclutamiento de talento top.
- Elon Musk: Para temas de ingeniería, primeros principios, reducción de costos, automatización y ambición extrema.
- Warren Buffett: Para temas de inversión, fosos económicos (moats), paciencia estratégica, y asignación de capital.
- Sara Blakely: Para temas de ventas, resiliencia, desarrollo de producto desde cero, marketing de guerrilla y mentalidad de "no aceptar un no por respuesta".

Nunca entregas frases motivacionales vacías. Siempre entregas:
- Diagnóstico estructurado
- Puntos débiles detectados
- Decisiones concretas
- Plan de acción
- Métricas a medir
- Riesgos del plan

REGLAS DE ORO:
- No seas genérico.
- No seas motivacional.
- No digas "depende" sin análisis.
- No avances sin métricas.
- Obliga a elegir foco.
- Obliga a descartar opciones débiles.
- Cada recomendación debe impactar ingresos, margen o ventaja.
- Siempre devuelve: Diagnóstico -> Decisión -> Plan -> Métrica.
- PERSONALIZACIÓN: Siempre dirígete al fundador por su nombre (si está disponible en el contexto) para hacer la interacción más humana y directa.

FORMATO DE RESPUESTA OBLIGATORIO (MULTI-AVATAR):
Cuando respondas, DEBES estructurar tu respuesta dividiéndola por los mentores que están hablando. Usa EXACTAMENTE estas etiquetas para separar las intervenciones:
[HORMOZI] texto aquí [/HORMOZI]
[NAVAL] texto aquí [/NAVAL]
[PG] texto aquí [/PG]
[THIEL] texto aquí [/THIEL]
[ALTMAN] texto aquí [/ALTMAN]
[MUSK] texto aquí [/MUSK]
[BUFFETT] texto aquí [/BUFFETT]
[SARA] texto aquí [/SARA]
[BOARD] conclusión o resumen unificado aquí [/BOARD]

Puedes usar uno, varios o todos los mentores dependiendo de la pregunta. NO uses markdown fuera de estas etiquetas. Todo el texto debe estar dentro de alguna de ellas.

${MENTOR_KNOWLEDGE_BASE}`;

export const classifyUser = async (data: OnboardingData): Promise<{ level: UserLevel; scores: Record<string, number> }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
    Clasifica al usuario en uno de estos niveles basado en sus datos:
    Nivel A - Emprendedor inicial (SISTEMA DE VALIDACIÓN Y CIERRE)
    Nivel B - Pyme en crecimiento (SISTEMA DE ESCALA)
    Nivel D - Dueño consolidado +100M CLP año (SISTEMA DE DIRECTORIO ESTRATÉGICO)

    Datos del usuario:
    - Industria / Nicho: ${data.industry}
    - Países Objetivo: ${data.countries}
    - Facturación mensual promedio: ${data.revenue}
    - Margen estimado: ${data.margin}
    - Número de clientes activos: ${data.customers}
    - Principal canal de adquisición: ${data.acquisition}
    - Equipo actual: ${data.team}
    - Meta a 12 meses: ${data.goal}

    Devuelve un JSON con la siguiente estructura:
    {
      "level": "A" | "B" | "D",
      "scores": {
        // Si es A: "Offer Score", "Close Readiness Score" (0-100)
        // Si es B: "Growth Bottleneck Score", "Acquisition Efficiency Score", "Margin Health Score" (0-100)
        // Si es D: "Moat Score", "Founder Dependency Index", "Expansion Readiness Score" (0-100)
      }
    }
  `;

  try {
    const responsePromise = ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 15000)
    );

    const response = await Promise.race([responsePromise, timeoutPromise]) as any;

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (e) {
    console.error("Error parsing classification", e);
    return { level: "A", scores: { "Offer Score": 50, "Close Readiness Score": 50 } };
  }
};

export const chatWithMentor = async (
  message: string,
  level: UserLevel,
  isBoardSession: boolean,
  fileData?: { mimeType: string; data: string },
  userData?: OnboardingData,
  selectedMentor?: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const mentorNames: Record<string, string> = {
    HORMOZI: 'Alex Hormozi',
    NAVAL: 'Naval Ravikant',
    PG: 'Paul Graham',
    THIEL: 'Peter Thiel',
    ALTMAN: 'Sam Altman',
    MUSK: 'Elon Musk',
    BUFFETT: 'Warren Buffett',
    SARA: 'Sara Blakely'
  };
  const mentorName = selectedMentor ? mentorNames[selectedMentor] : 'Alex Hormozi';

  let modePrompt = "";
  if (isBoardSession) {
    modePrompt = `
      MODO DIRECTORIO (MULTI-MENTOR):
      Simula debate estructurado entre diferentes perspectivas estratégicas:
      - Perspectiva Oferta / Valor
      - Perspectiva Ventaja Competitiva
      - Perspectiva Crecimiento
      - Perspectiva Riesgo
      - Perspectiva Apalancamiento

      Formato obligatorio:
      - Resumen de métricas actuales
      - Identificación del cuello de botella principal
      - Debate estructurado (posturas contrastadas)
      - Decisión final
      - Plan de acción 30 días
      - Riesgos críticos
      - Métricas que definen éxito o fracaso
      Termina con un "Board Memo" claro y ejecutable.
    `;
  } else {
    modePrompt = `
      MODO MENTOR (1:1):
      Actúa EXCLUSIVAMENTE como ${mentorName}.
      Debes envolver TODA tu respuesta con las etiquetas [${selectedMentor || 'HORMOZI'}] y [/${selectedMentor || 'HORMOZI'}].
      - Haz preguntas profundas
      - Oblígalo a cuantificar
      - Detecta pensamiento débil
      - Reformula su estrategia
      - Asigna tareas con fecha
      - Nunca des soluciones sin datos.
    `;
  }

  const fullPrompt = `
    El usuario es Nivel ${level}.
    ${userData ? `
    Contexto del negocio:
    - Fundador: ${userData.founderName}
    - Industria: ${userData.industry}
    - Países: ${userData.countries}
    - Facturación: ${userData.revenue}
    - Margen: ${userData.margin}
    - Clientes: ${userData.customers}
    - Adquisición: ${userData.acquisition}
    - Equipo: ${userData.team}
    - Meta: ${userData.goal}
    ` : ''}
    
    ${modePrompt}
    
    Mensaje del usuario: ${message}
  `;

  const parts: any[] = [{ text: fullPrompt }];
  if (fileData) {
    parts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.data,
      },
    });
  }

  // Use gemini-2.0-flash for better reliability and speed, but with HIGH thinking for Board
  const model = "gemini-2.0-flash";
  const config: any = {
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ googleSearch: {} }],
  };
  
  if (isBoardSession) {
    // thinkingConfig removed for gemini-2.0-flash compatibility
  }

  try {
    const responsePromise = ai.models.generateContent({
      model,
      contents: { parts },
      config,
    });

        // Increase timeout to 90s for Board Sessions
    const timeoutDuration = isBoardSession ? 90000 : 45000;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), timeoutDuration)
    );

    const response = await Promise.race([responsePromise, timeoutPromise]) as any;
    return response.text || "";
  } catch (e) {
    console.error("Error in chatWithMentor:", e);
    return "Hubo un error al procesar tu solicitud. El Directorio está experimentando una alta carga de análisis o la respuesta tomó demasiado tiempo. Por favor, intenta con una pregunta más específica o intenta de nuevo.";
  }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const responsePromise = ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Audio,
            },
          },
          { text: "Transcribe the following audio accurately in Spanish." },
        ],
      },
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 30000)
    );

    const response = await Promise.race([responsePromise, timeoutPromise]) as any;
    return response.text || "";
  } catch (e) {
    console.error("Error in transcribeAudio:", e);
    return "Error al transcribir el audio.";
  }
};

export const generateSpeech = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const responsePromise = ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 15000)
    );

    const response = await Promise.race([responsePromise, timeoutPromise]) as any;
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (e) {
    console.error("Error in generateSpeech:", e);
    return null;
  }
};

export const analyzeVideo = async (base64Video: string, mimeType: string, prompt: string, userData?: OnboardingData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const responsePromise = ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Video,
            },
          },
          { text: `Analiza este pitch/video actuando como el directorio de Founder Board AI (Alex Hormozi, Naval Ravikant, Paul Graham, Peter Thiel, Sam Altman, Elon Musk, Warren Buffett, Sara Blakely). 
          
          Tu análisis DEBE ser exhaustivo y cubrir obligatoriamente estos puntos:
          1. OFERTA: ¿Es irresistible? ¿Tiene una propuesta de valor clara? (Hormozi/Sara)
          2. MODELO DE NEGOCIO: ¿Es sostenible y escalable? (Altman/PG)
          3. CLARIDAD: ¿Se entiende el problema y la solución en menos de 60 segundos? (PG/Altman)
          4. APALANCAMIENTO: ¿Cómo está usando código, capital, medios o trabajo? (Naval)
          5. EFICIENCIA: ¿Hay desperdicio en el proceso o costos innecesarios? (Musk)
          6. FOSO ECONÓMICO (MOAT): ¿Qué tan difícil es copiar este negocio? (Buffett/Thiel)
          
          ${prompt}
          
          ${userData ? `
          Contexto del negocio:
          - Fundador: ${userData.founderName}
          - Industria: ${userData.industry}
          - Países: ${userData.countries}
          - Facturación: ${userData.revenue}
          - Margen: ${userData.margin}
          - Clientes: ${userData.customers}
          - Adquisición: ${userData.acquisition}
          - Equipo: ${userData.team}
          - Meta: ${userData.goal}
          ` : ''}
          ` },
        ],
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
      }
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 60000)
    );

    const response = await Promise.race([responsePromise, timeoutPromise]) as any;
    return response.text || "";
  } catch (e) {
    console.error("Error in analyzeVideo:", e);
    return "Error al analizar el video.";
  }
};

export const generateBoardRoomImage = async (founderName: string, companyName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const prompt = `A cinematic, ultra-high-definition wide shot of a prestigious, modern boardroom. Eight distinct and world-famous business mentors are seated around a massive dark wood conference table, looking directly at the camera with attentive, serious expressions. 

The mentors are:
1. A muscular man with a beard and glasses (Alex Hormozi).
2. A thoughtful Indian-American man with curly hair (Naval Ravikant).
3. An older, intellectual-looking man with glasses (Paul Graham).
4. A sharp-featured man with an intense gaze in a dark suit (Peter Thiel).
5. A younger, clean-shaven tech executive (Sam Altman).
6. A distinctive, visionary-looking man in a modern suit (Elon Musk).
7. An elderly man with white hair and glasses in a classic suit (Warren Buffett).
8. A professional woman with blonde hair and a confident expression (Sara Blakely).

They are all DIFFERENT people. Ensure NO REPETITIONS of any person. They are listening to a presentation from the viewer's perspective. In the background, a large digital screen subtly displays the text "${companyName}". The lighting is dramatic and professional, creating a high-stakes atmosphere. First-person perspective.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ text: prompt }],
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Error generating boardroom image:", e);
    return null;
  }
};
