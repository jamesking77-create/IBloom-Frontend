import React, { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, ShoppingBag, ChevronRight, Sparkles, Clock } from "lucide-react";

const QuickActionsSection = ({ navigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Ultra-lightweight intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '20px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Optimized event handlers
  const handleOrderByDate = useCallback(() => {
    navigate('/warehouseinfo');
  }, [navigate]);

  const handleBookItems = useCallback(() => {
    navigate('/eventbooking');
  }, [navigate]);

  return (
    <>
      <style>
        {`
          /* Ultra-optimized animations */
          @keyframes quickFadeUp {
            0% { opacity: 0; transform: translate3d(0, 15px, 0); }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }

          @keyframes quickSlideLeft {
            0% { opacity: 0; transform: translate3d(-15px, 0, 0); }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }

          @keyframes quickSlideRight {
            0% { opacity: 0; transform: translate3d(15px, 0, 0); }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }

          @keyframes gentleFloat {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(0, -3px, 0); }
          }

          .quick-fade-up { animation: quickFadeUp 0.5s ease-out forwards; }
          .quick-slide-left { animation: quickSlideLeft 0.5s ease-out forwards; }
          .quick-slide-right { animation: quickSlideRight 0.5s ease-out forwards; }
          .gentle-float { animation: gentleFloat 4s ease-in-out infinite; }

          .quick-glass {
            background: rgba(255, 255, 255, 0.55);
            backdrop-filter: blur(14px);
            border: 1px solid rgba(47, 93, 58, 0.12);
            box-shadow: 0 4px 16px rgba(36, 26, 32, 0.06);
            transition: all 0.25s ease;
          }

          .quick-glass:hover {
            background: rgba(255, 255, 255, 0.75);
            border: 1px solid rgba(47, 93, 58, 0.2);
            box-shadow: 0 10px 24px rgba(36, 26, 32, 0.1);
            transform: translateY(-3px) scale(1.01);
          }

          /* Performance containment */
          .quick-actions-container {
            contain: layout style;
            will-change: contents;
          }

          /* Accessibility */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
            .quick-glass:hover { transform: none !important; }
          }
        `}
      </style>

      <section
        ref={sectionRef}
        className="quick-actions-container py-16 bg-bloom-ivory relative overflow-hidden"
      >
        {/* Organic background shapes */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="blob blob-a absolute top-16 -left-10 w-72 h-72 bg-bloom-green/20" />
          <div className="blob blob-b absolute bottom-16 -right-10 w-64 h-64 bg-bloom-rose/15" />
        </div>

        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <Sparkles className="absolute top-1/4 left-1/4 w-4 h-4 text-bloom-green gentle-float" style={{ animationDelay: '0s' }} />
          <Clock className="absolute top-3/4 right-1/4 w-5 h-5 text-bloom-rose gentle-float" style={{ animationDelay: '2s' }} />
          <Sparkles className="absolute top-1/2 right-1/3 w-3 h-3 text-bloom-gold gentle-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Header */}
          <header
            className={`text-center mb-16 transition-opacity duration-500 ${
              isVisible ? 'quick-fade-up' : 'opacity-0'
            }`}
          >
            <div className="inline-flex items-center justify-center p-2 quick-glass rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-bloom-green mr-2" />
              <span className="text-gray-700 font-medium">Quick Actions</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-gray-800 mb-4">
              Get Started <span className="text-bloom-rose">Instantly</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Choose your path to the perfect event. Fast, simple, and tailored to your needs.
            </p>
            <div className="w-16 h-1 bg-bloom-rose mx-auto mt-8 rounded-full" />
          </header>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

            {/* Order by Date Card */}
            <article
              className={`transition-opacity duration-500 ${
                isVisible ? 'quick-slide-left' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.1s' }}
            >
              <div
                onClick={handleOrderByDate}
                className="quick-glass relative rounded-3xl p-8 cursor-pointer group overflow-hidden focus:outline-none focus:ring-2 focus:ring-bloom-green focus:ring-offset-2"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOrderByDate()}
                aria-label="Order by Date - Plan your event with date-specific inventory"
              >
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative p-4 bg-bloom-green rounded-2xl transform group-hover:scale-105 transition-transform duration-250">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-bloom-green transition-colors duration-250">
                      Order by Date
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Plan ahead with confidence. Browse our complete inventory filtered by your event date to ensure perfect availability.
                    </p>

                    {/* Call to Action */}
                    <div className="inline-flex items-center justify-center px-6 py-3 bg-white/70 border border-bloom-green/20 rounded-full text-gray-700 font-medium group-hover:bg-bloom-green group-hover:text-white group-hover:border-bloom-green transition-all duration-250">
                      <span>Plan Your Event</span>
                      <ChevronRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-250" />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Book Items Card */}
            <article
              className={`transition-opacity duration-500 ${
                isVisible ? 'quick-slide-right' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.2s' }}
            >
              <div
                onClick={handleBookItems}
                className="quick-glass relative rounded-3xl p-8 cursor-pointer group overflow-hidden focus:outline-none focus:ring-2 focus:ring-bloom-rose focus:ring-offset-2"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleBookItems()}
                aria-label="Book Items Now - Start building your dream event instantly"
              >
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative p-4 bg-bloom-rose rounded-2xl transform group-hover:scale-105 transition-transform duration-250">
                      <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-bloom-rose transition-colors duration-250">
                      Book Items Now
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Start building your dream event instantly. Browse our premium collection and reserve items with our streamlined booking process.
                    </p>

                    {/* Call to Action */}
                    <div className="inline-flex items-center justify-center px-6 py-3 bg-white/70 border border-bloom-rose/20 rounded-full text-gray-700 font-medium group-hover:bg-bloom-rose group-hover:text-white group-hover:border-bloom-rose transition-all duration-250">
                      <span>Start Booking</span>
                      <ChevronRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-250" />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Trust Indicator */}
          <footer
            className={`text-center mt-16 transition-opacity duration-500 ${
              isVisible ? 'quick-fade-up' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.3s' }}
          >
            <div className="inline-flex items-center text-gray-500 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Trusted by 500+ event planners</span>
              <Sparkles className="w-4 h-4 ml-2" />
            </div>
          </footer>
        </div>
      </section>
    </>
  );
};

export default QuickActionsSection;
