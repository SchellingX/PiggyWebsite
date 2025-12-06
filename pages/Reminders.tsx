import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';

const Reminders: React.FC = () => {
    const { user, reminders, addReminder, toggleReminder, deleteReminder } = useData();

    // Filter State
    const [filter, setFilter] = useState<'all' | 'today' | 'scheduled'>('all');
    const [newTask, setNewTask] = useState('');

    // --- ACCESS CONTROL: GUEST GUARD ---
    if (user?.role === 'guest') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center animate-fade-in">
                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6 text-slate-400">
                    <LucideIcons.Lock size={48} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">访问受限</h1>
                <p className="text-slate-500 mb-8 max-w-md">抱歉，游客无法查看家庭提醒事项。这是一个私密应用。</p>
                <Link to="/" className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all transform active:scale-95">
                    返回大厅
                </Link>
            </div>
        );
    }
    // -----------------------------------

    const sortedReminders = [...reminders].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });

    const filteredReminders = sortedReminders.filter(r => {
        if (filter === 'all') return true;
        // TODO: Implement actual date filtering for 'today' and 'scheduled'
        return true;
    });

    const incompleteCount = reminders.filter(r => !r.completed).length;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.trim()) {
            addReminder(newTask);
            setNewTask('');
        }
    };

    return (
        <div className="flex h-screen bg-white text-slate-900 font-sans overflow-hidden">
            {/* Sidebar (iOS Style) */}
            <div className="w-80 bg-slate-100/50 flex flex-col border-r border-slate-200">
                <div className="p-4 pt-12">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <LucideIcons.Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input type="text" placeholder="Search" className="w-full bg-slate-200/50 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-slate-200 transition-colors" />
                    </div>

                    {/* Smart Lists Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button onClick={() => setFilter('today')} className={`p-3 rounded-xl text-left flex flex-col justify-between h-20 shadow-sm transition-all ${filter === 'today' ? 'bg-blue-500 text-white shadow-blue-200' : 'bg-white hover:bg-slate-50'}`}>
                            <div className="flex justify-between items-start w-full">
                                <div className={`p-1.5 rounded-full ${filter === 'today' ? 'bg-white/20' : 'bg-blue-100 text-blue-500'}`}><LucideIcons.Calendar size={18} /></div>
                                <span className="text-xl font-bold">{incompleteCount}</span>
                            </div>
                            <span className={`text-xs font-bold ${filter === 'today' ? 'text-white/90' : 'text-slate-500'}`}>Today</span>
                        </button>

                        <button onClick={() => setFilter('scheduled')} className={`p-3 rounded-xl text-left flex flex-col justify-between h-20 shadow-sm transition-all ${filter === 'scheduled' ? 'bg-red-500 text-white shadow-red-200' : 'bg-white hover:bg-slate-50'}`}>
                            <div className="flex justify-between items-start w-full">
                                <div className={`p-1.5 rounded-full ${filter === 'scheduled' ? 'bg-white/20' : 'bg-red-100 text-red-500'}`}><LucideIcons.Clock size={18} /></div>
                                <span className="text-xl font-bold">0</span>
                            </div>
                            <span className={`text-xs font-bold ${filter === 'scheduled' ? 'text-white/90' : 'text-slate-500'}`}>Scheduled</span>
                        </button>

                        <button onClick={() => setFilter('all')} className={`p-3 rounded-xl text-left flex flex-col justify-between h-20 shadow-sm transition-all col-span-2 ${filter === 'all' ? 'bg-slate-800 text-white shadow-slate-200' : 'bg-white hover:bg-slate-50'}`}>
                            <div className="flex justify-between items-start w-full">
                                <div className={`p-1.5 rounded-full ${filter === 'all' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}><LucideIcons.Inbox size={18} /></div>
                                <span className="text-xl font-bold">{reminders.length}</span>
                            </div>
                            <span className={`text-xs font-bold ${filter === 'all' ? 'text-white/90' : 'text-slate-500'}`}>All</span>
                        </button>
                    </div>

                    {/* Personal Lists */}
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">My Lists</div>
                    <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-200/50 text-slate-800 font-medium">
                            <div className="w-7 h-7 rounded-full bg-orange-400 flex items-center justify-center text-white"><LucideIcons.List size={14} /></div>
                            <span>Reminders</span>
                            <span className="ml-auto text-slate-400">{reminders.length}</span>
                        </button>
                    </div>
                </div>

                {/* Footer - Simplified */}
                <div className="mt-auto p-4 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3 text-slate-400">
                        <LucideIcons.HardDrive size={18} />
                        <div className="flex-1">
                            <div className="text-xs font-bold text-slate-500 uppercase">Storage</div>
                            <div className="text-sm font-medium">Local Only</div>
                        </div>
                        <LucideIcons.Info size={14} className="text-slate-300" />
                    </div>
                    {/* Cloud Sync Feature - Coming Soon */}
                    {/* Future: Add Outlook/iCloud sync here */}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl z-10 flex items-center px-8 border-b border-transparent">
                    <h1 className="text-3xl font-bold text-blue-600">{filter === 'today' ? 'Today' : filter === 'scheduled' ? 'Scheduled' : 'Reminders'}</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-24 pb-32 custom-scrollbar">
                    {/* Incomplete Tasks */}
                    <div className="space-y-1">
                        {filteredReminders.filter(r => !r.completed).map(r => (
                            <div key={r.id} className="group flex items-start gap-4 py-3 border-b border-slate-100 hover:bg-slate-50 -mx-4 px-4 transition-colors">
                                <button
                                    onClick={() => toggleReminder(r)}
                                    className="mt-1 w-5 h-5 rounded-full border-2 border-slate-300 hover:border-blue-500 transition-colors"
                                ></button>
                                <div className="flex-1">
                                    <div className="text-slate-800 text-lg leading-snug">{r.text}</div>
                                    {r.source === 'cloud' && <div className="text-xs text-blue-400 font-medium mt-1 flex items-center gap-1"><LucideIcons.Cloud size={10} /> Cloud Synced</div>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredReminders.filter(r => !r.completed).length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <LucideIcons.CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="font-medium">All done! No pending reminders.</p>
                        </div>
                    )}

                    {/* Completed Section */}
                    {filteredReminders.some(r => r.completed) && (
                        <div className="mt-12">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Completed</h3>
                            <div className="space-y-1 opacity-60">
                                {filteredReminders.filter(r => r.completed).map(r => (
                                    <div key={r.id} className="group flex items-start gap-4 py-3 border-b border-slate-100 -mx-4 px-4">
                                        <button
                                            onClick={() => toggleReminder(r)}
                                            className="mt-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-blue-500 flex items-center justify-center transition-colors"
                                        >
                                            <LucideIcons.Check size={12} className="text-white" />
                                        </button>
                                        <div className="flex-1">
                                            <div className="text-slate-800 text-lg leading-snug line-through decoration-slate-300">{r.text}</div>
                                        </div>
                                        <button onClick={() => deleteReminder(r.id)} className="text-slate-300 hover:text-red-500 transition-colors"><LucideIcons.Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                    <form onSubmit={handleAdd}>
                        <input
                            value={newTask}
                            onChange={e => setNewTask(e.target.value)}
                            type="text"
                            placeholder="+ New Reminder"
                            className="w-full text-lg font-medium bg-transparent border-none focus:ring-0 placeholder-slate-400"
                        />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Reminders;
