'use client';

import Image from "next/image";
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const ProductCard = ({ product }) => {
    const pathname = usePathname();
    const currentLocale = pathname.split('/')[1] || 'en';
    return (
        <motion.div
            className="shadow-lg w-full relative bg-white mb-2 rounded-xl md:rounded-2xl overflow-hidden group h-full"
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
        >
            {/* Status Badges - Positioned in top corners */}
            <div className="absolute top-2 left-2 right-2 flex justify-between z-20">
                {product.is_new && (
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-md shadow-md">
                        {currentLocale === 'ar' ? 'جديد' : 'New'}
                    </div>
                )}
                {!product.in_stock && (
                    <div className="bg-red-500 text-white text-xs py-1 px-2 rounded-md shadow-md ml-auto">
                        {currentLocale === 'ar' ? 'غير متوفر' : 'Out of Stock'}
                    </div>
                )}
            </div>

            {/* Image Section - Using aspect ratio for responsiveness */}
            <div className="relative w-full aspect-square bg-gray-50">
                <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                >
                    <Image
                        src={product.image ? `https://st.amjadshbib.com/api/public/${product.image}` : '/placeholder-product.jpg'}
                        alt={product.name_translations?.[currentLocale] || product.name_translations?.en || 'Product'}
                        fill
                        className="object-cover"
                        onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                        }}
                    />
                    {/* Gradient overlay for better text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.div>
            </div>

            {/* Content Section */}
            <div className="px-3 py-3 flex flex-col gap-1 sm:gap-2">
                {/* Title */}
                <motion.h3
                    className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-1"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                >
                    {product.name_translations?.[currentLocale] || product.name_translations?.en}
                </motion.h3>

                {/* Description - Hidden on smallest screens */}
                {(product.description_translations?.[currentLocale] || product.description_translations?.en) && (
                    <p className="hidden sm:block text-xs sm:text-sm text-gray-500 line-clamp-2">
                        {product.description_translations?.[currentLocale] || product.description_translations?.en}
                    </p>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm mt-1">
                    {product.weight_unit && (
                        <div className="flex flex-col">
                            <span className="text-gray-500">{currentLocale === 'ar' ? 'الوحدة' : 'Unit'}</span>
                            <span className="font-medium text-gray-700 uppercase">
                                {product.weight_unit}
                            </span>
                        </div>
                    )}
                </div>

                {/* Tags */}
                {product.material_property && (
                    <div className="flex gap-1 sm:gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 bg-purple-50 text-purple-700 rounded-full font-medium truncate max-w-full">
                            {product.material_property}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ProductCard;
