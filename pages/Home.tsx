import React from 'react';
import HomeCarousel from '../components/HomeCarousel';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Clock } from 'lucide-react';

const Home: React.FC = () => {
  const { blogs, apps } = useData();
  const recentBlogs = blogs.slice(0, 3);
  const quickApps = apps.slice(0, 4);

  return (
    <div className="space-y-12 pb-10">
      {/* Hero Section */}
      <section className="animate-fade-in">
        <HomeCarousel />
      </section>

      {/* Quick Apps Grid */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">快速访问</h2>
          <Link to="/apps" className="text-rose-500 hover:text-rose-600 text-sm font-medium flex items-center">
            查看全部 <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickApps.map((app) => (
            <Link
              key={app.id}
              to="/apps"
              className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-3 border border-slate-100 group"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform duration-300">
                {/* Fallback for dynamic icons would go here, simplified for demo */}
                <div className="font-bold text-xl">{app.name.charAt(0)}</div>
              </div>
              <span className="font-medium text-slate-700">{app.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Updates */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">最新故事</h2>
          <Link to="/blog" className="text-rose-500 hover:text-rose-600 text-sm font-medium flex items-center">
            阅读博客 <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {recentBlogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col h-full">
              <div className="h-48 overflow-hidden">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center text-xs text-slate-400 mb-3 space-x-3">
                  <span className="flex items-center"><Calendar size={12} className="mr-1" /> {new Date(blog.date).toLocaleDateString()}</span>
                  <span className="flex items-center"><User size={12} className="mr-1" /> {blog.author.name}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{blog.title}</h3>
                <p className="text-slate-500 text-sm mb-4 flex-1 line-clamp-2">{blog.excerpt}</p>
                <Link to={`/blog`} className="text-rose-500 font-medium text-sm hover:underline mt-auto inline-block">
                  阅读更多
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notice Board */}
      <section className="bg-amber-50 rounded-2xl p-6 md:p-8 border border-amber-100">
        <h2 className="text-xl font-bold text-amber-800 mb-4 flex items-center">
          <Clock className="mr-2" /> 家庭公告栏
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-amber-900/80">
            <span className="w-2 h-2 mt-2 rounded-full bg-amber-400 shrink-0"></span>
            <span>记得周二给植物浇水！ - 猪妈妈</span>
          </li>
          <li className="flex items-start gap-3 text-amber-900/80">
            <span className="w-2 h-2 mt-2 rounded-full bg-amber-400 shrink-0"></span>
            <span>猪爷爷这周五要来吃晚饭。</span>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Home;