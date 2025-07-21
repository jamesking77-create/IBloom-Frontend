import React from "react";
import { Calendar, ShoppingBag, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActionsSection = () => {
  const navigate = useNavigate()
  const handleOrderByDate = () => {
    // Navigate to order by date screen
    console.log("Navigate to /order-by-date");
  };

  const handleBookItems = () => {
    navigate('/eventbooking')
  };

  return (
    <>
      <style>
        {`
          .glass-box {
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 
              0 4px 24px 0 rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .glass-box:hover {
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.25);
            box-shadow: 
              0 8px 32px 0 rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
            transform: translateY(-4px) scale(1.01);
          }
          
          .glass-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.1) 0%,
              rgba(255, 255, 255, 0.02) 50%,
              rgba(255, 255, 255, 0.08) 100%
            );
            border-radius: inherit;
            pointer-events: none;
          }
        `}
      </style>

      <div className="py-12 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
        {/* Subtle animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Quick Actions
            </h2>
            <p className="text-lg text-gray-300">
              Manage your orders and bookings effortlessly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Order by Date Box */}
            <div
              onClick={handleOrderByDate}
              className="glass-box relative rounded-2xl p-6 cursor-pointer group h-40"
            >
              <div className="relative z-10 flex items-center h-full">
                <div className="flex items-center justify-center mr-6">
                  <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all duration-300">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Order by Date
                  </h3>
                  <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                    Plan your events in advance. Browse available items by your preferred date.
                  </p>
                  <div className="flex items-center text-gray-300 group-hover:text-white transition-colors duration-300">
                    <span className="font-medium text-sm">Get Started</span>
                    <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Book Items Box */}
            <div
              onClick={handleBookItems}
              className="glass-box relative rounded-2xl p-6 cursor-pointer group h-40"
            >
              <div className="relative z-10 flex items-center h-full">
                <div className="flex items-center justify-center mr-6">
                  <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all duration-300">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Book Items
                  </h3>
                  <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                    Browse and reserve items for your upcoming events. Quick and easy booking process.
                  </p>
                  <div className="flex items-center text-gray-300 group-hover:text-white transition-colors duration-300">
                    <span className="font-medium text-sm">Start Booking</span>
                    <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickActionsSection;