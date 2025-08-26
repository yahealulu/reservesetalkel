'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { usePathname } from 'next/navigation';
import { toast } from 'react-toastify';
import { X, Upload, Send } from 'lucide-react';

export default function ContactUs() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [customInterest, setCustomInterest] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    mobile_number: '',
    city: '',
    trade_activity: '',
    message: '',
    website: '',
    your_role: '',
    file: null
  });

  // Trade activity options
  const tradeActivities = locale === 'ar' ? [
    'وكيل',
    'تجارة جملة',
    'تجارة تجزئة',
    'مول',
    'تموين',
    'أخرى'
  ] : [
    'Agent',
    'Wholesales',
    'Retail',
    'Mall',
    'Catering',
    'Other'
  ];

  // Visitor interests options
  const visitorInterests = [
    'STUFFED EGGPLANT- MAKDOUS',
    'Olives',
    'PICKLED',
    'SAUCES',
    'BOTTLES',
    'OLIVE OIL',
    'POWDERS',
    'DRIED',
    'DRIED/ PLACE OF ORIGIN: EGYPT',
    'Jams',
    'SWEETS & BREAD STICKS',
    'GHEE',
    'CONSOLE',
    'CANNED / PLACE OF ORIGIN: EUROPEAN UNION',
    'FROZENS/ PLACE OF ORIGIN: EGYPT',
    'HALVAH & TAHINI',
    'LEGUMES',
    'SEEDS',
    'VACUUM',
    'SETALKEL COLLECTION 6 BAG',
    'OFFERS',
    'HERBS',
    'SPICIES',
    'HOME ACCESSORIES',
    'SOAP& SPONGES',
    'BOWLS - FOOD PACKAGING',
    'KITCHENWARES',
    'Planters'
  ];

  const contactMutation = useMutation({
    mutationFn: async (formData) => {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'file' && formData[key]) {
          formDataToSend.append('file', formData[key]);
        } else if (key !== 'file') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add visitor interests
      if (selectedInterests.length > 0) {
        formDataToSend.append('visitor_interests', selectedInterests.join(', '));
      }

      const { data } = await axios.post('https://st.amjadshbib.com/api/ContactUs', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Message submitted successfully!', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        country: '',
        mobile_number: '',
        city: '',
        trade_activity: '',
        message: '',
        website: '',
        your_role: '',
        file: null
      });
      setSelectedInterests([]);
      setCustomInterest('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit message. Please try again.', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
    } else {
      toast.error('Please select a PDF or image file.');
    }
  };

  const addInterest = (interest) => {
    if (interest && !selectedInterests.includes(interest)) {
      setSelectedInterests(prev => [...prev, interest]);
      setCustomInterest('');
    }
  };

  const removeInterest = (interestToRemove) => {
    setSelectedInterests(prev => prev.filter(interest => interest !== interestToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.country || !formData.mobile_number) {
      toast.error('Please fill in all required fields.');
      return;
    }

    contactMutation.mutate(formData);
  };

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <div className="mx-4 md:mx-10 px-2 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#4c5a3c] mb-4">
            {locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
          </h1>
          <div className="w-24 h-1 bg-[#4c5a3c] mx-auto rounded mb-6"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {locale === 'ar' 
              ? 'اتصل بنا أو راسلنا عبر البريد الإلكتروني. نحن هنا لخدمتك على مدار الساعة'
              : 'Give us a call or message via your email. We\'re here for you 24/7'}
          </p>
        </div>

        {/* Contact Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'الاسم *' : 'Name *'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c5a3c] focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c5a3c] focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Country and City Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'الدولة *' : 'Country *'}
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c5a3c] focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'المدينة *' : 'City *'}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c5a3c] focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Phone Number and Trade Activity Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c5a3c] focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'النشاط التجاري *' : 'Trade Activity *'}
                  </label>
                  <select
                    name="trade_activity"
                    value={formData.trade_activity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c5a3c] focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">{locale === 'ar' ? 'اختر النشاط التجاري' : 'Select Trade Activity'}</option>
                    {tradeActivities.map((activity) => (
                      <option key={activity} value={activity}>
                        {activity}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Website and Your Role Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c5a3c] focus:border-transparent transition-colors"
                    placeholder={locale === 'ar' ? 'https://example.com' : 'https://example.com'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'دورك' : 'Your Role'}
                  </label>
                  <input
                    type="text"
                    name="your_role"
                    value={formData.your_role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c5a3c] focus:border-transparent transition-colors"
                    placeholder={locale === 'ar' ? 'مثال: مدير، مالك، إلخ.' : 'e.g., Manager, Owner, etc.'}
                  />
                </div>
              </div>

              {/* Visitor Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'اهتمامات الزائر' : 'Visitor Interests'}
                </label>
                <div className="space-y-4">
                  {/* Selected Interests */}
                  {selectedInterests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedInterests.map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-[#4c5a3c] text-white rounded-full text-sm"
                        >
                          {interest}
                          <button
                            type="button"
                            onClick={() => removeInterest(interest)}
                            className="hover:bg-red-500 rounded-full p-1 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Interest Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        {locale === 'ar' ? 'اختر من القائمة' : 'Select from list'}
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addInterest(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c5a3c] focus:border-transparent transition-colors"
                      >
                        <option value="">{locale === 'ar' ? 'اختر اهتمامًا' : 'Choose an interest'}</option>
                        {visitorInterests.map((interest) => (
                          <option key={interest} value={interest}>
                            {interest}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        {locale === 'ar' ? 'إضافة اهتمام مخصص' : 'Add custom interest'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customInterest}
                          onChange={(e) => setCustomInterest(e.target.value)}
                          placeholder={locale === 'ar' ? 'اكتب اهتمامًا مخصصًا' : 'Type custom interest'}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c5a3c] focus:border-transparent transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => addInterest(customInterest)}
                          className="px-4 py-3 bg-[#4c5a3c] text-white rounded-lg hover:bg-[#3a4530] transition-colors"
                        >
                          {locale === 'ar' ? 'إضافة' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'الرسالة *' : 'Message *'}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c5a3c] focus:border-transparent transition-colors resize-none"
                  placeholder={locale === 'ar' ? 'أخبرنا عن استفسارك...' : 'Tell us about your inquiry...'}
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'تحميل الملفات (اختياري)' : 'Upload Files (Optional)'}
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload size={20} className="text-gray-500" />
                    <span className="text-gray-600">
                      {formData.file ? formData.file.name : (locale === 'ar' ? 'اختر ملف PDF أو صورة' : 'Choose PDF or Image')}
                    </span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,image/*"
                      className="hidden"
                    />
                  </label>
                  {formData.file && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {locale === 'ar' 
                    ? 'الصيغ المقبولة: PDF، JPG، PNG، GIF (الحد الأقصى 10 ميجابايت)'
                    : 'Accepted formats: PDF, JPG, PNG, GIF (Max 10MB)'}
                </p>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-6">
                <button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#4c5a3c] text-white rounded-lg hover:bg-[#3a4530] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                >
                  {contactMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {locale === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      {locale === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}