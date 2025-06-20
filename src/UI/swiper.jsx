// components/Swiper.jsx
import React, { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const TheSwiper = ({ categories, onCategoryClick }) => {
  const swiperRef = useRef(null);

  return (
    <>
      <style jsx>{`
        .futuristic-swiper {
          padding: 50px 0;
        }
        
        .futuristic-swiper .swiper-slide {
          background-position: center;
          background-size: cover;
          width: 350px;
          height: 400px;
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .futuristic-swiper .swiper-slide-active {
          transform: scale(1.1) !important;
          z-index: 10;
        }
        
        .futuristic-swiper .swiper-slide-next,
        .futuristic-swiper .swiper-slide-prev {
          transform: scale(0.95);
          filter: brightness(0.7);
        }
        
        .futuristic-swiper .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
          border: 2px solid rgba(255, 255, 255, 0.3);
          opacity: 0.5;
          transition: all 0.3s ease;
        }
        
        .futuristic-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          transform: scale(1.3);
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.6);
        }
        
        .category-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        
        .category-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.1));
          opacity: 0;
          transition: opacity 0.4s ease;
          border-radius: 20px;
        }
        
        .category-card:hover::before {
          opacity: 1;
        }
        
        .glow-effect {
          position: relative;
          overflow: hidden;
        }
        
        .glow-effect::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(transparent, rgba(102, 126, 234, 0.3), transparent 30%);
          animation: rotate 4s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .glow-effect:hover::after {
          opacity: 1;
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .nav-button {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .nav-button:hover {
          transform: scale(1.1);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2));
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      <div className="relative py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6 floating-animation">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
              Rental Categories
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover our premium collection designed for extraordinary events
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button 
              className="nav-button rounded-full p-4 text-white hover:text-purple-200 transition-colors"
              onClick={() => swiperRef.current?.slidePrev()}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              className="nav-button rounded-full p-4 text-white hover:text-purple-200 transition-colors"
              onClick={() => swiperRef.current?.slideNext()}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Swiper Container */}
          <Swiper
            ref={swiperRef}
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
            className="futuristic-swiper"
          >
            {categories.map((category, index) => (
              <SwiperSlide key={category.id} className="rounded-3xl">
                <div 
                  className="category-card glow-effect relative h-full rounded-3xl cursor-pointer group transform transition-all duration-500 hover:scale-105"
                  onClick={() => onCategoryClick(category)}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden">
                    <img
                      src={category.image || `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=400&h=500&fit=crop`}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-8">
                    <div className="transform transition-all duration-500 group-hover:translate-y-[-10px]">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4 opacity-90">
                        Premium quality rentals for your special event
                      </p>
                      
                      {category.types && category.types.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                          <span className="text-purple-300 text-sm font-medium">
                            {category.types.length} item{category.types.length !== 1 ? 's' : ''} available
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                  </div>

                  {/* Corner Decoration */}
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default TheSwiper;