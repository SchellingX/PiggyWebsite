import React, { useState, useEffect, FormEvent } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
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
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/50 text-center flex flex-col justify-center items-center">
            <p className="text-7xl md:text-8xl font-bold text-slate-800 tracking-tighter">{timeString}</p>
            <p className="text-lg text-amber-800/90 font-semibold mt-2">{date} {day}</p>
        </div>
    );
};

// 2. Search Panel
const SearchPanel: React.FC = () => {
    type SearchEngine = 'site' | 'ai' | 'baidu' | 'google';
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
            case 'baidu':
                window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(query)}`, '_blank');
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
                // For now, this is a placeholder. A real implementation would
                // navigate to a search results page.
                console.log(`Searching site for: "${query}"`);
                const blogResults = blogs.filter(b => b.title.includes(query) || b.content.includes(query));
                alert(`在博客中找到 ${blogResults.length} 个结果 (查看控制台)。`);
                console.log(blogResults);
                break;
        }
    };
    
    const SearchButton: React.FC<{
      label: string, 
      current: SearchEngine, 
      target: SearchEngine, 
      icon: React.ReactNode
    }> = ({label, current, target, icon}) => (
        <button
          type="button"
          onClick={() => setEngine(target)}
          className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all border-2 ${
            current === target 
              ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
              : 'bg-white text-slate-500 border-white hover:border-slate-200'
          }`}
        >
          {icon} {label}
        </button>
    )

    return (
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/50">
            <div className="flex justify-center items-center gap-2 mb-6">
                <SearchButton label="AI问答" current={engine} target="ai" icon={<LucideIcons.Sparkles size={16}/>} />
                <SearchButton label="站内" current={engine} target="site" icon={<LucideIcons.Library size={16}/>} />
                <SearchButton label="百度" current={engine} target="baidu" icon={<LucideIcons.Globe size={16}/>} />
                <SearchButton label="Google" current={engine} target="google" icon={<LucideIcons.Globe size={16}/>} />
            </div>
            <form onSubmit={handleSearch} className="relative">
                <LucideIcons.Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={engine === 'ai' ? '有什么可以帮您？' : '搜索...'}
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-14 pr-32 py-5 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400 transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-slate-800 transition-all">
                    {engine === 'ai' ? '提问' : '搜索'}
                </button>
            </form>
            {isAiModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsAiModalOpen(false)}>
                    <div className="bg-white max-w-2xl w-full rounded-2xl p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">AI 回复:</h3>
                        {isAiLoading ? (
                            <div className="text-center p-8">
                               <LucideIcons.Loader className="animate-spin text-amber-500 mx-auto" size={32} />
                               <p className="mt-4 text-slate-500">正在思考...</p>
                            </div>
                        ) : (
                            <div className="prose max-w-none text-slate-700 whitespace-pre-wrap">{aiResponse}</div>
                        )}
                        <button onClick={() => setIsAiModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><LucideIcons.X/></button>
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

    const Icon = ({ name, ...props }: {name: keyof typeof LucideIcons} & LucideIcons.LucideProps) => {
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
            // Reset form and close modal
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
        <>
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/50">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">应用中心</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {apps.map((app: AppItem) => (
                        <a 
                          key={app.id} 
                          href={app.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-slate-50 border-2 border-transparent hover:border-amber-300 hover:bg-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-center group transition-all"
                        >
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-slate-500 group-hover:text-amber-500 transition-colors shadow-sm">
                                <Icon name={app.icon as keyof typeof LucideIcons} size={24} />
                            </div>
                            <p className="text-xs font-bold text-slate-700 truncate w-full">{app.name}</p>
                        </a>
                    ))}
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-slate-50 border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-center group transition-all text-slate-400 hover:text-amber-600"
                    >
                        <div className="w-12 h-12 flex items-center justify-center">
                            <LucideIcons.PlusCircle size={24} />
                        </div>
                        <p className="text-xs font-bold">添加应用</p>
                    </button>
                </div>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
                    <div className="bg-white max-w-md w-full rounded-2xl p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-800 mb-6">添加新应用</h3>
                        <form onSubmit={handleAddNewApp} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-1 block">名称</label>
                                <input type="text" value={newAppName} onChange={e => setNewAppName(e.target.value)} required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="例如: 路由器"/>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-1 block">URL</label>
                                <input type="url" value={newAppUrl} onChange={e => setNewAppUrl(e.target.value)} required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="https://"/>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-1 block">图标 (来自 Lucide)</label>
                                <input type="text" value={newAppIcon} onChange={e => setNewAppIcon(e.target.value as keyof typeof LucideIcons)} required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="例如: Router"/>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-100">取消</button>
                                <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg bg-slate-800 text-white font-bold shadow-lg hover:bg-slate-700 disabled:opacity-50">
                                    {isSubmitting ? '添加中...' : '确认添加'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};


// --- The Main Home Component ---
const Home: React.FC = () => {
    const { siteTheme } = useData();

    return (
        <div 
          className="min-h-screen w-full bg-cover bg-center bg-fixed transition-all duration-500"
          style={{ backgroundImage: `url('${siteTheme.homeBanner}')` }}
        >
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
            <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Top-left panel: Clock */}
                    <div className="md:col-span-1">
                        <ClockPanel />
                    </div>
                    {/* Top-right panel: Search */}
                    <div className="md:col-span-2">
                        <SearchPanel />
                    </div>
                    {/* Full-width bottom panel: Apps */}
                    <div className="md:col-span-3">
                        <AppsPanel />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;