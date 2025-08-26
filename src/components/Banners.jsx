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
        const response = await fetch('https://setalkel.amjadshbib.com/api/banners');
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
        <div className="w-full rounded-xl overflow-hidden shadow-xl bg-gradient-to-r from-gray-200 to-gray-300 border border-gray-300 animate-pulse">
          <div className="relative w-full overflow-hidden" style={{ paddingTop: 'calc(1000 / 3000 * 100%)' }}>
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <div className="text-gray-600 font-bold text-lg md:text-xl mb-2">No banners available</div>
              <div className="text-gray-500 text-sm md:text-base">Loading banners...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const current = banners[currentIndex];
  const imageUrl = current.image
    ? `https://setalkel.amjadshbib.com/public/${current.image}`
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
          transition={{ duration: 1, ease: "easeInOut" }}
          className="w-full h-full"
        >
         {imageUrl ? (
  <div className="relative w-full overflow-hidden" style={{ paddingTop: 'calc(1000 / 3000 * 100%)' }}>
    <img
      src={imageUrl}
      alt={`Banner ${current.id}`}
      className="absolute top-0 left-0 w-full h-full object-cover object-center transition-all duration-1000 hover:scale-110"
      loading="eager"
      onError={(e) => {
        console.error('Error loading banner image:', e);
        e.target.onerror = null;
        e.target.src = 'https://via.placeholder.com/3000x1000?text=Banner+Image+Not+Available';
      }}
    />
    {/* Enhanced overlay with gradient for better text visibility */}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70 hover:opacity-80 transition-opacity duration-500"></div>
    {/* Banner title overlay */}
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transform translate-y-0 hover:-translate-y-1 transition-transform duration-300">
      <div className="max-w-2xl mx-auto text-white">
        <h3 className="text-xl md:text-2xl font-bold mb-1 drop-shadow-lg">{current.title || `Banner ${current.id}`}</h3>
        <p className="text-sm md:text-base opacity-90 drop-shadow-md">{current.description || ""}</p>
      </div>
    </div>
  </div>
) : videoUrl ? (
            <div className="relative w-full h-full">
              <iframe
                src={videoUrl}
                title={`YouTube video ${videoId}`}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
              {/* YouTube overlay with title */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 hover:opacity-90 transition-opacity duration-500">
                <div className="max-w-2xl mx-auto text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-1 drop-shadow-lg">{current.title || `Banner ${current.id}`}</h3>
                  <p className="text-sm md:text-base opacity-90 drop-shadow-md">{current.description || ""}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No media available
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Navigation Arrows */}
      <motion.button
        onClick={handlePrev}
        className="absolute left-3 md:left-5 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-2 md:p-3 rounded-full shadow-xl transition-all duration-300 z-10 flex items-center justify-center backdrop-blur-sm"
        aria-label="Previous banner"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 md:h-8 md:w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>
      <motion.button
        onClick={handleNext}
        className="absolute right-3 md:right-5 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-2 md:p-3 rounded-full shadow-xl transition-all duration-300 z-10 flex items-center justify-center backdrop-blur-sm"
        aria-label="Next banner"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 md:h-8 md:w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>
      
      {/* Enhanced Banner Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 md:space-x-3 z-10">
        {banners.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => {
              clearTimeout(timerRef.current);
              setCurrentIndex(index);
              setKey((prev) => prev + 1);
            }}
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white scale-125' : 'bg-white bg-opacity-40 hover:bg-opacity-70'}`}
            aria-label={`Go to banner ${index + 1}`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-50">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-r"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ 
            duration: banners[currentIndex]?.show_duration || 15, 
            ease: "linear",
            repeat: Infinity
          }}
        />
      </div>
      </div>
    </div>
  );
};

export default Banners;
