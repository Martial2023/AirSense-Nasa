'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
if (!apiKey) {
  throw new Error("Missing Gemini API key");
}

const genAI = new GoogleGenerativeAI(apiKey);

type botParams = {
  prompt: string;
}
function safeJsonParse(raw: string) {
  try {
    // Nettoie les balises markdown
    let cleaned = raw.replace(/```json|```/g, "").trim();
    
    // Cherche le premier { et le dernier } pour extraire le JSON
    const firstCurly = cleaned.indexOf("{");
    const lastCurly = cleaned.lastIndexOf("}");
    
    if (firstCurly !== -1 && lastCurly !== -1 && firstCurly < lastCurly) {
      const jsonString = cleaned.substring(firstCurly, lastCurly + 1);
      return JSON.parse(jsonString);
    }
    
    // Cherche un tableau JSON
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    
    if (firstBracket !== -1 && lastBracket !== -1 && firstBracket < lastBracket) {
      const jsonString = cleaned.substring(firstBracket, lastBracket + 1);
      return JSON.parse(jsonString);
    }
    
    // Si pas de JSON détecté, essaie de parser directement après nettoyage
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Erreur lors du parsing JSON:", error);
    console.error("Contenu brut reçu:", raw);
    throw new Error("La réponse de l'IA n'est pas au format JSON valide");
  }
}

export async function answerUserQuestion({prompt}: botParams) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    return raw;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to answer user question");
  }
}