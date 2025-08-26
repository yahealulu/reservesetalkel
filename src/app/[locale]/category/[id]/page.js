'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ProductCard from '../../../../components/ProductCard';
import { CategoryProductsSection } from '../../../../components/CategoryProducts';

const CategoryPage = ({ params }) => {
    const unwrappedParams = React.use(params);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(20);
    const containerRef = useRef(null);
    const progressRef = useRef(null);
    const x = useMotionValue(0);

    // Fetch category details
    const { data: category, isLoading: categoryLoading, error: categoryError } = useQuery({
        queryKey: ['category', unwrappedParams.id],
        queryFn: async () => {
            const { data } = await axios.get(`https://setalkel.amjadshbib.com/api/categories/${unwrappedParams.id}`);
            return data?.data;
        },
    });

    // Fetch category products
    const { data: categoryProducts, isLoading: productsLoading, error: productsError } = useQuery({
        queryKey: ['category-products', unwrappedParams.id],
        queryFn: async () => {
            const { data } = await axios.get(`https://setalkel.amjadshbib.com/api/categories-products/${unwrappedParams.id}`);
            return data?.data;
        },
    });

    // Calculate pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = categoryProducts ? categoryProducts.slice(indexOfFirstProduct, indexOfLastProduct) : [];
    const totalPages = categoryProducts ? Math.ceil(categoryProducts.length / productsPerPage) : 0;

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

    if (categoryLoading || productsLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
                <div className="animate-pulse">
                    <div className="h-[200px] sm:h-[250px] md:h-64 bg-gray-200 rounded-xl md:rounded-lg mb-4" />
                    <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-gray-200 rounded-xl overflow-hidden">
                                <div className="aspect-square w-full"></div>
                                <div className="p-3">
                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (categoryError || productsError) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                    Failed to load category details or products
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
                <div className="text-gray-500 text-center py-8">Category not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
            {/* Category Banner */}
            <div className="relative h-[200px] sm:h-[250px] md:h-[300px] w-full rounded-xl md:rounded-2xl overflow-hidden mb-4 sm:mb-6 md:mb-8">
                <Image
                    src={`https://setalkel.amjadshbib.com/public/${category.image}`}
                    alt={category.name_translations?.en || 'Category'}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white px-4 text-center">{category.name_translations?.en}</h1>
                </div>
            </div>

            {/* Products Section */}
            <div className="mt-4 sm:mt-6 md:mt-8">
                {!categoryProducts || categoryProducts.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No products found in this category</div>
                ) : (
                    <>
                        {/* Use the CategoryProductsSection component to display products */}
                        <CategoryProductsSection 
                            category={{
                                ...category,
                                products: currentProducts
                            }} 
                        />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6 md:mt-8 overflow-x-auto py-2">
                                <nav className="flex flex-wrap items-center justify-center">
                                    <button
                                        onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                                        disabled={currentPage === 1}
                                        className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 mx-1 text-sm md:text-base rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        Previous
                                    </button>

                                    <div className="flex flex-wrap justify-center">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
                                            // For mobile, only show current page, first, last, and one page before and after current
                                            const isImportantPage = number === 1 || number === totalPages || 
                                                                    number === currentPage || 
                                                                    number === currentPage - 1 || 
                                                                    number === currentPage + 1;
                                            
                                            // For small screens, hide less important pages
                                            if (!isImportantPage && window.innerWidth < 640) {
                                                // Show ellipsis for skipped pages, but only once for consecutive skipped pages
                                                if (number === 2 || number === totalPages - 1) {
                                                    return (
                                                        <span key={`ellipsis-${number}`} className="px-2 py-1 mx-1 text-gray-500">...</span>
                                                    );
                                                }
                                                return null;
                                            }
                                            
                                            return (
                                                <button
                                                    key={number}
                                                    onClick={() => paginate(number)}
                                                    className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 mx-1 text-sm md:text-base rounded-md ${currentPage === number ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                                >
                                                    {number}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                        disabled={currentPage === totalPages}
                                        className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 mx-1 text-sm md:text-base rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;