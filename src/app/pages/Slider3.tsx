"use client";
import { useState } from 'react';
// import { specialGothic } from '../fonts';

export default function Home() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPosition({ x, y });
  };

  // Calculate years once to prevent hydration mismatch
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({length: 10}, (_, i) => currentYear - i);

  return (
    <div className="relative w-full h-full">
      {/* Background Image */}
      <img 
        src="/oilbg.png" 
        alt="Background" 
        className="absolute inset-0 w-screen h-[400px] sm:h-[500px] object-cover"
      />
      
      {/* Main Content Row */}
      <div className="relative z-20 w-full h-full flex flex-col sm:flex-row items-center justify-between px-4 sm:pl-12 py-8 sm:py-0">
        {/* Form Section */}
        <div className="hidden sm:block w-full sm:w-[400px] bg-white py-4 sm:py-6 px-3 sm:px-4 rounded-lg shadow-lg mt-6 sm:mt-10 mb-4 sm:mb-0">
            <h1 className='text-black text-lg sm:text-xl font-bold mb-2'>Select your car</h1>
          <form className="space-y-2">
            <div className='flex flex-col sm:flex-row justify-between gap-2 sm:gap-0'>
              {/* First Column - Takes half width */}
              <div className='flex-1 sm:pr-1'>
                {/* Make Dropdown */}
                <div className="mb-2">
                  <div className="relative">
                    <select 
                      id="vehicle-make" 
                      className="w-full font-normal px-2 sm:px-3 py-2 sm:py-3 border border-gray-200 rounded-lg appearance-none text-gray-700 text-sm sm:text-base"
                    >
                      <option value="Make">Make</option>
                      <option value="toyota">Toyota</option>
                      <option value="honda">Honda</option>
                      <option value="ford">Ford</option>
                    </select>
                    <img 
                      src="/down.png" 
                      alt="Dropdown arrow" 
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Model Dropdown */}
                <div className="mb-2">
                  <div className="relative">
                    <select 
                      id="vehicle-model" 
                      className="w-full font-normal px-2 sm:px-3 py-2 sm:py-3 border border-gray-200 rounded-lg appearance-none text-gray-700 text-sm sm:text-base"
                    >
                      <option value="">Model</option>
                      <option value="camry">Camry</option>
                      <option value="accord">Accord</option>
                      <option value="f150">F-150</option>
                    </select>
                    <img 
                      src="/down.png" 
                      alt="Dropdown arrow" 
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Year Dropdown */}
                <div>
                  <div className="relative">
                    <select 
                      id="vehicle-year" 
                      className="w-full font-normal px-2 sm:px-3 py-2 sm:py-3 border border-gray-200 rounded-lg appearance-none text-gray-700 text-sm sm:text-base"
                    >
                      <option value="">Year</option>
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <img 
                      src="/down.png" 
                      alt="Dropdown arrow" 
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Second Column - Takes half width */}
              <div className='flex-1 sm:pl-2'>
                {/* Engine Dropdown */}
                <div className="mb-2">
                  <div className="relative">
                    <select 
                      id="vehicle-engine" 
                      className="w-full font-normal px-2 sm:px-3 py-2 sm:py-3 border border-gray-200 rounded-lg appearance-none text-gray-700 text-sm sm:text-base"
                    >
                      <option value="">Engine</option>
                      <option value="2.0L">2.0L 4-cylinder</option>
                      <option value="3.5L">3.5L V6</option>
                      <option value="5.0L">5.0L V8</option>
                    </select>
                    <img 
                      src="/down.png" 
                      alt="Dropdown arrow" 
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Transmission Dropdown */}
                <div className="mb-2">
                  <div className="relative">
                    <select 
                      id="vehicle-transmission" 
                      className="w-full font-normal px-2 sm:px-3 py-2 sm:py-3 border border-gray-200 rounded-lg appearance-none text-gray-700 text-sm sm:text-base"
                    >
                      <option value="">Transmission</option>
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                      <option value="cvt">CVT</option>
                    </select>
                    <img 
                      src="/down.png" 
                      alt="Dropdown arrow" 
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Trim Dropdown */}
                <div>
                  <div className="relative">
                    <select 
                      id="vehicle-trim" 
                      className="w-full font-normal px-2 sm:px-3 py-2 sm:py-3 border border-gray-200 rounded-lg appearance-none text-gray-700 text-sm sm:text-base"
                    >
                      <option value="">Trim</option>
                      <option value="base">Base</option>
                      <option value="le">LE</option>
                      <option value="sport">Sport</option>
                    </select>
                    <img 
                      src="/down.png" 
                      alt="Dropdown arrow" 
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* OR Divider */}
            <div className="flex items-center my-4 sm:my-6 font-normal">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-3 sm:px-4 text-gray-500 text-sm sm:text-base">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Search by VIN */}
            <div>
              <div className="flex">
                <input
                  id="vehicle-vin"
                  type="text"
                  placeholder="Search by VIN"
                  className="flex-1 px-2 sm:px-3 py-2 border font-normal border-gray-200 rounded-l-lg focus:outline-none text-gray-700 text-sm sm:text-base"
                />
                
              </div>
            </div>

            {/* Add Vehicle Button */}
            <button 
              type="submit" 
              className="w-full bg-[var(--global-palette10)] text-white py-2 sm:py-3 rounded-lg hover:bg-black transition-colors text-sm sm:text-base"
            >
              Search
            </button>
          </form>
        </div>

        {/* Middle Headings Column - Centered with single-line heading */}
        <div className="flex-1 flex flex-col justify-center items-center sm:items-start px-4 sm:pl-[90px] text-center sm:text-left mb-6 sm:mb-0">
          <h1 className="text-3xl sm:text-6xl font-bold text-[#034c8c] whitespace-nowrap">MOTOR OIL</h1>
          <h2 className="text-xl sm:text-3xl font-semibold text-white mt-4 sm:mt-8">KEEP YOUR ENGINE RUNNING</h2>
          <h3 className="text-lg sm:text-2xl font-medium text-white mt-2 sm:mt-4">Plus Price Lock on 100 of line</h3>
          <button className="mt-4 sm:mt-8 w-[140px] sm:w-[180px] bg-white text-black py-2 flex items-center justify-center gap-2 rounded-lg hover:bg-black transition-colors hover:text-white font-bold text-sm sm:text-base mx-auto sm:mx-0">Shop Now <span className='font-bold text-xl sm:text-2xl'>➞</span></button>
        </div>

        {/* Image with Hover Effect */}
        <div 
          className="relative flex items-center justify-center sm:justify-end mt-4 sm:mt-0"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={isHovering ? handleMouseMove : undefined}
        >
          <div className='w-[80px] h-[80px] sm:w-[120px]  sm:h-[120px] bg-amber-700 rounded-full flex flex-col items-center justify-center absolute top-[150px] sm:top-[250px] right-[50px] sm:right-[260px] z-30 transform -translate-y-1/2 rotate-20'>
            <h1 className='text-sm sm:text-xl font-bold'>From</h1>
            <h1 className='text-lg sm:text-3xl font-bold'>₹250</h1>
          </div>
          <img
            src="/oil.png"
            alt="Foreground"
            className="w-[150px] sm:w-[300px] sm:mr-[100px] mt-[15px] sm:mt-[40px] transition-all duration-100 ease-linear transform cursor-pointer"
            style={{
              transform: isHovering 
                ? `translate(${position.x * 80 - 40}px, ${position.y * 80 - 40}px)` 
                : 'none',
              transformOrigin: 'center center',
              willChange: 'transform'
            }}
          />
        </div>
      </div>
    </div>
  );
} 