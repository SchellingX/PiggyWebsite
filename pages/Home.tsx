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
    type SearchEngine = 'site' | 'ai' | 'bing' | 'google';
    const [engine, setEngine] = useState<SearchEngine>('ai');
    const [query, setQuery] = useState('');
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const { blogs } = useData();

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        switch (engine) {
            case 'google':
                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                break;
            case 'bing':
                window.open(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, '_blank');
                break;
            case 'ai':
                setIsAiModalOpen(true);
                setIsAiLoading(true);
                try {
                    const response = await askGemini(query);
                    setAiResponse(response);
                } catch (error: any) {
                    setAiResponse(error.message || 'AI 请求失败。');
                } finally {
                    setIsAiLoading(false);
                }
                break;
            case 'site':
                // Simple site search
                const blogResults = blogs.filter(b => b.title.includes(query) || b.content.includes(query));
                // For a sun-panel, we might just show an alert or a simple modal results. 
                // A full search results page was requested to be simplified/removed.
                // We'll use a simple alert for now as per "simplify search page".
                const resultText = blogResults.length > 0
                    ? `找到 ${blogResults.length} 篇相关博客:\n` + blogResults.map(b => `- ${b.title}`).join('\n')
                    : '未找到相关内容';
                alert(resultText);
                break;
        }
    };

    const SearchButton: React.FC<{
        label: string,
        current: SearchEngine,
        target: SearchEngine,
        icon: React.ReactNode
    }> = ({ label, current, target, icon }) => (
        <button
            type="button"
            onClick={() => setEngine(target)}
            className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all border backdrop-blur-md ${current === target
                ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-md scale-105'
                : 'bg-black/30 text-white/80 border-transparent hover:bg-black/40 hover:text-white'
                }`}
        >
            {icon} {label}
        </button>
    )

    return (
        <div className="w-full max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-center items-center gap-3 mb-6">
                <SearchButton label="AI问答" current={engine} target="ai" icon={<LucideIcons.Sparkles size={16} />} />
                <SearchButton label="站内" current={engine} target="site" icon={<LucideIcons.Library size={16} />} />
                <SearchButton label="必应" current={engine} target="bing" icon={<LucideIcons.Globe size={16} />} />
                <SearchButton label="Google" current={engine} target="google" icon={<LucideIcons.Globe size={16} />} />
            </div>
            <form onSubmit={handleSearch} className="relative group mx-4 md:mx-0">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <LucideIcons.Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 z-10 transition-colors group-focus-within:text-amber-500" size={24} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={engine === 'ai' ? '今天想聊点什么...' : '搜索...'}
                    className="w-full bg-white/90 backdrop-blur-xl border-2 border-transparent rounded-full pl-16 pr-36 py-4 md:py-5 text-lg font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-400/30 focus:bg-white focus:border-amber-300 shadow-2xl transition-all relative z-0"
                />
                <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-900 text-white font-bold px-6 py-2.5 md:py-3 rounded-full shadow-lg hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all z-10">
                    {engine === 'ai' ? '提问' : 'GO'}
                </button>
            </form>

            {/* AI Modal */}
            {isAiModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsAiModalOpen(false)}>
                    <div className="bg-white max-w-2xl w-full rounded-3xl p-8 shadow-2xl relative animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <LucideIcons.Sparkles className="text-amber-500 fill-current" />
                                AI 助手
                            </h3>
                            <button onClick={() => setIsAiModalOpen(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-200 transition-colors"><LucideIcons.X size={20} className="text-slate-500" /></button>
                        </div>

                        {isAiLoading ? (
                            <div className="text-center p-12">
                                <LucideIcons.Loader className="animate-spin text-amber-500 mx-auto mb-4" size={48} />
                                <p className="text-slate-500 font-bold animate-pulse">正在思考中...</p>
                            </div>
                        ) : (
                            <div className="prose prose-slate max-w-none max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-lg">{aiResponse}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// 3. Apps Panel
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
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:bg-purple-500 group-hover:border-purple-400 group-hover:shadow-purple-500/50 transition-all duration-300">
                        <LucideIcons.Image size={32} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-bold text-white drop-shadow-md group-hover:text-white transition-colors">相册</span>
                </Link>

                {/* 2. Blog (Built-in) */}
                <Link to="/blog" className="group flex flex-col items-center gap-3 w-20 md:w-24">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:bg-pink-500 group-hover:border-pink-400 group-hover:shadow-pink-500/50 transition-all duration-300">
                        <LucideIcons.BookHeart size={32} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-bold text-white drop-shadow-md group-hover:text-white transition-colors">博客</span>
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
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:bg-white group-hover:text-amber-600 group-hover:shadow-white/50 transition-all duration-300">
                            <Icon name={app.icon as keyof typeof LucideIcons} size={32} strokeWidth={1.5} />
                        </div>
                        <span className="text-sm font-bold text-white drop-shadow-md truncate w-full text-center group-hover:text-white transition-colors">{app.name}</span>
                    </a>
                ))}

                {/* Add Button */}
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="group flex flex-col items-center gap-3 w-20 md:w-24 opacity-70 hover:opacity-100 transition-opacity"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-black/20 backdrop-blur-sm border-2 border-white/30 border-dashed rounded-3xl flex items-center justify-center text-white group-hover:bg-white/20 group-hover:border-white transition-all duration-300">
                        <LucideIcons.Plus size={32} />
                    </div>
                    <span className="text-sm font-bold text-white drop-shadow-md">添加</span>
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

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