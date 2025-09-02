'use client';

import Link from 'next/link';
import { MapPin, Phone, Heart, User, ChevronDown, Menu, X, LogOut, Globe, Grid, ShoppingCart } from 'lucide-react';
import SubHeader from './SubHeader';
import { useRouter, usePathname } from 'next/navigation';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTranslations } from 'next-intl';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [mobileView, setMobileView] = useState('menu'); // 'menu' or 'categories'
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('header');
  
  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user dropdown if clicking outside
      if (isDropdownOpen && !event.target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
      
      // Close language dropdown if clicking outside
      if (isLangOpen && !event.target.closest('.lang-dropdown')) {
        setIsLangOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, isLangOpen]);
  
  // Fetch categories from API
  const fetchCategories = async () => {
    if (categories.length > 0) return; // Don't fetch if we already have categories
    
    setIsLoading(true);
    try {
      const response = await fetch('https://st.amjadshbib.com/api/categories');
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Always redirect to home page after logout
      router.push(`/${currentLocale}`);
      // Close the dropdown
      setIsDropdownOpen(false);
      // Close mobile menu if open
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const switchLanguage = (locale) => {
    // Get the current path segments
    const segments = pathname.split('/');
    
    // Replace the locale segment (index 1)
    segments[1] = locale;
    
    // Join the segments back together and navigate
    const newPath = segments.join('/');
    router.push(newPath);
    
    // Close the language dropdown
    setIsLangOpen(false);
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`w-full transition-all duration-300 ${scrolled ? 'shadow-md' : ''} sticky top-0 z-40 bg-white`}>
        {/* Top Bar - Hidden on mobile */}
        <div className="w-full bg-gradient-to-r from-[#a4cf6e]/90 to-[#00B207]/90 text-white backdrop-blur-sm hidden md:block">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-[40px] text-sm">
              {/* Left Links */}
              <div className="flex items-center gap-6">
                <Link href={`/${currentLocale}/about-us`} className="text-white/90 hover:text-white transition-colors">
                  {currentLocale === 'ar' ? 'من نحن' : 'About Us'}
                </Link>
                <Link href={`/${currentLocale}/contact-us`} className="text-white/90 hover:text-white transition-colors">
                  {currentLocale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                </Link>
                <div className="h-4 w-[1px] bg-white/30"></div>
                <Link href={`/${currentLocale}/partners`} className="text-white/90 hover:text-white transition-colors">
                  {currentLocale === 'ar' ? 'الشركاء' : 'Partners'}
                </Link>
                <Link href={`/${currentLocale}/agents`} className="text-white/90 hover:text-white transition-colors">
                  {currentLocale === 'ar' ? 'الوكلاء' : 'Agents'}
                </Link>
              </div>

              {/* Right Links */}
              <div className="flex items-center gap-6">
                <Link href={`/${currentLocale}/our-locations`} className="flex items-center gap-1 text-white/90 hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                  <span>{currentLocale === 'ar' ? 'مواقع المتاجر' : 'Store Locations'}</span>
                </Link>
                <Link href="tel:+966123456789" className="flex items-center gap-1 text-white/90 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>+966123456789</span>
                </Link>
              
                
                <div className="h-4 w-[1px] bg-white/30"></div>
                
                {/* Language Selector */}
                <div className="relative lang-dropdown">
                  <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="flex items-center gap-1 text-white/90 hover:text-white transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{currentLocale === 'ar' ? 'العربية' : 'English'}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isLangOpen && (
                    <div className="absolute top-full right-0 w-[120px] bg-white shadow-lg rounded-lg mt-1 z-[200] overflow-hidden">
                      <button 
                        onClick={() => switchLanguage('en')} 
                        className={`block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${currentLocale === 'en' ? 'bg-gray-50 font-medium text-[#00B207]' : 'text-gray-700'}`}
                      >
                        English
                      </button>
                      <button 
                        onClick={() => switchLanguage('ar')} 
                        className={`block w-full text-right px-4 py-2 hover:bg-gray-50 transition-colors ${currentLocale === 'ar' ? 'bg-gray-50 font-medium text-[#00B207]' : 'text-gray-700'}`}
                      >
                        العربية
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-4 w-[1px] bg-white/30"></div>

                {/* User Account */}
                {user ? (
                  <div className="relative user-dropdown">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 text-white hover:text-white/90 transition-colors"
                    >
                      <div className="text-left">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-white/80">{user.email}</div>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-[200] overflow-hidden">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center">
                            <LogOut className="w-4 h-4 mr-2" />
                            <span>{t('logout')}</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => router.push(`/${currentLocale}/auth/login`)}
                    className="flex items-center gap-1 text-white/90 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>{currentLocale === 'ar' ? 'تسجيل الدخول / التسجيل' : 'Login / Register'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Header - Only visible on mobile */}
        <div className="md:hidden bg-white shadow-sm py-3 px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={`/${currentLocale}`}>
              <img 
                src="/images/logo_black_and_gold.png" 
                alt="Set Alkel logo" 
                className="w-16 transition-transform hover:scale-105" 
              />
            </Link>
            
            {/* Mobile Actions */}
            <div className="flex items-center gap-3">
              {/* Cart Icon - Added to mobile header */}
              <Link
                href={`/${currentLocale}/orders/new`}
                className="w-10 h-10 rounded-full bg-[#E6F5E7] flex items-center justify-center hover:shadow-md transition-all"
              >
                <ShoppingCart className="w-5 h-5 text-[#00B207]" />
              </Link>
              
              {/* Language Toggle - Mobile */}
              <div>
                <Link
                  href={`/${currentLocale}/language-switch`}
                  className="w-10 h-10 rounded-full bg-[#E6F5E7] flex items-center justify-center hover:shadow-md transition-all"
                >
                  <Globe className="w-5 h-5 text-[#00B207]" />
                </Link>
              </div>
              
              {/* User Account */}
              <div className="relative">
                {/* Desktop User Button with Dropdown */}
                <div className="hidden md:block">
                  {user ? (
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-10 h-10 rounded-full bg-[#E6F5E7] flex items-center justify-center hover:shadow-md transition-all"
                    >
                      <User className="w-5 h-5 text-[#00B207]" />
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/${currentLocale}/auth/login`)}
                      className="w-10 h-10 rounded-full bg-[#E6F5E7] flex items-center justify-center hover:shadow-md transition-all"
                    >
                      <User className="w-5 h-5 text-[#00B207]" />
                    </button>
                  )}
                  
                  {/* Desktop User Dropdown */}
                  {isDropdownOpen && user && (
                    <div className="absolute right-0 top-12 w-48 bg-white shadow-lg rounded-lg z-[200] overflow-hidden border">
                      <div className="px-4 py-2 border-b">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <Link
                        href={`/${currentLocale}/logout-confirm`}
                        className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="flex items-center">
                          <LogOut className="w-4 h-4 mr-2" />
                          <span>{t('logout')}</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Mobile User Button - Direct Link to Logout Confirm Page */}
                <div className="md:hidden">
                  {user ? (
                    <Link
                      href={`/${currentLocale}/logout-confirm`}
                      className="w-10 h-10 rounded-full bg-[#E6F5E7] flex items-center justify-center hover:shadow-md transition-all"
                    >
                      <User className="w-5 h-5 text-[#00B207]" />
                    </Link>
                  ) : (
                    <Link
                      href={`/${currentLocale}/auth/login`}
                      className="w-10 h-10 rounded-full bg-[#E6F5E7] flex items-center justify-center hover:shadow-md transition-all"
                    >
                      <User className="w-5 h-5 text-[#00B207]" />
                    </Link>
                  )}
                </div>
              </div>
              
              {/* Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 rounded-full bg-[#00B207] flex items-center justify-center text-white shadow-md"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu - Slide in from right */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-[300] md:hidden">
            <div className="absolute right-0 top-0 h-full w-3/4 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
              <div className="p-5 overflow-y-auto h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#00B207]">
                    {currentLocale === 'ar' ? 'القائمة' : 'Menu'}
                  </h2>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Menu/Categories Toggle */}
                <div className="flex mb-6 border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setMobileView('menu')}
                    className={`flex-1 py-2 px-4 text-center ${mobileView === 'menu' ? 'bg-[#00B207] text-white' : 'bg-white text-gray-700'}`}
                  >
                    {currentLocale === 'ar' ? 'القائمة' : 'Menu'}
                  </button>
                  <button
                    onClick={() => {
                      setMobileView('categories');
                      fetchCategories();
                    }}
                    className={`flex-1 py-2 px-4 text-center ${mobileView === 'categories' ? 'bg-[#00B207] text-white' : 'bg-white text-gray-700'}`}
                  >
                    {currentLocale === 'ar' ? 'الفئات' : 'Categories'}
                  </button>
                </div>
                
                {/* Menu Content */}
                {mobileView === 'menu' && (
                  <div className="space-y-4">
                    <Link 
                      href={`/${currentLocale}/about-us`} 
                      className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {currentLocale === 'ar' ? 'من نحن' : 'About Us'}
                    </Link>
                    <Link 
                      href={`/${currentLocale}/contact-us`} 
                      className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {currentLocale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                    </Link>
                    <Link 
                      href={`/${currentLocale}/partners`} 
                      className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {currentLocale === 'ar' ? 'الشركاء' : 'Partners'}
                    </Link>
                    <Link 
                      href={`/${currentLocale}/agents`} 
                      className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {currentLocale === 'ar' ? 'الوكلاء' : 'Agents'}
                    </Link>
                    <Link 
                      href={`/${currentLocale}/store-locations`} 
                      className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{currentLocale === 'ar' ? 'مواقع المتاجر' : 'Store Locations'}</span>
                      </div>
                    </Link>
                   
                    
                    <div className="border-t border-gray-200 my-4"></div>
                    
                    <Link 
                      href={`/${currentLocale}/offers`} 
                      className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {currentLocale === 'ar' ? 'العروض' : 'Offers'}
                    </Link>
                    <Link 
                      href={`/${currentLocale}/activites`} 
                      className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {currentLocale === 'ar' ? 'الأنشطة' : 'Activities'}
                    </Link>
                    <Link 
                      href={`/${currentLocale}/bites`} 
                      className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {currentLocale === 'ar' ? 'اللقمات' : 'Bites'}
                    </Link>
                  </div>
                )}
                
                {/* Categories Content */}
                {mobileView === 'categories' && (
                  <div>
                    {isLoading ? (
                      <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00B207]"></div>
                      </div>
                    ) : categories.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {categories
                          .filter(category => !category.is_hidden && category.products_count > 0)
                          .map((category) => (
                          <Link
                            key={category.id}
                            href={`/${currentLocale}/category/${category.id}`}
                            className="block bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <div className="aspect-square relative overflow-hidden bg-gray-100">
                              <img
                                src={`https://st.amjadshbib.com/api/public/${category.image}`}
                                alt={category.name_translations[currentLocale] || category.name_translations.en}
                                className="w-full h-full object-cover"
                              />
                              {category.products_count > 0 && (
                                <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
                                  {category.products_count} {currentLocale === 'ar' ? 'منتج' : ''}
                                </span>
                              )}
                            </div>
                            <div className="p-3">
                              <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                                {category.name_translations[currentLocale] || category.name_translations.en}
                              </h3>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        <Grid className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>{currentLocale === 'ar' ? 'لا توجد فئات متاحة' : 'No categories available'}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <SubHeader />
      </header>
    </>
  );
};

export default Header;