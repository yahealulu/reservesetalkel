'use client';

import { use, useRef, useEffect, useState, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Box, Globe, Tag, Barcode, Package, Scale, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import JsBarcode from 'jsbarcode';

const ProductPage = ({ params }) => {
    const resolvedParams = use(params);
    const { user } = useContext(AuthContext);
    const pathname = usePathname();
    const locale = pathname.split('/')[1] || 'en';
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [barcodeUrl, setBarcodeUrl] = useState('');
    const relatedContainerRef = useRef(null);
    const relatedProgressRef = useRef(null);
    const relatedX = useMotionValue(0);

    const { data: product, isLoading: productLoading, error: productError } = useQuery({
        queryKey: ['product', resolvedParams.product],
        queryFn: async () => {
            const { data } = await axios.get(`https://st.amjadshbib.com/api/products/${resolvedParams.product}`);
            return data?.data;
        }
    });

    const { data: variants, isLoading: variantsLoading } = useQuery({
        queryKey: ['variants', resolvedParams.product],
        queryFn: async () => {
            const { data } = await axios.get(`https://st.amjadshbib.com/api/products/${resolvedParams.product}/variants`);
            return data?.data;
        },
        onSuccess: (data) => {
            if (data && data.length > 0 && !selectedVariant) {
                setSelectedVariant(data[0]);
            }
        }
    });
    
    // Fetch variant details when a variant is selected
    const { data: variantDetails, isLoading: variantLoading } = useQuery({
        queryKey: ['variantDetails', selectedVariant?.id],
        queryFn: async () => {
            if (!selectedVariant) return null;
            
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const endpoint = user 
                ? `https://st.amjadshbib.com/api/product-with-variants/${selectedVariant.id}`
                : `https://st.amjadshbib.com/api/products/${resolvedParams.product}/variants/${selectedVariant.id}`;
                
            const { data } = await axios.get(endpoint, { headers });
            
            // Handle different response structures
            // For logged-in users, API returns array with one object
            // For non-logged-in users, API returns direct object
            if (Array.isArray(data?.data)) {
                return data?.data[0]; // Return first item from array
            } else {
                return data?.data; // Return direct object
            }
        },
        enabled: !!selectedVariant,
    });
    
    // Fetch related products
    const { data: relatedProducts, isLoading: relatedLoading } = useQuery({
        queryKey: ['relatedProducts', resolvedParams.product],
        queryFn: async () => {
            const { data } = await axios.get(`https://st.amjadshbib.com/api/relatedproducts/${resolvedParams.product}`);
            return data?.data;
        },
        enabled: !!resolvedParams.product,
    });

    // Generate barcode for selected variant
    useEffect(() => {
        if (variantDetails?.barcode) {
            const canvas = document.createElement('canvas');
            try {
                JsBarcode(canvas, variantDetails.barcode, {
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
            }
        }
    }, [variantDetails]);
    
    const updateProgressBar = (scrollLeft, containerElement, progressElement, motionValue) => {
        if (!containerElement || !progressElement) return;
        const scrollWidth = containerElement.scrollWidth - containerElement.clientWidth;
        const progress = (scrollLeft / scrollWidth) * (progressElement.clientWidth - 100);
        motionValue.set(-progress);
    };
    
    const handleRelatedScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        updateProgressBar(scrollLeft, relatedContainerRef.current, relatedProgressRef.current, relatedX);
    };

    // Scroll related products
    const scrollRelated = (direction) => {
        if (relatedContainerRef.current) {
            const container = relatedContainerRef.current;
            const scrollAmount = container.clientWidth * 0.8;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const relatedContainer = relatedContainerRef.current;
        
        if (relatedContainer) {
            relatedContainer.addEventListener('scroll', handleRelatedScroll);
        }
        
        return () => {
            if (relatedContainer) {
                relatedContainer.removeEventListener('scroll', handleRelatedScroll);
            }
        };
    }, []);

    if (productLoading) {
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

    if (productError) {
        console.log(productError);
        
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {locale === 'ar' ? 'فشل تحميل تفاصيل المنتج' : 'Failed to load product details'}
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-gray-500">
                    {locale === 'ar' ? 'المنتج غير موجود' : 'Product not found'}
                </div>
            </div>
        );
    }

    const isLoading = productLoading || (selectedVariant && variantLoading);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-xl sm:rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
                    {/* Left Column - Image and Variants */}
                    <div className="space-y-8">
                        {/* Main Product Image */}
                        <div className="relative h-[300px] sm:h-[400px] md:h-[500px] bg-gray-50 rounded-lg sm:rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={selectedVariant?.id || 'product'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full"
                                >
                                    <Image
                                        src={selectedVariant?.image 
                                            ? `https://st.amjadshbib.com/api/public/${selectedVariant.image}` 
                                            : `https://st.amjadshbib.com/api/public/${product?.image}`}
                                        alt={(selectedVariant ? `${product?.name_translations?.en} - ${selectedVariant.size}` : product?.name_translations?.en) || 'Product'}
                                        fill
                                        className="object-contain p-4"
                                    />
                                </motion.div>
                            </AnimatePresence>
                            {product?.is_new && (
                                <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                                    {locale === 'ar' ? 'جديد' : 'New'}
                                </span>
                            )}
                            {product?.is_hidden && (
                                <span className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                                    {locale === 'ar' ? 'مخفي' : 'Hidden'}
                                </span>
                            )}
                        </div>
                        
                        {/* Variant Selection */}
                        {variants?.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                                    {locale === 'ar' ? 'المتغيرات المتاحة' : 'Available Variants'}
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                                    {/* Main Product Image Button */}
                                    <button
                                        onClick={() => setSelectedVariant(null)}
                                        className={`relative p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all ${!selectedVariant 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-blue-300 bg-white'}`}
                                    >
                                        <div className="relative h-12 sm:h-16 mb-1 sm:mb-2">
                                            <Image
                                                src={`https://st.amjadshbib.com/api/public/${product?.image}`}
                                                alt={product?.name_translations?.en || 'Product'}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <p className="text-xs sm:text-sm font-medium text-center truncate">
                                            {locale === 'ar' ? 'المنتج الرئيسي' : 'Main Product'}
                                        </p>
                                        {!selectedVariant && (
                                            <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-500" />
                                        )}
                                    </button>
                                    
                                    {/* Variant Buttons */}
                                    {variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`relative p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all ${selectedVariant?.id === variant.id 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-blue-300 bg-white'}`}
                                        >
                                            <div className="relative h-12 sm:h-16 mb-1 sm:mb-2">
                                                <Image
                                                    src={`https://st.amjadshbib.com/api/public/${variant.image}`}
                                                    alt={`${product?.name_translations?.en} - ${variant.size}`}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            <p className="text-xs sm:text-sm font-medium text-center truncate">{variant.size}</p>
                                            {selectedVariant?.id === variant.id && (
                                                <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                                {selectedVariant 
                                    ? `${product?.name_translations?.en} - ${selectedVariant.size}` 
                                    : product?.name_translations?.en}
                            </h1>
                            
                            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-sm sm:text-base">
                                <Tag className="w-4 h-4" />
                                <span>{locale === 'ar' ? `رمز المنتج: ${product?.product_code}` : `Product Code: ${product?.product_code}`}</span>
                            </div>
                            
                            {product?.description_translations?.en && (
                                <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                                    {product.description_translations.en}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${(selectedVariant?.in_stock || product?.in_stock) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {(selectedVariant?.in_stock || product?.in_stock) 
                                    ? (locale === 'ar' ? 'متوفر في المخزون' : 'In Stock') 
                                    : (locale === 'ar' ? 'غير متوفر في المخزون' : 'Out of Stock')}
                            </span>
                            {product?.is_new && (
                                <span className="bg-green-100 text-green-600 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                    {locale === 'ar' ? 'جديد' : 'New'}
                                </span>
                            )}
                        </div>
                        
                        {/* Variant Details Section */}
                        {selectedVariant && variantDetails && (
                            <div className="space-y-6 mt-6">
                                {/* Pricing Information (only for logged in users) */}
                                {user && variantDetails.user_price && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3"
                                    >
                                        <h3 className="text-base sm:text-lg font-semibold text-blue-800">
                                            {locale === 'ar' ? 'التسعير' : 'Pricing'}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                            {variantDetails.user_price.piece_price && (
                                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                                    <p className="text-xs sm:text-sm text-gray-500">
                                                        {locale === 'ar' ? 'السعر لكل قطعة' : 'Price Per Piece'}
                                                    </p>
                                                    <p className="text-lg sm:text-xl font-bold text-blue-600">${variantDetails.user_price.piece_price}</p>
                                                </div>
                                            )}
                                            {variantDetails.user_price.box_price && (
                                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                                    <p className="text-sm text-gray-500">
                                                        {locale === 'ar' ? 'سعر الصندوق' : 'Box Price'}
                                                    </p>
                                                    <p className="text-xl font-bold text-blue-600">${variantDetails.user_price.box_price}</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                                
                                {/* Packaging Information */}
                                <div className="space-y-3">
                                    <h3 className="text-base sm:text-lg font-semibold flex items-center">
                                        <Package className="w-5 h-5 mr-2 text-indigo-600" />
                                        {locale === 'ar' ? 'معلومات التعبئة والتغليف' : 'Packaging Information'}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                            <p className="text-sm text-gray-500">
                                                {locale === 'ar' ? 'نوع التعبئة' : 'Packaging Type'}
                                            </p>
                                            <p className="font-medium">{variantDetails.packaging}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                            <p className="text-sm text-gray-500">
                                                {locale === 'ar' ? 'تعبئة الصندوق' : 'Box Packing'}
                                            </p>
                                            <p className="font-medium">{variantDetails.box_packing}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                            <p className="text-sm text-gray-500">
                                                {locale === 'ar' ? 'أبعاد الصندوق' : 'Box Dimensions'}
                                            </p>
                                            <p className="font-medium">{variantDetails.box_dimensions}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Weight Information */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold flex items-center">
                                        <Scale className="w-5 h-5 mr-2 text-indigo-600" />
                                        {locale === 'ar' ? 'معلومات الوزن' : 'Weight Information'}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                            <p className="text-sm text-gray-500">
                                                {locale === 'ar' ? 'الوزن الصافي' : 'Net Weight'}
                                            </p>
                                            <p className="font-medium">{variantDetails.net_weight} g</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                            <p className="text-sm text-gray-500">
                                                {locale === 'ar' ? 'الوزن الإجمالي' : 'Gross Weight'}
                                            </p>
                                            <p className="font-medium">{variantDetails.gross_weight} g</p>
                                        </div>
                                        {variantDetails.tare_weight && (
                                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                <p className="text-sm text-gray-500">
                                                    {locale === 'ar' ? 'وزن الفارغ' : 'Tare Weight'}
                                                </p>
                                                <p className="font-medium">{variantDetails.tare_weight} g</p>
                                            </div>
                                        )}
                                        {variantDetails.standard_weight && (
                                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                <p className="text-sm text-gray-500">
                                                    {locale === 'ar' ? 'الوزن القياسي' : 'Standard Weight'}
                                                </p>
                                                <p className="font-medium">{variantDetails.standard_weight} g</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Barcode Section */}
                                {variantDetails.barcode && (
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold flex items-center">
                                            <Barcode className="w-5 h-5 mr-2 text-indigo-600" />
                                            {locale === 'ar' ? 'الباركود' : 'Barcode'}
                                        </h3>
                                        <div className="flex justify-center p-4 bg-white rounded-xl border border-gray-200">
                                            {barcodeUrl ? (
                                                <img src={barcodeUrl} alt="Product Barcode" className="max-w-full" />
                                            ) : (
                                                <div className="text-gray-600 text-center">
                                                    <p className="font-mono text-lg">{variantDetails.barcode}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Related Products Section */}

            {/* Related Products Section with Arrows */}
            {relatedProducts?.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 mt-6 sm:mt-8">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                            {locale === 'ar' ? 'منتجات ذات صلة' : 'Related Products'}
                        </h2>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => scrollRelated('left')}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => scrollRelated('right')}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                aria-label="Scroll right"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="relative overflow-hidden">
                        <div 
                            ref={relatedContainerRef} 
                            className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar" 
                            style={{ scrollBehavior: 'smooth', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
                        >
                            {relatedProducts.map((relatedProduct) => (
                                <Link 
                                    href={`/${resolvedParams.locale}/${relatedProduct.id}`} 
                                    key={relatedProduct.id}
                                    className="block flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px]"
                                >
                                    <motion.div 
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-full"
                                        whileHover={{ y: -5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="relative h-32 sm:h-40 md:h-48">
                                            {relatedProduct.image ? (
                                                <Image
                                                    src={`https://st.amjadshbib.com/api/public/${relatedProduct.image}`}
                                                    alt={relatedProduct.name_translations?.en || 'Related Product'}
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                    <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                                                        <path d="M12 17c.55 0 1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1h-2v-2c0-.55-.45-1-1-1s-1 .45-1 1v2H9c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1z" />
                                                    </svg>
                                                </div>
                                            )}
                                            {relatedProduct.is_new && (
                                                <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                    {locale === 'ar' ? 'جديد' : 'New'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <h3 className="text-base sm:text-lg font-medium text-gray-900 line-clamp-2">
                                                {relatedProduct.name_translations?.en || 'Product Name'}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                                                {relatedProduct.description_translations?.en || ''}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {relatedProduct.product_code && (
                                                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        {relatedProduct.product_code}
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${relatedProduct.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {relatedProduct.in_stock 
                                                        ? (locale === 'ar' ? 'متوفر في المخزون' : 'In Stock') 
                                                        : (locale === 'ar' ? 'غير متوفر في المخزون' : 'Out of Stock')}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-center py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 mt-3 sm:mt-4">
                                                {locale === 'ar' ? 'عرض المنتج' : 'View Product'}
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading state for related products */}
            {relatedLoading && (
                <div className="bg-white rounded-3xl shadow-sm p-8 mt-8">
                    <h2 className="text-2xl font-semibold mb-6">
                        {locale === 'ar' ? 'منتجات ذات صلة' : 'Related Products'}
                    </h2>
                    <div className="flex gap-6 overflow-x-auto pb-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="animate-pulse bg-white rounded-2xl shadow-sm overflow-hidden flex-shrink-0 w-[280px]">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-4">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default ProductPage;