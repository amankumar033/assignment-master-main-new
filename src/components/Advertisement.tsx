"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface AdvertisementImage {
  id: number;
  image: string;
  name: string;
}

export default function Advertisement() {
  const [isFlashing, setIsFlashing] = useState(false);
  const [advertisements, setAdvertisements] = useState<AdvertisementImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await fetch('/api/advertisements');
        const data = await response.json();
        
        if (data.success) {
          setAdvertisements(data.advertisements);
        } else {
          console.error('Failed to fetch advertisements:', data.message);
        }
      } catch (error) {
        console.error('Error fetching advertisements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 1000); // Flash duration
    }, 3000); // Flash every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Get advertisement by ID
  const getAdvertisementById = (id: number) => {
    return advertisements.find(ad => ad.id === id);
  };

  // Get the first advertisement (ID 1)
  const firstAd = getAdvertisementById(1);
  // Get the second advertisement (ID 2)
  const secondAd = getAdvertisementById(2);

  if (loading) {
    return (
      <div className="bg-gray-100 p-4 rounded-md flex flex-col gap-4">
        <div className="animate-pulse bg-gray-300 h-64 rounded"></div>
        <div className="animate-pulse bg-gray-300 h-64 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-4 rounded-md flex flex-col gap-4">
      {/* First Advertisement (ID 1) */}
      {firstAd && (
        <div className={`relative ${isFlashing ? 'animate-flash' : ''}`}>
          <Image 
            src={firstAd.image} 
            alt={firstAd.name} 
            width={800} 
            height={200}
            className="w-full h-[500px] object-cover"
          />
        </div>
      )}
      
      {/* Second Advertisement (ID 2) */}
      {secondAd && (
        <Image 
          src={secondAd.image} 
          alt={secondAd.name} 
          width={800} 
          height={200}
          className="w-full h-[500px] object-cover"
        />
      )}

      {/* Show message if no advertisements found */}
      {advertisements.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No advertisements available</p>
        </div>
      )}

      <style jsx global>{`
        @keyframes flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; filter: brightness(1.5); }
        }
        .animate-flash {
          animation: flash 1s ease-in-out;
        }
      `}</style>
    </div>
  );
}