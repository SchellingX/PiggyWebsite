import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';

const HomeCarousel: React.FC = () => {
  const { photos } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Define local slide assets
  const localSlides = [
    { id: 's1', url: '/assets/slide1.jpg', caption: '家庭时光', desc: '我们在一起的每一天' },
    { id: 's2', url: '/assets/slide2.jpg', caption: '快乐出游', desc: '探索世界的角落' },
    { id: 's3', url: '/assets/slide3.jpg', caption: '美好回忆', desc: '珍藏每一个瞬间' }
  ];

  // Combine user photos (if any) with local slides as fallback
  // We prefer showing actual photos if available, but for visual demo, let's mix or use local slides if photos are scarce.
  // Strategy: If user uploaded photos exist (>0), use them. Else use default slides.
  const displayItems = photos.length > 0 ? photos.slice(0, 5) : localSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayItems.length]);

  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % displayItems.length);

  if (displayItems.length === 0) return null;

  return (
    <div className="relative w-full h-[300px] md:h-[450px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl shadow-amber-100 group border-4 border-white">
      {displayItems.map((item, index) => (
        <div key={item.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
          <img src={item.url} alt={item.caption} className="w-full h-full object-cover" />
          {/* Amber-tinted gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight drop-shadow-lg font-serif">{item.caption}</h2>
            <p className="text-base md:text-lg opacity-90 font-medium bg-black/20 px-4 py-1.5 rounded-full inline-block backdrop-blur-md border border-white/20">
              {/* Handle different data structures between Photo and static slide */}
              {'date' in item ? `${item.date} • ${item.takenBy}` : item.desc}
            </p>
          </div>
        </div>
      ))}
      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 border border-white/30"><ChevronLeft size={28} /></button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 border border-white/30"><ChevronRight size={28} /></button>
      <div className="absolute bottom-6 right-8 flex space-x-2">
        {displayItems.map((_, index) => (
          <button key={index} onClick={() => setCurrentIndex(index)} className={`h-1.5 rounded-full transition-all shadow-sm ${index === currentIndex ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`} />
        ))}
      </div>
    </div>
  );
};

export default HomeCarousel;