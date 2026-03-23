import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getTravelRecommendations(tripName: string, items: any[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Ты - эксперт по путешествиям. У нас есть план поездки: "${tripName}". 
      Текущие элементы плана: ${JSON.stringify(items)}.
      Предложи 3 дополнительных активности или рекомендации на основе этого плана. 
      Ответь в формате JSON: [{ "title": "...", "details": "...", "type": "activity" }]`,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}
