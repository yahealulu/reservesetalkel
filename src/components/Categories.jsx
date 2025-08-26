'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';

const Categories = () => {
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';
  const isRTL = currentLocale === 'ar';
  const [showAll, setShowAll] = useState(false);
  
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axios.get('https://setalkel.amjadshbib.com/api/categories');
      return data?.data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-200 animate-pulse mb-4 rounded-lg"></div>
                <div className="h-4 w-20 bg-gray-200 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4">
          <div className={`text-red-500 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
            {currentLocale === 'ar' ? 'خطأ في تحميل الفئات' : 'Error loading categories'}
          </div>
        </div>
      </section>
    );
  }

  const categories = categoriesData
    ? categoriesData.filter(category => !category.is_hidden && category.products_count > 0)
    : [];

  if (!categories || categories.length === 0) {
    return (
      <section className="py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4">
          <div className={`text-gray-500 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
            {currentLocale === 'ar' ? 'لا توجد فئات متاحة' : 'No categories available'}
          </div>
        </div>
      </section>
    );
  }

  const displayCategories = showAll ? categories : categories.slice(0, 6);

  return (
    <section dir={isRTL ? 'rtl' : 'ltr'}>
      <h2 className={`text-2xl md:text-3xl font-bold mb-8 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
        {currentLocale === 'ar' ? 'الفئات' : 'Categories'}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
        {displayCategories.map((category) => (
          <Link
            key={category.id}
            href={`/${params?.locale || 'en'}/category/${category.id}`}
            className="group relative block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-square relative overflow-hidden bg-gray-50">
              <Image
                src={`https://setalkel.amjadshbib.com/public/${category.image}`}
                alt={category.name_translations?.[currentLocale] || category.name_translations?.en || 'Category'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay with product count that appears on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <motion.div 
                  className="bg-white bg-opacity-90 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1 }}
                >
                  <span className={`font-medium text-green-600 ${isRTL ? 'font-arabic' : ''}`}>
                    {category.products_count} {currentLocale === 'ar' ? 'منتج' : 'products'}
                  </span>
                </motion.div>
              </div>
            </div>
            <div className="p-3 bg-white">
              <h3 className={`text-sm md:text-base font-medium text-gray-800 truncate group-hover:text-green-600 transition-colors ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                {category.name_translations?.[currentLocale] || category.name_translations?.en}
              </h3>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Show More / Show Less Button */}
      {categories.length > 6 && (
        <div className="flex justify-center mt-10">
          <motion.button
            onClick={() => setShowAll(!showAll)}
            className={`px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg ${isRTL ? 'font-arabic' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showAll 
              ? (currentLocale === 'ar' ? 'عرض أقل' : 'Show Less') 
              : (currentLocale === 'ar' ? 'عرض المزيد' : 'Show More')
            }
          </motion.button>
        </div>
      )}
    </section>
  );
};

export default Categories;