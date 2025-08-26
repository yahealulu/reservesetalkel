'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plane, Ship, Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ReactFlagsSelect from 'react-flags-select';
import { useParams, usePathname } from 'next/navigation';

const CountriesSection = () => {
    const params = useParams();
    const pathname = usePathname();
    const currentLocale = pathname.split('/')[1] || 'en';
    const isRTL = currentLocale === 'ar';
    
    const translations = {
        en: {
            title: "Our Shipping Countries",
            categories: "Categories",
            products: "Products",
            air: "Air",
            sea: "Sea",
            land: "Land"
        },
        ar: {
            title: "بلدان الشحن لدينا",
            categories: "فئات",
            products: "منتجات",
            air: "جوي",
            sea: "بحري",
            land: "بري"
        }
    };
    
    const t = translations[currentLocale] || translations.en;
    
    const { data: countries, isLoading, error } = useQuery({
        queryKey: ['get-countries'],
        queryFn: async () => {
            const { data } = await axios.get(`https://setalkel.amjadshbib.com/api/countries`);
            return data?.data;
        },
    });
    
    const containerRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isTouching, setIsTouching] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [autoScroll, setAutoScroll] = useState(true);
    
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setScrollLeft(containerRef.current.scrollLeft);
        setAutoScroll(false);
    };
    
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        containerRef.current.scrollLeft = scrollLeft - walk;
    };
    
    const handleMouseUp = () => {
        setIsDragging(false);
        // Resume auto-scroll after a delay
        setTimeout(() => setAutoScroll(true), 3000);
    };
    
    const handleMouseLeave = () => {
        setIsDragging(false);
    };
    
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        
        let animationFrame;
        let lastTime = 0;
        
        const scroll = (timestamp) => {
            if (!lastTime) lastTime = timestamp;
            const delta = timestamp - lastTime;
            lastTime = timestamp;
            
            if (autoScroll && !isHovered && !isTouching && !isDragging) {
                const speed = 20; // pixels per second
                container.scrollLeft += (speed * delta) / 1000;
                
                // Reset to beginning when reaching the end
                if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
                    container.scrollLeft = 0;
                }
            }
            
            animationFrame = requestAnimationFrame(scroll);
        };
        
        animationFrame = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrame);
    }, [autoScroll, isHovered, isTouching, isDragging]);
    
    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div className="text-red-600">Error loading countries.</div>;
    }
    
    return (
        <div className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className={`text-xl md:text-2xl font-semibold mb-4 md:mb-6 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                {t.title}
            </h2>
            
            {/* Scrollable Container */}
            <div
                ref={containerRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false);
                    handleMouseLeave();
                }}
                onTouchStart={() => {
                    setIsTouching(true);
                    setAutoScroll(false);
                }}
                onTouchEnd={() => {
                    setIsTouching(false);
                    // Resume auto-scroll after a delay
                    setTimeout(() => setAutoScroll(true), 3000);
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="flex overflow-x-auto hide-scrollbar gap-3 sm:gap-4 md:gap-6 relative mb-4 pb-2 cursor-grab"
                style={{
                    scrollBehavior: 'smooth',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                    userSelect: 'none',
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
            >
                {countries.map((country) => (
                    <motion.div
                        key={country.id}
                        className="shadow bg-white rounded-xl md:rounded-2xl p-3 md:p-6 cursor-pointer overflow-hidden flex-shrink-0 scroll-snap-align-start"
                        style={{ 
                            width: 'calc(85% - 12px)',
                            maxWidth: '320px'
                        }}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col h-full">
                            <div className={`flex items-center gap-2 md:gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <ReactFlagsSelect
                                    selected={country.code.toUpperCase()}
                                    showSelectedLabel={false}
                                    showOptionLabel={false}
                                    disabled
                                    className="!p-0 !w-auto !border-none menu-flags"
                                />
                                <h3 className={`text-base md:text-xl font-semibold capitalize truncate ${isRTL ? 'font-arabic' : ''}`}>
                                    {country.name}
                                </h3>
                            </div>
                            <div className={`flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3 md:mb-4 text-xs md:text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">{country.categories_count}</span>
                                    <span>{t.categories}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">{country.products_count}</span>
                                    <span>{t.products}</span>
                                </div>
                            </div>
                            <div className={`flex flex-wrap gap-2 md:gap-3 mb-3 md:mb-6 ${isRTL ? 'justify-end' : ''}`}>
                                {country.air && (
                                    <div className="flex items-center gap-1 md:gap-2 bg-blue-50 text-blue-600 px-2 md:px-3 py-1 md:py-2 rounded-md md:rounded-lg">
                                        <Plane className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="text-xs md:text-sm">{t.air}</span>
                                    </div>
                                )}
                                {country.sea && (
                                    <div className="flex items-center gap-1 md:gap-2 bg-green-50 text-green-600 px-2 md:px-3 py-1 md:py-2 rounded-md md:rounded-lg">
                                        <Ship className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="text-xs md:text-sm">{t.sea}</span>
                                    </div>
                                )}
                                {country.land && (
                                    <div className="flex items-center gap-1 md:gap-2 bg-orange-50 text-orange-600 px-2 md:px-3 py-1 md:py-2 rounded-md md:rounded-lg">
                                        <Truck className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="text-xs md:text-sm">{t.land}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            <style jsx global>{`
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .menu-flags {
                    pointer-events: none;
                }
                .menu-flags button {
                    border: none !important;
                    padding: 0 !important;
                    background: transparent !important;
                }
                .menu-flags .ReactFlagsSelect-module_selectBtn__19wW7 {
                    padding: 0 !important;
                    background: transparent !important;
                }
                .menu-flags .ReactFlagsSelect-module_selectValue__152eS {
                    padding: 0 !important;
                }
                .menu-flags .ReactFlagsSelect-module_selectBtn__19wW7:after {
                    display: none !important;
                }
                .menu-flags .ReactFlagsSelect-module_flagsSelect__2pfa2 {
                    padding: 0 !important;
                }
                .scroll-snap-align-start {
                    scroll-snap-align: start;
                }
                @media (max-width: 639px) {
                    .ReactFlagsSelect-module_selectFlag__2q5gC img {
                        width: 20px !important;
                        height: auto !important;
                    }
                }
                @media (min-width: 640px) {
                    .scroll-snap-align-start {
                        width: calc(50% - 16px) !important;
                    }
                }
                @media (min-width: 768px) {
                    .scroll-snap-align-start {
                        width: calc(33.333% - 16px) !important;
                    }
                }
                @media (min-width: 1024px) {
                    .scroll-snap-align-start {
                        width: calc(25% - 18px) !important;
                        max-width: 280px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default CountriesSection;