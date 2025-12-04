
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { BlogPost } from '../types';
import { MessageSquare, Heart, Plus, X, Calendar, User, Tag, Image as ImageIcon, Trash2, Edit, Save, Upload, Star, Send } from 'lucide-react';

const Blog: React.FC = () => {
  const { blogs, addBlog, updateBlog, deleteBlog, likeBlog, collectBlog, commentBlog, user } = useData();
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  
  // 编辑器状态
  const [blogId, setBlogId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [draftStatus, setDraftStatus] = useState<string>('');
  
  // 评论状态
  const [newComment, setNewComment] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

  // --- 草稿逻辑 ---
  const getDraftKey = () => `blog_draft_${user.id}_${isEditingMode && blogId ? `edit_${blogId}` : 'new'}`;

  useEffect(() => {
    if (isModalOpen) {
      const key = getDraftKey();
      const savedDraft = localStorage.getItem(key);
      if (savedDraft) {
        try {
          const { title: dTitle, content: dContent, coverImage: dImage, timestamp } = JSON.parse(savedDraft);
          if (!isEditingMode || (dTitle || dContent)) {
              setTitle(dTitle || '');
              setContent(dContent || '');
              if (dImage) setCoverImage(dImage);
              setDraftStatus(`已恢复草稿 (${new Date(timestamp).toLocaleTimeString()})`);
          }
        } catch (e) { console.error(e); }
      }
    }
  }, [isModalOpen, isEditingMode, blogId, user.id]);

  useEffect(() => {
    if (!isModalOpen) return;
    setDraftStatus('正在保存...');
    const timer = setTimeout(() => {
      localStorage.setItem(getDraftKey(), JSON.stringify({ title, content, coverImage, timestamp: Date.now() }));
      setDraftStatus(`草稿已保存 ${new Date().toLocaleTimeString()}`);
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, content, coverImage, isModalOpen]);

  // --- 图片处理逻辑 ---
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleContentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setContent(prev => prev + `\n![插图](${reader.result})\n`);
          reader.readAsDataURL(file);
      }
  };

  // --- 提交博客 ---
  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const excerpt = content.substring(0, 100).replace(/!\[.*?\]\(.*?\)/g, '[图片]') + '...';
    
    if (isEditingMode && blogId) {
       const original = blogs.find(b => b.id === blogId);
       if (original) updateBlog({ ...original, title, content, excerpt, image: coverImage || original.image });
    } else {
        addBlog({
          id: Date.now().toString(),
          title,
          content,
          excerpt,
          author: user,
          date: new Date().toISOString(),
          tags: ['家庭'],
          likes: 0,
          isCollected: false,
          image: coverImage,
          comments: []
        });
    }
    localStorage.removeItem(getDraftKey());
    closeModal();
  };

  const openEditModal = (blog: BlogPost) => {
      setBlogId(blog.id); setTitle(blog.title); setContent(blog.content); setCoverImage(blog.image || '');
      setIsEditingMode(true); setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false); setIsEditingMode(false); setTitle(''); setContent(''); setCoverImage(''); setBlogId(''); setDraftStatus('');
  };

  const handleDelete = (id: string) => {
      if (confirm('确定要删除吗？')) { deleteBlog(id); if (selectedBlog?.id === id) setSelectedBlog(null); }
  };
  
  const handleAddComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedBlog || !newComment.trim()) return;
      commentBlog(selectedBlog.id, newComment);
      setNewComment('');
  };

  const renderContent = (text: string) => {
      const parts = text.split(/(!\[.*?\]\(.*?\))/g);
      return parts.map((part, index) => {
          const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
          return imageMatch 
            ? <div key={index} className="my-8 rounded-xl overflow-hidden shadow-md"><img src={imageMatch[2]} alt={imageMatch[1]} className="w-full h-auto" /></div> 
            : <span key={index} className="whitespace-pre-wrap">{part}</span>;
      });
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">家庭博客</h1>
          <p className="text-slate-500 mt-1 font-medium">生活中的点点滴滴</p>
        </div>
        {(user.role === 'admin' || user.role === 'member') && (
            <button onClick={() => { setIsEditingMode(false); setIsModalOpen(true); }} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-amber-200 transition-all font-bold">
            <Plus size={18} /> 新建文章
            </button>
        )}
      </div>

      {selectedBlog ? (
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-white overflow-hidden animate-fade-in">
          <div className="relative h-64 md:h-96 w-full">
            <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 flex gap-2">
                {(user.role === 'admin' || user.id === selectedBlog.author.id) && (
                    <>
                        <button onClick={() => openEditModal(selectedBlog)} className="bg-white/90 hover:bg-white text-slate-700 p-2.5 rounded-full backdrop-blur-md shadow-sm"><Edit size={20} /></button>
                        <button onClick={() => handleDelete(selectedBlog.id)} className="bg-white/90 hover:bg-red-500 hover:text-white text-slate-700 p-2.5 rounded-full backdrop-blur-md shadow-sm"><Trash2 size={20} /></button>
                    </>
                )}
                <button onClick={() => setSelectedBlog(null)} className="bg-black/30 hover:bg-black/50 text-white p-2.5 rounded-full backdrop-blur-md"><X size={20} /></button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-10 text-white">
              <h1 className="text-4xl font-bold mb-3 tracking-tight">{selectedBlog.title}</h1>
              <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                 <span className="flex items-center gap-1"><User size={14}/> {selectedBlog.author.name}</span>
                 <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(selectedBlog.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="p-10">
            <div className="prose prose-slate max-w-none mb-10 text-lg leading-loose text-slate-700 font-serif">
              {renderContent(selectedBlog.content)}
            </div>
            <div className="flex items-center gap-2 mb-8 border-t border-slate-100 pt-6">
              {selectedBlog.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1"><Tag size={12} /> {tag}</span>
              ))}
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-3">
                  <button onClick={() => likeBlog(selectedBlog.id)} className="flex items-center gap-2 text-rose-500 font-bold bg-rose-50 hover:bg-rose-100 px-5 py-2.5 rounded-full transition-colors"><Heart size={20} className={selectedBlog.likes > 0 ? "fill-current" : ""} /> {selectedBlog.likes} 点赞</button>
                  <button onClick={() => collectBlog(selectedBlog.id)} className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-full transition-colors ${selectedBlog.isCollected ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Star size={20} className={selectedBlog.isCollected ? "fill-current" : ""} /> {selectedBlog.isCollected ? '已收藏' : '收藏'}</button>
              </div>
            </div>

            {/* 评论区 */}
            <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MessageSquare size={18}/> 评论 ({selectedBlog.comments.length})</h3>
                <div className="space-y-4 mb-6">
                    {selectedBlog.comments.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">{comment.author.charAt(0)}</div>
                            <div className="bg-white p-3 rounded-r-xl rounded-bl-xl shadow-sm text-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-1 gap-4">
                                    <span className="font-bold text-slate-700">{comment.author}</span>
                                    <span className="text-slate-400 text-xs scale-90">{new Date(comment.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-600">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                    {selectedBlog.comments.length === 0 && <p className="text-slate-400 text-sm italic">还没有评论，快来抢沙发！</p>}
                </div>
                <form onSubmit={handleAddComment} className="relative">
                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="写下你的想法..." className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
                    <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-amber-500 text-white rounded-lg disabled:opacity-50"><Send size={16}/></button>
                </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {blogs.map((blog) => (
            <div key={blog.id} onClick={() => setSelectedBlog(blog)} className="bg-[#FFF9E6] backdrop-blur-sm rounded-2xl p-6 shadow-sm border-2 border-amber-100 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-100 transition-all cursor-pointer group flex flex-col md:flex-row gap-6 relative">
              <div className="w-full md:w-56 h-56 shrink-0 rounded-xl overflow-hidden shadow-inner bg-white">
                 <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="flex-1 flex flex-col py-2">
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 font-medium">
                  <span className="bg-white/80 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">{blog.tags[0]}</span>
                  <span>{new Date(blog.date).toLocaleDateString()}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-amber-700 transition-colors">{blog.title}</h2>
                <p className="text-slate-600 text-base mb-4 line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={blog.author.avatar} alt={blog.author.name} className="w-8 h-8 rounded-full border border-white shadow-sm" />
                    <span className="text-sm text-slate-700 font-bold">{blog.author.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                    <span className="flex items-center gap-1 group-hover:text-rose-500 transition-colors"><Heart size={16} className={blog.likes > 0 ? "fill-current text-rose-500" : ""} /> {blog.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={16} /> {blog.comments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 博客编辑/创建弹窗 (Keep existing implementation) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in font-serif">
          <div className="bg-white rounded-3xl w-full max-w-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-2xl font-bold text-slate-800">{isEditingMode ? '编辑文章' : '写新故事'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            {draftStatus && <div className="mb-4 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs flex items-center gap-2 font-bold"><Save size={14} className="animate-pulse" />{draftStatus}</div>}
            <form onSubmit={handleCreateOrUpdate} className="space-y-6 flex-1 flex flex-col">
              <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">封面图片</label>
                    <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-square bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors overflow-hidden relative group">
                        {coverImage ? (
                            <>
                                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white font-bold flex items-center gap-2 text-xs"><ImageIcon size={16}/> 更换</span></div>
                            </>
                        ) : (
                            <div className="text-center text-slate-400 p-2"><ImageIcon className="mx-auto mb-2" size={32} /><span className="text-sm font-medium">点击上传</span></div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleCoverImageUpload} className="hidden" accept="image/*"/>
                  </div>
                  <div className="md:col-span-2 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">标题</label>
                        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400 text-lg font-bold text-slate-800 placeholder:text-slate-400" placeholder="给故事起个名字..." />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="flex items-center justify-between text-sm font-bold text-slate-700 mb-2">
                            <span>正文</span>
                            <button type="button" onClick={() => contentImageInputRef.current?.click()} className="text-amber-600 text-xs flex items-center gap-1 hover:bg-amber-50 px-3 py-1 rounded-full transition-colors font-medium"><Upload size={14} /> 插入图片</button>
                            <input type="file" ref={contentImageInputRef} onChange={handleContentImageUpload} className="hidden" accept="image/*"/>
                        </label>
                        <textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={10} className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400 transition-all resize-none text-base leading-relaxed text-slate-700 placeholder:text-slate-400" placeholder="开始讲述..." />
                    </div>
                  </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 shrink-0">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-full text-slate-600 font-bold hover:bg-slate-100">取消</button>
                <button type="submit" className="px-8 py-2.5 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg">{isEditingMode ? '更新发布' : '立即发布'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
