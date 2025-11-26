import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AppItem } from '../types';
import { Plus, X, Search, MoreHorizontal } from 'lucide-react';
import * as Icons from 'lucide-react';

const Apps: React.FC = () => {
  const { apps, addApp } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newAppName, setNewAppName] = useState('');

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
      category: 'Custom',
      description: 'A custom family app',
      url: '#'
    };
    addApp(newApp);
    setIsAdding(false);
    setNewAppName('');
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
          <h1 className="text-3xl font-bold text-slate-800">Family Apps</h1>
          <p className="text-slate-500 mt-1">Tools to keep the pig sty organized.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Find app..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm w-48 transition-all"
                />
            </div>
            <button 
                onClick={() => setIsAdding(true)}
                className="bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition-all shadow-lg"
            >
                <Plus size={20} />
            </button>
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
                            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col items-center text-center relative"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mb-3 shadow-inner group-hover:scale-110 transition-transform">
                                <IconRenderer name={app.icon} />
                            </div>
                            <h3 className="font-semibold text-slate-800 text-sm mb-1">{app.name}</h3>
                            <p className="text-xs text-slate-400 line-clamp-1">{app.description}</p>
                            
                            <button className="absolute top-3 right-3 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal size={16} />
                            </button>
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
                     <h3 className="text-lg font-bold text-slate-800">Add Shortcut</h3>
                     <button onClick={() => setIsAdding(false)}><X className="text-slate-400" size={20} /></button>
                 </div>
                 <form onSubmit={handleAddApp}>
                     <input 
                        type="text" 
                        placeholder="App Name" 
                        value={newAppName}
                        onChange={(e) => setNewAppName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 mb-4 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        required
                     />
                     <button type="submit" className="w-full bg-rose-500 text-white py-2 rounded-xl font-medium">Add</button>
                 </form>
             </div>
          </div>
      )}
    </div>
  );
};

export default Apps;
