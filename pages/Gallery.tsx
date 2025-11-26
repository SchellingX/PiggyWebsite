import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Photo } from '../types';
import { Filter, Upload, X, ChevronLeft, ChevronRight, Download, Heart } from 'lucide-react';

const Gallery: React.FC = () => {
  const { photos, addPhoto, user } = useData();
  const [filter, setFilter] = useState<string>('全部');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Permissions
  const canUpload = user.role === 'admin' || user.role === 'member';

  // Categories
  const categories = ['全部', '活动', '日常', '旅行', '有趣'];
  
  // Filter Logic
  const filteredPhotos = filter === '全部' 
    ? photos 
    : photos.filter(p => p.category === filter);

  // Upload Logic
  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would handle file data.
    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/800/800`,
      caption: '新回忆',
      category: '日常',
      date: new Date().toISOString().split('T')[0],
      takenBy: user.name
    };
    addPhoto(newPhoto);
    setIsUploading(false);
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
                <Upload size={18} /> 上传
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
                className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-lg transition-all"
            >
                <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
                      
                      <div className="flex justify-center gap-4 mt-4">
                          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-md transition-colors">
                              <Heart size={16} /> 收藏
                          </button>
                          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-md transition-colors">
                              <Download size={16} /> 下载
                          </button>
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

      {/* Upload Modal (Simulated) */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
                <h3 className="text-xl font-bold text-slate-800 mb-2">添加新照片</h3>
                <p className="text-slate-500 mb-6 text-sm">从您的设备选择照片添加到家庭相册。</p>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 mb-6 hover:bg-slate-50 transition-colors cursor-pointer">
                    <Upload className="mx-auto text-rose-400 mb-2" size={32} />
                    <span className="text-slate-400 text-sm">点击浏览</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsUploading(false)} className="flex-1 py-2 rounded-full text-slate-600 hover:bg-slate-100 font-medium transition-colors">取消</button>
                    <button onClick={handleUpload} className="flex-1 py-2 rounded-full bg-rose-500 text-white font-medium hover:bg-rose-600 shadow-md shadow-rose-200 transition-all">上传</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;