import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { BlogPost } from '../types';
import { MessageSquare, Heart, Plus, X, Calendar, User, Tag, Image as ImageIcon, Trash2, Edit } from 'lucide-react';

const Blog: React.FC = () => {
  const { blogs, addBlog, updateBlog, deleteBlog, likeBlog, user } = useData();
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  
  // New/Edit Blog State
  const [blogId, setBlogId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save Draft key
  const DRAFT_KEY = `blog_draft_${user.id}`;

  // Load Draft on Init
  useEffect(() => {
    if (isCreating && !isEditingMode) {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const { title: dTitle, content: dContent, coverImage: dImage } = JSON.parse(savedDraft);
          setTitle(dTitle || '');
          setContent(dContent || '');
          setCoverImage(dImage || '');
        } catch (e) {
          console.error("Failed to load draft", e);
        }
      } else {
          // Random default image if new
          setCoverImage(`https://picsum.photos/id/${Math.floor(Math.random() * 50)}/800/400`);
      }
    }
  }, [isCreating, isEditingMode, DRAFT_KEY]);

  // Save Draft logic
  useEffect(() => {
    if (isCreating && !isEditingMode) {
      const timer = setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content, coverImage }));
      }, 1000); // Debounce 1s
      return () => clearTimeout(timer);
    }
  }, [title, content, coverImage, isCreating, isEditingMode, DRAFT_KEY]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditingMode && blogId) {
       // Update existing
       const original = blogs.find(b => b.id === blogId);
       if (original) {
           const updatedPost: BlogPost = {
               ...original,
               title,
               content,
               excerpt: content.substring(0, 100) + '...',
               image: coverImage || original.image
           };
           updateBlog(updatedPost);
       }
    } else {
        // Create new
        const newPost: BlogPost = {
          id: Date.now().toString(),
          title,
          content,
          excerpt: content.substring(0, 100) + '...',
          author: user,
          date: new Date().toISOString(),
          tags: ['家庭'],
          likes: 0,
          image: coverImage,
          comments: []
        };
        addBlog(newPost);
        // Clear draft
        localStorage.removeItem(DRAFT_KEY);
    }

    closeModal();
  };

  const openEditModal = (blog: BlogPost) => {
      setBlogId(blog.id);
      setTitle(blog.title);
      setContent(blog.content);
      setCoverImage(blog.image || '');
      setIsEditingMode(true);
      setIsCreating(true);
  };

  const closeModal = () => {
      setIsCreating(false);
      setIsEditingMode(false);
      setTitle('');
      setContent('');
      setCoverImage('');
      setBlogId('');
  };

  const handleDelete = (id: string) => {
      if (confirm('确定要删除这篇文章吗？')) {
          deleteBlog(id);
          if (selectedBlog?.id === id) setSelectedBlog(null);
      }
  };

  const canModify = (blog: BlogPost) => {
      return user.role === 'admin' || user.id === blog.author.id;
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">家庭博客</h1>
          <p className="text-slate-500 mt-1">分享生活点滴</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-rose-200 transition-all active:scale-95"
        >
          <Plus size={18} /> 新建文章
        </button>
      </div>

      {/* Main Content Area */}
      {selectedBlog ? (
        // Detail View
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
          <div className="relative h-64 md:h-80 w-full">
            <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 flex gap-2">
                {canModify(selectedBlog) && (
                    <>
                        <button 
                            onClick={() => openEditModal(selectedBlog)}
                            className="bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full backdrop-blur-md transition-all shadow-sm"
                            title="编辑"
                        >
                            <Edit size={20} />
                        </button>
                        <button 
                            onClick={() => handleDelete(selectedBlog.id)}
                            className="bg-white/90 hover:bg-red-500 hover:text-white text-slate-700 p-2 rounded-full backdrop-blur-md transition-all shadow-sm"
                            title="删除"
                        >
                            <Trash2 size={20} />
                        </button>
                    </>
                )}
                <button 
                onClick={() => setSelectedBlog(null)}
                className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-all"
                >
                <X size={20} />
                </button>
            </div>
            
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
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row gap-6 relative"
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

      {/* Create/Edit Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">{isEditingMode ? '编辑文章' : '写新故事'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            {!isEditingMode && (
                <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded-xl text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    草稿会自动保存
                </div>
            )}

            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">封面图片</label>
                <div 
                    className="w-full h-40 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-slate-50 transition-colors overflow-hidden relative group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {coverImage ? (
                        <>
                            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-medium flex items-center gap-2"><ImageIcon size={18}/> 更换图片</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-slate-400">
                            <ImageIcon className="mx-auto mb-2" size={24} />
                            <span className="text-sm">点击上传封面</span>
                        </div>
                    )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">标题</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="这个故事关于什么？"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">内容</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="分享细节..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 rounded-full text-slate-600 font-medium hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-rose-500 text-white font-medium hover:bg-rose-600 shadow-md shadow-rose-200 transition-all"
                >
                  {isEditingMode ? '更新' : '发布'}
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