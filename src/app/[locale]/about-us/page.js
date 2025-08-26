'use client'
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function AboutUs() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const { data: aboutData, isLoading, error } = useQuery({
    queryKey: ['about-us'],
    queryFn: async () => {
      const { data } = await axios.get('https://st.amjadshbib.com/api/about-us');
      return data?.data;
    },
  });

  // Convert YouTube URL to embed format
  const convertToEmbedUrl = (url) => {
    if (!url) return null;
    
    let videoId = '';
    if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Create slides array with video and images
  const slides = aboutData ? [
    ...(aboutData.video_url?.map(url => ({ 
      type: 'video', 
      url: convertToEmbedUrl(url),
      originalUrl: url
    })).filter(slide => slide.url) || []),
    ...(aboutData.gallery?.map(image => ({ 
      type: 'image', 
      url: `https://st.amjadshbib.com/api/public/${image.image_path}` 

    })) || [])
  ] : [];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsVideoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsVideoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsVideoPlaying(false);
  };

  // Auto-advance slides only if no video is playing
  useEffect(() => {
    if (slides.length === 0 || isVideoPlaying) return;
    
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, isVideoPlaying]);

  // Get the appropriate text based on locale
  const getDescription = () => {
    if (!aboutData?.description_translations) return '';
    
    return aboutData.description_translations[locale] || 
           aboutData.description_translations.en || 
           Object.values(aboutData.description_translations)[0] || '';
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#faf8f5]">
        <div className="mx-4 md:mx-10 px-2 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
            <div className="h-64 md:h-96 bg-gray-200 rounded-2xl mb-8" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#faf8f5]">
        <div className="mx-4 md:mx-10 px-2 py-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Failed to load about us information
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <div className="mx-4 md:mx-10 px-2 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#4c5a3c] mb-4">
            {locale === 'ar' ? 'من نحن' : 'About Us'}
          </h1>
          <div className="w-24 h-1 bg-[#4c5a3c] mx-auto rounded"></div>
        </div>

        {/* Slider Section */}
        {slides.length > 0 && (
          <div className="relative h-[300px] md:h-[500px] rounded-2xl overflow-hidden group mb-8 md:mb-12">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  currentSlide === index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {slide.type === 'video' ? (
                  <div className="relative h-full bg-black z-10">
                    <iframe
                      src={`${slide.url}?autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => setIsVideoPlaying(false)}
                      onMouseEnter={() => setIsVideoPlaying(true)}
                      onMouseLeave={() => setIsVideoPlaying(false)}
                    />
                  </div>
                ) : (
                  <div className="relative h-full">
                    <Image
                      src={slide.url}
                      alt={`About Us - Slide ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 80vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  </div>
                )}
              </div>
            ))}

            {/* Navigation Arrows */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 md:left-4 z-20 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                  aria-label="Previous slide"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="md:w-6 md:h-6">
                    <path d="M15 18L9 12L15 6" stroke="#4c5a3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 md:right-4 z-20 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                  aria-label="Next slide"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="md:w-6 md:h-6">
                    <path d="M9 6L15 12L9 18" stroke="#4c5a3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}

            {/* Dots Navigation */}
            {slides.length > 1 && (
              <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-20">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                      idx === currentSlide 
                        ? 'w-6 md:w-8 bg-white shadow-lg' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm">
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed text-base md:text-lg"
                style={{ 
                  direction: locale === 'ar' ? 'rtl' : 'ltr',
                  textAlign: locale === 'ar' ? 'right' : 'left'
                }}
              >
                {getDescription()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}