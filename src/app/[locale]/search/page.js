'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import ProductCard from '../../../components/ProductCard';

const SearchPage = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const locale = pathname.split('/')[1] || 'en';
    const query = searchParams.get('q') || '';
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(20);

    // Reset to page 1 when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [query]);

    // Fetch search results
    const { data: searchResults, isLoading, error } = useQuery({
        queryKey: ['search-products', query],
        queryFn: async () => {
            if (!query.trim()) return { data: [] };
            const { data } = await axios.get(`https://st.amjadshbib.com/api/searchproduct?q=${encodeURIComponent(query)}`);
            return data;
        },
        enabled: !!query.trim(),
    });

    // Calculate pagination
    const products = searchResults?.data || [];
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">
                    {locale === 'ar' ? `نتائج البحث عن "${query}"` : `Search Results for "${query}"`}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-lg mb-4" />
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">
                {locale === 'ar' ? `نتائج البحث عن "${query}"` : `Search Results for "${query}"`}
            </h1>
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {locale === 'ar' 
                        ? 'فشل تحميل نتائج البحث. يرجى المحاولة مرة أخرى لاحقًا.' 
                        : 'Failed to load search results. Please try again later.'}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>
            
            {!query.trim() ? (
                <div className="text-gray-500">
                    {locale === 'ar' 
                        ? 'يرجى إدخال مصطلح البحث للعثور على المنتجات.' 
                        : 'Please enter a search term to find products.'}
                </div>
            ) : products.length === 0 ? (
                <div className="text-gray-500">
                    {locale === 'ar' 
                        ? `لم يتم العثور على منتجات لـ "${query}".` 
                        : `No products found for "${query}".`}
                </div>
            ) : (
                <>
                    <p className="text-gray-600 mb-6">
                        {locale === 'ar' 
                            ? `تم العثور على ${products.length} منتج(ات)` 
                            : `${products.length} product(s) found`}
                    </p>
                    
                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {currentProducts.map((product) => (
                            <Link href={`/${product.id}`} key={product.id}>
                                <ProductCard product={product} />
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <nav className="flex items-center">
                                <button
                                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 mx-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {locale === 'ar' ? 'السابق' : 'Previous'}
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                    <button
                                        key={number}
                                        onClick={() => paginate(number)}
                                        className={`px-4 py-2 mx-1 rounded-md ${currentPage === number ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        {number}
                                    </button>
                                ))}

                                <button
                                    onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 mx-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {locale === 'ar' ? 'التالي' : 'Next'}
                                </button>
                            </nav>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchPage;