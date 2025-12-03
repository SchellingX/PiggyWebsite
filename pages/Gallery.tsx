
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Photo } from '../types';
import { Filter, Upload, X, ChevronLeft, ChevronRight, Download, Heart, FolderOpen, Link as LinkIcon, AlertCircle } from 'lucide-react';

const Gallery: React.FC = () => {
  const { photos, addPhoto, user } = useData();
  const [filter, setFilter] = useState<string>('全部');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTab, setUploadTab] = useState<'upload' | 'mount'>('upload');

  // Mount Input State
  const [mountFileName, setMountFileName] = useState('');
  const [mountCategory, setMountCategory] = useState('日常');

  // Permissions
  const canUpload = user.role === 'admin' || user.role === 'member';

  // Categories
  const categories = ['全部', '活动', '日常', '旅行', '有趣'];
  
  // Filter Logic
  const filteredPhotos = filter === '全部' 
    ? photos 
    : photos.filter(p => p.category === filter);

  // Upload Logic (Browser Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         const newPhoto: Photo = {
            id: Date.now().toString(),
            url: reader.result as string,
            caption: file.name.split('.')[0] || '新照片',
            category: '日常',
            date: new Date().toISOString().split('T')[0],
            takenBy: user.name,
            source: 'local'
          };
          addPhoto(newPhoto);
          setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add from Mounted Directory Logic
  const handleAddFromMount = (e: React.FormEvent) => {
      e.preventDefault();
      if (!mountFileName) return;

      // Assuming the Nginx alias /media/ maps to the mounted directory
      // The user just needs to input the filename (e.g., 'pic.jpg')
      const fileUrl = `/media/${mountFileName}`;
      
      const newPhoto: Photo = {
          id: Date.now().toString(),
          url: fileUrl,
          caption: mountFileName,
          category: mountCategory,
          date: new Date().toISOString().split('T')[0],
          takenBy: user.name,
          source: 'mount'
      };
      addPhoto(newPhoto);
      setIsUploading(false);
      setMountFileName('');
  };

  // Lightbox Navigation
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredPhotos.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">家庭相册</h1>
          <p className="text-slate-500 mt-1">定格时间，留住每一刻。</p>
        </div>
        <div className="flex items-center gap-3">
          {canUpload && (
            <button 
                onClick={() => setIsUploading(true)}
                className="bg-slate-800 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
            >
                <Upload size={18} /> 添加照片
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {categories.map(cat => (
            <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    filter === cat 
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
                {cat}
            </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo, index) => (
            <div 
                key={photo.id}
                onClick={() => setSelectedPhotoIndex(index)}
                className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-lg transition-all bg-slate-100"
            >
                <img 
                    src={photo.url} 
                    alt={photo.caption} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        // Fallback for broken links (common with mounted files if not present)
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Image+Not+Found';
                    }} 
                />
                
                {photo.source === 'mount' && (
                    <div className="absolute top-2 right-2 bg-black/40 text-white p-1 rounded-full backdrop-blur-md">
                        <FolderOpen size={12} />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white font-medium truncate">{photo.caption}</p>
                    <p className="text-white/80 text-xs">{photo.date}</p>
                </div>
            </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhotoIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={() => setSelectedPhotoIndex(null)}>
              <button 
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
                onClick={() => setSelectedPhotoIndex(null)}
              >
                  <X size={32} />
              </button>

              <button 
                className="absolute left-4 text-white/70 hover:text-white p-2 hidden md:block"
                onClick={handlePrev}
              >
                  <ChevronLeft size={40} />
              </button>

              <div className="max-w-5xl max-h-[80vh] relative p-4" onClick={(e) => e.stopPropagation()}>
                  <img 
                    src={filteredPhotos[selectedPhotoIndex].url} 
                    alt={filteredPhotos[selectedPhotoIndex].caption}
                    className="max-h-[70vh] w-auto rounded-lg shadow-2xl mx-auto"
                  />
                  <div className="mt-4 text-center text-white">
                      <h2 className="text-xl font-bold">{filteredPhotos[selectedPhotoIndex].caption}</h2>
                      <p className="opacity-70 text-sm mt-1">由 {filteredPhotos[selectedPhotoIndex].takenBy} 拍摄于 {filteredPhotos[selectedPhotoIndex].date}</p>
                      {filteredPhotos[selectedPhotoIndex].source === 'mount' && (
                          <p className="text-xs text-rose-300 mt-1 flex items-center justify-center gap-1">
                              <FolderOpen size={12} /> 来自挂载目录
                          </p>
                      )}
                      
                      <div className="flex justify-center gap-4 mt-4">
                          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-md transition-colors">
                              <Heart size={16} /> 收藏
                          </button>
                          <a 
                            href={filteredPhotos[selectedPhotoIndex].url} 
                            download={filteredPhotos[selectedPhotoIndex].caption}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-md transition-colors"
                          >
                              <Download size={16} /> 下载
                          </a>
                      </div>
                  </div>
              </div>

              <button 
                className="absolute right-4 text-white/70 hover:text-white p-2 hidden md:block"
                onClick={handleNext}
              >
                  <ChevronRight size={40} />
              </button>
          </div>
      )}

      {/* Upload/Add Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">添加新照片</h3>
                    <button onClick={() => setIsUploading(false)}><X className="text-slate-400" size={24} /></button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                    <button 
                        onClick={() => setUploadTab('upload')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            uploadTab === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                        }`}
                    >
                        <Upload size={16} /> 直接上传
                    </button>
                    <button 
                        onClick={() => setUploadTab('mount')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            uploadTab === 'mount' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
                        }`}
                    >
                        <FolderOpen size={16} /> 从存储目录
                    </button>
                </div>

                {uploadTab === 'upload' ? (
                    <div className="text-center">
                        <p className="text-slate-500 mb-6 text-sm">选择本地文件。注意：刷新页面后可能会丢失（演示模式）。</p>
                        <label className="block border-2 border-dashed border-slate-200 rounded-2xl p-8 mb-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                            <Upload className="mx-auto text-rose-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
                            <span className="text-slate-400 text-sm">点击浏览文件</span>
                            <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                        </label>
                    </div>
                ) : (
                    <form onSubmit={handleAddFromMount} className="space-y-4">
                        <div className="bg-amber-50 p-3 rounded-xl flex items-start gap-2 text-amber-700 text-xs mb-4">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p>请确保文件已放入服务器的 <code className="bg-amber-100 px-1 rounded">/media</code> 挂载目录中。</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">文件名</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="例如：2023-picnic.jpg" 
                                    value={mountFileName}
                                    onChange={(e) => setMountFileName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
                            <select 
                                value={mountCategory}
                                onChange={(e) => setMountCategory(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                            >
                                {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <button 
                            type="submit" 
                            disabled={!mountFileName}
                            className="w-full py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 shadow-md shadow-rose-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            添加链接
                        </button>
                    </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
