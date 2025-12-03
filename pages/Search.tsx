import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Search as SearchIcon, Sparkles, ArrowRight, CornerDownLeft, Copy, Check } from 'lucide-react';
import { askGemini } from '../services/geminiService';

const Search: React.FC = () => {
  const { blogs, photos, apps } = useData();
  const [activeTab, setActiveTab] = useState<'local' | 'ai'>('ai');
  const [query, setQuery] = useState('');
  const [localResults, setLocalResults] = useState<{type: string, title: string, desc: string, link: string}[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // --- 本地搜索逻辑 ---
  const handleLocalSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) { setLocalResults([]); return; }
    const q = searchQuery.toLowerCase();
    
    // 分别从博客、相册、应用中过滤数据
    const blogResults = blogs.filter(b => b.title.toLowerCase().includes(q) || b.content.toLowerCase().includes(q)).map(b => ({ type: '博客', title: b.title, desc: b.excerpt, link: '/blog' }));
    const photoResults = photos.filter(p => p.caption.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).map(p => ({ type: '相册', title: p.caption, desc: `拍摄者：${p.takenBy}`, link: '/gallery' }));
    const appResults = apps.filter(a => a.name.toLowerCase().includes(q)).map(a => ({ type: '应用', title: a.name, desc: a.description, link: '/apps' }));
    setLocalResults([...blogResults, ...photoResults, ...appResults]);
  };

  // --- AI 搜索逻辑 (Gemini) ---
  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    setIsLoading(true); setAiResponse('');
    try { const result = await askGemini(query); setAiResponse(result); } catch (err) { setAiResponse("抱歉，我有点糊涂了。"); } finally { setIsLoading(false); }
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(aiResponse); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };

  return (
    <div className="max-w-3xl mx-auto pb-12">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">全能搜索</h1>
            <p className="text-slate-500 font-medium">寻找记忆，或探索未知</p>
        </div>

        {/* 标签页切换 */}
        <div className="flex justify-center mb-10">
            <div className="bg-slate-100 p-1.5 rounded-full flex shadow-inner">
                <button onClick={() => setActiveTab('local')} className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'local' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>站内搜索</button>
                <button onClick={() => setActiveTab('ai')} className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'ai' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Sparkles size={16} /> AI 助手</button>
            </div>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl shadow-amber-100/50 border border-white p-8 min-h-[400px]">
            {activeTab === 'local' ? (
                <div>
                    <div className="relative mb-8">
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                        {/* 高对比度搜索框 */}
                        <input 
                            type="text" 
                            placeholder="搜索照片、博客、应用..." 
                            value={query} 
                            onChange={(e) => handleLocalSearch(e.target.value)} 
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-2 border-slate-200 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100 text-slate-800 font-bold text-lg placeholder:font-medium transition-all shadow-sm" 
                            autoFocus 
                        />
                    </div>
                    <div className="space-y-4">
                        {localResults.length > 0 ? (
                            localResults.map((res, idx) => (
                                <div key={idx} className="flex items-start gap-5 p-5 rounded-2xl hover:bg-amber-50/50 transition-colors border border-transparent hover:border-amber-100/50 group">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${res.type === '博客' ? 'bg-blue-100 text-blue-600' : res.type === '相册' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                        {res.type === '博客' ? <ArrowRight size={20}/> : res.type === '相册' ? <Sparkles size={20}/> : <Check size={20}/>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-bold text-lg text-slate-800">{res.title}</h3>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">{res.type}</span>
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium">{res.desc}</p>
                                    </div>
                                </div>
                            ))
                        ) : query ? <div className="text-center py-12 text-slate-400 font-medium"><p>家里没找到这个东西。</p></div> : <div className="text-center py-12 text-slate-400 font-medium"><p>开始输入进行搜索...</p></div>}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <form onSubmit={handleAiSearch} className="relative mb-8">
                        <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" size={22} />
                        {/* 高对比度搜索框 */}
                        <input 
                            type="text" 
                            placeholder="问我任何事..." 
                            value={query} 
                            onChange={(e) => setQuery(e.target.value)} 
                            className="w-full pl-14 pr-14 py-4 rounded-2xl bg-white border-2 border-slate-200 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100 text-slate-800 font-bold text-lg placeholder:text-slate-400 transition-all shadow-sm" 
                            autoFocus 
                        />
                        <button type="submit" disabled={isLoading || !query.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-all shadow-md"><CornerDownLeft size={20} /></button>
                    </form>
                    <div className="flex-1 bg-slate-50/50 rounded-2xl p-8 relative min-h-[200px] border border-slate-100">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                                <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-bold">正在思考...</span>
                            </div>
                        ) : aiResponse ? (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-start mb-6 border-b border-slate-200/50 pb-4">
                                    <div className="flex items-center gap-2 text-amber-600 font-bold text-sm"><Sparkles size={16} /> AI 回答</div>
                                    <button onClick={copyToClipboard} className="text-slate-400 hover:text-slate-600 transition-colors">{isCopied ? <Check size={18} /> : <Copy size={18} />}</button>
                                </div>
                                <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed font-serif">{aiResponse}</div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400/50">
                                <Sparkles size={48} className="mb-4" />
                                <p className="text-base font-medium">我可以帮你写诗、讲故事、或者查资料！</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Search;
