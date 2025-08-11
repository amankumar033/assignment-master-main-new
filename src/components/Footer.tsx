import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaComments } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import Image from "next/image";

export default function Footer() {
  return (
    <div>
      {/* Footer Top Image - Hidden on mobile, visible on tablet and desktop */}
      <div className="w-full hidden md:block">
        <Image
          src="/footer-top.png"
          alt="Footer Top Banner"
          width={1920}
          height={150}
          className="w-full h-auto object-cover"
          priority
        />
      </div>
      
      {/* Footer Content */}
      <div className="bg-black text-white">
      <div className="mx-3 px-4 sm:px-15 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 text-center sm:text-left">
        {/* Logo and Newsletter */}
        <div className="space-y-3 col-span-1 sm:col-span-2 lg:col-span-1 mb-8 sm:mb-0">
          <h1 className="text-3xl sm:text-5xl font-extrabold italic">
            <span className="text-white">MOB</span><span className="text-[#ffb221]">EX</span>
          </h1>
          <p className="text-white text-xs sm:text-sm">AUTO PARTS & ACCESSORIES</p>
          <div className="flex space-x-4 sm:space-x-7 text-lg sm:text-xl mt-4 justify-center sm:justify-start">
            <FaFacebookF />
            <FaInstagram />
            <FaLinkedinIn />
            <FaTwitter />
            <FaYoutube />
          </div>
          <p className="mt-5 font-semibold text-neutral-400 text-xs sm:text-sm">What&apos;s inside: new arrivals, exclusive sales, truck news and more!</p>
          <div className="flex mt-3 justify-center sm:justify-start">
            <input
              type="email"
              placeholder="Email address"
              className="p-2 sm:p-3 w-full sm:w-60 rounded-l-md text-black bg-white text-xs sm:text-sm"
            />
            <button className="bg-[#0052cc] px-3 sm:px-4 rounded-r-md">
              <IoIosArrowForward className="text-white text-xl sm:text-2xl" />
            </button>
          </div>
        </div>

        {/* Middle Three Columns Container */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-row gap-6 sm:gap-8">
          {/* Account */}
          <div className="font-bold text-sm sm:text-base text-center sm:text-left flex-1">
            <h3 className="font-bold mb-3 text-white">Account</h3>
            <ul className="space-y-2 text-neutral-400">
              <li className="pt-1">Dashboard</li>
              <li className="pt-1">Orders</li>
              <li className="pt-1">Wishlist</li>
              <li className="pt-1">My garage</li>
              <li className="pt-1">Addresses</li>
            </ul>
          </div>

          {/* Catalog */}
          <div className="font-bold text-sm sm:text-base text-center sm:text-left flex-1">
            <h3 className="font-bold mb-3 text-white">Catalog</h3>
            <ul className="space-y-2 text-neutral-400">
              <li className="pt-1">Shop by parts</li>
              <li className="pt-1">Shop by brands</li>
              <li className="pt-1">Shop by make</li>
              <li className="pt-1">Promotions</li>
              <li className="pt-1">Sitemap</li>
            </ul>
          </div>

          {/* Help */}
          <div className="font-bold text-sm sm:text-base text-center sm:text-left flex-1">
            <h3 className="font-bold mb-3 text-white">Help</h3>
            <ul className="space-y-2 text-neutral-400">
              <li className="pt-1">Features</li>
              <li className="pt-1">FAQ</li>
              <li className="pt-1">About us</li>
              <li className="pt-1">Career</li>
              <li className="pt-1">Contact us</li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-4 text-sm sm:text-base col-span-1 sm:col-span-2 mt-4 lg:col-span-1 text-center sm:text-left">
          <h3 className="font-bold">Need help? / Contact us</h3>
          <div className="flex items-start space-x-2 text-white text-base sm:text-lg pt-1 justify-center sm:justify-start">
            <FaMapMarkerAlt className="text-[#ffb221] text-base sm:text-lg flex-shrink-0 mt-1" />
            <p className="text-xs sm:text-sm">7031 N 35th Ave, Phoenix<br />Arkansas United States</p>
          </div>
          <div className="flex items-start space-x-3 sm:space-x-4 text-white pt-1 justify-center sm:justify-start">
            <FaPhoneAlt className="text-[#ffb221] text-base sm:text-lg flex-shrink-0 mt-1" />
            <div className="text-base sm:text-lg">
              <p className="text-xs sm:text-sm">Call us between 8 AM – 10 PM</p>
              <p className="text-[#ffb221] font-bold text-lg sm:text-xl">6668 5555 8464</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 sm:space-x-4 text-white justify-center sm:justify-start">
            <FaComments className="text-[#ffb221] text-base sm:text-lg flex-shrink-0 mt-1" />
            <div className="text-xs sm:text-sm">
              <p className="text-white font-bold">Live chat</p>
              <p>Chat with an Expert</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-700 py-4 sm:py-6 flex flex-col md:flex-row items-center justify-between max-w-screen-xl mx-4 sm:mx-20 text-xs sm:text-sm text-white">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 md:mb-0">
          <span className="font-semibold">Languages</span>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <span className="flex items-center space-x-1"><img src="https://flagcdn.com/gb.svg" className="w-4 sm:w-5" /> <span>English</span></span>
            <span className="flex items-center space-x-1"><img src="https://flagcdn.com/de.svg" className="w-4 sm:w-5" /> <span>Deutsch</span></span>
            <span className="flex items-center space-x-1"><img src="https://flagcdn.com/fr.svg" className="w-4 sm:w-5" /> <span>Français</span></span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <span className="font-semibold text-sm sm:text-base">Payment options</span>
          <div className="flex flex-wrap gap-2">
            <img src="https://img.icons8.com/ios-filled/50/apple-pay.png" className="w-6 h-5 sm:w-8 sm:h-6" />
            <img src="https://img.icons8.com/color/48/google-pay-india.png" className="w-6 h-5 sm:w-8 sm:h-6" />
            <img src="https://img.icons8.com/color/48/mastercard-logo.png" className="w-6 h-5 sm:w-8 sm:h-6" />
            <img src="https://img.icons8.com/color/48/paypal.png" className="w-6 h-5 sm:w-8 sm:h-6" />
            <img src="https://img.icons8.com/color/48/visa.png" className="w-6 h-5 sm:w-8 sm:h-6" />
            <img src="https://img.icons8.com/color/48/amex.png" className="w-6 h-5 sm:w-8 sm:h-6" />
          </div>
        </div>
      </div>

      <div className="py-3 flex flex-col md:flex-row items-center justify-between mx-4 sm:mx-20 text-xs sm:text-sm text-white">
        <div className="flex items-center mb-2 md:mb-0">
            <p>Copyright © 2025 Mobex. All Rights Reserved</p>
        </div>
        <div className="flex items-center">
          <span className="flex flex-col sm:flex-row font-medium gap-2 sm:gap-5 text-neutral-200">
            <p>Terms of Use</p>
            <p>Privacy Policy</p>
            <p>Interest-Based Ads</p>
            <p>Accessibility</p>
            </span>
        </div>
      </div>
      </div>
    </div>
  );
}