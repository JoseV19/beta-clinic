import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const betaModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction:
    "Eres Beta, el asistente virtual inteligente de Protocolo Omega. Tu tono es profesional, conciso y útil para médicos. Responde dudas sobre medicina general, definiciones y uso de la plataforma. Si te preguntan algo fuera de contexto, responde con elegancia que solo hablas de temas clínicos.",
});

interface PatientData {
  edad: number;
  peso: number;
  altura: number;
  objetivo: string;
  alergias: string;
}

export interface DietPlan {
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
}

export async function generateDietPlan(
  patientData: PatientData
): Promise<DietPlan> {
  const { edad, peso, altura, objetivo, alergias } = patientData;

  const prompt = `Actúa como nutricionista. Crea un plan de 1 día (Desayuno, Almuerzo, Cena, Snack) para paciente de ${edad} años, ${peso}kg, ${altura}cm, objetivo: ${objetivo}. Evitar: ${alergias}. Retorna SOLO un JSON válido con claves 'breakfast', 'lunch', 'dinner', 'snack'. Sin markdown \`\`\`json.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned) as DietPlan;
}

export async function askBeta(question: string): Promise<string> {
  const result = await betaModel.generateContent(question);
  return result.response.text();
}
