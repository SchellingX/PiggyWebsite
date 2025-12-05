import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AppItem } from '../types';
import { Plus, X, Search, MoreHorizontal, Check, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';

const Apps: React.FC = () => {
  const { apps, addApp, user, reminders, addReminder, toggleReminder, deleteReminder } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [newReminderText, setNewReminderText] = useState('');

  const canEdit = user?.role === 'admin';
  const filteredApps = apps.filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()) || app.category.toLowerCase().includes(searchTerm.toLowerCase()));
  const categories = Array.from(new Set(apps.map(a => a.category)));

  // --- 应用管理逻辑 ---
  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    addApp({ id: Date.now().toString(), name: newAppName, icon: 'Box', category: '自定义', description: '自定义应用', url: '#' });
    setIsAdding(false); setNewAppName('');
  };

  const handleAppClick = (app: AppItem) => { if (app.id === 'app-reminders') setIsRemindersOpen(true); };
  
  // --- 提醒事项逻辑 ---
  const handleAddReminder = (e: React.FormEvent) => { e.preventDefault(); if (newReminderText.trim()) { addReminder(newReminderText); setNewReminderText(''); } };
  
  // 动态渲染 Lucide 图标
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconRenderer = ({ name }: { name: string }) => { const LucideIcon = (Icons as any)[name] || Icons.Box; return <LucideIcon size={28} />; };

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">家庭应用</h1>
          <p className="text-slate-500 mt-1 font-medium">实用工具箱</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="查找应用..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm w-48 transition-all font-medium" />
            </div>
            {canEdit && (
              <button onClick={() => setIsAdding(true)} className="bg-slate-900 text-white p-2.5 rounded-full hover:bg-slate-700 transition-all shadow-lg"><Plus size={20} /></button>
            )}
        </div>
      </div>

      {/* 按类别渲染应用网格 */}
      {categories.map(category => {
          const categoryApps = filteredApps.filter(app => app.category === category);
          if (categoryApps.length === 0) return null;
          return (
            <div key={category} className="mb-10">
                <h2 className="text-lg font-bold text-slate-700 mb-5 px-1 border-l-4 border-amber-400 pl-3">{category}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {categoryApps.map(app => (
                        <div key={app.id} onClick={() => handleAppClick(app)} className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-white hover:shadow-xl hover:shadow-amber-100 hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col items-center text-center relative">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-4 shadow-inner group-hover:scale-110 transition-transform group-hover:bg-amber-100">
                                <IconRenderer name={app.icon} />
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm mb-1">{app.name}</h3>
                            <p className="text-xs text-slate-500 font-medium line-clamp-1">{app.description}</p>
                        </div>
                    ))}
                </div>
            </div>
          );
      })}

      {/* 添加应用弹窗 */}
      {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl font-serif">
                 <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-slate-800">添加快捷方式</h3><button onClick={() => setIsAdding(false)}><X className="text-slate-400" size={24} /></button></div>
                 <form onSubmit={handleAddApp}>
                     <input type="text" placeholder="应用名称" value={newAppName} onChange={(e) => setNewAppName(e.target.value)} className="w-full px-5 py-3 rounded-xl border border-slate-200 mb-6 focus:ring-2 focus:ring-amber-400 focus:outline-none font-medium" required />
                     <button type="submit" className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold shadow-lg">添加</button>
                 </form>
             </div>
          </div>
      )}

      {/* 提醒事项弹窗 */}
      {isRemindersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in font-serif">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm"><Icons.ListTodo size={28} /></div>
                <div><h2 className="text-xl font-bold text-slate-800">提醒事项</h2><p className="text-xs text-amber-600 font-bold">{reminders.filter(r => !r.completed).length} 个待办</p></div>
              </div>
              <button onClick={() => setIsRemindersOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {reminders.map(reminder => (
                    <div key={reminder.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <button onClick={() => toggleReminder(reminder.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${reminder.completed ? 'bg-amber-500 border-amber-500' : 'border-slate-300 hover:border-amber-400'}`}>{reminder.completed && <Check size={14} className="text-white" />}</button>
                        <span className={`flex-1 text-slate-700 font-bold ${reminder.completed ? 'line-through text-slate-400' : ''}`}>{reminder.text}</span>
                        <button onClick={() => deleteReminder(reminder.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"><Trash2 size={18} /></button>
                    </div>
                ))}
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50">
                <form onSubmit={handleAddReminder} className="relative">
                    <input type="text" placeholder="添加新提醒..." value={newReminderText} onChange={(e) => setNewReminderText(e.target.value)} className="w-full pl-5 pr-14 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white shadow-sm font-medium" />
                    <button type="submit" disabled={!newReminderText.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-all"><Plus size={20} /></button>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Apps;
