'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, usePathname } from 'next/navigation';

const TopSellingProducts = () => {
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';
  const isRTL = currentLocale === 'ar';
  const [showAll, setShowAll] = useState(false);
  
  const { data: topProducts, error, isLoading } = useQuery({
    queryKey: ['get-top-products-country'],
    queryFn: async () => {
      const { data } = await axios.get(`https://setalkel.amjadshbib.com/api/top-products-country`);
      return data?.data;
    },
  });

  // Group products by country
  const groupedByCountry = topProducts?.reduce((acc, product) => {
    if (!acc[product.country_name]) {
      acc[product.country_name] = [];
    }
    acc[product.country_name].push(product);
    return acc;
  }, {}) || {};

  if (isLoading) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <h2 className={`text-xl md:text-2xl font-semibold mb-4 md:mb-6 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {currentLocale === 'ar' ? 'الأكثر مبيعاً حسب البلد' : 'Top Selling by Country'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-xl md:rounded-2xl overflow-hidden">
              <div className="h-12 bg-gray-300 rounded-t-xl flex items-center px-4">
                <div className="h-6 w-6 bg-gray-400 rounded-full mr-3"></div>
                <div className="h-4 bg-gray-400 rounded w-24"></div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                {[1, 2].map((j) => (
                  <div key={j} className="aspect-square w-full bg-gray-300 rounded-lg"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <h2 className={`text-xl md:text-2xl font-semibold mb-4 md:mb-6 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {currentLocale === 'ar' ? 'الأكثر مبيعاً حسب البلد' : 'Top Selling by Country'}
        </h2>
        <div className={`text-red-500 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {currentLocale === 'ar' ? 'خطأ في تحميل المنتجات الأكثر مبيعاً' : 'Error loading top selling products'}
        </div>
      </div>
    );
  }

  if (!topProducts || topProducts.length === 0) {
    return (
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <h2 className={`text-xl md:text-2xl font-semibold mb-4 md:mb-6 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {currentLocale === 'ar' ? 'الأكثر مبيعاً حسب البلد' : 'Top Selling by Country'}
        </h2>
        <div className={`text-gray-500 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {currentLocale === 'ar' ? 'لم يتم العثور على منتجات' : 'No products found'}
        </div>
      </div>
    );
  }

  // Get countries to display (limit to 6 if not showing all)
  const countriesToDisplay = showAll 
    ? Object.keys(groupedByCountry) 
    : Object.keys(groupedByCountry).slice(0, 6);

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex justify-between items-center mb-4 md:mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1`}>
          <h2 className={`text-xl md:text-2xl font-semibold ${isRTL ? 'font-arabic' : ''}`}>
            {currentLocale === 'ar' ? 'الأكثر مبيعاً حسب البلد' : 'Top Selling by Country'}
          </h2>
        </div>
        
        {Object.keys(groupedByCountry).length > 6 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className={`text-sm text-[#00B207] hover:text-[#009706] font-medium transition-colors ${isRTL ? 'font-arabic' : ''}`}
          >
            {showAll 
              ? (currentLocale === 'ar' ? 'عرض أقل' : 'Show Less') 
              : (currentLocale === 'ar' ? 'عرض الكل' : 'Show All')}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {countriesToDisplay.map((countryName) => {
          const countryProducts = groupedByCountry[countryName];
          
          return (
            <motion.div
              key={countryName}
              className="shadow bg-white rounded-xl md:rounded-2xl overflow-hidden h-full"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {/* Country Header */}
              <div className={`bg-gradient-to-r from-[#a4cf6e]/90 to-[#00B207]/90 text-white p-3 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className={`font-semibold ${isRTL ? 'font-arabic text-right w-full' : 'text-left w-full'}`}>{countryName}</h3>
              </div>
              
              {/* Products Grid */}
              <div className="grid grid-cols-2 gap-2 p-3">
                {countryProducts.slice(0, 4).map((product) => (
                  <Link
                    key={`${countryName}-${product.product_id}`}
                    href={`/${params?.locale || 'en'}/${product.product_id}`}
                  >
                    <motion.div
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Product Image */}
                      <Image
                        src={product.image 
                          ? `https://setalkel.amjadshbib.com/public/${product.image}`
                          : '/placeholder-product.jpg'}
                        alt={product.product_name?.[currentLocale] || product.product_name?.en || 'Product'}
                        fill
                        className="object-cover"
                      />
                      
                      {/* Gradient overlay with product name */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                        <p className={`text-white text-xs font-medium line-clamp-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                          {product.product_name?.[currentLocale] || product.product_name?.en}
                        </p>
                      </div>
                      
                      {/* Sales Badge */}
                      <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-[#00B207] text-white text-xs font-semibold px-2 py-1 rounded-lg shadow-md`}>
                        {product.total_sales.toLocaleString()} {currentLocale === 'ar' ? 'مبيعات' : 'Sales'}
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TopSellingProducts;