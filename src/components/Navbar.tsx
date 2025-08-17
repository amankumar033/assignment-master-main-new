"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import EnhancedLink from './EnhancedLink';
import LoadingButton from './LoadingButton';
import CartDropdown from './CartDropdown';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();
  const { cartItems, getTotalItems, loading: cartLoading } = useCart();
  const { showToast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cartItemCount = getTotalItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log(`Searching for: ${searchQuery.trim()}`);
      // Use smart navigation for search
      handleNavigation(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      // Instant client-side logout
      await logout();

      // Toast and redirect with smart navigation
      showToast('success', 'Successfully logged out!');
      handleNavigation('/');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('error', 'Logout failed. Please try again.');
    }
  };

  const handleNavigation = (href: string) => {
    console.log(`🚀 Starting navigation to: ${href}`);
    const startTime = performance.now();
    
    // Set a timeout to detect slow navigation
    const slowNavigationTimeout = setTimeout(() => {
      console.log(`🐌 Slow navigation detected for: ${href}`);
      document.dispatchEvent(new CustomEvent('navigationStart'));
    }, 300); // Show progress bar if navigation takes longer than 300ms
    
    // Direct router navigation for instant response
    router.push(href);
    
    const endTime = performance.now();
    const navigationTime = endTime - startTime;
    console.log(`⚡ Navigation initiated in ${navigationTime}ms`);
    
    // Clear timeout if navigation was fast
    if (navigationTime < 300) {
      clearTimeout(slowNavigationTimeout);
    } else {
      // If slow navigation was detected, set up completion detection
      const handleNavigationComplete = () => {
        console.log(`✅ Navigation completed for: ${href}`);
        document.dispatchEvent(new CustomEvent('navigationComplete'));
        // Clean up event listeners
        window.removeEventListener('load', handleNavigationComplete);
        window.removeEventListener('popstate', handleNavigationComplete);
      };
      
      // Listen for navigation completion
      window.addEventListener('load', handleNavigationComplete);
      window.addEventListener('popstate', handleNavigationComplete);
      
      // Fallback: hide progress bar after 3 seconds
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('navigationComplete'));
      }, 3000);
    }
  };

  return (
    <>
      <div className="font-sans relative z-50" style={{ fontFamily: 'Inter, Arial, Helvetica, sans-serif' }}>
        {/* Top Blue Bar */}
      <div className="bg-[#02427A] text-white py-2 px-4 lg:px-20">
        <div className="flex items-center justify-between text-sm">
          {/* Left - Location and Social Media */}
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>SS Layout, Ring Road, Davangere - 577004</span>
            
            {/* Social Media */}
            <div className="hidden md:flex items-center ml-5">
              <span>Stay connected:</span>
              <div className="flex space-x-2 ml-2">
              {/* Facebook */}
              <a href="#" className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <span className="text-white font-bold text-xs">f</span>
              </a>
              {/* Instagram */}
              <a href="#" className="w-6 h-6 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-lg flex items-center justify-center hover:opacity-80 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="w-6 h-6 bg-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-800 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <span className="text-white font-bold text-xs">in</span>
              </a>
              {/* X (Twitter) */}
              <a href="#" className="w-6 h-6 bg-sky-500 rounded-lg flex items-center justify-center hover:bg-sky-600 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <span className="text-white font-bold text-xs">X</span>
              </a>
              {/* YouTube */}
              <a href="#" className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-700 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              </div>
            </div>
          </div>

          {/* Right - Currency, Language */}
          <div className="flex items-center space-x-4">

            
            {/* Currency Selector */}
            <div className="relative">
              <select 
                className="bg-transparent text-white border-none outline-none cursor-pointer text-sm underline"
                suppressHydrationWarning
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <select 
                className="bg-transparent text-white border-none outline-none cursor-pointer text-sm underline"
                suppressHydrationWarning
              >
                <option value="en">En</option>
                <option value="hi">हिंदी</option>
                <option value="kn">ಕನ್ನಡ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Black Header */}
      <div className="bg-black text-white py-4 px-4 lg:px-20 relative z-50">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/"
            prefetch
            onClick={() => {
              console.log('Logo clicked - navigating to home');
              document.dispatchEvent(new CustomEvent('navigationStart'));
            }}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img 
              src="/nav_logo.png" 
              alt="SRI SAI CAR DECOR" 
              className="h-12 w-auto"
            />
          </Link>

        {/* Search Bar - Desktop/Tablet only */}
          <div className="hidden md:block flex-1 max-w-2xl mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="flex" suppressHydrationWarning>
            <input
              type="text"
                placeholder="Enter a keyword or product SKU"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 text-black rounded-l-lg outline-none bg-white"
                suppressHydrationWarning
            />
            <button 
              type="submit"
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-r-lg transition-colors"
                suppressHydrationWarning
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
          </form>
        </div>

          {/* User Icons - Responsive */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {/* Auth Controls */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <LoadingButton
                onClick={() => handleNavigation('/profile')}
                  className="flex items-center space-x-2 cursor-pointer hover:text-yellow-400 transition-colors"
                  showSpinner={false}
                  instantFeedback={false}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">Profile</span>
                </LoadingButton>
                <LoadingButton
                  onClick={handleLogout}
                  className="flex items-center space-x-2 cursor-pointer hover:text-yellow-400 transition-colors"
                  showSpinner={false}
                  instantFeedback={false}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                  <span className="font-medium">Logout</span>
                </LoadingButton>
              </div>
            ) : (
              <LoadingButton 
                onClick={() => {
                  console.log('🔐 Login button clicked');
                  handleNavigation('/login');
                }}
                className="flex items-center space-x-2 cursor-pointer hover:text-yellow-400 transition-colors"
                showSpinner={false}
                instantFeedback={false}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                                  <span className="font-medium">Login</span>
              </LoadingButton>
            )}
          
            {/* Reverse Icon */}
            <div className="cursor-pointer hover:text-yellow-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>

            {/* Wishlist */}
            <div className="cursor-pointer hover:text-yellow-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>

            {/* Cart with Dropdown */}
            <div className="relative">
              <LoadingButton 
                onClick={toggleCart}
                className="relative cursor-pointer hover:text-yellow-400 transition-colors flex items-center"
                showSpinner={false}
              >
                <div className="relative inline-block">
                  <img 
                    src="/cart-2.png" 
                    alt="Cart" 
                    className="w-8 h-8"
                  />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                </div>
                <span className="ml-2 font-medium">Cart</span>
                <span className="ml-1 text-sm text-gray-300">({cartItemCount} items)</span>
              </LoadingButton>
              {isCartOpen && (
                <CartDropdown onNavigate={handleNavigation} onClose={() => setIsCartOpen(false)} />
              )}
            </div>
          </div>
        </div>
      </div>

      </div>
      {/* Orange Navigation Bar (sticky) - Hidden on mobile */}
      <div className="hidden lg:block bg-[#D27208] text-white py-2 px-4 lg:px-20 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          {/* Left Side - Navigation Items with Slider Effect */}
          <div className="flex items-center">
            {/* Home */}
            <div className="relative group">
              <LoadingButton 
                onClick={() => handleNavigation('/')}
                className="block px-6 py-2 font-bold transition-all duration-300 hover:text-[#D27208] relative z-10"
                showSpinner={false}
                instantFeedback={false}
              >
                Home
              </LoadingButton>
              <div className="absolute inset-0 bg-white rounded-lg transform scale-x-0 group-hover:scale-x-100 origin-left"></div>
            </div>

            {/* Shop */}
            <div className="relative group">
              <LoadingButton 
                onClick={() => handleNavigation('/shop')}
                className="block px-6 py-2 font-bold cursor-pointer transition-all duration-300 hover:text-[#D27208] relative z-10"
                showSpinner={false}
              >
                Shop
              </LoadingButton>
              <div className="absolute inset-0 bg-white rounded-lg transform scale-x-0 group-hover:scale-x-100 origin-left"></div>
            </div>

            {/* Services */}
            <div className="relative group">
              <LoadingButton 
                onClick={() => handleNavigation('/location')}
                className="block px-6 py-2 font-bold cursor-pointer transition-all duration-300 hover:text-[#D27208] relative z-10"
                showSpinner={false}
              >
                Services
              </LoadingButton>
              <div className="absolute inset-0 bg-white rounded-lg transform scale-x-0 group-hover:scale-x-100 origin-left"></div>
            </div>

            {/* Track Orders */}
            <div className="relative group">
              <LoadingButton 
                onClick={() => handleNavigation('/orders')}
                className="block px-6 py-2 font-bold cursor-pointer transition-all duration-300 hover:text-[#D27208] relative z-10"
                showSpinner={false}
              >
                Track Orders
              </LoadingButton>
              <div className="absolute inset-0 bg-white rounded-lg transform scale-x-0 group-hover:scale-x-100 origin-left"></div>
            </div>
          </div>

          {/* Right Side - Merged Contact Button */}
          <div className="flex items-center">
            <div className="bg-green-500 rounded flex items-center">
              {/* Call Us Section */}
              <div className="flex items-center px-4 py-2 border-r border-green-400">
                <svg className="w-6 h-6 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <div className="text-left">
                  <div className="text-white font-bold text-sm leading-tight">9742839555</div>
                  <div className="text-white text-xs leading-tight">Call Us</div>
                </div>
              </div>

              {/* Live Chat Section */}
              <div className="flex items-center px-4 py-2">
                <svg className="w-6 h-6 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <div className="text-left">
                  <div className="text-white font-bold text-sm leading-tight">Live Chat</div>
                  <div className="text-white text-xs leading-tight">Chat with an Expert</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bar: search (when menu closed) + hamburger */}
      <div className="lg:hidden bg-[#D27208] px-4 py-2 flex items-center space-x-2">
        {!isMobileMenuOpen && (
          <form onSubmit={handleSearch} className="flex flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-black rounded-l-lg outline-none bg-white text-sm"
            />
            <button 
              type="submit"
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-r-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        )}
        <button
          onClick={toggleMobileMenu}
          className="text-white hover:text-yellow-200 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#D27208] text-white px-4 py-4">
          {/* Mobile Menu Header with Close Button */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Menu</h3>
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-yellow-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Mobile Search removed from menu to avoid duplication */}

          {/* Row 1: Primary menu items */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            <LoadingButton 
              onClick={() => handleNavigation('/')}
              className="flex flex-col items-center justify-center bg-white/10 rounded-md py-3 text-sm"
              showSpinner={false}
              instantFeedback={false}
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
              </svg>
              Home
            </LoadingButton>
            <LoadingButton 
              onClick={() => handleNavigation('/shop')}
              className="flex flex-col items-center justify-center bg-white/10 rounded-md py-3 text-sm"
              showSpinner={false}
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M3 9h18M3 15h18M3 21h18" />
              </svg>
              Shop
            </LoadingButton>
            <LoadingButton 
              onClick={() => handleNavigation('/location')}
              className="flex flex-col items-center justify-center bg-white/10 rounded-md py-3 text-sm"
              showSpinner={false}
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1 1 0 01-1.414 0L6.343 16.657a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Services
            </LoadingButton>
            <LoadingButton 
              onClick={() => handleNavigation('/orders')}
              className="flex flex-col items-center justify-center bg-white/10 rounded-md py-3 text-sm"
              showSpinner={false}
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h8m-6 8h6M3 7h6m0 0V3m0 4v8" />
              </svg>
              Orders
            </LoadingButton>
          </div>

          {/* Row 2: Account/Cart controls */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            {isLoggedIn ? (
              <>
                <LoadingButton
                  onClick={() => handleNavigation('/profile')}
                  className="flex items-center justify-center bg-white/10 rounded-md py-3 text-sm"
                  showSpinner={false}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </LoadingButton>
                <LoadingButton
                  onClick={handleLogout}
                  className="flex items-center justify-center bg-white/10 rounded-md py-3 text-sm"
                  showSpinner={false}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                  Logout
                </LoadingButton>
                <LoadingButton
                  onClick={() => handleNavigation('/cart')}
                  className="flex items-center justify-center bg-white/10 rounded-md py-3 text-sm"
                  showSpinner={false}
                >
                  <img src="/cart-2.png" alt="Cart" className="w-5 h-5 mr-2" />
                  Cart ({cartItemCount})
                </LoadingButton>
              </>
            ) : (
              <>
                <LoadingButton 
                  onClick={() => handleNavigation('/login')}
                  className="flex items-center justify-center bg-white/10 rounded-md py-3 text-sm"
                  showSpinner={false}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Login
                </LoadingButton>
                <div className="col-span-2">
                  <LoadingButton
                    onClick={() => handleNavigation('/cart')}
                    className="flex items-center justify-center bg-white/10 rounded-md py-3 text-sm w-full"
                    showSpinner={false}
                  >
                    <img src="/cart-2.png" alt="Cart" className="w-5 h-5 mr-2" />
                    Cart ({cartItemCount})
                  </LoadingButton>
                </div>
              </>
            )}
          </div>

          {/* Row 3: Contact */}
          <div className="grid grid-cols-2 gap-2">
            <a href="tel:9742839555" className="flex items-center justify-center bg-green-600 rounded-md py-3 font-semibold">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              9742839555
            </a>
            <LoadingButton
              onClick={() => {}}
              className="flex items-center justify-center bg-white/10 rounded-md py-3 font-semibold"
              showSpinner={false}
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Live Chat
            </LoadingButton>
          </div>
        </div>
      )}
      
    </>
  );
};

export default Navbar;