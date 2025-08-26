'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ActivityDetail({ params }) {
  const unwrappedParams = React.use(params);
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  
  // Fetch activity details
  const { data: activity, isLoading, error } = useQuery({
    queryKey: ['activity', unwrappedParams.id],
    queryFn: async () => {
      const { data } = await axios.get(`https://st.amjadshbib.com/api/activities/${unwrappedParams.id}`);
      return data?.data || null;
    },
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(locale, options);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c8a27a]"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !activity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{locale === 'ar' ? 'خطأ في تحميل تفاصيل النشاط. يرجى المحاولة مرة أخرى لاحقًا.' : 'Error loading activity details. Please try again later.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-[#faf8f5]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Activity Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-800"
          >
            {activity.name_translations?.[locale] || activity.name_translations?.en || (locale === 'ar' ? 'نشاط' : 'Activity')}
          </motion.h1>
          
          <div className="flex flex-wrap justify-center gap-4">
            <span className="inline-block bg-[#f0e6d9] text-[#c8a27a] px-4 py-2 rounded-full font-medium">
              {activity.events?.length || 0} {locale === 'ar' ? 'فعالية' : 'Events'}
            </span>
            {activity.video_url && (
              <span className="inline-block bg-[#f0e6d9] text-[#c8a27a] px-4 py-2 rounded-full font-medium">
                {locale === 'ar' ? 'فيديو متاح' : 'Video Available'}
              </span>
            )}
          </div>
        </div>

        {/* Activity Image */}
        {activity.image && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12 rounded-xl overflow-hidden shadow-xl"
          >
            <div className="relative h-[60vh] w-full">
              <Image
                src={`https://st.amjadshbib.com/api/public/${activity.image}`}
                alt={activity.name_translations?.[locale] || activity.name_translations?.en || 'Activity'}
                fill
                className="object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg';
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Activity Description */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-8 rounded-xl shadow-md mb-12"
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {locale === 'ar' ? 'عن النشاط' : 'About This Activity'}
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {activity.description_translations?.[locale] || activity.description_translations?.en || (locale === 'ar' ? 'لا يوجد وصف متاح.' : 'No description available.')}
          </p>
        </motion.div>

        {/* Video Section */}
        {activity.video_url && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-8 rounded-xl shadow-md mb-12"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {locale === 'ar' ? 'فيديو النشاط' : 'Activity Video'}
            </h2>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <iframe
                src={activity.video_url.replace('watch?v=', 'embed/')}
                title="Activity Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-[400px]"
              ></iframe>
            </div>
          </motion.div>
        )}

        {/* Events Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold mb-8 text-center text-gray-800">
            {locale === 'ar' ? 'فعاليات النشاط' : 'Activity Events'}
          </h2>
          
          {activity.events && activity.events.length > 0 ? (
            <div className="space-y-12">
              {activity.events.map((event, index) => (
                <EventCard key={event.id} event={event} locale={locale} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <p className="text-gray-500">
                {locale === 'ar' ? 'لا توجد فعاليات متاحة لهذا النشاط.' : 'No events available for this activity.'}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Event Card Component
const EventCard = ({ event, locale, index }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Prepare gallery images
  const galleryImages = event.gallery?.length > 0 
    ? event.gallery.map(img => `https://st.amjadshbib.com/api/public/${img.image_path}`)
    : [];
  
  // Handle gallery navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(locale, options);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="md:flex">
        {/* Event Gallery */}
        <div className="md:w-1/2 relative">
          {galleryImages.length > 0 ? (
            <>
              <div className="relative h-64 md:h-full">
                <Image
                  src={galleryImages[currentImageIndex]}
                  alt={`${event.name_translations?.[locale] || event.name_translations?.en || 'Event'} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
                
                {/* Gallery Navigation */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      aria-label={locale === 'ar' ? 'الصورة السابقة' : 'Previous image'}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      aria-label={locale === 'ar' ? 'الصورة التالية' : 'Next image'}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    {/* Gallery Indicators */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      {galleryImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`h-2 w-2 rounded-full transition-all ${currentImageIndex === idx ? 'bg-white w-4' : 'bg-white bg-opacity-50'}`}
                          aria-label={locale === 'ar' ? `الانتقال إلى الصورة ${idx + 1}` : `Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {galleryImages.length > 1 && (
                <div className="p-4 bg-gray-50 flex overflow-x-auto space-x-2">
                  {galleryImages.map((image, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 relative h-16 w-16 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-[#c8a27a]' : 'border-transparent'}`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-64 md:h-full flex items-center justify-center bg-gray-200">
              <p className="text-gray-500">{locale === 'ar' ? 'لا توجد صور متاحة' : 'No images available'}</p>
            </div>
          )}
        </div>
        
        {/* Event Details */}
        <div className="md:w-1/2 p-8">
          <div className="mb-6">
            <span className="inline-block bg-[#f0e6d9] text-[#c8a27a] text-xs px-3 py-1 rounded-full font-medium mb-4">
              {locale === 'ar' ? 'فعالية' : 'Event'} {index + 1}
            </span>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {event.name_translations?.[locale] || event.name_translations?.en || (locale === 'ar' ? 'فعالية' : 'Event')}
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600">
                <svg className="h-5 w-5 mr-3 text-[#c8a27a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  {event.locations_translations?.[locale] || event.locations_translations?.en || (locale === 'ar' ? 'الموقع' : 'Location')}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <svg className="h-5 w-5 mr-3 text-[#c8a27a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(event.event_date)}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <svg className="h-5 w-5 mr-3 text-[#c8a27a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {galleryImages.length} {locale === 'ar' ? 'صورة' : 'Images'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-800 mb-3">
              {locale === 'ar' ? 'الوصف' : 'Description'}
            </h4>
            <p className="text-gray-600 leading-relaxed">
              {event.description_translations?.[locale] || event.description_translations?.en || (locale === 'ar' ? 'لا يوجد وصف متاح.' : 'No description available.')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};