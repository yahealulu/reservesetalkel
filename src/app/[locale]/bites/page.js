'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function BitesPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const { data: bitesData, isLoading, error } = useQuery({
    queryKey: ['bites'],
    queryFn: async () => {
      const { data } = await axios.get('https://st.amjadshbib.com/api/bites');
      return data?.data;
    },
  });

  // Convert YouTube URL to embed format for preview
  const convertToEmbedUrl = (url) => {
    if (!url) return null;
    
    // Remove extra spaces and quotes that might be in the API response
    url = url.trim().replace(/["'`]/g, '');
    
    let videoId = '';
    if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Get the appropriate text based on locale
  const getLocalizedText = (translations) => {
    if (!translations) return '';
    
    return translations[locale] || 
           translations.en || 
           Object.values(translations)[0] || '';
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#faf8f5]">
        <div className="mx-4 md:mx-10 px-2 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#4c5a3c] mb-4">
              {locale === 'ar' ? 'وصفات الطعام' : 'Food Recipes'}
            </h1>
            <div className="w-24 h-1 bg-[#4c5a3c] mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#faf8f5]">
        <div className="mx-4 md:mx-10 px-2 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#4c5a3c] mb-4">
              {locale === 'ar' ? 'وصفات الطعام' : 'Food Recipes'}
            </h1>
            <div className="w-24 h-1 bg-[#4c5a3c] mx-auto rounded"></div>
          </div>
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            {locale === 'ar' ? 'فشل في تحميل الوصفات' : 'Failed to load recipes'}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <div className="mx-4 md:mx-10 px-2 py-8">
        {/* Page Title */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#4c5a3c] mb-4">
            {locale === 'ar' ? 'وصفات الطعام' : 'Food Recipes'}
          </h1>
          <div className="w-24 h-1 bg-[#4c5a3c] mx-auto rounded"></div>
        </motion.div>

        {/* Bites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bitesData && bitesData.map((bite, index) => (
            <motion.div
              key={bite.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/${locale}/bite-details/${bite.id}`}>
                <div className="relative h-48 bg-gray-100">
                  {bite.image ? (
                    <Image
                      src={`https://st.amjadshbib.com/api/public/${bite.image}`}
                      alt={getLocalizedText(bite.name_translations)}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : bite.video_url ? (
                    <div className="relative h-full w-full bg-gray-800">
                      <iframe
                        src={convertToEmbedUrl(bite.video_url)}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <div className="absolute inset-0 bg-transparent pointer-events-none" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm-4-4h-1v-1c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1v1H8c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-1h1c.55 0 1-.45 1-1s-.45-1-1-1z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Play button overlay for video */}
                  {bite.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#4c5a3c]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4" style={{ direction: locale === 'ar' ? 'rtl' : 'ltr' }}>
                  <h2 className="text-xl font-semibold text-[#4c5a3c] mb-2">
                    {getLocalizedText(bite.name_translations)}
                  </h2>
                  <p className="text-gray-600 line-clamp-2">
                    {getLocalizedText(bite.description_translations)}
                  </p>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {bite.preparation_translations_steps?.length || 0} {locale === 'ar' ? 'خطوات' : 'steps'}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#4c5a3c]/10 text-[#4c5a3c]">
                      {locale === 'ar' ? 'عرض الوصفة' : 'View Recipe'}
                      <svg className={`w-4 h-4 ml-1 ${locale === 'ar' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          
          {/* Empty state */}
          {bitesData && bitesData.length === 0 && (
            <div className="col-span-full text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                <path d="M12 17c.55 0 1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1h-2v-2c0-.55-.45-1-1-1s-1 .45-1 1v2H9c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-600">
                {locale === 'ar' ? 'لا توجد وصفات متاحة حالياً' : 'No recipes available yet'}
              </h3>
              <p className="text-gray-500 mt-2">
                {locale === 'ar' ? 'يرجى التحقق مرة أخرى لاحقاً' : 'Please check back later'}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}