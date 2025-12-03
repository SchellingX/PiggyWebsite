import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Photo } from '../types';
import { Filter, Upload, X, ChevronLeft, ChevronRight, PlayCircle, FolderOpen, Video } from 'lucide-react';

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

  // Helper to detect video
  const isVideoFile = (filename: string) => {
      const ext = filename.split('.').pop()?.toLowerCase();
      return ['mp4', 'mov', 'webm', 'ogg', 'm4v'].includes(ext || '');
  };

  // Upload Logic (Browser Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         const isVideo = file.type.startsWith('video/');
         const newPhoto: Photo = {
            id: Date.now().toString(),
            url: reader.result as string,
            caption: file.name.split('.')[0] || '新文件',
            category: '日常',
            date: new Date().toISOString().split('T')[0],
            takenBy: user.name,
            source: 'local',
            mediaType: isVideo ? 'video' : 'image'
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

      const fileUrl = `/media/${mountFileName}`;
      const isVideo = isVideoFile(mountFileName);
      
      const newPhoto: Photo = {
          id: Date.now().toString(),
          url: fileUrl,
          caption: mountFileName,
          category: mountCategory,
          date: new Date().toISOString().split('T')[0],
          takenBy: user.name,
          source: 'mount',
          mediaType: isVideo ? 'video' : 'image'
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
                <Upload size={18} /> 添加照片/视频
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
                {photo.mediaType === 'video' ? (
                   <div className="w-full h-full relative">
                      <video 
                        src={photo.url} 
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted // Muted for autoplay preview if desired, or just static
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                         <PlayCircle size={48} className="text-white opacity-80 group-hover:scale-110 transition-transform drop-shadow-lg"/>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/40 text-white px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md z-10 flex items-center gap-1">
                          <Video size={10} /> 视频
                      </div>
                   </div>
                ) : (
                   <img 
                      src={photo.url} 
                      alt={photo.caption} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Image+Not+Found';
                      }} 
                  />
                )}
                
                {photo.source === 'mount' && (
                    <div className="absolute top-2 left-2 bg-blue-500/80 text-white p-1 rounded-full backdrop-blur-md z-10 shadow-sm" title="来自挂载目录">
                        <FolderOpen size={12} />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10">
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
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50 transition-colors"
                onClick={() => setSelectedPhotoIndex(null)}
              >
                  <X size={32} />
              </button>

              <button 
                className="absolute left-4 text-white/70 hover:text-white p-2 hidden md:block z-50 transition-colors hover:bg-white/10 rounded-full"
                onClick={handlePrev}
              >
                  <ChevronLeft size={40} />
              </button>

              <div className="max-w-6xl max-h-[90vh] w-full relative p-4 flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  <div className="relative w-full h-full flex items-center justify-center">
                    {filteredPhotos[selectedPhotoIndex].mediaType === 'video' ? (
                        <video 
                            src={filteredPhotos[selectedPhotoIndex].url}
                            controls
                            autoPlay
                            className="max-h-[80vh] max-w-full rounded-lg shadow-2xl"
                        >
                            您的浏览器不支持视频播放。
                        </video>
                    ) : (
                        <img 
                            src={filteredPhotos[selectedPhotoIndex].url} 
                            alt={filteredPhotos[selectedPhotoIndex].caption} 
                            className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl" 
                        />
                    )}
                  </div>
                  <div className="mt-4 text-center text-white">
                      <h2 className="text-xl font-bold">{filteredPhotos[selectedPhotoIndex].caption}</h2>
                      <p className="text-white/60 text-sm mt-1">
                          {filteredPhotos[selectedPhotoIndex].date} • {filteredPhotos[selectedPhotoIndex].takenBy} 
                          {filteredPhotos[selectedPhotoIndex].source === 'mount' && ' • [本地文件]'}
                      </p>
                  </div>
              </div>

              <button 
                className="absolute right-4 text-white/70 hover:text-white p-2 hidden md:block z-50 transition-colors hover:bg-white/10 rounded-full"
                onClick={handleNext}
              >
                  <ChevronRight size={40} />
              </button>
          </div>
      )}

      {/* Upload/Add Modal */}
      {isUploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800">添加新回忆</h3>
                      <button onClick={() => setIsUploading(false)}><X className="text-slate-400 hover:text-slate-600" size={24} /></button>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                      <button 
                          onClick={() => setUploadTab('upload')}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              uploadTab === 'upload' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                          直接上传
                      </button>
                      <button 
                          onClick={() => setUploadTab('mount')}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              uploadTab === 'mount' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                          挂载导入
                      </button>
                  </div>

                  {uploadTab === 'upload' ? (
                      <div className="text-center">
                          <label className="block w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/30 transition-all group">
                              <Upload className="text-slate-400 group-hover:text-rose-500 mb-2 transition-colors" size={32} />
                              <span className="text-slate-500 text-sm font-medium group-hover:text-rose-600">点击选择图片或视频</span>
                              <span className="text-slate-400 text-xs mt-1">(支持 JPG, PNG, MP4, MOV)</span>
                              <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                          </label>
                      </div>
                  ) : (
                      <form onSubmit={handleAddFromMount} className="space-y-4">
                          <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                             <FolderOpen size={16} className="shrink-0 mt-0.5" />
                             <div>
                                请确保文件已存在于服务器的 <b>/media</b> 目录中。
                                <br/>Docker 挂载路径：/app/media
                             </div>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">文件名 (包含后缀)</label>
                              <input 
                                  type="text" 
                                  placeholder="例如：trip_video.mp4" 
                                  value={mountFileName}
                                  onChange={(e) => setMountFileName(e.target.value)}
                                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                  required
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
                              <select 
                                  value={mountCategory}
                                  onChange={(e) => setMountCategory(e.target.value)}
                                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                              >
                                  {categories.filter(c => c !== '全部').map(c => (
                                      <option key={c} value={c}>{c}</option>
                                  ))}
                              </select>
                          </div>
                          <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all">
                              确认导入
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