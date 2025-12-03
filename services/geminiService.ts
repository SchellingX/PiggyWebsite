import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client using API key from environment variables
// Note: In Vite, process.env.API_KEY is polyfilled by vite.config.ts
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends a natural language query to the Gemini model.
 * 
 * @param query - The user's question.
 * @returns The text response from the AI.
 */
export const askGemini = async (query: string): Promise<string> => {
  try {
    // Using gemini-3-pro-preview for high quality reasoning
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        // System instruction defines the AI's persona and language rules
        systemInstruction: "你是一个热情、乐于助人且有礼貌的AI助手，服务于“暖暖的猪窝”网站。你应该用简体中文回答问题，语言风格通俗易懂，适合家庭环境。如果被问及家庭成员，请假设典型的充满爱意的家庭动态（爸比、妈咪、圆圆猪、婆婆）。回答要简洁明了。",
      }
    });
    
    return response.text || "我的猪脑袋瓜现在想不出答案。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，我现在连接大脑有点困难。";
  }
};