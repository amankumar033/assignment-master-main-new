"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from 'react';

interface Category {
  category_id: number;
  name: string;
  slug: string;
  description: string;
  is_active: number;
  image: string | null; // avoid Node Buffer type in client code
  created_at: string;
  updated_at: string;
  dealer_id: number;
}

const Categoriesalone = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Background colors for categories
  const bgColors = [
    "bg-blue-100", "bg-pink-100", "bg-green-100", "bg-purple-100", 
    "bg-red-100", "bg-yellow-100", "bg-indigo-100", "bg-orange-100", 
    "bg-teal-100", "bg-cyan-100", "bg-lime-100", "bg-emerald-100"
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.categories);
        } else {
          setError('Failed to fetch categories');
        }
      } catch (err) {
        setError('Error loading categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  return (
    <div className=" py-5 bg-gray-100">
      <div className="flex justify-center flex-col">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Featured by Categories
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D27208]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">
            {error}
          </div>
        ) : (
          <div className="flex justify-center pb-4 scrollbar-hide">
            <div className="flex space-x-4 min-w-max">
              {categories.map((category, index) => (
                <div 
                  key={category.category_id} 
                  className="flex flex-col items-center group flex-shrink-0"
                >
                  <div className={`relative w-[100px] h-[100px] rounded-full overflow-hidden shadow-lg ${bgColors[index % bgColors.length]} group-hover:shadow-xl transition-all duration-300 hover:border-3 border-[#F29F05]`}>
                    {category.image ? (
                      <Image
                        src={`/api/categories/image/${category.category_id}`}
                        alt={category.name}
                        fill
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-center text-black transition-colors">
                    {category.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
     
    </div>
  );
};

export default Categoriesalone;