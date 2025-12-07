import React, { useState, FormEvent } from 'react';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { AppItem } from '../../types';

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

export default AppsPanel;
