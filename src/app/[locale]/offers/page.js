'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const OfferCard = ({ variant }) => {
  return (
    <Link href={`/${variant.product_id}/${variant.id}`}>
      <motion.div
        className="shadow-lg w-full relative bg-white mb-2 rounded-2xl overflow-hidden group h-[380px]"
        style={{ width: 'calc(100% - 18px)' }}
        whileHover={{ scale: 1.03, y: -5 }}
        transition={{ duration: 0.3 }}
      >
        {!variant.in_stock && (
          <div className="absolute top-5 right-0 z-20">
            <div className="bg-red-500 text-white text-xs py-1 px-4 rounded-l-full shadow-md">
              Out of Stock
            </div>
          </div>
        )}

        {variant.is_new && (
          <div className="absolute top-0 left-0 z-20">
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-te-full shadow-md">
              New
            </div>
          </div>
        )}

        <div className="relative w-full h-48 bg-gray-50">
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={variant.image && variant.image !== 'null' ? `https://setalkel.amjadshbib.com/public/${variant.image}` : '/placeholder-product.jpg'}
              alt={variant.size || 'Product'}
              fill
              className="object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />
          </motion.div>
        </div>

        <div className="px-4 py-3 pt-0 flex flex-col gap-2">
          <motion.h3
            className="text-lg font-semibold text-gray-800 line-clamp-1"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            {variant.size}
          </motion.h3>

          <div className="grid grid-cols-2 gap-2 text-sm mt-1">
            {variant.net_weight && (
              <div className="flex flex-col">
                <span className="text-gray-500">Net Weight</span>
                <span className="font-medium text-gray-700">
                  {variant.net_weight} g
                </span>
              </div>
            )}
            {variant.packaging && (
              <div className="flex flex-col">
                <span className="text-gray-500">Packaging</span>
                <span className="font-medium text-gray-700 capitalize">
                  {variant.packaging}
                </span>
              </div>
            )}
          </div>

          {variant.box_packing && (
            <div className="flex gap-2 mt-1">
              <span className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">
                {variant.box_packing}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

const OfferPage = () => {
  const [selectedOffer, setSelectedOffer] = useState(null);

  const { data: offers, isLoading: offersLoading, error: offersError } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data } = await axios.get('https://setalkel.amjadshbib.com/api/offers');
      return data?.data || [];
    },
  });

  const { data: offerDetails, isLoading: detailsLoading, error: detailsError } = useQuery({
    queryKey: ['offer-details', selectedOffer],
    queryFn: async () => {
      if (!selectedOffer) return null;
      const { data } = await axios.get(`https://setalkel.amjadshbib.com/api/offers/${selectedOffer}`);
      return data?.data;
    },
    enabled: !!selectedOffer,
  });

  if (offers && offers.length > 0 && !selectedOffer) {
    setSelectedOffer(offers[0].id);
  }

  if (offersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-4" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-64 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (offersError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load offers. Please try again later.
        </div>
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-gray-500">No offers available at the moment.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Offers Navigation */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-4 pb-2">
          {offers.map((offer) => (
            <button
              key={offer.id}
              onClick={() => setSelectedOffer(offer.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedOffer === offer.id ? 'bg-[#00B207] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              {offer.offer_name?.en || 'Offer'}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Offer Details */}
      {detailsLoading ? (
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-4" />
        </div>
      ) : detailsError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
          Failed to load offer details. Please try again later.
        </div>
      ) : offerDetails ? (
        <div className="mb-8">
          {/* Offer Banner */}
          <div className="relative w-full min-h-[400px] bg-white rounded-2xl overflow-hidden mb-8">
            <div className="relative w-full h-full min-h-[400px]">
              <Image
                src={`https://setalkel.amjadshbib.com/public/${offerDetails.image}`}
                alt={offerDetails.offer_name?.en || 'Offer'}
                fill
                className="object-contain"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-top justify-center">
                <h1 className="text-4xl font-bold text-white text-center px-4">
                  {offerDetails.offer_name?.en}
                </h1>
              </div>

              <div className="absolute top-5 right-5 bg-red-600 text-white text-xl font-bold px-4 py-2 rounded-full transform rotate-12 shadow-lg">
                {offerDetails.discount_percentage}% OFF
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {offerDetails.variants && offerDetails.variants.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-6">Products in this Offer</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {offerDetails.variants.map((variant) => (
                  <OfferCard key={variant.id} variant={variant} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-gray-500">No products available in this offer.</div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default OfferPage;
