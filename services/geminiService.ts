/**
 * 浏览器端的 AI 调用代理：将请求转发到后端的 /api/ai
 * 服务端会负责真正调用 Gemini SDK（若已配置），前端只需调用此函数即可。
 */
export const askGemini = async (query: string, history: any[] = []): Promise<string> => {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return '哼哼，请问点什么吧？';
  }

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history })
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return body?.error || '哼哼，我的小猪脑袋暂时短路啦，稍后再试吧。';
    }

    const data = await res.json();
    return data?.text || '哼哼，我不知道该说什么了。';
  } catch (err) {
    console.error('askGemini fetch error:', err);
    return '哼哼，连接我的大猪脑袋失败啦，请检查网络哦。';
  }
};
