import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { BlogPost } from '../types';
import { MessageSquare, Heart, Plus, X, Calendar, User, Tag } from 'lucide-react';

const Blog: React.FC = () => {
  const { blogs, addBlog, likeBlog, user } = useData();
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Permissions
  const canCreate = user.role === 'admin' || user.role === 'member';
  
  // New Blog State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      excerpt: newContent.substring(0, 100) + '...',
      author: user,
      date: new Date().toISOString(),
      tags: ['家庭'],
      likes: 0,
      image: `https://picsum.photos/id/${Math.floor(Math.random() * 50)}/800/400`,
      comments: []
    };
    addBlog(newPost);
    setIsCreating(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">家庭博客</h1>
          <p className="text-slate-500 mt-1">分享生活点滴</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-rose-200 transition-all active:scale-95"
          >
            <Plus size={18} /> 新建文章
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {selectedBlog ? (
        // Detail View
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
          <div className="relative h-64 md:h-80 w-full">
            <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" />
            <button 
              onClick={() => setSelectedBlog(null)}
              className="absolute top-4 right-4 bg-white/30 hover:bg-white/50 backdrop-blur-md p-2 rounded-full text-white transition-all"
            >
              <X size={24} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">{selectedBlog.title}</h1>
              <div className="flex items-center gap-4 text-sm opacity-90">
                 <span className="flex items-center gap-1"><User size={14}/> {selectedBlog.author.name}</span>
                 <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(selectedBlog.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="prose prose-slate max-w-none mb-8">
              <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">{selectedBlog.content}</p>
            </div>
            
            <div className="flex items-center gap-2 mb-8">
              {selectedBlog.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium flex items-center gap-1">
                  <Tag size={12} /> {tag}
                </span>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
              <button 
                onClick={() => likeBlog(selectedBlog.id)}
                className="flex items-center gap-2 text-rose-500 font-medium hover:bg-rose-50 px-4 py-2 rounded-full transition-colors"
              >
                <Heart size={20} className={selectedBlog.likes > 0 ? "fill-current" : ""} /> {selectedBlog.likes} 点赞
              </button>
              <div className="flex items-center gap-2 text-slate-500">
                <MessageSquare size={20} /> {selectedBlog.comments.length} 评论
              </div>
            </div>

            {/* Comments Section (Static for demo) */}
            <div className="mt-8 bg-slate-50 rounded-2xl p-6">
              <h3 className="font-bold text-slate-700 mb-4">评论</h3>
              {selectedBlog.comments.length > 0 ? (
                <div className="space-y-4">
                  {selectedBlog.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                        {comment.author.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-800">{comment.author}</span>
                          <span className="text-xs text-slate-400">{new Date(comment.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600 text-sm mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">暂无评论。快来抢沙发吧！</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        // List View
        <div className="space-y-6">
          {blogs.map((blog) => (
            <div 
              key={blog.id} 
              onClick={() => setSelectedBlog(blog)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row gap-6"
            >
              <div className="w-full md:w-48 h-48 md:h-auto shrink-0 rounded-xl overflow-hidden">
                 <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex-1 flex flex-col py-2">
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                  <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-medium">{blog.tags[0]}</span>
                  <span>{new Date(blog.date).toLocaleDateString()}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-rose-600 transition-colors">{blog.title}</h2>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{blog.excerpt}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={blog.author.avatar} alt={blog.author.name} className="w-6 h-6 rounded-full" />
                    <span className="text-sm text-slate-600 font-medium">{blog.author.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-sm">
                    <span className="flex items-center gap-1"><Heart size={14} /> {blog.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={14} /> {blog.comments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">写新故事</h2>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">标题</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="这个故事关于什么？"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">内容</label>
                <textarea
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="分享细节..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2 rounded-full text-slate-600 font-medium hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-rose-500 text-white font-medium hover:bg-rose-600 shadow-md shadow-rose-200 transition-all"
                >
                  发布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;