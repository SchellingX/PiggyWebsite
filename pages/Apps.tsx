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
  
  // Reminders Modal State
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [newReminderText, setNewReminderText] = useState('');

  // Permissions
  const canEdit = user.role === 'admin';

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by category
  const categories = Array.from(new Set(apps.map(a => a.category)));

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp: AppItem = {
      id: Date.now().toString(),
      name: newAppName,
      icon: 'Box', // Default icon
      category: '自定义',
      description: '自定义家庭应用',
      url: '#'
    };
    addApp(newApp);
    setIsAdding(false);
    setNewAppName('');
  };

  const handleAppClick = (app: AppItem) => {
    if (app.id === 'app-reminders') {
        setIsRemindersOpen(true);
    } else {
        // Default behavior for other apps (could be external links)
        console.log(`Clicked on ${app.name}`);
    }
  };

  const handleAddReminder = (e: React.FormEvent) => {
      e.preventDefault();
      if (newReminderText.trim()) {
          addReminder(newReminderText);
          setNewReminderText('');
      }
  };

  // Dynamic Icon Renderer
  const IconRenderer = ({ name }: { name: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LucideIcon = (Icons as any)[name] || Icons.Box;
    return <LucideIcon size={28} />;
  };

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">家庭应用</h1>
          <p className="text-slate-500 mt-1">管理猪一家的工具。</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="查找应用..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm w-48 transition-all"
                />
            </div>
            {canEdit && (
              <button 
                  onClick={() => setIsAdding(true)}
                  className="bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition-all shadow-lg"
              >
                  <Plus size={20} />
              </button>
            )}
        </div>
      </div>

      {categories.map(category => {
          const categoryApps = filteredApps.filter(app => app.category === category);
          if (categoryApps.length === 0) return null;

          return (
            <div key={category} className="mb-8">
                <h2 className="text-lg font-bold text-slate-700 mb-4 px-1">{category}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {categoryApps.map(app => (
                        <div 
                            key={app.id} 
                            onClick={() => handleAppClick(app)}
                            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col items-center text-center relative"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mb-3 shadow-inner group-hover:scale-110 transition-transform">
                                <IconRenderer name={app.icon} />
                            </div>
                            <h3 className="font-semibold text-slate-800 text-sm mb-1">{app.name}</h3>
                            <p className="text-xs text-slate-400 line-clamp-1">{app.description}</p>
                            
                            {canEdit && (
                              <button className="absolute top-3 right-3 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal size={16} />
                              </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          );
      })}

      {/* Add App Modal */}
      {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
             <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-slate-800">添加快捷方式</h3>
                     <button onClick={() => setIsAdding(false)}><X className="text-slate-400" size={20} /></button>
                 </div>
                 <form onSubmit={handleAddApp}>
                     <input 
                        type="text" 
                        placeholder="应用名称" 
                        value={newAppName}
                        onChange={(e) => setNewAppName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 mb-4 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        required
                     />
                     <button type="submit" className="w-full bg-rose-500 text-white py-2 rounded-xl font-medium">添加</button>
                 </form>
             </div>
          </div>
      )}

      {/* Reminders Modal */}
      {isRemindersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                  <Icons.ListTodo size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">提醒事项</h2>
                    <p className="text-xs text-slate-500">{reminders.filter(r => !r.completed).length} 个待办</p>
                </div>
              </div>
              <button onClick={() => setIsRemindersOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-white/50 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {reminders.map(reminder => (
                    <div key={reminder.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <button 
                            onClick={() => toggleReminder(reminder.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                reminder.completed ? 'bg-rose-500 border-rose-500' : 'border-slate-300 hover:border-rose-400'
                            }`}
                        >
                            {reminder.completed && <Check size={14} className="text-white" />}
                        </button>
                        <span className={`flex-1 text-slate-700 font-medium ${reminder.completed ? 'line-through text-slate-400' : ''}`}>
                            {reminder.text}
                        </span>
                        <button 
                            onClick={() => deleteReminder(reminder.id)}
                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {reminders.length === 0 && (
                    <div className="text-center text-slate-400 py-10">
                        <p>没有待办事项！尽情玩泥巴吧！</p>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
                <form onSubmit={handleAddReminder} className="relative">
                    <input 
                        type="text" 
                        placeholder="添加新提醒..." 
                        value={newReminderText}
                        onChange={(e) => setNewReminderText(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white shadow-sm"
                    />
                    <button 
                        type="submit" 
                        disabled={!newReminderText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:hover:bg-rose-500 transition-all"
                    >
                        <Plus size={20} />
                    </button>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Apps;