import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askGemini = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: "You are a warm, helpful, and polite AI assistant for the 'Pig Family' website. You should answer questions simply, suitable for a family environment. If asked about the family, assume typical loving family dynamics (Daddy Pig, Mummy Pig, Peppa, George). Keep answers concise.",
      }
    });
    
    return response.text || "I couldn't think of an answer right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the brain right now.";
  }
};
