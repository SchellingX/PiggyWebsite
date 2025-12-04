
import React, { useRef } from 'react';
import HomeCarousel from '../components/HomeCarousel';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Clock, Trash2, GripVertical, Plus } from 'lucide-react';
import { HomeSection } from '../types';

const Home: React.FC = () => {
  const { 
    blogs, 
    apps, 
    reminders, 
    homeSections, 
    isHomeEditing, 
    updateHomeSections,
    siteTheme 
  } = useData();

  // 获取概览数据
  const recentBlogs = blogs.slice(0, 3);
  const quickApps = apps.slice(0, 4);
  const incompleteReminders = reminders.filter(r => !r.completed);

  // --- 布局管理逻辑 ---
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === homeSections.length - 1)) return;
    const newSections = [...homeSections];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];
    updateHomeSections(newSections);
  };

  const deleteSection = (id: string) => {
    const newSections = homeSections.map(s => s.id === id ? { ...s, visible: false } : s);
    updateHomeSections(newSections);
  };

  const addSection = (id: string) => {
    const newSections = homeSections.map(s => s.id === id ? { ...s, visible: true } : s);
    updateHomeSections(newSections);
  };
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newSections = [...homeSections];
    const draggedItemContent = newSections.splice(dragItem.current, 1)[0];
    newSections.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    updateHomeSections(newSections);
  };

  // --- 渲染各个版块 ---
  const renderSection = (section: HomeSection, index: number) => {
    if (!section.visible && !isHomeEditing) return null;

    let content = null;
    switch (section.type) {
      case 'carousel':
        content = <HomeCarousel />;
        break;
      case 'apps':
        content = (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">快速访问</h2>
              {!isHomeEditing && (
                <Link to="/apps" className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center">
                  查看全部 <ArrowRight size={16} className="ml-1" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {quickApps.map((app) => (
                <Link
                  key={app.id}
                  to={isHomeEditing ? '#' : "/apps"}
                  className={`bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-amber-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 border border-white group ${isHomeEditing ? 'pointer-events-none' : ''}`}
                >
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300 group-hover:bg-amber-100">
                    <div className="font-bold text-xl">{app.name.charAt(0)}</div>
                  </div>
                  <span className="font-bold text-slate-700">{app.name}</span>
                </Link>
              ))}
            </div>
          </>
        );
        break;
      case 'blogs':
        content = (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">最新故事</h2>
              {!isHomeEditing && (
                <Link to="/blog" className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center">
                  阅读博客 <ArrowRight size={16} className="ml-1" />
                </Link>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recentBlogs.map((blog) => (
                <div key={blog.id} className={`bg-[#FFF9E6] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-amber-100 transition-all duration-300 border-2 border-white flex flex-col h-full ${isHomeEditing ? 'pointer-events-none' : ''}`}>
                  <div className="h-48 overflow-hidden">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center text-xs text-slate-400 mb-3 space-x-3 font-medium">
                      <span className="flex items-center"><Calendar size={12} className="mr-1" /> {new Date(blog.date).toLocaleDateString()}</span>
                      <span className="flex items-center"><User size={12} className="mr-1" /> {blog.author.name}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{blog.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 flex-1 line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                    <div className="text-amber-600 font-bold text-sm mt-auto inline-block hover:underline">
                      阅读更多
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
        break;
      case 'notices':
        content = (
          <div className="bg-amber-50/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-amber-100 shadow-inner">
            <h2 className="text-xl font-bold text-amber-800 mb-4 flex items-center">
              <Clock className="mr-2" /> 家庭公告栏
            </h2>
            {incompleteReminders.length > 0 ? (
              <ul className="space-y-3">
                {incompleteReminders.slice(0, 5).map(reminder => (
                  <li key={reminder.id} className="flex items-start gap-3 text-amber-900/80 font-medium">
                    <span className="w-2 h-2 mt-2 rounded-full bg-amber-400 shrink-0"></span>
                    <span>{reminder.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
               <p className="text-amber-800/60 italic font-medium">太棒了，目前没有待办事项！</p>
            )}
             {!isHomeEditing && incompleteReminders.length > 0 && (
                <div className="mt-4 pt-4 border-t border-amber-200/50">
                    <Link to="/apps" className="text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center">
                        前往提醒事项处理 <ArrowRight size={14} className="ml-1"/>
                    </Link>
                </div>
             )}
          </div>
        );
        break;
    }

    if (isHomeEditing) {
      if (!section.visible) return null;
      return (
        <div 
          key={section.id} 
          className="relative group mb-12 p-4 border-2 border-dashed border-amber-300 rounded-3xl bg-amber-50/30 hover:bg-amber-50 transition-colors"
          draggable
          onDragStart={(e) => { dragItem.current = index; e.currentTarget.style.opacity = '0.5'; }}
          onDragEnter={(e) => { dragOverItem.current = index; }}
          onDragEnd={(e) => { e.currentTarget.style.opacity = '1'; handleSort(); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg z-10 cursor-move">
             <GripVertical size={14} /> 拖拽移动
          </div>
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
             <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="bg-white p-2 rounded-full shadow-md text-slate-600 hover:text-amber-500 disabled:opacity-30 transition-colors"><ArrowRight size={16} className="-rotate-90" /></button>
             <button onClick={() => moveSection(index, 'down')} disabled={index === homeSections.length - 1} className="bg-white p-2 rounded-full shadow-md text-slate-600 hover:text-amber-500 disabled:opacity-30 transition-colors"><ArrowRight size={16} className="rotate-90" /></button>
             <button onClick={() => deleteSection(section.id)} className="bg-white p-2 rounded-full shadow-md text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
          </div>
          <div className="opacity-60 pointer-events-none grayscale-[0.2]">{content}</div>
        </div>
      );
    }

    return <section key={section.id} className="animate-fade-in">{content}</section>;
  };

  return (
    <div className="min-h-screen">
      {/* 
        Hero Header Section
        Full width banner merging into content
      */}
      <div className="relative w-full h-[65vh] overflow-hidden">
        {/* Banner Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url('${siteTheme.homeBanner}')` }}
        />
        
        {/* Gradient Overlay for blending - Fades from transparent to the page background color */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#FDFCFD]" />

        {/* Text Overlay */}
        <div className="absolute top-1/2 left-0 w-full text-center px-4 -translate-y-1/2">
             <h1 className="text-4xl md:text-7xl font-bold text-white drop-shadow-xl font-serif tracking-wide mb-4 animate-fade-in">暖暖的猪窝</h1>
             <p className="text-white/95 text-xl md:text-2xl font-medium drop-shadow-lg tracking-wider animate-fade-in delay-100">记录爱与泥巴的点点滴滴</p>
        </div>
      </div>

      {/* 
        Main Content Area 
        Overlaps the banner slightly with negative margin
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-32 pb-10">
          <div className="space-y-16">
            {homeSections.map((section, index) => renderSection(section, index))}
            
            {isHomeEditing && (
              <div className="border-t-2 border-dashed border-slate-200 pt-8 mt-12 bg-white/50 p-6 rounded-3xl">
                  <h3 className="text-center text-slate-400 font-medium mb-6">已隐藏的板块 (点击添加)</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                      {homeSections.filter(s => !s.visible).map(section => (
                          <button
                              key={section.id}
                              onClick={() => addSection(section.id)}
                              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 font-bold hover:border-amber-400 hover:text-amber-600 transition-all"
                          >
                              <Plus size={18} /> {section.title}
                          </button>
                      ))}
                  </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default Home;
