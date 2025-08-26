'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Helper function to get translated text
const getTranslatedText = (textObject, locale) => {
  if (!textObject) return '';
  return textObject[locale] || textObject.en || '';
};

// Helper function to extract locale from URL
const getLocaleFromPath = (pathname) => {
  if (!pathname) return 'en';
  const segments = pathname.split('/');
  // Check if the first segment is a valid locale
  if (segments[1] === 'ar' || segments[1] === 'en') {
    return segments[1];
  }
  return 'en';
};

const OfferCard = ({ variant, locale }) => {
  const translatedName = getTranslatedText(variant.name, locale);
  
  return (
    <Link href={`/${locale}/${variant.product_id}/${variant.id}`}>
      <motion.div
        className="shadow-lg w-full relative bg-white mb-2 rounded-2xl overflow-hidden group h-[380px]"
        style={{ width: 'calc(100% - 18px)' }}
        whileHover={{ scale: 1.03, y: -5 }}
        transition={{ duration: 0.3 }}
      >
        {!variant.in_stock && (
          <div className="absolute top-5 right-0 z-20">
            <div className="bg-red-500 text-white text-xs py-1 px-4 rounded-l-full shadow-md">
              {locale === 'ar' ? 'غير متوفر' : 'Out of Stock'}
            </div>
          </div>
        )}
        {variant.is_new && (
          <div className="absolute top-0 left-0 z-20">
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-te-full shadow-md">
              {locale === 'ar' ? 'جديد' : 'New'}
            </div>
          </div>
        )}
        <div className="relative w-full h-48 bg-gray-50">
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={variant.image && variant.image !== 'null' ? `https://st.amjadshbib.com/api/public/${variant.image}` : '/placeholder-product.jpg'}
              alt={translatedName || 'Product'}
              fill
              className="object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />
          </motion.div>
        </div>
        <div className="px-4 py-3 pt-0 flex flex-col gap-2">
          <motion.h3
            className="text-lg font-semibold text-gray-800 line-clamp-1"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            {translatedName}
          </motion.h3>
          
          <div className="flex justify-between items-center mt-1">
            <span className="text-lg font-bold text-gray-800">
              ${variant.price}
            </span>
            {variant.is_free && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {locale === 'ar' ? 'مجاني' : 'Free'}
              </span>
            )}
          </div>
          
          {/* Additional details if they exist */}
          {variant.quantity && (
            <div className="flex flex-col mt-1">
              <span className="text-gray-500">{locale === 'ar' ? 'الكمية' : 'Quantity'}</span>
              <span className="font-medium text-gray-700">
                {variant.quantity}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

const OfferPage = () => {
  const pathname = usePathname();
  const [locale, setLocale] = useState('en');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Set locale based on URL and ensure component is mounted
  useEffect(() => {
    setLocale(getLocaleFromPath(pathname));
    setIsMounted(true);
  }, [pathname]);
  
  const { data: offers, isLoading: offersLoading, error: offersError } = useQuery({
    queryKey: ['offers', locale],
    queryFn: async () => {
      const { data } = await axios.get('https://st.amjadshbib.com/api/offers');
      return data?.data || [];
    },
    enabled: isMounted, // Only run query after component is mounted
  });
  
  const { data: offerDetails, isLoading: detailsLoading, error: detailsError } = useQuery({
    queryKey: ['offer-details', selectedOffer, locale],
    queryFn: async () => {
      if (!selectedOffer) return null;
      const { data } = await axios.get(`https://st.amjadshbib.com/api/offers/${selectedOffer}`);
      return data?.data;
    },
    enabled: !!selectedOffer && isMounted, // Only run query after component is mounted and we have a selected offer
  });

  // Set initial selected offer after component is mounted and offers are loaded
  useEffect(() => {
    if (isMounted && offers && offers.length > 0 && !selectedOffer) {
      setSelectedOffer(offers[0].id);
    }
  }, [isMounted, offers, selectedOffer]);

  if (offersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-4" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-64 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (offersError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {locale === 'ar' ? 'فشل في تحميل العروض. يرجى المحاولة مرة أخرى لاحقاً.' : 'Failed to load offers. Please try again later.'}
        </div>
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-gray-500">
          {locale === 'ar' ? 'لا توجد عروض متاحة في الوقت الحالي.' : 'No offers available at the moment.'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Offers Navigation */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-4 pb-2">
          {offers.map((offer) => (
            <button
              key={offer.id}
              onClick={() => setSelectedOffer(offer.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedOffer === offer.id ? 'bg-[#00B207] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              {getTranslatedText(offer.offer_name, locale)}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Offer Details */}
      {detailsLoading ? (
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-4" />
        </div>
      ) : detailsError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
          {locale === 'ar' ? 'فشل في تحميل تفاصيل العرض. يرجى المحاولة مرة أخرى لاحقاً.' : 'Failed to load offer details. Please try again later.'}
        </div>
      ) : offerDetails ? (
        <div className="mb-8">
          {/* Offer Banner */}
          <div className="relative w-full min-h-[400px] bg-white rounded-2xl overflow-hidden mb-8">
            <div className="relative w-full h-full min-h-[400px]">
              <Image
                src={`https://st.amjadshbib.com/api/public/${offerDetails.image}`}
                alt={getTranslatedText(offerDetails.offer_name, locale) || 'Offer'}
                fill
                className="object-contain"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-top justify-center">
                <h1 className="text-4xl font-bold text-white text-center px-4">
                  {getTranslatedText(offerDetails.offer_name, locale)}
                </h1>
              </div>
              <div className="absolute top-5 right-5 bg-red-600 text-white text-xl font-bold px-4 py-2 rounded-full transform rotate-12 shadow-lg">
                {offerDetails.discount_percentage}% OFF
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {offerDetails.variants && offerDetails.variants.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-6">
                {locale === 'ar' ? 'المنتجات في هذا العرض' : 'Products in this Offer'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {offerDetails.variants.map((variant) => (
                  <OfferCard key={variant.id} variant={variant} locale={locale} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-gray-500">
              {locale === 'ar' ? 'لا توجد منتجات متاحة في هذا العرض' : 'No products available in this offer.'}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default OfferPage;