import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Search as SearchIcon, Sparkles, ArrowRight, CornerDownLeft, Copy, Check } from 'lucide-react';
import { askGemini } from '../services/geminiService';

const Search: React.FC = () => {
  const { blogs, photos, apps } = useData();
  const [activeTab, setActiveTab] = useState<'local' | 'ai'>('ai');
  const [query, setQuery] = useState('');
  
  // Local Search State
  const [localResults, setLocalResults] = useState<{type: string, title: string, desc: string, link: string}[]>([]);
  
  // AI Search State
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleLocalSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
        setLocalResults([]);
        return;
    }
    const q = searchQuery.toLowerCase();
    
    const blogResults = blogs
        .filter(b => b.title.toLowerCase().includes(q) || b.content.toLowerCase().includes(q))
        .map(b => ({ type: 'Blog', title: b.title, desc: b.excerpt, link: '/blog' }));
        
    const photoResults = photos
        .filter(p => p.caption.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
        .map(p => ({ type: 'Photo', title: p.caption, desc: `Taken by ${p.takenBy}`, link: '/gallery' }));
        
    const appResults = apps
        .filter(a => a.name.toLowerCase().includes(q))
        .map(a => ({ type: 'App', title: a.name, desc: a.description, link: '/apps' }));

    setLocalResults([...blogResults, ...photoResults, ...appResults]);
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setAiResponse('');
    
    try {
        const result = await askGemini(query);
        setAiResponse(result);
    } catch (err) {
        setAiResponse("Sorry, I got confused.");
    } finally {
        setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiResponse);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Smart Search</h1>
            <p className="text-slate-500">Find anything in the house, or ask the AI brain.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
            <div className="bg-slate-100 p-1 rounded-full flex">
                <button
                    onClick={() => setActiveTab('local')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        activeTab === 'local' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Site Search
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                        activeTab === 'ai' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Sparkles size={16} /> AI Assistant
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 md:p-8 min-h-[400px]">
            {activeTab === 'local' ? (
                // LOCAL SEARCH
                <div>
                    <div className="relative mb-6">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search photos, blogs, apps..."
                            value={query}
                            onChange={(e) => handleLocalSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 font-medium text-lg placeholder:font-normal transition-all"
                            autoFocus
                        />
                    </div>
                    
                    <div className="space-y-4">
                        {localResults.length > 0 ? (
                            localResults.map((res, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                        res.type === 'Blog' ? 'bg-blue-50 text-blue-500' :
                                        res.type === 'Photo' ? 'bg-purple-50 text-purple-500' : 'bg-green-50 text-green-500'
                                    }`}>
                                        {res.type === 'Blog' ? <ArrowRight size={18}/> : res.type === 'Photo' ? <Sparkles size={18}/> : <Check size={18}/>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="font-semibold text-slate-800">{res.title}</h3>
                                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{res.type}</span>
                                        </div>
                                        <p className="text-slate-500 text-sm mt-1">{res.desc}</p>
                                    </div>
                                </div>
                            ))
                        ) : query ? (
                            <div className="text-center py-10 text-slate-400">
                                <p>No matching results found in the house.</p>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-400">
                                <p>Start typing to search...</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // AI SEARCH
                <div className="flex flex-col h-full">
                    <form onSubmit={handleAiSearch} className="relative mb-6">
                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={20} />
                        <input
                            type="text"
                            placeholder="Ask Gemini AI (e.g., 'How do I make pancakes?')"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-rose-50/50 border-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 font-medium text-lg placeholder:text-rose-300 transition-all"
                            autoFocus
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !query.trim()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 disabled:opacity-50 disabled:hover:bg-rose-500 transition-all"
                        >
                            <CornerDownLeft size={18} />
                        </button>
                    </form>

                    <div className="flex-1 bg-slate-50 rounded-2xl p-6 relative min-h-[200px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                <div className="w-6 h-6 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium">Thinking...</span>
                            </div>
                        ) : aiResponse ? (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
                                        <Sparkles size={14} /> AI Answer
                                    </div>
                                    <button onClick={copyToClipboard} className="text-slate-400 hover:text-slate-600 transition-colors">
                                        {isCopied ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
                                    {aiResponse}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <Sparkles size={32} className="mb-3 opacity-20" />
                                <p className="text-sm">Ask me anything about cooking, facts, or ideas!</p>
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
