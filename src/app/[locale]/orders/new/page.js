'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Ship, Truck, Package, Thermometer, CheckCircle } from 'lucide-react';
import ReactFlagsSelect from 'react-flags-select';
import { useRouter } from 'next/navigation';

// Container capacity data based on transport type
const CONTAINER_CAPACITIES = {
  sea: {
    '20 cpm': { volume: 33.2, weight: 28200, freezed: { volume: 33.2, weight: 28200 } },
    '40 cpm': { volume: 67.7, weight: 26700, freezed: { volume: 67.7, weight: 26700 } },
    '40 hq': { volume: 76.4, weight: 26700, freezed: { volume: 76.4, weight: 26700 } }
  },
  land: {
    '20 cpm': { volume: 33.2, weight: 20000, freezed: { volume: 33.2, weight: 20000 } },
    '40 cpm': { volume: 67.7, weight: 25000, freezed: { volume: 67.7, weight: 25000 } },
    '40 hq': { volume: 76.4, weight: 27000, freezed: { volume: 76.4, weight: 27000 } }
  },
  air: {
    '20 cpm': { volume: 1.8, weight: 500, freezed: { volume: 1.8, weight: 500 } },
    '40 cpm': { volume: 4.5, weight: 2000, freezed: { volume: 4.5, weight: 2000 } },
    '40 hq': { volume: 11.0, weight: 6000, freezed: { volume: 11.0, weight: 6000 } }
  }
};

