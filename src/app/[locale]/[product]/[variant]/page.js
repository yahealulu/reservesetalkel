'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, Package, Scale, Barcode, Box, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import JsBarcode from 'jsbarcode';
import { AuthContext } from '@/context/AuthContext';

const VariantPage = () => {
    const router = useRouter();
    const params = useParams();
    const unwrappedParams = React.use(params);
    const pathname = usePathname();
    const currentLocale = pathname.split('/')[1];
    const [barcodeUrl, setBarcodeUrl] = useState('');
    const { user, isAuthLoading } = useContext(AuthContext);

    // Fetch variant data
    const { data: variant, isLoading, error } = useQuery({
        queryKey: ['variant', unwrappedParams.product, unwrappedParams.variant, !!user],
        queryFn: async () => {
            let response;
            
            if (user) {
                // User is logged in, use the authenticated API endpoint
                const token = localStorage.getItem('token');
                response = await axios.get(
                    `https://setalkel.amjadshbib.com/api/product-with-variants/${unwrappedParams.variant}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                // The authenticated API returns data as an array [{}]
                return Array.isArray(response.data?.data) ? response.data?.data[0] : response.data?.data;
            } else {
                // User is not logged in, use the regular API endpoint
                response = await axios.get(
                    `https://setalkel.amjadshbib.com/api/products/${unwrappedParams.product}/variants/${unwrappedParams.variant}`
                );
                return response.data?.data;
            }
        },
        enabled: !!unwrappedParams.product && !!unwrappedParams.variant && !isAuthLoading
    });

    // Generate barcode image
    useEffect(() => {
        if (variant?.barcode) {
            const canvas = document.createElement('canvas');
            try {
                JsBarcode(canvas, variant.barcode, {
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
    }, [variant]);

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

    if (!variant) {
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
                            src={variant.image ? `https://setalkel.amjadshbib.com/public/${variant.image}` : '/placeholder-product.jpg'}
                            alt={variant.size || 'Variant'}
                            fill
                            className="object-contain"
                        />
                    </div>

                    {/* Barcode Section */}
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
                                    <p className="font-mono text-sm sm:text-base md:text-lg">{variant.barcode}</p>
                                    <p className="text-sm mt-2">{currentLocale === 'ar' ? 'عرض الباركود غير متاح' : 'Barcode display unavailable'}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-md p-6 space-y-6"
                    >
                        <div className="space-y-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{variant.size}</h2>
                            
                            <div className="flex flex-wrap gap-2 sm:gap-4">
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${variant.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {variant.in_stock 
                                        ? (currentLocale === 'ar' ? 'متوفر' : 'In Stock') 
                                        : (currentLocale === 'ar' ? 'غير متوفر' : 'Out of Stock')}
                                </span>
                            </div>
                        </div>

                        {/* Packaging Information */}
                        <div className="space-y-3">
                            <h3 className="text-base sm:text-lg font-semibold flex items-center">
                                <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
                                {currentLocale === 'ar' ? 'معلومات التعبئة' : 'Packaging Information'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <div className="space-y-0.5 sm:space-y-1">
                                    <p className="text-xs sm:text-sm text-gray-500">{currentLocale === 'ar' ? 'نوع التعبئة' : 'Packaging Type'}</p>
                                    <p className="font-medium text-sm sm:text-base">{variant.packaging}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'تعبئة الصندوق' : 'Box Packing'}</p>
                                    <p className="font-medium">{variant.box_packing}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'أبعاد الصندوق' : 'Box Dimensions'}</p>
                                    <p className="font-medium">{variant.box_dimensions}</p>
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
                                    <p className="font-medium">{variant.net_weight} g</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'الوزن الإجمالي' : 'Gross Weight'}</p>
                                    <p className="font-medium">{variant.gross_weight} g</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'وزن الفارغ' : 'Tare Weight'}</p>
                                    <p className="font-medium">{variant.tare_weight} g</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'الوزن القياسي' : 'Standard Weight'}</p>
                                    <p className="font-medium">{variant.standard_weight} g</p>
                                </div>
                            </div>
                        </div>

                        {/* User Rating & Price (if available) */}
                        {(variant.user_rating || (user && variant.user_price)) && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">{currentLocale === 'ar' ? 'معلومات المستخدم' : 'User Information'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                    {variant.user_rating && (
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'تقييم المستخدم' : 'User Rating'}</p>
                                            <p className="font-medium">{variant.user_rating}</p>
                                        </div>
                                    )}
                                    {user && variant.user_price && (
                                        <>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'السعر للقطعة' : 'Price Per Piece'}</p>
                                                <p className="font-medium">${variant.user_price.piece_price}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500">{currentLocale === 'ar' ? 'سعر الصندوق' : 'Box Price'}</p>
                                                <p className="font-medium">${variant.user_price.box_price}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                        <Link 
                            href={`/${unwrappedParams.locale}/${unwrappedParams.product}`}
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