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