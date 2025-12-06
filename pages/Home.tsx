import React, { useState, useEffect, FormEvent } from 'react';
import { useData } from '../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { AppItem } from '../types';
import { askGemini } from '../services/geminiService';

// --- Sub-components for the new Home Page ---

// 1. Clock Panel
const ClockPanel: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const date = time.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    const day = time.toLocaleDateString('zh-CN', { weekday: 'long' });
    const timeString = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

    return (
        <div className="text-center flex flex-col justify-center items-center mb-10 drop-shadow-lg animate-fade-in-up">
            <p className="text-7xl md:text-9xl font-bold text-white tracking-tighter" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>{timeString}</p>
            <p className="text-xl md:text-2xl text-white/90 font-medium mt-2 tracking-widest uppercase">{date} {day}</p>
        </div>
    );
};

// 2. Search Panel
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
            const res = await fetch(`/api/chat/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setSessions(data.sessions || []);
            }
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
            const res = await fetch(`/api/chat/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: currentSessionId,
                    messages: storageMessages
                })
            });
            if (res.ok) {
                const session = await res.json();
                setCurrentSessionId(session.id);
                // Update sessions list
                setSessions(prev => {
                    const existing = prev.find(s => s.id === session.id);
                    if (existing) {
                        return prev.map(s => s.id === session.id ? session : s);
                    }
                    return [session, ...prev];
                });
            }
        } catch (err) {
            console.error('Failed to save session:', err);
        }
    };

    // Delete a session
    const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || !confirm('确定删除这个对话？')) return;
        try {
            await fetch(`/api/chat/${user.id}?sessionId=${sessionId}`, { method: 'DELETE' });
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
            await fetch(`/api/chat/${user.id}`, { method: 'DELETE' });
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


const AppsPanel: React.FC = () => {
    const { apps, addApp } = useData();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newAppName, setNewAppName] = useState('');
    const [newAppUrl, setNewAppUrl] = useState('');
    const [newAppIcon, setNewAppIcon] = useState<keyof typeof LucideIcons>('Globe');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const Icon = ({ name, ...props }: { name: keyof typeof LucideIcons } & LucideIcons.LucideProps) => {
        const IconComponent = LucideIcons[name] as React.ElementType;
        if (!IconComponent) return <LucideIcons.Globe {...props} />;
        return <IconComponent {...props} />;
    };

    const handleAddNewApp = async (e: FormEvent) => {
        e.preventDefault();
        if (!newAppName || !newAppUrl) return;
        setIsSubmitting(true);
        try {
            await addApp({ name: newAppName, url: newAppUrl, icon: newAppIcon });
            setIsAddModalOpen(false);
            setNewAppName('');
            setNewAppUrl('');
            setNewAppIcon('Globe');
        } catch (error) {
            console.error("Failed to add new app", error);
            alert("添加应用失败，请检查URL是否正确。");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Main Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-y-8 gap-x-4 justify-items-center">

                {/* 1. Gallery (Built-in) */}
                <Link to="/gallery" className="group flex flex-col items-center gap-3 w-20 md:w-24">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md border border-amber-400/30 rounded-3xl flex items-center justify-center text-amber-400 shadow-lg group-hover:scale-110 group-hover:bg-purple-500 group-hover:border-purple-400 group-hover:text-white group-hover:shadow-purple-500/50 transition-all duration-300">
                        <LucideIcons.Image size={32} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-bold text-amber-400 drop-shadow-sm group-hover:text-white transition-colors">相册</span>
                </Link>

                {/* 2. Blog (Built-in) */}
                <Link to="/blog" className="group flex flex-col items-center gap-3 w-20 md:w-24">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md border border-amber-400/30 rounded-3xl flex items-center justify-center text-amber-400 shadow-lg group-hover:scale-110 group-hover:bg-pink-500 group-hover:border-pink-400 group-hover:text-white group-hover:shadow-pink-500/50 transition-all duration-300">
                        <LucideIcons.BookHeart size={32} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-bold text-amber-400 drop-shadow-sm group-hover:text-white transition-colors">博客</span>
                </Link>

                {/* 3. Reminders (Built-in) */}
                <Link to="/reminders" className="group flex flex-col items-center gap-3 w-20 md:w-24">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md border border-amber-400/30 rounded-3xl flex items-center justify-center text-amber-400 shadow-lg group-hover:scale-110 group-hover:bg-blue-500 group-hover:border-blue-400 group-hover:text-white group-hover:shadow-blue-500/50 transition-all duration-300">
                        <LucideIcons.ListTodo size={32} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-bold text-amber-400 drop-shadow-sm group-hover:text-white transition-colors">提醒</span>
                </Link>

                {/* Dynamic Apps */}
                {apps.map((app: AppItem) => (
                    <a
                        key={app.id}
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center gap-3 w-20 md:w-24"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md border border-amber-400/30 rounded-3xl flex items-center justify-center text-amber-400 shadow-lg group-hover:scale-110 group-hover:bg-white group-hover:text-amber-600 group-hover:shadow-white/50 transition-all duration-300">
                            <Icon name={app.icon as keyof typeof LucideIcons} size={32} strokeWidth={1.5} />
                        </div>
                        <span className="text-sm font-bold text-amber-400 drop-shadow-sm truncate w-full text-center group-hover:text-white transition-colors">{app.name}</span>
                    </a>
                ))}

                {/* Add Button */}
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="group flex flex-col items-center gap-3 w-20 md:w-24 opacity-80 hover:opacity-100 transition-opacity"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-black/20 backdrop-blur-sm border-2 border-amber-400/50 border-dashed rounded-3xl flex items-center justify-center text-amber-400 group-hover:bg-white/20 group-hover:border-white transition-all duration-300">
                        <LucideIcons.Plus size={32} />
                    </div>
                    <span className="text-sm font-bold text-amber-400 drop-shadow-sm">添加</span>
                </button>
            </div>

            {/* Add App Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
                    <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl relative animate-scale-in" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-800 mb-6">添加自定义应用</h3>
                        <form onSubmit={handleAddNewApp} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">名称</label>
                                <input type="text" value={newAppName} onChange={e => setNewAppName(e.target.value)} required className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400 transition-all font-medium" placeholder="例如: NAS" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">URL (链接)</label>
                                <input type="url" value={newAppUrl} onChange={e => setNewAppUrl(e.target.value)} required className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400 transition-all font-medium" placeholder="https://192.168.1.1" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">图标 (Lucide 图标名)</label>
                                <div className="flex gap-2">
                                    <input type="text" value={newAppIcon} onChange={e => setNewAppIcon(e.target.value as keyof typeof LucideIcons)} required className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400 transition-all font-medium" placeholder="Server" />
                                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                                        <Icon name={newAppIcon} size={24} />
                                    </div>
                                </div>
                                <a href="https://lucide.dev/icons" target="_blank" rel="noopener" className="text-xs text-amber-600 font-bold mt-2 inline-block hover:underline">查看所有图标 &rarr;</a>
                            </div>
                            <div className="flex justify-end gap-3 pt-6">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors">取消</button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all transform active:scale-95">
                                    {isSubmitting ? '添加中...' : '确认添加'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- The Main Home Component ---
const Home: React.FC = () => {
    const { siteTheme } = useData();

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed transition-all duration-500 overflow-hidden flex flex-col items-center"
            style={{ backgroundImage: `url('${siteTheme.homeBanner}')` }}
        >
            {/* Background overlay removed */}
            {/* <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" /> */}

            {/* Main Content Area - Centered Vertical Layout */}
            <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col justify-center items-center py-20 px-4">
                <ClockPanel />
                <SearchPanel />
                <AppsPanel />
            </div>

            {/* Simple Footer */}
            <div className="relative z-10 w-full p-6 text-center text-white/40 text-xs font-medium tracking-wide">
                PIGGY FAMILY HUB · {new Date().getFullYear()}
            </div>
        </div>
    );
};

export default Home;