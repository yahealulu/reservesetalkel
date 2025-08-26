'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Activities() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const [selectedType, setSelectedType] = useState('all');
  const [types, setTypes] = useState([]);
  
  // Fetch activities
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data } = await axios.get('https://setalkel.amjadshbib.com/api/activities');
      return data?.data || [];
    },
  });

  // Extract unique activity types based on event names
  useEffect(() => {
    if (activities && activities.length > 0) {
      const eventTypes = new Set();
      activities.forEach(activity => {
        activity.events.forEach(event => {
          const eventName = event.name_translations?.[locale] || event.name_translations?.en || 'Event';
          eventTypes.add(eventName);
        });
      });
      setTypes(['all', ...Array.from(eventTypes)]);
    }
  }, [activities, locale]);

  // Filter activities by selected event type
  const filteredActivities = activities?.filter(activity => {
    if (selectedType === 'all') return true;
    
    return activity.events.some(event => {
      const eventName = event.name_translations?.[locale] || event.name_translations?.en || 'Event';
      return eventName === selectedType;
    });
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c8a27a]"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{locale === 'ar' ? 'خطأ في تحميل الأنشطة. يرجى المحاولة مرة أخرى لاحقًا.' : 'Error loading activities. Please try again later.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-[#faf8f5]">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
      >
        {locale === 'ar' ? 'أنشطتنا' : 'Our Activities'}
      </motion.h1>
      
      {/* Filter tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedType === type
              ? 'bg-[#c8a27a] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Activities grid */}
      {filteredActivities?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">{locale === 'ar' ? 'لم يتم العثور على أنشطة.' : 'No activities found.'}</p>
        </div>
      )}
    </div>
  );
}

const ActivityCard = ({ activity, locale }) => {
  // Get the first event for preview
  const firstEvent = activity.events?.[0];
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(locale, options);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <Link href={`/activites/${activity.id}`}>
        <div className="relative h-56 w-full">
          {activity.image ? (
            <Image
              src={`https://setalkel.amjadshbib.com/public/${activity.image}`}
              alt={activity.name_translations?.[locale] || activity.name_translations?.en || 'Activity'}
              fill
              className="object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-gray-500">{locale === 'ar' ? 'لا توجد صورة' : 'No image available'}</p>
            </div>
          )}
          
          {/* Event count badge */}
          <div className="absolute top-4 right-4 bg-[#c8a27a] text-white text-xs font-bold px-3 py-1 rounded-full">
            {activity.events?.length || 0} {locale === 'ar' ? 'فعالية' : 'Events'}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            {activity.name_translations?.[locale] || activity.name_translations?.en || (locale === 'ar' ? 'نشاط' : 'Activity')}
          </h3>
          
          {/* Preview of first event */}
          {firstEvent && (
            <div className="mb-4">
              <div className="flex items-center text-gray-600 mb-2">
                <svg className="h-5 w-5 mr-2 text-[#c8a27a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">
                  {firstEvent.locations_translations?.[locale] || firstEvent.locations_translations?.en || (locale === 'ar' ? 'الموقع' : 'Location')}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600 mb-2">
                <svg className="h-5 w-5 mr-2 text-[#c8a27a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{formatDate(firstEvent.event_date)}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <svg className="h-5 w-5 mr-2 text-[#c8a27a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">
                  {firstEvent.name_translations?.[locale] || firstEvent.name_translations?.en || (locale === 'ar' ? 'فعالية' : 'Event')}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <span className="inline-block bg-[#f0e6d9] text-[#c8a27a] text-xs px-3 py-1 rounded-full font-medium">
              {activity.events?.length > 0 
                ? `${activity.events.length} ${locale === 'ar' ? 'فعاليات' : 'Events'}`
                : locale === 'ar' ? 'لا توجد فعاليات' : 'No events'}
            </span>
            <span className="text-[#c8a27a] font-medium text-sm flex items-center">
              {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};