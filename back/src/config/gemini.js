import "dotenv/config";

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
}

export const geminiConfig = {
  chatModel: process.env.GEMINI_CHAT_MODEL || "gemini-3.8-flash",

  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",

  embeddingDimension: Number(process.env.GEMINI_EMBEDDING_DIMENSION || 768),
};

if (
  !Number.isInteger(geminiConfig.embeddingDimension) ||
  geminiConfig.embeddingDimension < 128 ||
  geminiConfig.embeddingDimension > 3072
) {
  throw new Error("GEMINI_EMBEDDING_DIMENSION 설정이 올바르지 않습니다.");
}

export const gemini = new GoogleGenAI({
  apiKey,
});