const NewOrderPage = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedTransportType, setSelectedTransportType] = useState('');
  const [selectedContainerSize, setSelectedContainerSize] = useState('');
  const [selectedContainerType, setSelectedContainerType] = useState(''); // 'regular' or 'freezed'
  const [currentStep, setCurrentStep] = useState(1);
  
  // Handle client-side only operations
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch export countries
  const { data: countriesData, isLoading, error } = useQuery({
    queryKey: ['export-countries'],
    queryFn: async () => {
      const { data } = await axios({
        method: 'GET',
        url: 'https://setalkel.amjadshbib.com/api/countries?type=export',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return data?.data || [];
    },
  });

  const selectedCountryData = countriesData?.find(country => country.code === selectedCountry);
  
  // Get container options for the selected transport type
  const availableSizes = selectedTransportType && selectedCountryData 
    ? selectedCountryData[`${selectedTransportType}_allowed_sizes`] || []
    : [];

  // Group containers by size and track which types are available
  const containerOptions = availableSizes.reduce((acc, current) => {
    const existingSize = acc.find(item => item.size === current.size);
    if (!existingSize) {
      acc.push({
        size: current.size,
        regular: !current.freezed,
        freezed: current.freezed
      });
    } else {
      if (current.freezed) {
        existingSize.freezed = true;
      } else {
        existingSize.regular = true;
      }
    }
    return acc;
  }, []);

  const selectedSizeData = containerOptions.find(size => size.size === selectedContainerSize);
  const capacity = selectedContainerSize && selectedTransportType ? CONTAINER_CAPACITIES[selectedTransportType][selectedContainerSize] : null;
  const actualCapacity = capacity && selectedContainerType === 'freezed' && capacity.freezed ? capacity.freezed : capacity;

  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setSelectedTransportType('');
    setSelectedContainerSize('');
    setSelectedContainerType('');
    setCurrentStep(2);
  };

  const handleTransportTypeChange = (type) => {
    setSelectedTransportType(type);
    setSelectedContainerSize('');
    setSelectedContainerType('');
    setCurrentStep(3);
  };

  const handleContainerSelection = (size, type) => {
    setSelectedContainerSize(size);
    setSelectedContainerType(type);
    setCurrentStep(4);
  };

  const canProceed = selectedCountry && selectedTransportType && selectedContainerSize && selectedContainerType;

  const handleConfirmAndContinue = () => {
    if (!canProceed) return;
    
    const orderData = {
      countryCode: selectedCountry,
      countryName: selectedCountryData?.name,
      countryId: selectedCountryData?.id,
      transportType: selectedTransportType,
      containerSize: selectedContainerSize,
      containerType: selectedContainerType
    };
    
    // Save order data to localStorage
    localStorage.setItem('orderData', JSON.stringify(orderData));
    
    // Navigate to fill page
    router.push('/orders/fill');
  };

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-red-600 text-xl font-semibold">Failed to load countries</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Create New Order</h1>
          <p className="text-gray-600 text-lg">Configure your shipping preferences step by step</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mb-12"
        >
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                    currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Country Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              Select Export Country
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose the country you want to import from:
              </label>
              <div className="relative">
                <ReactFlagsSelect
                  countries={countriesData?.map(country => country.code) || []}
                  customLabels={countriesData?.reduce((acc, country) => {
                    acc[country.code] = country.name;
                    return acc;
                  }, {}) || {}}
                  selected={selectedCountry}
                  onSelect={handleCountryChange}
                  placeholder="Select a country"
                  className="w-full"
                  selectButtonClassName="!border-2 !border-gray-300 !rounded-xl !p-4 !text-left hover:!border-indigo-500 transition-all duration-200"
                  menuClassName="!rounded-xl !shadow-xl !border-0 !mt-2"
                />
              </div>
            </div>

            {selectedCountryData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <h3 className="font-semibold text-gray-800 mb-4">Available Transport Methods:</h3>
                <div className="flex space-x-4">
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCountryData.air ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Plane className="w-5 h-5" />
                    <span>Air</span>
                  </div>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCountryData.sea ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Ship className="w-5 h-5" />
                    <span>Sea</span>
                  </div>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCountryData.land ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Truck className="w-5 h-5" />
                    <span>Land</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Step 2: Transport Type Selection */}
          <AnimatePresence>
            {selectedCountryData && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl shadow-xl p-8 mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Select Transport Type
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { type: 'air', icon: Plane, label: 'Air Transport', color: 'blue' },
                    { type: 'sea', icon: Ship, label: 'Sea Transport', color: 'green' },
                    { type: 'land', icon: Truck, label: 'Land Transport', color: 'orange' }
                  ].map(({ type, icon: Icon, label, color }) => {
                    const isAvailable = selectedCountryData[type];
                    const isSelected = selectedTransportType === type;
                    
                    return (
                      <motion.button
                        key={type}
                        whileHover={isAvailable ? { scale: 1.05 } : {}}
                        whileTap={isAvailable ? { scale: 0.95 } : {}}
                        onClick={() => isAvailable && handleTransportTypeChange(type)}
                        disabled={!isAvailable}
                        className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? `border-${color}-500 bg-${color}-50 shadow-lg`
                            : isAvailable
                            ? `border-gray-200 hover:border-${color}-300 hover:bg-${color}-25`
                            : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <Icon className={`w-8 h-8 mx-auto mb-3 ${
                          isSelected ? `text-${color}-600` : isAvailable ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                        <div className={`font-semibold ${
                          isSelected ? `text-${color}-700` : isAvailable ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                          {label}
                        </div>
                        {!isAvailable && (
                          <div className="text-xs text-gray-400 mt-1">Not Available</div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Container Size Selection */}
          <AnimatePresence>
            {selectedTransportType && containerOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl shadow-xl p-8 mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                  Select Container Type & Size
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {containerOptions.map((sizeOption) => {
                    const capacity = selectedTransportType ? CONTAINER_CAPACITIES[selectedTransportType][sizeOption.size] : null;
                    
                    return (
                      <div key={sizeOption.size} className="space-y-3">
                        {/* Regular Container - Only show if available */}
                        {sizeOption.regular && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleContainerSelection(sizeOption.size, 'regular')}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              selectedContainerSize === sizeOption.size && selectedContainerType === 'regular'
                                ? 'border-green-500 bg-green-50 shadow-lg'
                                : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <Package className={`w-5 h-5 mr-2 ${
                                selectedContainerSize === sizeOption.size && selectedContainerType === 'regular' ? 'text-green-600' : 'text-gray-600'
                              }`} />
                              <span className={`font-bold text-sm ${
                                selectedContainerSize === sizeOption.size && selectedContainerType === 'regular' ? 'text-green-700' : 'text-gray-700'
                              }`}>
                                {sizeOption.size.toUpperCase()} - Regular
                              </span>
                            </div>
                            
                            {capacity && (
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Volume:</span>
                                  <span className="font-semibold">{capacity.volume}m³</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Weight:</span>
                                  <span className="font-semibold">{capacity.weight.toLocaleString()}kg</span>
                                </div>
                              </div>
                            )}
                          </motion.button>
                        )}

                        {/* Freezed Container - Only show if available */}
                        {sizeOption.freezed && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleContainerSelection(sizeOption.size, 'freezed')}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              selectedContainerSize === sizeOption.size && selectedContainerType === 'freezed'
                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <Thermometer className={`w-5 h-5 mr-2 ${
                                selectedContainerSize === sizeOption.size && selectedContainerType === 'freezed'
                                  ? 'text-blue-600' 
                                  : 'text-gray-600'
                              }`} />
                              <span className={`font-bold text-sm ${
                                selectedContainerSize === sizeOption.size && selectedContainerType === 'freezed'
                                  ? 'text-blue-700' 
                                  : 'text-gray-700'
                              }`}>
                                {sizeOption.size.toUpperCase()} - Freezed
                              </span>
                            </div>
                            
                            {capacity && capacity.freezed ? (
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Volume:</span>
                                  <span className="font-semibold">{capacity.freezed.volume}m³</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Weight:</span>
                                  <span className="font-semibold">{capacity.freezed.weight.toLocaleString()}kg</span>
                                </div>
                              </div>
                            ) : capacity ? (
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Volume:</span>
                                  <span className="font-semibold">{capacity.volume}m³</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Weight:</span>
                                  <span className="font-semibold">{capacity.weight.toLocaleString()}kg</span>
                                </div>
                              </div>
                            ) : null}
                          </motion.button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>



          {/* Summary and Confirm */}
          <AnimatePresence>
            {canProceed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-xl p-8 text-white"
              >
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="font-semibold mb-3">Shipping Details</h3>
                    <div className="space-y-2 text-indigo-100">
                      <div>Country: {selectedCountryData?.name}</div>
                      <div>Transport: {selectedTransportType?.toUpperCase()}</div>
                      <div>Container: {selectedContainerSize?.toUpperCase()}</div>
                      <div>Type: {selectedContainerType === 'freezed' ? 'Freezed' : 'Regular'}</div>
                    </div>
                  </div>
                  
                  {actualCapacity && (
                    <div>
                      <h3 className="font-semibold mb-3">Container Capacity</h3>
                      <div className="space-y-2 text-indigo-100">
                        <div>Max Volume: {actualCapacity.volume}m³</div>
                        <div>Max Weight: {actualCapacity.weight.toLocaleString()}kg</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirmAndContinue}
                  className="w-full bg-white text-indigo-600 font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Confirm and Continue
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NewOrderPage;