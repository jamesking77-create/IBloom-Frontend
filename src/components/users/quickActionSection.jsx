import React, { useState, useEffect } from "react";
import { Calendar, ShoppingBag, ChevronRight, Sparkles, Clock } from "lucide-react";

const QuickActionsSection = ({ navigate }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Scroll handler for parallax effects
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('quick-actions-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const handleOrderByDate = () => {
      navigate('/warehouseinfo');
  };

  const handleBookItems = () => {
    navigate('/eventbooking');
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translate3d(0, 30px, 0); }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          
          @keyframes slideInLeft {
            0% { opacity: 0; transform: translate3d(-30px, 0, 0); }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          
          @keyframes slideInRight {
            0% { opacity: 0; transform: translate3d(30px, 0, 0); }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          
          @keyframes float {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(0, -8px, 0); }
          }
          
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
            will-change: transform, opacity;
          }
          
          .animate-slide-in-left {
            animation: slideInLeft 0.8s ease-out forwards;
            will-change: transform, opacity;
          }
          
          .animate-slide-in-right {
            animation: slideInRight 0.8s ease-out forwards;
            will-change: transform, opacity;
          }
          
          .animate-float {
            animation: float 4s ease-in-out infinite;
            will-change: transform;
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.25);
            box-shadow: 
              0 8px 32px 0 rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;
          }
          
          .glass-effect:hover {
            background: rgba(255, 255, 255, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 
              0 12px 40px 0 rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.4);
            transform: translateY(-8px) scale(1.02);
          }
          
          .text-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .icon-glow {
            filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.3));
            transition: filter 0.3s ease;
          }
          
          .icon-glow:hover {
            filter: drop-shadow(0 0 20px rgba(102, 126, 234, 0.6));
          }
          
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>

      <div 
        id="quick-actions-section"
        className="py-16 bg-gray-200 relative overflow-hidden"
      >
        {/* Subtle background elements for visual interest */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full blur-3xl"
            style={{ transform: `translate3d(0, ${scrollY * -0.1}px, 0)` }}
          ></div>
          <div 
            className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full blur-3xl" 
            style={{ 
              transform: `translate3d(0, ${scrollY * -0.15}px, 0)` 
            }}
          ></div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 animate-float" style={{ animationDelay: '0s' }}>
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div className="absolute top-3/4 right-1/4 animate-float" style={{ animationDelay: '2s' }}>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
          <div className="absolute top-1/2 right-1/3 animate-float" style={{ animationDelay: '1s' }}>
            <Sparkles className="w-4 h-4 text-pink-400" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Enhanced Header with adaptive colors */}
          <div 
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            <div className="inline-flex items-center justify-center p-2 glass-effect rounded-full mb-6">
              <Sparkles className="w-6 h-6 text-blue-600 mr-2" />
              <span className="text-gray-700 font-medium">Quick Actions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Get Started <span className="text-gradient">Instantly</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Choose your path to the perfect event. Fast, simple, and tailored to your needs.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-8 rounded-full"></div>
          </div>

          {/* Enhanced Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Order by Date Card */}
            <div
              className={`transition-all duration-1000 ${
                isVisible ? 'animate-slide-in-left' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.2s' }}
            >
              <div
                onClick={handleOrderByDate}
                className="glass-effect relative rounded-3xl p-8 cursor-pointer group overflow-hidden"
              >
                {/* Card gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                
                <div className="relative z-10">
                  {/* Enhanced Icon */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                      <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl transform group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="w-8 h-8 text-white icon-glow" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content with adaptive text colors */}
                  <div className="text-center" onClick={() => navigate("/eventbooking")}>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-gradient transition-all duration-300">
                      Order by Date
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Plan ahead with confidence. Browse our complete inventory filtered by your event date to ensure perfect availability.
                    </p>
                    
                    {/* Enhanced CTA with adaptive styling */}
                    <div className="inline-flex items-center justify-center px-6 py-3 glass-effect rounded-full text-gray-700 font-medium group-hover:bg-white/30 group-hover:text-gray-800 transition-all duration-300">
                      <span>Plan Your Event</span>
                      <ChevronRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            </div>

            {/* Book Items Card */}
            <div
              className={`transition-all duration-1000 ${
                isVisible ? 'animate-slide-in-right' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.4s' }}
            >
              <div
                onClick={handleBookItems}
                className="glass-effect relative rounded-3xl p-8 cursor-pointer group overflow-hidden"
              >
                {/* Card gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                
                <div className="relative z-10">
                  {/* Enhanced Icon */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                      <div className="relative p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl transform group-hover:scale-110 transition-transform duration-300">
                        <ShoppingBag className="w-8 h-8 text-white icon-glow" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content with adaptive text colors */}
                  <div className="text-center" onClick={handleBookItems}>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-gradient transition-all duration-300">
                      Book Items Now
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Start building your dream event instantly. Browse our premium collection and reserve items with our streamlined booking process.
                    </p>
                    
                    {/* Enhanced CTA with adaptive styling */}
                    <div className="inline-flex items-center justify-center px-6 py-3 glass-effect rounded-full text-gray-700 font-medium group-hover:bg-white/30 group-hover:text-gray-800 transition-all duration-300">
                      <span>Start Booking</span>
                      <ChevronRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom accent with adaptive colors */}
          <div 
            className={`text-center mt-16 transition-all duration-1000 ${
              isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.6s' }}
          >
            <div className="inline-flex items-center text-gray-500 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Trusted by 500+ event planners</span>
              <Sparkles className="w-4 h-4 ml-2" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickActionsSection;