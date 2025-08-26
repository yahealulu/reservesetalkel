'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function BiteDetailsPage({ params }) {
  const { id } = params;
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeStep, setActiveStep] = useState(1);

  // Fetch bite details
  const { data: biteData, isLoading: biteLoading, error: biteError } = useQuery({
    queryKey: ['bite', id],
    queryFn: async () => {
      const { data } = await axios.get(`https://st.amjadshbib.com/api/bites/${id}`);
      return data?.data;
    },
  });

  // Fetch product details for the current step
  const { data: productData, isLoading: productLoading, error: productError, refetch: refetchProduct } = useQuery({
    queryKey: ['product', activeStep, biteData],
    queryFn: async () => {
      if (!biteData?.preparation_translations_steps) return null;
      
      const currentStep = biteData.preparation_translations_steps.find(step => step.step_number === activeStep);
      if (!currentStep || !currentStep.product_id) return null;
      
      const { data } = await axios.get(`https://st.amjadshbib.com/api/products/${currentStep.product_id}`);
      return data?.data;
    },
    enabled: !!biteData?.preparation_translations_steps,
  });

  // Update product data when active step changes
  useEffect(() => {
    if (biteData?.preparation_translations_steps) {
      refetchProduct();
    }
  }, [activeStep, biteData, refetchProduct]);

  // Convert YouTube URL to embed format
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

  // Gallery slides from images and video
  const slides = biteData ? [
    ...(biteData.video_url ? [{ type: 'video', url: convertToEmbedUrl(biteData.video_url) }] : []),
    ...(biteData.image ? [{ type: 'image', url: `https://st.amjadshbib.com/api/public/${biteData.image}` }] : []),
    ...(biteData.gallery ? biteData.gallery.map(img => ({ 
      type: 'image', 
      url: `https://st.amjadshbib.com/api/public/${img}` 
    })) : [])
  ] : [];

  // Navigation for gallery
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Loading state
  if (biteLoading) {
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

  // Error state
  if (biteError) {
    return (
      <main className="min-h-screen bg-[#faf8f5]">
        <div className="mx-4 md:mx-10 px-2 py-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {locale === 'ar' ? 'فشل في تحميل تفاصيل الوصفة' : 'Failed to load recipe details'}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <div className="mx-4 md:mx-10 px-2 py-8">
        {/* Back Button */}
        <Link 
          href={`/${locale}/bites`}
          className="inline-flex items-center text-[#4c5a3c] mb-6 hover:underline"
          style={{ direction: locale === 'ar' ? 'rtl' : 'ltr' }}
        >
          <svg 
            className={`w-5 h-5 ${locale === 'ar' ? 'ml-1 transform rotate-180' : 'mr-1'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          {locale === 'ar' ? 'العودة إلى الوصفات' : 'Back to Recipes'}
        </Link>

        {/* Recipe Title */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ direction: locale === 'ar' ? 'rtl' : 'ltr' }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#4c5a3c] mb-4">
            {getLocalizedText(biteData?.name_translations)}
          </h1>
          <div className="w-24 h-1 bg-[#4c5a3c] rounded"></div>
        </motion.div>

        {/* Gallery Section */}
        {slides.length > 0 && (
          <motion.div 
            className="relative h-[300px] md:h-[500px] rounded-2xl overflow-hidden group mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
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
                    />
                  </div>
                ) : (
                  <div className="relative h-full">
                    <Image
                      src={slide.url}
                      alt={getLocalizedText(biteData?.name_translations)}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 80vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
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
          </motion.div>
        )}

        {/* Description Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div 
            className="bg-white rounded-2xl p-6 shadow-sm"
            style={{ direction: locale === 'ar' ? 'rtl' : 'ltr' }}
          >
            <h2 className="text-2xl font-semibold text-[#4c5a3c] mb-4">
              {locale === 'ar' ? 'وصف الوصفة' : 'Recipe Description'}
            </h2>
            <div className="prose max-w-none text-gray-700">
              {getLocalizedText(biteData?.description_translations)}
            </div>
          </div>
        </motion.div>

        {/* Preparation Steps Section */}
        {biteData?.preparation_translations_steps && biteData.preparation_translations_steps.length > 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 
                className="text-2xl font-semibold text-[#4c5a3c] mb-6"
                style={{ direction: locale === 'ar' ? 'rtl' : 'ltr' }}
              >
                {locale === 'ar' ? 'خطوات التحضير' : 'Preparation Steps'}
              </h2>
              
              {/* Steps Navigation */}
              <div className="flex overflow-x-auto pb-4 mb-6 gap-2">
                {biteData.preparation_translations_steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.step_number)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeStep === step.step_number
                        ? 'bg-[#4c5a3c] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {locale === 'ar' ? `الخطوة ${step.step_number}` : `Step ${step.step_number}`}
                  </button>
                ))}
              </div>
              
              {/* Active Step Content */}
              {biteData.preparation_translations_steps.map((step) => {
                if (step.step_number !== activeStep) return null;
                
                return (
                  <div key={step.id} className="space-y-6">
                    {/* Step Instruction */}
                    <div 
                      className="p-4 bg-[#f8f5f0] rounded-lg"
                      style={{ direction: locale === 'ar' ? 'rtl' : 'ltr' }}
                    >
                      <h3 className="font-medium text-lg text-[#4c5a3c] mb-2">
                        {locale === 'ar' ? `الخطوة ${step.step_number}` : `Step ${step.step_number}`}
                      </h3>
                      <p className="text-gray-700">
                        {getLocalizedText(step.instruction_translations)}
                      </p>
                    </div>
                    
                    {/* Step Media */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Step Image or Video */}
                      <div className="rounded-lg overflow-hidden bg-white shadow-sm">
                        {step.image ? (
                          <div className="relative h-64">
                            <Image
                              src={`https://st.amjadshbib.com/api/public/${step.image}`}
                              alt={`Step ${step.step_number}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        ) : step.video_url ? (
                          <div className="relative h-64 bg-black">
                            <iframe
                              src={convertToEmbedUrl(step.video_url)}
                              className="absolute inset-0 w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-64 bg-gray-100">
                            <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                              <path d="M12 17c.55 0 1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1h-2v-2c0-.55-.45-1-1-1s-1 .45-1 1v2H9c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Product Card */}
                      <div className="rounded-lg overflow-hidden bg-white shadow-sm">
                        {productLoading ? (
                          <div className="p-4 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        ) : productError ? (
                          <div className="p-4 text-red-500">
                            {locale === 'ar' ? 'فشل في تحميل معلومات المنتج' : 'Failed to load product information'}
                          </div>
                        ) : productData ? (
                          <Link href={`/${locale}/${productData.id}`}>
                            <div className="relative h-40 bg-gray-100">
                              {productData.image ? (
                                <Image
                                  src={`https://st.amjadshbib.com/api/public/${productData.image}`}
                                  alt={getLocalizedText(productData.name_translations)}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                                    <path d="M12 17c.55 0 1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1h-2v-2c0-.55-.45-1-1-1s-1 .45-1 1v2H9c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1z" />
                                  </svg>
                                </div>
                              )}
                              
                              {/* Product Badge */}
                              <div className="absolute top-2 right-2 bg-[#4c5a3c] text-white text-xs font-bold px-2 py-1 rounded">
                                {locale === 'ar' ? 'منتج مستخدم' : 'Used Product'}
                              </div>
                            </div>
                            
                            <div 
                              className="p-4"
                              style={{ direction: locale === 'ar' ? 'rtl' : 'ltr' }}
                            >
                              <h3 className="font-medium text-[#4c5a3c]">
                                {getLocalizedText(productData.name_translations)}
                              </h3>
                              
                              {/* Product Details */}
                              <div className="mt-2 flex flex-wrap gap-2">
                                {productData.price && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                    {productData.price} {productData.currency || 'USD'}
                                  </span>
                                )}
                                
                                {productData.weight && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {productData.weight} {productData.weight_unit || 'g'}
                                  </span>
                                )}
                                
                                {productData.status && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                    {productData.status}
                                  </span>
                                )}
                              </div>
                              
                              {/* View Product Link */}
                              <div className="mt-3 text-sm text-[#4c5a3c] font-medium hover:underline">
                                {locale === 'ar' ? 'عرض المنتج' : 'View Product'}
                                <svg 
                                  className={`inline-block w-4 h-4 ${locale === 'ar' ? 'mr-1 transform rotate-180' : 'ml-1'}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div 
                            className="p-4 text-center text-gray-500 h-full flex flex-col items-center justify-center"
                            style={{ direction: locale === 'ar' ? 'rtl' : 'ltr' }}
                          >
                            <svg className="w-12 h-12 text-gray-300 mb-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                              <path d="M12 17c.55 0 1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1h-2v-2c0-.55-.45-1-1-1s-1 .45-1 1v2H9c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1z" />
                            </svg>
                            <p>
                              {locale === 'ar' ? 'لا يوجد منتج مرتبط بهذه الخطوة' : 'No product associated with this step'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Step Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                  disabled={activeStep === 1}
                  className={`px-4 py-2 rounded-lg flex items-center ${activeStep === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-[#4c5a3c] hover:bg-[#4c5a3c]/10'}`}
                >
                  <svg 
                    className={`w-5 h-5 ${locale === 'ar' ? 'ml-1 transform rotate-180' : 'mr-1'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  {locale === 'ar' ? 'الخطوة السابقة' : 'Previous Step'}
                </button>
                
                <button
                  onClick={() => setActiveStep(prev => Math.min(biteData.preparation_translations_steps.length, prev + 1))}
                  disabled={activeStep === biteData.preparation_translations_steps.length}
                  className={`px-4 py-2 rounded-lg flex items-center ${activeStep === biteData.preparation_translations_steps.length ? 'text-gray-400 cursor-not-allowed' : 'text-[#4c5a3c] hover:bg-[#4c5a3c]/10'}`}
                >
                  {locale === 'ar' ? 'الخطوة التالية' : 'Next Step'}
                  <svg 
                    className={`w-5 h-5 ${locale === 'ar' ? 'mr-1 transform rotate-180' : 'ml-1'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}