import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client using API key from environment variables
// Note: In Vite, process.env.API_KEY is polyfilled by vite.config.ts
const API_KEY = process.env.API_KEY;

// 验证 API Key 配置
if (!API_KEY || API_KEY === 'default') {
  console.warn('⚠️  警告：Gemini API_KEY 未正确配置，AI 功能将不可用');
}

const ai = API_KEY && API_KEY !== 'default' ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Sends a natural language query to the Gemini model.
 * 
 * @param query - The user's question.
 * @returns The text response from the AI.
 */
export const askGemini = async (query: string): Promise<string> => {
  try {
    // 检查 API Key 是否配置
    if (!ai || !API_KEY || API_KEY === 'default') {
      return "抱歉，AI 服务暂未配置。请联系管理员设置 Gemini API Key。";
    }

    // 验证查询不为空
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return "请输入有效的问题。";
    }

    // Using gemini-3-pro-preview for high quality reasoning
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        // System instruction defines the AI's persona and language rules
        systemInstruction: "你是一个热情、乐于助人且有礼貌的AI助手，服务于"暖暖的猪窝"网站。你应该用简体中文回答问题，语言风格通俗易懂，适合家庭环境。如果被问及家庭成员，请假设典型的充满爱意的家庭动态（爸比、妈咪、圆圆猪、婆婆）。回答要简洁明了。",
      }
    });
    
    const text = response.text || "我的猪脑袋瓜现在想不出答案。";
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // 更友好的错误提示
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return "API Key 配置错误，请检查密钥是否有效。";
      }
      if (error.message.includes('rate limit')) {
        return "请求过于频繁，请稍后再试。";
      }
    }
    
    return "抱歉，我现在连接大脑有点困难。";
  }
};
