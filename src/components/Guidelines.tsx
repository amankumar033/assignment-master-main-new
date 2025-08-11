"use client"
import Image from 'next/image';

const Guide = () => {
  const guideCards = [
    {
      id: 1,
      number: '1',
      image: '/img1.png',
      title: 'News',
      description: 'Learn how to select the perfect components for your vehicle in variants.'
    },
    {
      id: 2,
      number: '2',
      image: '/img2.png',
      title: 'Useful',
      description: 'Professional advice for installing your auto parts correctly.'
    },
    {
      id: 3,
      number: '3',
      image: '/img3.png',
      title: 'Premium',
      description: 'Keep your vehicle running smoothly with these maintenance tips.'
    }
  ];

  return (
    <div className="container mx-auto px-20 py-12">
      {/* Two Column Section */}
      <div className="flex flex-col gap-5 md:flex-row mb-12">
        {/* Left Column - Heading and Text */}
        <div className="">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Guides and Articles</h2>
          <p className="text-gray-600 font-light mb-6 w-[420px]">
            Articles and Guides that are written with the help of mechanics to ensure you have all the knowledge you need to make the correct purchase here at Mobex.
          </p>
          <button className="px-6 py-2 border-2 border-black text-black hover:bg-black font-bold hover:text-white rounded-lg transition-colors">
            Read More ➜
          </button>
        </div>

        {/* Right Column - Guide Cards */}
        <div className=" grid grid-cols-1 sm:grid-cols-3 gap-6">
          {guideCards.map((card) => (
            <div key={card.id} className="w-[300px]  bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image with Number Badge */}
              <div className="relative h-40">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover h-full"
                />
                <div className="absolute top-4 left-4 bg-amber-700 w-13 h-12 flex flex-col  items-center justify-center rounded-lg shadow-sm">
                  <span className="font-bold text-white">{card.number}</span>
                  <span className="font-bold text-white">Oct</span>
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-400">{card.title}</h3>
                <h3 className="font-bold text-lg mb-2 text-black">{card.description}</h3>
                <button className="text-[#034c8c] hover:text-amber-700 font-bold mt-2">
                  Read More ➜
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Guide;