import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';

const HomeCarousel: React.FC = () => {
  const { photos } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);
  // Pick top 5 photos for carousel
  const carouselPhotos = photos.slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselPhotos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselPhotos.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselPhotos.length) % carouselPhotos.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselPhotos.length);
  };

  if (carouselPhotos.length === 0) return null;

  return (
    <div className="relative w-full h-[300px] md:h-[450px] lg:h-[500px] rounded-3xl overflow-hidden shadow-xl shadow-rose-100 group">
      {carouselPhotos.map((photo, index) => (
        <div
          key={photo.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={photo.url}
            alt={photo.caption}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 tracking-tight">{photo.caption}</h2>
            <p className="text-sm md:text-base opacity-90 font-medium bg-black/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
              {photo.date} • {photo.takenBy}
            </p>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-4 right-6 flex space-x-2">
        {carouselPhotos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeCarousel;
