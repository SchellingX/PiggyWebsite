/**
 * 浏览器端的 AI 调用代理：将请求转发到后端的 /api/ai
 * 服务端会负责真正调用 Gemini SDK（若已配置），前端只需调用此函数即可。
 */
export const askGemini = async (query: string): Promise<string> => {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return '请输入有效的问题。';
  }

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return body?.error || '抱歉，AI 服务暂不可用。';
    }

    const data = await res.json();
    return data?.text || '抱歉，AI 未返回内容。';
  } catch (err) {
    console.error('askGemini fetch error:', err);
    return '抱歉，我现在连接大脑有点困难。';
  }
};
