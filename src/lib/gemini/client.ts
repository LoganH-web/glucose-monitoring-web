import { GoogleGenerativeAI } from "@google/generative-ai";

let cached: GoogleGenerativeAI | null = null;

export function geminiClient(): GoogleGenerativeAI {
  if (cached) return cached;
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  cached = new GoogleGenerativeAI(key);
  return cached;
}

export function geminiModelName(): string {
  return process.env.GEMINI_MODEL || "gemini-1.5-flash";
}
