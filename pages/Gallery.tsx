
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Photo } from '../types';
import { Filter, Upload, X, ChevronLeft, ChevronRight, PlayCircle, FolderOpen, Video, Heart, Star, MessageSquare, Send } from 'lucide-react';

const Gallery: React.FC = () => {
    const { photos, addPhoto, likePhoto, collectPhoto, commentPhoto, user } = useData();
    if (!user) return <div className="pb-12">请先登录以查看相册。</div>;
  const [filter, setFilter] = useState<string>('全部');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTab, setUploadTab] = useState<'upload' | 'mount'>('upload');
  const [mountFileName, setMountFileName] = useState('');
  const [mountCategory, setMountCategory] = useState('日常');
  const [newComment, setNewComment] = useState('');

    const canUpload = user?.role === 'admin' || user?.role === 'member';
  const categories = ['全部', '活动', '日常', '旅行', '有趣'];
  const filteredPhotos = filter === '全部' ? photos : photos.filter(p => p.category === filter);

  const isVideoFile = (filename: string) => ['mp4', 'mov', 'webm', 'ogg', 'm4v'].includes(filename.split('.').pop()?.toLowerCase() || '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         const isVideo = file.type.startsWith('video/');
         addPhoto({
            id: Date.now().toString(),
            url: reader.result as string,
            caption: file.name.split('.')[0] || '新文件',
            category: '日常',
            date: new Date().toISOString().split('T')[0],
            takenBy: user?.name ?? '匿名',
            source: 'local',
            mediaType: isVideo ? 'video' : 'image',
            likes: 0,
            isCollected: false,
            comments: []
          });
          setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddFromMount = (e: React.FormEvent) => {
      e.preventDefault();
      if (!mountFileName) return;
      addPhoto({
          id: Date.now().toString(),
          url: `/media/${mountFileName}`,
          caption: mountFileName,
          category: mountCategory,
          date: new Date().toISOString().split('T')[0],
          takenBy: user?.name ?? '匿名',
          source: 'mount',
          mediaType: isVideoFile(mountFileName) ? 'video' : 'image',
          likes: 0,
          isCollected: false,
          comments: []
      });
      setIsUploading(false); setMountFileName('');
  };

  const handleNext = (e: React.MouseEvent) => { e.stopPropagation(); if (selectedPhotoIndex !== null) setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredPhotos.length); };
  const handlePrev = (e: React.MouseEvent) => { e.stopPropagation(); if (selectedPhotoIndex !== null) setSelectedPhotoIndex((selectedPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length); };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedPhotoIndex !== null && newComment.trim()) {
          commentPhoto(filteredPhotos[selectedPhotoIndex].id, newComment);
          setNewComment('');
      }
  };

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">家庭相册</h1>
          <p className="text-slate-500 mt-1 font-medium">美好的时光都在这里</p>
        </div>
        <div className="flex items-center gap-3">
          {canUpload && (
            <button onClick={() => setIsUploading(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg font-bold">
                <Upload size={18} /> 添加回忆
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === cat ? 'bg-amber-400 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-amber-50'}`}>
                {cat}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredPhotos.map((photo, index) => (
            <div key={photo.id} onClick={() => setSelectedPhotoIndex(index)} className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-xl hover:shadow-amber-100 transition-all bg-slate-100 border-2 border-white">
                {photo.mediaType === 'video' ? (
                   <div className="w-full h-full relative">
                      <video src={photo.url} className="w-full h-full object-cover" preload="metadata" muted />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors"><PlayCircle size={48} className="text-white opacity-90 group-hover:scale-110 transition-transform drop-shadow-lg"/></div>
                      <div className="absolute top-2 right-2 bg-black/40 text-white px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md z-10 flex items-center gap-1"><Video size={10} /> 视频</div>
                   </div>
                ) : (
                   <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Error'; }} />
                )}
                {photo.source === 'mount' && <div className="absolute top-2 left-2 bg-blue-500/80 text-white p-1.5 rounded-full backdrop-blur-md z-10 shadow-sm" title="本地文件"><FolderOpen size={12} /></div>}
                
                {/* 悬停信息 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 z-10">
                    <p className="text-white font-bold truncate text-lg">{photo.caption}</p>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-white/80 text-xs font-medium">{photo.date}</p>
                        <div className="flex items-center gap-2 text-white/90 text-xs">
                           <span className="flex items-center gap-1"><Heart size={12} className={photo.likes > 0 ? "fill-current" : ""}/> {photo.likes}</span>
                           <span className="flex items-center gap-1"><MessageSquare size={12}/> {photo.comments.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Lightbox 全屏查看 */}
      {selectedPhotoIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in" onClick={() => setSelectedPhotoIndex(null)}>
              <button className="absolute top-6 left-6 text-white/70 hover:text-white p-2 z-[60] transition-colors" onClick={() => setSelectedPhotoIndex(null)}><X size={36} /></button>
              
              <div className="w-full h-full flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
                  {/* 左侧：媒体展示 */}
                  <div className="flex-1 relative flex items-center justify-center bg-black/20 h-[60vh] md:h-full">
                      <button className="absolute left-4 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all" onClick={handlePrev}><ChevronLeft size={48} /></button>
                      <button className="absolute right-4 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all" onClick={handleNext}><ChevronRight size={48} /></button>
                      
                      <div className="max-w-[90%] max-h-[90%]">
                        {filteredPhotos[selectedPhotoIndex].mediaType === 'video' ? (
                            <video src={filteredPhotos[selectedPhotoIndex].url} controls autoPlay className="max-h-full max-w-full rounded-lg shadow-2xl">无法播放</video>
                        ) : (
                            <img src={filteredPhotos[selectedPhotoIndex].url} alt={filteredPhotos[selectedPhotoIndex].caption} className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl" />
                        )}
                      </div>
                  </div>

                  {/* 右侧：互动栏 (评论与点赞) */}
                  <div className="w-full md:w-96 bg-white flex flex-col h-[40vh] md:h-full shrink-0 border-l border-slate-200">
                      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                          <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-1">{filteredPhotos[selectedPhotoIndex].caption}</h2>
                          <p className="text-slate-500 text-sm font-medium">{filteredPhotos[selectedPhotoIndex].date} • {filteredPhotos[selectedPhotoIndex].takenBy}</p>
                          
                          <div className="flex gap-3 mt-4">
                              <button onClick={() => likePhoto(filteredPhotos[selectedPhotoIndex].id)} className="flex-1 py-2 bg-rose-50 text-rose-500 rounded-xl font-bold text-sm hover:bg-rose-100 transition-colors flex items-center justify-center gap-2">
                                  <Heart size={18} className={filteredPhotos[selectedPhotoIndex].likes > 0 ? "fill-current" : ""} /> {filteredPhotos[selectedPhotoIndex].likes}
                              </button>
                              <button onClick={() => collectPhoto(filteredPhotos[selectedPhotoIndex].id)} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${filteredPhotos[selectedPhotoIndex].isCollected ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                  <Star size={18} className={filteredPhotos[selectedPhotoIndex].isCollected ? "fill-current" : ""} />
                              </button>
                          </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                          {filteredPhotos[selectedPhotoIndex].comments.length > 0 ? (
                              filteredPhotos[selectedPhotoIndex].comments.map(comment => (
                                  <div key={comment.id} className="text-sm">
                                      <div className="flex justify-between items-baseline mb-1">
                                          <span className="font-bold text-slate-700">{comment.author}</span>
                                          <span className="text-xs text-slate-400">{new Date(comment.date).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-slate-600 bg-white p-3 rounded-xl shadow-sm border border-slate-100">{comment.text}</p>
                                  </div>
                              ))
                          ) : (
                              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                  <MessageSquare size={32} className="mb-2"/>
                                  <p className="text-sm">暂无评论，快来留言吧</p>
                              </div>
                          )}
                      </div>

                      <div className="p-4 border-t border-slate-100 bg-white">
                          <form onSubmit={handleCommentSubmit} className="relative">
                               <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="添加评论..." className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50 focus:bg-white transition-all text-sm" />
                               <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-amber-500 text-white rounded-lg disabled:opacity-50 hover:bg-amber-600"><Send size={16}/></button>
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {isUploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in font-serif">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800">添加新回忆</h3>
                      <button onClick={() => setIsUploading(false)}><X className="text-slate-400 hover:text-slate-600" size={24} /></button>
                  </div>
                  <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
                      <button onClick={() => setUploadTab('upload')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${uploadTab === 'upload' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>直接上传</button>
                      <button onClick={() => setUploadTab('mount')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${uploadTab === 'mount' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>挂载导入</button>
                  </div>
                  {uploadTab === 'upload' ? (
                      <div className="text-center">
                          <label className="block w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all group">
                              <Upload className="text-slate-400 group-hover:text-amber-500 mb-3 transition-colors" size={40} />
                              <span className="text-slate-500 text-base font-bold group-hover:text-amber-600">点击选择图片或视频</span>
                              <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                          </label>
                      </div>
                  ) : (
                      <form onSubmit={handleAddFromMount} className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 flex items-start gap-2 font-medium">
                             <FolderOpen size={16} className="shrink-0 mt-0.5" />
                             <div>请确保文件已存在于服务器的 <b>/media</b> 目录中。<br/>Docker 挂载路径：/app/media</div>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">文件名 (含后缀)</label>
                              <input type="text" placeholder="video.mp4" value={mountFileName} onChange={(e) => setMountFileName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:outline-none font-medium" required />
                          </div>
                          <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all">确认导入</button>
                      </form>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Gallery;
