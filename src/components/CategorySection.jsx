'use client'

import { useRef, useEffect } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import Image from 'next/image'

const CategorySection = ({ category, selectedVariants, setSelectedVariants, hoveredId, setHoveredId }) => {
    const containerRef = useRef(null);
    const progressRef = useRef(null);
    const x = useMotionValue(0);

    const updateProgressBar = (scrollLeft) => {
        if (!containerRef.current || !progressRef.current) return;
        const scrollWidth = containerRef.current.scrollWidth - containerRef.current.clientWidth;
        const progress = (scrollLeft / scrollWidth) * (progressRef.current.clientWidth - 100);
        x.set(-progress);
    };

    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        updateProgressBar(scrollLeft);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <div className="px-8 py-8">
            <h2 className="text-2xl font-semibold mb-6">{category.name_translations?.en}</h2>

            <div
                ref={containerRef}
                className="grid grid-cols-5 gap-6 overflow-x-auto hide-scrollbar"
                style={{
                    scrollBehavior: 'smooth',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {category.products?.map((product) => (
                    <div key={product.id} className="relative">
                        <div
                            className="bg-white rounded-2xl overflow-hidden shadow-lg"
                            onMouseEnter={() => setHoveredId(product.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            {/* Product Image */}
                            <div className="relative h-48">
                                <Image
                                    src={`https://st.amjadshbib.com/api/public/${product.image}`}
                                    alt={product.name_translations?.en}
                                    fill
                                    className="object-contain"
                                />
                                {product.is_new && (
                                    <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1 text-xs rounded-br">
                                        New
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold mb-2">
                                    {product.name_translations?.en}
                                </h3>

                                {/* Variants Selection */}
                                <div className="space-y-2 mt-4">
                                    {product.variants?.map((variant) => {
                                        const isSelected = selectedVariants.some(v => v.id === variant.id);
                                        return (
                                            <div key={variant.id} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">{variant.size}</span>
                                                    <button
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setSelectedVariants(prev => 
                                                                    prev.filter(v => v.id !== variant.id)
                                                                );
                                                            } else {
                                                                setSelectedVariants(prev => [
                                                                    ...prev,
                                                                    { id: variant.id, note: '' }
                                                                ]);
                                                            }
                                                        }}
                                                        className={`px-3 py-1 rounded text-sm ${
                                                            isSelected 
                                                                ? 'bg-green-500 text-white' 
                                                                : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {isSelected ? 'Selected' : 'Select'}
                                                    </button>
                                                </div>

                                                {/* Note Input */}
                                                {isSelected && (
                                                    <input
                                                        type="text"
                                                        placeholder="Add note..."
                                                        value={selectedVariants.find(v => v.id === variant.id)?.note || ''}
                                                        onChange={(e) => {
                                                            setSelectedVariants(prev => 
                                                                prev.map(v => 
                                                                    v.id === variant.id 
                                                                        ? { ...v, note: e.target.value }
                                                                        : v
                                                                )
                                                            );
                                                        }}
                                                        className="w-full px-3 py-1 border rounded text-sm"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress Bar */}
            <div ref={progressRef} className="relative h-1 bg-gray-200 rounded-full mt-6 w-full overflow-hidden">
                <motion.div
                    className="absolute left-0 h-full w-[100px] bg-green-500 rounded-full"
                    style={{ x }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            </div>

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

export default CategorySection;