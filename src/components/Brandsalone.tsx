
 
"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Brandsalone() {
  const brands = [
    { id: 1, name: 'Nike', logo: '/brands/images/1.png' },
    { id: 2, name: 'Adidas', logo: '/brands/images/2.png' },
    { id: 3, name: 'Apple', logo: '/brands/images/3.png' },
    { id: 4, name: 'Samsung', logo: '/brands/images/4.png' },
    { id: 5, name: 'Sony', logo: '/brands/images/5.png' },
    { id: 6, name: 'Microsoft', logo: '/brands/images/6.png' },
    { id: 7, name: 'Amazon', logo: '/brands/images/7.png' },
    { id: 8, name: 'Google', logo: '/brands/images/8.png' },
    { id: 9, name: 'Tesla', logo: '/brands/images/9.png' },
    { id: 10, name: 'Intel', logo: '/brands/images/10.png' },
    { id: 11, name: 'Coca-Cola', logo: '/brands/images/11.png' },
    { id: 12, name: 'Pepsi', logo: '/brands/images/12.png' },
    { id: 14, name: 'Starbucks', logo: '/brands/images/14.png' },
  ];

 
  return (
    <div className="container mx-auto  py-10 text-black">
      {/* Heading */}
      <h1 className="text-3xl font-bold mb-8 px-20 text-black">Featured Brands</h1>
      
      {/* Brand Grid - First Row */}
      <div className="flex justify-center px-20 gap-3 mb-3 bg-gray-100" >
        {brands.slice(0, 7).map((brand) => (
          <div key={brand.id} className="w-52 flex items-center justify-center bg-gray-100 shadow-md hover:shadow-lg transition-all">
            <img 
              src={brand.logo} 
              alt={brand.name} 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        ))}
      </div>
      
      {/* Brand Grid - Second Row */}
      <div className="flex justify-center px-20  bg-gray-100 gap-3 pb-10">
        {brands.slice(7, 14).map((brand) => (
          <div key={brand.id} className="w-52 flex items-center justify-center bg-gray-100 shadow-md hover:shadow-lg transition-all">
            <img 
              src={brand.logo} 
              alt={brand.name} 
              className="max-w-full max-h-full object-contain rounded-lg bg-gray-100"
            />
          </div>
        ))}
      </div>
   

    </div>
  );
}