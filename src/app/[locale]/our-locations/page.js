'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { usePathname } from 'next/navigation';
import { MapPin, Mail, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import useLanguageDirection from '@/i18n/useLanguageDirection';

export default function OurLocations() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const t = useTranslations('locations');
  
  // Apply RTL/LTR direction based on locale
  useLanguageDirection();
  
  const { data: addressesData, isLoading, error } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await axios.get('https://st.amjadshbib.com/api/address');
      return data?.data || [];
    },
  });
  
  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#faf8f5]">
        <div className="mx-4 md:mx-10 px-2 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  if (error) {
    return (
      <main className="min-h-screen bg-[#faf8f5]">
        <div className="mx-4 md:mx-10 px-2 py-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {t('failedToLoad')}
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <div className="mx-4 md:mx-10 px-2 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#4c5a3c] mb-4">
            {t('title')}
          </h1>
          <div className="w-24 h-1 bg-[#4c5a3c] mx-auto rounded"></div>
        </div>
        
        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {addressesData && addressesData.map((address) => (
            <div 
              key={address.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              style={{ direction: locale === 'ar' ? 'rtl' : 'ltr' }}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#4c5a3c] mb-4">
                  {address.address_name_translation[locale] || address.address_name_translation.en}
                </h2>
                
                <div className="space-y-3">
                  {/* Location */}
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-[#a4cf6e] mt-1 flex-shrink-0" />
                    <div className="ml-3 rtl:mr-3 rtl:ml-0">
                      <p className="text-gray-700">
                        {address.country.name}, {address.state.name}
                      </p>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-[#a4cf6e] mt-1 flex-shrink-0" />
                    <div className="ml-3 rtl:mr-3 rtl:ml-0 space-y-1">
                      <p className="text-gray-700">{address.primary_email}</p>
                      {address.second_email && (
                        <p className="text-gray-700">{address.second_email}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-[#a4cf6e] mt-1 flex-shrink-0" />
                    <div className="ml-3 rtl:mr-3 rtl:ml-0">
                      <p className="text-gray-700 dir-ltr">{address.phone_number}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* No Locations Message */}
        {(!addressesData || addressesData.length === 0) && (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">
              {t('noLocations')}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}