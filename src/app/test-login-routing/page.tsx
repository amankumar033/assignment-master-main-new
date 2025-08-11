'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TestLoginRouting() {
  const router = useRouter();

  useEffect(() => {
    console.log('Test login routing page loaded');
  }, []);

  const handleDirectNavigation = () => {
    console.log('Navigating directly to /login');
    router.push('/login');
  };

  const handleLinkClick = () => {
    console.log('Link to /login clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
          Test Login Routing
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <button
              onClick={handleDirectNavigation}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Navigate to /login (router.push)
            </button>

            <Link href="/login" onClick={handleLinkClick}>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                Navigate to /login (Link component)
              </button>
            </Link>

            <a href="/login" onClick={handleLinkClick}>
              <button className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
                Navigate to /login (a tag)
              </button>
            </a>

            <Link href="/">
              <button className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
