// UI/ItemDetailsModal.js - Complete Item Details Modal Component (No Quantity Selection)
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  X, 
  ShoppingCart, 
  Star, 
  Heart, 
  Share2, 
  Zap, 
  Clock, 
  Package, 
  Award,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { addToCart } from '../store/slices/cart-slice';

const ItemDetailsModal = ({ isOpen, onClose, item, category, onAddToCart }) => {
  const dispatch = useDispatch();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showAddedAnimation, setShowAddedAnimation] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedImageIndex(0);
      setShowAddedAnimation(false);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  // FIXED: Proper price formatting function
  const formatPrice = (price) => {
    if (!price) return '₦0';
    
    let numericPrice;
    if (typeof price === 'string') {
      const cleanPrice = price.replace(/[₦\s]/g, '');
      numericPrice = parseFloat(cleanPrice.replace(/,/g, ''));
    } else {
      numericPrice = parseFloat(price);
    }
    
    if (isNaN(numericPrice)) return '₦0';
    return `₦${numericPrice.toLocaleString('en-NG')}`;
  };

  // Prepare images array (handle single image or multiple images)
  const images = item.images && Array.isArray(item.images) 
    ? item.images 
    : [item.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'];

  const handleAddToCart = () => {
    // Process item price properly
    let processedPrice;
    if (typeof item.price === 'string') {
      processedPrice = parseFloat(item.price.replace(/[₦\s,]/g, ''));
    } else {
      processedPrice = parseFloat(item.price);
    }

    const processedItem = {
      ...item,
      price: processedPrice
    };

    if (onAddToCart) {
      onAddToCart(processedItem);
    } else {
      dispatch(addToCart({ 
        item: processedItem,
        dates: null,
        allowDuplicates: false 
      }));
    }

    setShowAddedAnimation(true);
    setTimeout(() => setShowAddedAnimation(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: `Check out this ${item.name} for your event!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {category && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {category.name}
                </span>
              )}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors duration-200"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6">
            {/* Image Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
                <img
                  src={images[selectedImageIndex]}
                  alt={item.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop';
                  }}
                />
                
                {/* Image Navigation - Only show if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Zoom indicator */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {isZoomed ? 'Click to zoom out' : 'Click to zoom'}
                </div>
              </div>

              {/* Thumbnail Gallery - Only show if multiple images */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImageIndex === index
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${item.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Title and Rating */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {item.name}
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (item.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      ({item.reviews || 124} reviews)
                    </span>
                  </div>
                  {item.featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center">
                      <Award className="w-3 h-3 mr-1" />
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {formatPrice(item.price)}
                </div>
                <div className="text-sm text-gray-600">
                  Per {item.orderMode === 'booking' ? 'hour' : 'day'} • Duration: {item.duration || 1} {item.orderMode === 'booking' ? 'hour(s)' : 'day(s)'}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description || 'Premium quality rental item perfect for your special event. Professional grade equipment with reliable performance.'}
                </p>
              </div>

              {/* Features/Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item.features ? item.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </div>
                  )) : (
                    <>
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-600 text-sm">Professional Quality</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-600 text-sm">Quick Setup</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-600 text-sm">Complete Package</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-600 text-sm">Premium Support</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Specifications */}
              {item.specifications && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {Object.entries(item.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-medium text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Section */}
              <div className="space-y-4">
                {/* Price Display */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {formatPrice(item.price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Per {item.orderMode === 'booking' ? 'hour' : 'day'} • Duration: {item.duration || 1} {item.orderMode === 'booking' ? 'hour(s)' : 'day(s)'}
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center ${
                    showAddedAnimation
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  }`}
                >
                  {showAddedAnimation ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Additional Info */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">📋 Rental Information</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Free delivery within Lagos mainland</li>
                  <li>• Professional setup assistance available</li>
                  <li>• 24/7 technical support during event</li>
                  <li>• Backup equipment provided for critical items</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;