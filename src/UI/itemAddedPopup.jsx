import React from 'react';
import { X, ShoppingCart, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ItemAddedPopup = ({ isOpen, onClose, item, category }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleViewCart = () => {
    onClose(); // Close the popup
    navigate('/eventbooking', { state: { category: category } });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 text-center">
            Item Added to Cart!
          </h3>
        </div>

        {/* Content */}
        <div className="p-6">
          {item && (
            <div className="flex items-center gap-4 mb-6">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop'}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop';
                }}
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{item.name}</h4>
                <p className="text-green-600 font-semibold">
                  ₦{parseFloat(item.price).toLocaleString('en-NG')}
                </p>
              </div>
            </div>
          )}

          <p className="text-gray-600 text-center mb-6">
            Your item has been successfully added to your cart. You can continue shopping or view your cart to see all added items.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors duration-300 font-medium"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleViewCart}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              View Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemAddedPopup;