// UI/ItemDetailsModal.js - Combined Version with Full Image Support
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
  Check,
  Palette,
  Ruler,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { addToCart } from '../store/slices/cart-slice';

const ItemDetailsModal = ({ 
  isOpen, 
  onClose, 
  item, 
  category, 
  onAddToCart,
  navigationSource, // NEW: Add navigation source prop
  warehouseInfo, // NEW: Add warehouse info for order process
  onShowAddedPopup // NEW: Add callback to show the added popup
}) => {
  const dispatch = useDispatch();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showAddedAnimation, setShowAddedAnimation] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [images, setImages] = useState([]);

  const fromOrderProcess = navigationSource === 'orderprocess';
  const fromEventBooking = navigationSource === 'eventbooking';

  // Enhanced image extraction that supports all image structures
  useEffect(() => {
    if (!item) return;
    
    const availableImages = [];
    
    // Priority 1: Check single image first (for backward compatibility with old structure)
    if (item.image) {
      availableImages.push(item.image);
    }
    
    // Priority 2: Handle new structure (item.images object)
    if (item.images && typeof item.images === 'object') {
      if (item.images.image1 && !availableImages.includes(item.images.image1)) {
        availableImages.push(item.images.image1);
      }
      if (item.images.image2 && !availableImages.includes(item.images.image2)) {
        availableImages.push(item.images.image2);
      }
      if (item.images.image3 && !availableImages.includes(item.images.image3)) {
        availableImages.push(item.images.image3);
      }
    }
    
    // Priority 3: Handle old structure (direct image1, image2, image3 fields)
    if (item.image1 && !availableImages.includes(item.image1)) {
      availableImages.push(item.image1);
    }
    if (item.image2 && !availableImages.includes(item.image2)) {
      availableImages.push(item.image2);
    }
    if (item.image3 && !availableImages.includes(item.image3)) {
      availableImages.push(item.image3);
    }
    
    // Priority 4: Handle array structure (item.images as array)
    if (item.images && Array.isArray(item.images)) {
      item.images.forEach(img => {
        if (img && !availableImages.includes(img)) {
          availableImages.push(img);
        }
      });
    }
    
    // If still no images found, use placeholder
    if (availableImages.length === 0) {
      availableImages.push('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop');
    }
    
    setImages(availableImages);
    setSelectedImageIndex(0);
  }, [item]);

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

  const handleAddToCart = () => {
    // Check if item is out of stock
    if (item.outOfStock) return;

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

    // Close the modal and show the added popup
    setTimeout(() => {
      onClose(); // Close the modal first
      if (onShowAddedPopup) {
        onShowAddedPopup(processedItem, category, navigationSource, warehouseInfo);
      }
    }, 1500); // Wait for animation to almost complete before closing
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

  const goToImage = (index) => {
    setSelectedImageIndex(index);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Mobile Optimized */}
        <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left side - Category and context badges */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-1 mr-4">
              {category && (
                <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium inline-block w-fit ${
                  fromOrderProcess
                    ? 'bg-purple-100 text-purple-800'
                    : fromEventBooking
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {category.name}
                </span>
              )}
              
              {/* Navigation context - Mobile optimized */}
              {(fromEventBooking || fromOrderProcess) && (
                <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium inline-block w-fit ${
                  fromOrderProcess
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  <span className="mr-1">{fromOrderProcess ? '📦' : '📅'}</span>
                  <span className="hidden sm:inline">{fromOrderProcess ? 'Order Process' : 'Event Booking'}</span>
                  <span className="sm:hidden">{fromOrderProcess ? 'Order' : 'Booking'}</span>
                </span>
              )}
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors duration-200"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Content - Mobile Scrollable */}
        <div className="overflow-y-auto h-full pb-24 sm:pb-6">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Image Section - Mobile First */}
            <div className="space-y-3 sm:space-y-4 order-1">
              {/* Main Image - Mobile Optimized */}
              <div className="relative aspect-square bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden group">
                <img
                  src={images[selectedImageIndex]}
                  alt={`${item.name} - Image ${selectedImageIndex + 1}`}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                  onError={handleImageError}
                />
                
                {/* Stock Status Overlay */}
                <div className="absolute top-4 left-4">
                  {item.outOfStock ? (
                    <div className="bg-red-500/90 backdrop-blur-sm text-white rounded-full px-3 py-1 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Out of Stock</span>
                    </div>
                  ) : (
                    <div className="bg-green-500/90 backdrop-blur-sm text-white rounded-full px-3 py-1 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">In Stock</span>
                    </div>
                  )}
                </div>
                
                {/* Image Navigation - Mobile Touch Friendly */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:bg-black/80 active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:bg-black/80 active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </>
                )}

                {/* Image Counter - Mobile Positioned */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Zoom indicator - Hidden on mobile */}
                <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                  {isZoomed ? 'Click to zoom out' : 'Click to zoom'}
                </div>
              </div>

              {/* Thumbnail Gallery - Mobile Optimized */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImageIndex === index
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${item.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section - Mobile Optimized */}
            <div className="space-y-4 sm:space-y-6 order-2">
              {/* Title and Rating - Mobile Typography */}
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 leading-tight">
                  {item.name}
                </h2>
                <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (item.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {item.featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center">
                      <Award className="w-3 h-3 mr-1" />
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Price - Mobile Prominent */}
              <div className={`p-3 sm:p-4 rounded-xl border ${
                fromOrderProcess
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                  : fromEventBooking
                  ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
                  : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
              }`}>
                <div className={`text-2xl sm:text-3xl font-bold mb-1 ${
                  fromOrderProcess
                    ? 'text-purple-600'
                    : fromEventBooking
                    ? 'text-green-600'
                    : 'text-green-600'
                }`}>
                  {formatPrice(item.price)}
                </div>
                
              </div>

              {/* Description - Mobile Readable */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {item.description || 'Premium quality rental item perfect for your special event. Professional grade equipment with reliable performance.'}
                </p>
              </div>

              {/* Colors and Sizes */}
              <div className="space-y-4">
                {/* Colors */}
                {item.colors && item.colors.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Palette className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Available Colors</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.colors.map((color, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {item.sizes && item.sizes.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Ruler className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Available Sizes</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.sizes.map((size, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Features - Mobile Grid */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Features</h3>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {item.features ? item.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm sm:text-base">{feature}</span>
                    </div>
                  )) : (
                    <>
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-600 text-sm sm:text-base">Professional Quality</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-600 text-sm sm:text-base">Quick Setup</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-600 text-sm sm:text-base">Complete Package</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-600 text-sm sm:text-base">Premium Support</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Specifications - Mobile Optimized */}
              {item.specifications && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Specifications</h3>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2">
                    {Object.entries(item.specifications).map(([key, value]) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                        <span className="text-gray-600 capitalize text-sm sm:text-base font-medium">{key.replace('_', ' ')}:</span>
                        <span className="font-medium text-gray-800 text-sm sm:text-base">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className={`p-4 rounded-xl ${
                item.outOfStock ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center gap-2">
                  {item.outOfStock ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-900">Out of Stock</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900">In Stock & Available</span>
                    </>
                  )}
                </div>
                <p className={`text-sm mt-1 ${
                  item.outOfStock ? 'text-red-700' : 'text-green-700'
                }`}>
                  {item.outOfStock 
                    ? 'This item is currently unavailable. Please check back later or contact us for alternatives.'
                    : 'This item is available for booking and rental.'
                  }
                </p>
              </div>

              {/* Additional Info - Mobile Compact */}
              <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2 text-sm sm:text-base">📋 Rental Information</h4>
                <ul className="text-xs sm:text-sm text-yellow-700 space-y-1">
               
                  <li>• Professional setup assistance available</li>
                  <li>• 24/7 technical support during event</li>
                  <li>• Backup equipment provided for critical items</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Section for Mobile - Add to Cart */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:relative sm:border-t-0 sm:p-0 sm:mt-6">
          <div className="max-w-4xl mx-auto">
            {/* Price Summary - Mobile Condensed */}
            <div className={`p-3 mb-3 rounded-xl border sm:hidden ${
              fromOrderProcess
                ? 'bg-purple-50 border-purple-200'
                : fromEventBooking
                ? 'bg-blue-50 border-blue-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className={`text-lg font-bold ${
                    fromOrderProcess
                      ? 'text-purple-600'
                      : fromEventBooking
                      ? 'text-blue-600'
                      : 'text-blue-600'
                  }`}>
                    {formatPrice(item.price)}
                  </div>
                
                </div>
              
              </div>
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center justify-center gap-2 sm:block hidden"
              >
                <Eye className="w-4 h-4" />
                Continue Browsing
              </button>
              
              <button
                onClick={handleAddToCart}
                disabled={item.outOfStock}
                className={`w-full sm:flex-1 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 transform active:scale-95 sm:hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center ${
                  showAddedAnimation
                    ? 'bg-green-500 text-white'
                    : item.outOfStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : fromOrderProcess
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    : fromEventBooking
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                }`}
              >
                {showAddedAnimation ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Added to {fromOrderProcess ? 'Order' : fromEventBooking ? 'Booking' : 'Cart'}!
                  </>
                ) : item.outOfStock ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {fromOrderProcess ? 'Add to Order' : fromEventBooking ? 'Add to Booking' : 'Add to Cart'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;