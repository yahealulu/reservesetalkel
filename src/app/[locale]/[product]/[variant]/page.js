'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, Package, Scale, Barcode, Box, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import JsBarcode from 'jsbarcode';
import { AuthContext } from '@/context/AuthContext';

const VariantPage = () => {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const currentLocale = pathname.split('/')[1];
    const [barcodeUrl, setBarcodeUrl] = useState('');
    const { user, isAuthLoading } = useContext(AuthContext);
    
    // Extract product and variant from params
    const product = params.product;
    const variant = params.variant;
    
    // Fetch variant data
    const { data: variantData, isLoading, error } = useQuery({
        queryKey: ['variant', product, variant, !!user],
        queryFn: async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers = {};
            
            if (user && token) {
                headers.Authorization = `Bearer ${token}`;
            }
            
            const response = await axios.get(
                `https://st.amjadshbib.com/api/products/${product}/variants/${variant}`,
                { headers }
            );
            
            return response.data?.data;
        },
        enabled: !!product && !!variant && !isAuthLoading
    });
    
    // Generate barcode image only on client side
    useEffect(() => {
        if (typeof window !== 'undefined' && variantData?.barcode) {
            const canvas = document.createElement('canvas');
            try {
                JsBarcode(canvas, variantData.barcode, {
                    format: 'CODE128',
                    displayValue: true,
                    fontSize: 16,
                    margin: 10,
                    background: '#ffffff',
                    lineColor: '#000000',
                    width: 2,
                    height: 100,
                });
                setBarcodeUrl(canvas.toDataURL('image/png'));
            } catch (e) {
                console.error('Error generating barcode:', e);
                // Fallback to text display if barcode generation fails
            }
        }
    }, [variantData]);
    
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="animate-pulse">
                    <div className="h-64 bg-gray-200 rounded-lg mb-4" />
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {currentLocale === 'ar' ? 'فشل تحميل تفاصيل المنتج' : 'Failed to load variant details'}
                </div>
            </div>
        );
    }
    
    if (!variantData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-gray-500">{currentLocale === 'ar' ? 'لم يتم العثور على المنتج' : 'Variant not found'}</div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back button and title */}
            <div className="flex items-center mb-4 sm:mb-8">
                <button
                    onClick={() => router.back()}
                    className="mr-4 p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
                >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{currentLocale === 'ar' ? 'تفاصيل المنتج' : 'Variant Details'}</h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {/* Left Column - Image and Basic Info */}
                <div className="space-y-6">
                    <div className="relative h-[250px] sm:h-[300px] md:h-[400px] bg-gray-50 rounded-lg sm:rounded-2xl overflow-hidden shadow-md">
                        <Image
                            src={variantData.image ? `https://st.amjadshbib.com/api/public/${variantData.image}` : '/placeholder-product.jpg'}
                            alt={variantData.size || 'Variant'}
                            fill
                            className="object-contain"
                        />
                    </div>
                    
                    {/* Barcode Section - Only render on client side to avoid hydration mismatch */}
                    {typeof window !== 'undefined' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-md p-6 space-y-4"
                        >
                            <h2 className="text-lg sm:text-xl font-semibold flex items-center">
                                <Barcode className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
                                {currentLocale === 'ar' ? 'الباركود' : 'Barcode'}
                            </h2>
                            <div className="flex flex-col items-center justify-center p-2 sm:p-4 bg-white rounded-lg border border-gray-200">
                                {barcodeUrl ? (
                                    <img src={barcodeUrl} alt="Product Barcode" className="max-w-full" />
                                ) : (
                                    <div className="text-gray-600 text-center">
                                        <p className="font-mono text-sm sm:text-base md:text-lg">{variantData.barcode}</p>
                                        <p className="text-sm mt-2">{currentLocale === 'ar' ? 'عرض الباركود غير متاح' : 'Barcode display unavailable'}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
                
                {/* Right Column - Details */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-md p-6 space-y-6"
                    >
                        <div className="space-y-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{variantData.size}</h2>
                            
                            <div className="flex flex-wrap gap-2 sm:gap-4">
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${variantData.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {variantData.in_stock 
                                        ? (currentLocale === 'ar' ? 'متوفر' : 'In Stock') 
                                        : (currentLocale === 'ar' ? 'غير متوفر' : 'Out of Stock')}
                                </span>
                                {variantData.is_new && (
                                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-700">
                                        {currentLocale === 'ar' ? 'جديد' : 'New'}
                                    </span>
                                )}
                            </div>
                            
                            {/* Product Name */}
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold text-gray-700">
                                    {currentLocale === 'ar' ? 'اسم المنتج' : 'Product Name'}
                                </h3>
                                <p className="text-gray-800">
                                    {variantData.product?.name_translations?.[currentLocale] || variantData.product?.name_translations?.en || variantData.product?.product_category}
                                </p>
                            </div>
                        </div>
                        
                        {/* Price Information - Enhanced Display */}
                        {variantData.user_price && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                                    {currentLocale === 'ar' ? 'معلومات الأسعار' : 'Price Information'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <motion.div 
                                        whileHover={{ y: -5 }}
                                        className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-sm"
                                    >
                                        <div className="flex items-center mb-2">
                                            <div className="bg-green-100 p-2 rounded-lg mr-3">
                                                <Package className="w-5 h-5 text-green-700" />
                                            </div>
                                            <h4 className="font-medium text-green-800">{currentLocale === 'ar' ? 'سعر القطعة' : 'Price Per Piece'}</h4>
                                        </div>
                                        <p className="text-2xl font-bold text-green-700 ml-11">${variantData.user_price.piece_price.toFixed(2)}</p>
                                        <p className="text-sm text-green-600 ml-11 mt-1">{currentLocale === 'ar' ? 'لكل قطعة' : 'per piece'}</p>
                                    </motion.div>
                                    
                                    <motion.div 
                                        whileHover={{ y: -5 }}
                                        className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm"
                                    >
                                        <div className="flex items-center mb-2">
                                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                                <Box className="w-5 h-5 text-blue-700" />
                                            </div>
                                            <h4 className="font-medium text-blue-800">{currentLocale === 'ar' ? 'سعر الصندوق' : 'Box Price'}</h4>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-700 ml-11">${variantData.user_price.box_price.toFixed(2)}</p>
                                        <p className="text-sm text-blue-600 ml-11 mt-1">{currentLocale === 'ar' ? 'لكل صندوق' : 'per box'}</p>
                                    </motion.div>
                                </div>
                                
                                {/* Savings indicator */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                                    <div className="flex items-center">
                                        <div className="bg-yellow-100 p-1 rounded-full mr-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-yellow-700">
                                            {currentLocale === 'ar' 
                                                ? `توفير ${(variantData.user_price.box_price - (variantData.user_price.piece_price * (variantData.box_packing || 1))).toFixed(2)} عند شراء صندوق كامل` 
                                                : `Save ${(variantData.user_price.box_price - (variantData.user_price.piece_price * (variantData.box_packing || 1))).toFixed(2)} when buying a full box`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Packaging Information */}
                        <div className="space-y-3">
                            <h3 className="text-base sm:text-lg font-semibold flex items-center">
                                <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
                                {currentLocale === 'ar' ? 'معلومات التعبئة' : 'Packaging Information'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <div className="space-y-0.5 sm:space-y-1">
                                    <p className="text-xs sm:text-sm text-gray-500">{currentLocale === 'ar' ? 'نوع التعبئة' : 'Packaging Type'}</p>
                                    <p className="font-medium text-sm sm:text-base">{variantData.packaging}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'تعبئة الصندوق' : 'Box Packing'}</p>
                                    <p className="font-medium">{variantData.box_packing}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'أبعاد الصندوق' : 'Box Dimensions'}</p>
                                    <p className="font-medium">{variantData.box_dimensions}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'سعة البالتة' : 'Pallet Capacity'}</p>
                                    <p className="font-medium">{variantData.pallet_capacity}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Weight Information */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center">
                                <Scale className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
                                {currentLocale === 'ar' ? 'معلومات الوزن' : 'Weight Information'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'الوزن الصافي' : 'Net Weight'}</p>
                                    <p className="font-medium">{variantData.net_weight} g</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'الوزن الإجمالي' : 'Gross Weight'}</p>
                                    <p className="font-medium">{variantData.gross_weight} g</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'وزن الفارغ' : 'Tare Weight'}</p>
                                    <p className="font-medium">{variantData.tare_weight} g</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'الوزن القياسي' : 'Standard Weight'}</p>
                                    <p className="font-medium">{variantData.standard_weight} g</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* User Rating (if available) */}
                        {variantData.average_rating !== undefined && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">{currentLocale === 'ar' ? 'معلومات المستخدم' : 'User Information'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'متوسط التقييم' : 'Average Rating'}</p>
                                        <p className="font-medium">{variantData.average_rating}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Product Information */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold">{currentLocale === 'ar' ? 'معلومات المنتج' : 'Product Information'}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'رمز المنتج' : 'Product Code'}</p>
                                    <p className="font-medium">{variantData.product?.product_code}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'وحدة الوزن' : 'Weight Unit'}</p>
                                    <p className="font-medium">{variantData.product?.weight_unit}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'الخصائص المادية' : 'Material Property'}</p>
                                    <p className="font-medium">{variantData.product?.material_property}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'بلد المنشأ' : 'Country of Origin'}</p>
                                    <p className="font-medium">{variantData.product?.country_origin_id?.name}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                        <Link 
                            href={`/${currentLocale}/${product}`}
                            className="flex-1 bg-indigo-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium hover:bg-indigo-700 transition-colors text-center text-sm sm:text-base"
                        >
                            {currentLocale === 'ar' ? 'العودة إلى المنتج' : 'Back to Product'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VariantPage;