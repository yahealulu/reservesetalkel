'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const AGENTS_API = 'https://st.amjadshbib.com/api/Agents';

export default function AgentsPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data } = await axios.get(AGENTS_API);
      return data?.data || [];
    },
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f0ebe0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c8a27a]"></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f0ebe0] flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-md text-center">
          {locale === 'ar' ? 'فشل تحميل الوكلاء. يرجى المحاولة مرة أخرى لاحقًا.' : 'Failed to load agents. Please try again later.'}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f0ebe0] px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-[#4c5a3c]">
          {locale === 'ar' ? 'وكلاؤنا' : 'Our Agents'}
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          {locale === 'ar' 
            ? ' meet our professional team of real estate experts dedicated to helping you find your perfect property.' 
            : 'Meet our professional team of real estate experts dedicated to helping you find your perfect property.'}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {data.map((agent, idx) => (
            <motion.div
              key={agent.email + idx}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
            >
              {/* Image Container - Square with modern styling */}
              <div className="relative w-full h-56 bg-gradient-to-r from-[#c8a27a] to-[#e2c9a8] overflow-hidden">
                <Image
                  src={`https://st.amjadshbib.com/api/public/${agent.image}`}
                  alt={agent.name}
                  fill
                  className="object-cover"
                  sizes="100%"
                  onError={e => { e.target.src = '/placeholder-product.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Content Section */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-[#4c5a3c] mb-1">{agent.name}</h2>
                  <div className="w-12 h-1 bg-[#c8a27a] rounded-full mb-3"></div>
                </div>
                
                <div className="space-y-3 text-gray-600 flex-grow">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-[#c8a27a] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="text-sm">{agent.address}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-[#c8a27a] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-sm">{agent.email}</span>
                  </div>
                </div>
               
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}