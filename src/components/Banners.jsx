'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const extractYouTubeVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    } else if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
  } catch (err) {
    return null;
  }
  return null;
};

const Banners = () => {
  // State for tracking if the banner is being hovered (for desktop enhancements)
  const [isHovered, setIsHovered] = useState(false);
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('https://st.amjadshbib.com/api/banners');
        const result = await response.json();
        if (result.status && result.data.length > 0) {
          setBanners(result.data);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };

    fetchBanners();

    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const durationMs = (banners[currentIndex]?.show_duration || 15) * 1000;

    timerRef.current = setTimeout(() => {
      handleNext();
    }, durationMs);

    return () => clearTimeout(timerRef.current);
  }, [currentIndex, banners]);

  const handlePrev = () => {
    clearTimeout(timerRef.current);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setKey((prev) => prev + 1);
  };

  const handleNext = () => {
    clearTimeout(timerRef.current);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setKey((prev) => prev + 1);
  };

  if (banners.length === 0) {
    return (
      <div className="mx-auto max-w-screen-2xl px-0 sm:px-2 md:px-4 mb-6">
        <div className="w-full rounded-lg overflow-hidden shadow-lg bg-gray-100">
          <div className="relative w-full overflow-hidden" style={{ paddingTop: 'calc(1000 / 3000 * 100%)' }}>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 animate-pulse">
              <div className="text-gray-500 font-medium">Loading banners...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const current = banners[currentIndex];
  const imageUrl = current.image
    ? `https://st.amjadshbib.com/api/public/${current.image}`
    : null;

  const videoId = current.video_url ? extractYouTubeVideoId(current.video_url) : null;
  const videoUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0`
    : null;

  return (
    <div className="mx-auto max-w-screen-2xl px-0 sm:px-2 md:px-4 mb-6">
      <div 
        className="relative w-full rounded-lg overflow-hidden shadow-lg bg-black"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full"
        >
         {imageUrl ? (
  <div className="relative w-full overflow-hidden" style={{ paddingTop: 'calc(1000 / 3000 * 100%)' }}>
    <img
      src={imageUrl}
      alt={`Banner ${current.id}`}
      className="absolute top-0 left-0 w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
      loading="eager"
      onError={(e) => {
        console.error('Error loading banner image:', e);
        e.target.onerror = null;
        e.target.src = 'https://via.placeholder.com/3000x1000?text=Banner+Image+Not+Available';
      }}
    />
    {/* Add a subtle overlay for better text visibility if needed */}
    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
  </div>
) : videoUrl ? (
            <iframe
              src={videoUrl}
              title={`YouTube video ${videoId}`}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No media available
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Arrows - Enhanced for better visibility */}
      <button
        onClick={handlePrev}
        className="absolute left-3 md:left-5 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-white p-1.5 md:p-3 rounded-full shadow-lg transition-all duration-300 z-10"
        aria-label="Previous banner"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 md:h-6 md:w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={handleNext}
        className="absolute right-3 md:right-5 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-white p-1.5 md:p-3 rounded-full shadow-lg transition-all duration-300 z-10"
        aria-label="Next banner"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 md:h-6 md:w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Banner Indicators */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              clearTimeout(timerRef.current);
              setCurrentIndex(index);
              setKey((prev) => prev + 1);
            }}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white scale-110' : 'bg-white bg-opacity-50 hover:bg-opacity-75'}`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
      </div>
    </div>
  );
};

export default Banners;
