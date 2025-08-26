'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const PARTNERS_API = 'https://st.amjadshbib.com/api/partner';

export default function PartnersPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data } = await axios.get(PARTNERS_API);
      return data || [];
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
          {locale === 'ar' ? 'فشل تحميل الشركاء. يرجى المحاولة مرة أخرى لاحقًا.' : 'Failed to load partners. Please try again later.'}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f0ebe0] px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-[#4c5a3c]">
          {locale === 'ar' ? 'شركاؤنا' : 'Our Partners'}
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          {locale === 'ar' 
            ? 'نفتخر بالشراكة مع هذه الشركات الرائدة لتقديم أفضل الخدمات لعملائنا.' 
            : 'We are proud to partner with these leading companies to provide the best services to our clients.'}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {data.map((partner, idx) => (
            <motion.div
              key={partner.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
            >
              {/* Image Container - Square with modern styling */}
              <div className="relative w-full h-56 bg-gradient-to-r from-[#c8a27a] to-[#e2c9a8] overflow-hidden">
                <Image
                  src={`https://st.amjadshbib.com/api/public/${partner.image}`}
                  alt={partner.title?.[locale] || partner.title?.en || 'Partner'}
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
                  <h2 className="text-xl font-bold text-[#4c5a3c] mb-1">
                    {partner.title?.[locale] || partner.title?.en}
                  </h2>
                  <div className="w-12 h-1 bg-[#c8a27a] rounded-full mb-3"></div>
                </div>
                
                <div className="text-gray-600 flex-grow">
                  <p className="text-sm leading-relaxed">
                    {partner.description?.[locale] || partner.description?.en}
                  </p>
                </div>
                
             
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}