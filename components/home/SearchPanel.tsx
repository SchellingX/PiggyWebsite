
import React, { useState, useEffect, FormEvent } from 'react';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { askGemini } from '../../services/geminiService';
import { chatService } from '../../services/chatService';

const SearchPanel: React.FC = () => {
    type SearchMode = 'search' | 'site';
    const [mode, setMode] = useState<SearchMode>('search');
    const [query, setQuery] = useState('');

    // AI Chat State
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [modalKey, setModalKey] = useState(0);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Multi-session state
    const [sessions, setSessions] = useState<any[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);

    const chatHistoryRef = React.useRef<any[]>([]);

    React.useEffect(() => {
        chatHistoryRef.current = chatHistory;
    }, [chatHistory]);

    // Search Engine Dropdown
    const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);

    // Site Search
    const { blogs, photos, apps, reminders, user } = useData();
    const [siteResults, setSiteResults] = useState<any[]>([]);
    const [isSiteSearchOpen, setIsSiteSearchOpen] = useState(false);

    // Load all sessions for user
    const loadSessions = async () => {
        if (!user) return;
        setIsLoadingHistory(true);
        try {
            const data = await chatService.getSessions(user.id);
            setSessions(data);
        } catch (err) {
            console.error('Failed to load sessions:', err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Load a specific session
    const loadSession = (session: any) => {
        setCurrentSessionId(session.id);
        const displayHistory = session.messages.map((msg: any) => ({
            role: msg.role,
            parts: [{ text: msg.text }],
            timestamp: msg.timestamp
        }));
        setChatHistory(displayHistory);
        chatHistoryRef.current = displayHistory;
        setShowHistoryPanel(false);
    };

    // Start new session
    const startNewSession = () => {
        setCurrentSessionId(null);
        setChatHistory([]);
        chatHistoryRef.current = [];
        setShowHistoryPanel(false);
    };

    // Save current session
    const saveCurrentSession = async (history: any[]) => {
        if (!user || history.length === 0) return;
        try {
            const storageMessages = history.map((msg: any) => ({
                role: msg.role,
                text: msg.parts[0].text,
                timestamp: msg.timestamp || new Date().toISOString()
            }));

            const session = await chatService.saveSession(user.id, currentSessionId, storageMessages);

            setCurrentSessionId(session.id);
            // Update sessions list
            setSessions(prev => {
                const existing = prev.find(s => s.id === session.id);
                if (existing) {
                    return prev.map(s => s.id === session.id ? session : s);
                }
                return [session, ...prev];
            });
        } catch (err) {
            console.error('Failed to save session:', err);
        }
    };

    // Delete a session
    const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || !confirm('确定删除这个对话？')) return;
        try {
            await chatService.deleteSession(user.id, sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (currentSessionId === sessionId) {
                startNewSession();
            }
        } catch (err) {
            console.error('Failed to delete session:', err);
        }
    };

    // Clear all sessions
    const clearAllSessions = async () => {
        if (!user || !confirm('确定清空所有聊天记录？')) return;
        try {
            await chatService.clearSessions(user.id);
            setSessions([]);
            startNewSession();
        } catch (err) {
            console.error('Failed to clear sessions:', err);
        }
    };

    // Handle Search Submit
    const handleSearchSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        if (mode === 'search') {
            openAiModal(query);
        } else {
            setIsSiteSearchOpen(true);
        }
    };

    // AI Logic
    const openAiModal = async (initialQuery?: string) => {
        setModalKey(prev => prev + 1);
        setIsAiModalOpen(true);
        await loadSessions();
        // Start fresh session if opening with query
        if (initialQuery?.trim()) {
            startNewSession();
            setQuery('');
            setTimeout(() => sendToAi(initialQuery), 100);
        }
    };

    const sendToAi = async (text: string) => {
        if (!text.trim() || isAiLoading) return;

        const timestamp = new Date().toISOString();
        const currentHistory = chatHistoryRef.current;
        const userMessage = { role: 'user', parts: [{ text }], timestamp };
        const newHistory = [...currentHistory, userMessage];

        setChatHistory(newHistory);
        chatHistoryRef.current = newHistory;
        setIsAiLoading(true);

        try {
            const responseText = await askGemini(text, currentHistory);
            const responseTimestamp = new Date().toISOString();
            const modelMessage = { role: 'model', parts: [{ text: responseText }], timestamp: responseTimestamp };
            const finalHistory = [...newHistory, modelMessage];

            setChatHistory(finalHistory);
            chatHistoryRef.current = finalHistory;
            await saveCurrentSession(finalHistory);
        } catch (error) {
            const errorTimestamp = new Date().toISOString();
            const errorMessage = { role: 'model', parts: [{ text: '哼哼，出错了，请稍后再试。' }], timestamp: errorTimestamp };
            const errorHistory = [...newHistory, errorMessage];

            setChatHistory(errorHistory);
            chatHistoryRef.current = errorHistory;
            await saveCurrentSession(errorHistory);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleChatSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (chatInput.trim()) {
            sendToAi(chatInput);
            setChatInput('');
        }
    };

    // Site Search Logic
    useEffect(() => {
        if (mode === 'site' && query.trim()) {
            const lowerQ = query.toLowerCase();
            const results = [
                ...blogs.filter(b => b.title.toLowerCase().includes(lowerQ) || b.tags.some(t => t.toLowerCase().includes(lowerQ))).map(b => ({ ...b, type: 'blog' })),
                ...photos.filter(p => p.caption.toLowerCase().includes(lowerQ) || p.category.toLowerCase().includes(lowerQ)).map(p => ({ ...p, type: 'photo' })),
                ...apps.filter(a => a.name.toLowerCase().includes(lowerQ)).map(a => ({ ...a, type: 'app' })),
                ...reminders.filter(r => r.text.toLowerCase().includes(lowerQ)).map(r => ({ ...r, type: 'reminder' }))
            ];
            setSiteResults(results);
            setIsSiteSearchOpen(results.length > 0);
        } else {
            setSiteResults([]);
            setIsSiteSearchOpen(false);
        }
    }, [query, mode, blogs, photos, apps, reminders]);

    // Tab component
    const ModeTab = ({ m, label }: { m: SearchMode, label: string }) => (
        <button
            onClick={() => { setMode(m); setQuery(''); }}
            className={`px-6 py-2 rounded-t-xl font-bold transition-all ${mode === m ? 'bg-white/90 text-slate-900 border-b-2 border-amber-400' : 'bg-black/20 text-white/70 hover:bg-black/30'}`}
        >
            {label}
        </button>
    );

    // Auto-scroll chat
    const chatContainerRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isAiLoading]);

    // Format date for session list
    const formatSessionDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 86400000) return '今天';
        if (diff < 172800000) return '昨天';
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-12 animate-fade-in-up relative z-20" style={{ animationDelay: '0.1s' }}>

            {/* Tabs */}
            <div className="flex justify-center gap-2 mb-0">
                <ModeTab m="search" label="全网搜索" />
                <ModeTab m="site" label="站内探索" />
            </div>

            <div className="relative group">
                <form onSubmit={handleSearchSubmit} className="relative z-20">
                    <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <LucideIcons.Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 z-30" size={24} />

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={mode === 'search' ? '想问本智慧猪点什么呢...' : '搜索博客、照片、提醒...'}
                        className="w-full bg-white/90 backdrop-blur-xl border-2 border-transparent rounded-3xl pl-16 pr-40 py-5 text-lg font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-400/30 focus:bg-white focus:border-amber-300 shadow-2xl transition-all relative z-20"
                    />

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 z-30">
                        {mode === 'search' ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => openAiModal(query)}
                                    className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm transition-all active:scale-95"
                                >
                                    <LucideIcons.Sparkles size={18} />
                                    问猪
                                </button>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl flex items-center gap-1 shadow-sm transition-all"
                                    >
                                        <LucideIcons.Search size={18} />
                                        引擎
                                        <LucideIcons.ChevronDown size={14} />
                                    </button>

                                    {isEngineDropdownOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in">
                                            <button onClick={() => { window.open(`https://www.google.com/search?q=${query}`, '_blank'); setIsEngineDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-amber-50 flex items-center gap-2"><LucideIcons.Globe size={14} /> Google</button>
                                            <button onClick={() => { window.open(`https://www.bing.com/search?q=${query}`, '_blank'); setIsEngineDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-amber-50 flex items-center gap-2"><LucideIcons.Globe size={14} /> Bing</button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="pr-4 text-slate-400 text-sm font-bold flex items-center">
                                实时搜索中...
                            </div>
                        )}
                    </div>
                </form>

                {/* Site Search Results */}
                {mode === 'site' && isSiteSearchOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 max-h-96 overflow-y-auto z-10 animate-fade-in custom-scrollbar border border-white/50">
                        {siteResults.map((item, idx) => (
                            <Link to={item.type === 'blog' ? '/blog' : item.type === 'photo' ? '/gallery' : '#'} key={idx} className="block p-3 hover:bg-amber-50 rounded-xl transition-colors group">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 bg-white rounded-lg shadow-sm text-amber-500">
                                        {item.type === 'blog' && <LucideIcons.BookHeart size={18} />}
                                        {item.type === 'photo' && <LucideIcons.Image size={18} />}
                                        {item.type === 'app' && <LucideIcons.AppWindow size={18} />}
                                        {item.type === 'reminder' && <LucideIcons.ListTodo size={18} />}
                                    </span>
                                    <div>
                                        <div className="font-bold text-slate-800 group-hover:text-amber-600">
                                            {item.title || item.name || item.text || item.caption}
                                        </div>
                                        <div className="text-xs text-slate-500 capitalize">{item.type}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Modal with Sessions */}
            {isAiModalOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setIsAiModalOpen(false)}
                >
                    <div
                        key={modalKey}
                        className="bg-white max-w-4xl w-full rounded-[2rem] shadow-2xl overflow-hidden flex h-[75vh] animate-scale-in relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Sessions Sidebar */}
                        <div className={`${showHistoryPanel ? 'w-72' : 'w-0'} bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden transition-all duration-300`}>
                            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                    <LucideIcons.History size={16} /> 历史对话
                                </h4>
                                {sessions.length > 0 && (
                                    <button onClick={clearAllSessions} className="text-xs text-slate-400 hover:text-red-500">清空</button>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {isLoadingHistory ? (
                                    <div className="text-center py-4 text-slate-400">
                                        <LucideIcons.Loader size={20} className="animate-spin mx-auto" />
                                    </div>
                                ) : sessions.length === 0 ? (
                                    <div className="text-center py-4 text-slate-400 text-sm">暂无历史对话</div>
                                ) : (
                                    sessions.map(session => (
                                        <div
                                            key={session.id}
                                            onClick={() => loadSession(session)}
                                            className={`p-3 rounded-xl cursor-pointer transition-all group ${currentSessionId === session.id ? 'bg-amber-100 border border-amber-200' : 'hover:bg-slate-100'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-slate-700 truncate text-sm">{session.title}</div>
                                                    <div className="text-xs text-slate-400 mt-1">{formatSessionDate(session.updatedAt)}</div>
                                                </div>
                                                <button
                                                    onClick={(e) => deleteSession(session.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-slate-400 transition-all"
                                                >
                                                    <LucideIcons.Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 border-t border-slate-200">
                                <button
                                    onClick={startNewSession}
                                    className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    <LucideIcons.Plus size={16} /> 新对话
                                </button>
                            </div>
                        </div>

                        {/* Main Chat Area */}
                        <div className="flex-1 flex flex-col bg-cover bg-center relative" style={{ backgroundImage: "url('/assets/background-aichat.jpeg')" }}>
                            <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-0"></div>

                            {/* Header */}
                            <div className="bg-gradient-to-r from-amber-50/90 to-white/90 px-6 py-4 border-b border-amber-100 flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                        title="历史对话"
                                    >
                                        <LucideIcons.PanelLeftOpen size={20} className={`text-slate-500 transition-transform ${showHistoryPanel ? 'rotate-180' : ''}`} />
                                    </button>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <div className="p-2 bg-amber-400 rounded-full text-white"><LucideIcons.Sparkles size={18} /></div>
                                        智慧猪助手
                                    </h3>
                                    {sessions.length > 0 && (
                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                                            {sessions.length} 个对话
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => setIsAiModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <LucideIcons.X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent custom-scrollbar relative z-10">
                                {chatHistory.length === 0 ? (
                                    <div className="text-center text-slate-600 mt-10 p-6 bg-white/50 backdrop-blur-md rounded-2xl mx-auto max-w-sm">
                                        <LucideIcons.MessageCircle size={48} className="mx-auto mb-2 text-slate-800 opacity-50" />
                                        <p className="font-bold">有什么想问的？</p>
                                        <p className="text-xs text-slate-500 mt-2">每次对话自动保存为独立会话</p>
                                    </div>
                                ) : null}
                                {chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-sm text-base leading-relaxed backdrop-blur-sm ${msg.role === 'user'
                                            ? 'bg-slate-900/90 text-white rounded-tr-none'
                                            : 'bg-white/90 text-slate-800 border border-white/50 rounded-tl-none shadow-md'
                                            }`}>
                                            {msg.parts[0].text}
                                        </div>
                                    </div>
                                ))}
                                {isAiLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/90 backdrop-blur-md px-5 py-4 rounded-2xl rounded-tl-none border border-white/50 flex gap-2 items-center text-slate-800 shadow-md">
                                            <LucideIcons.Loader size={16} className="animate-spin text-amber-500" />
                                            <span className="text-sm font-bold">猪猪思考中...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-white/95 border-t border-slate-100 relative z-10">
                                <form onSubmit={handleChatSubmit} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="输入消息..."
                                        className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all outline-none font-medium"
                                        autoFocus
                                        disabled={isAiLoading}
                                    />
                                    <button
                                        disabled={isAiLoading || !chatInput.trim()}
                                        type="submit"
                                        className="bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl px-4 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <LucideIcons.Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchPanel;
