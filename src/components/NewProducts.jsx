'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, usePathname } from 'next/navigation';

const NewProducts = () => {
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';
  const isRTL = currentLocale === 'ar';
  const [showAll, setShowAll] = useState(false);
  
  const { data: newProducts, error, isLoading } = useQuery({
    queryKey: ['get-new-products'],
    queryFn: async () => {
      const { data } = await axios.get(`https://st.amjadshbib.com/api/getnewvariants`);
      return data?.data;
    },
  });

  if (isLoading) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <h2 className={`text-xl md:text-2xl font-semibold mb-4 md:mb-6 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {currentLocale === 'ar' ? 'منتجات جديدة' : 'New Products'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-xl md:rounded-2xl overflow-hidden">
              <div className="aspect-square w-full bg-gray-300"></div>
              <div className="p-3">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <h2 className={`text-xl md:text-2xl font-semibold mb-4 md:mb-6 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {currentLocale === 'ar' ? 'منتجات جديدة' : 'New Products'}
        </h2>
        <div className={`text-red-500 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {currentLocale === 'ar' ? 'خطأ في تحميل المنتجات الجديدة' : 'Error loading new products'}
        </div>
      </div>
    );
  }

  if (!newProducts || newProducts?.length === 0) {
    return (
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <h2 className={`text-xl md:text-2xl font-semibold mb-4 md:mb-6 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {currentLocale === 'ar' ? 'منتجات جديدة' : 'New Products'}
        </h2>
        <div className={`text-gray-500 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {currentLocale === 'ar' ? 'لم يتم العثور على منتجات جديدة' : 'No new products found'}
        </div>
      </div>
    );
  }

  const displayProducts = showAll ? newProducts : newProducts.slice(0, 4);

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <h2 className={`text-xl md:text-2xl font-semibold mb-4 md:mb-6 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
        {currentLocale === 'ar' ? 'منتجات جديدة' : 'New Products'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {displayProducts.map((product) => (
          <Link
            key={product.id}
            href={`/${params?.locale || 'en'}/${product.product_id}/${product.id}`}
          >
            <motion.div
              className="shadow bg-white rounded-xl md:rounded-2xl overflow-hidden h-full cursor-pointer"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-full flex flex-col">
                {/* Image Container with Gradient Overlay */}
                <div className="relative w-full aspect-square overflow-hidden">
                  <motion.div
                    className="absolute inset-0 z-10"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src={product.image && product.image !== 'null'
                        ? `https://st.amjadshbib.com/api/public/${product.image}`
                        : product.product?.image && product.product.image !== 'null'
                          ? `https://st.amjadshbib.com/api/public/${product.product.image}`
                          : '/placeholder-product.jpg'}
                      alt={product.product?.name_translations?.[currentLocale] || product.product?.name_translations?.en || 'Product'}
                      fill
                      className="object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
                  </motion.div>
                  
                  {/* Badges */}
                  <div className={`absolute top-2 ${isRTL ? 'right-2 left-auto' : 'left-2 right-auto'} z-20 flex flex-col items-start`}>
                    {product.is_new && (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-md shadow-md mb-1">
                        {currentLocale === 'ar' ? 'جديد' : 'New'}
                      </div>
                    )}
                    {!product.in_stock && (
                      <div className="bg-red-500 text-white text-xs py-1 px-2 rounded-md shadow-md">
                        {currentLocale === 'ar' ? 'نفذ من المخزون' : 'Out of Stock'}
                      </div>
                    )}
                  </div>
                  
                  {/* Product name overlay on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                    <motion.h3
                      className={`text-white font-semibold text-sm md:text-base line-clamp-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                      whileHover={{ x: isRTL ? -3 : 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      {product.product?.name_translations?.[currentLocale] || product.product?.name_translations?.en}
                    </motion.h3>
                  </div>
                </div>
                
                {/* Product details */}
                <div className="p-3 flex-1 bg-white">
                  <div className={`text-xs md:text-sm text-gray-700 ${isRTL ? 'font-arabic' : ''}`}>
                    {product.size && (
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{currentLocale === 'ar' ? 'الحجم:' : 'Size:'}</span>
                        <span>{product.size}</span>
                      </div>
                    )}
                    {product.packaging && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{currentLocale === 'ar' ? 'التعبئة:' : 'Packaging:'}</span>
                        <span>{product.packaging}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
      
      {/* Show More / Show Less Button */}
      {newProducts.length > 4 && (
        <div className="flex justify-center mt-6 md:mt-8">
          <motion.button
            onClick={() => setShowAll(!showAll)}
            className={`px-4 md:px-6 py-2 bg-[#00B207] text-white text-sm md:text-base rounded-full hover:bg-[#009706] transition-colors ${isRTL ? 'font-arabic' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showAll ? (currentLocale === 'ar' ? 'عرض أقل' : 'Show Less') : (currentLocale === 'ar' ? 'عرض المزيد' : 'Show More')}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default NewProducts;