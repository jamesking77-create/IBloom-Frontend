import React from 'react';
import { X, ShoppingCart, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ItemAddedPopup = ({ 
  isOpen, 
  onClose, 
  item, 
  category, 
  navigationSource, // NEW: Add navigation source prop
  warehouseInfo // NEW: Add warehouse info for order process
}) => {
  const navigate = useNavigate();
  const fromOrderProcess = navigationSource === 'orderprocess';
  const fromEventBooking = navigationSource === 'eventbooking';

  if (!isOpen) return null;

  const handleViewCart = () => {
    onClose(); // Close the popup
    
    if (fromOrderProcess) {
      // Navigate back to order process
      navigate('/order-process', { 
        state: { 
          fromWarehouse: true,
          warehouseInfo: warehouseInfo 
        } 
      });
    } else {
      // Default to event booking (original behavior)
      navigate('/eventbooking', { 
        state: { 
          category: category,
          fromBooking: true 
        } 
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md mx-auto transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-4 sm:p-6 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className={`rounded-full p-2 sm:p-3 ${
              fromOrderProcess 
                ? 'bg-purple-100' 
                : fromEventBooking 
                ? 'bg-green-100' 
                : 'bg-green-100'
            }`}>
              <Check className={`w-6 h-6 sm:w-8 sm:h-8 ${
                fromOrderProcess 
                  ? 'text-purple-600' 
                  : fromEventBooking 
                  ? 'text-green-600' 
                  : 'text-green-600'
              }`} />
            </div>
          </div>
          
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center leading-tight">
            {fromOrderProcess 
              ? 'Item Added to Order!' 
              : fromEventBooking 
              ? 'Item Added to Booking!' 
              : 'Item Added to Cart!'
            }
          </h3>
          
          {/* Navigation Context Indicator */}
          {(fromEventBooking || fromOrderProcess) && (
            <div className="mt-2 sm:mt-3 flex justify-center">
              <div className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                fromOrderProcess
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                <span className="mr-1 text-sm">{fromOrderProcess ? '📦' : '📅'}</span>
                <span className="hidden xs:inline">
                  {fromOrderProcess ? 'Order Process' : 'Event Booking'}
                </span>
                <span className="xs:hidden">
                  {fromOrderProcess ? 'Order' : 'Event'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {item && (
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop'}
                alt={item.name}
                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop';
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 text-sm sm:text-base line-clamp-2 leading-tight">
                  {item.name}
                </h4>
                <p className="text-green-600 font-semibold text-sm sm:text-base mt-1">
                  ₦{typeof item.price === 'number' 
                    ? item.price.toLocaleString('en-NG') 
                    : parseFloat(item.price).toLocaleString('en-NG')
                  }
                </p>
              </div>
            </div>
          )}

          <p className="text-gray-600 text-center mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
            Your item has been successfully added to your {
              fromOrderProcess 
                ? 'order' 
                : fromEventBooking 
                ? 'booking' 
                : 'cart'
            }. You can continue shopping or view your {
              fromOrderProcess 
                ? 'order' 
                : fromEventBooking 
                ? 'booking' 
                : 'cart'
            } to see all added items.
          </p>

          {/* Action Buttons - Stack on very small screens */}
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg transition-colors duration-300 font-medium text-sm sm:text-base order-2 xs:order-1"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleViewCart}
              className={`flex-1 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg transition-all duration-300 transform active:scale-95 sm:hover:scale-105 font-medium flex items-center justify-center gap-2 text-white text-sm sm:text-base order-1 xs:order-2 ${
                fromOrderProcess
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800'
                  : fromEventBooking
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 active:from-green-800 active:to-blue-800'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">
                {fromOrderProcess 
                  ? 'View Order' 
                  : fromEventBooking 
                  ? 'View Booking' 
                  : 'View Cart'
                }
              </span>
              <span className="xs:hidden">
                {fromOrderProcess 
                  ? 'Order' 
                  : fromEventBooking 
                  ? 'Booking' 
                  : 'Cart'
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemAddedPopup;