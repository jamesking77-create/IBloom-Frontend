// UI/itemDetailsModal.js - Enhanced with Multiple Image Support
import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Package, Palette, Ruler, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const ItemDetailsModal = ({ 
  isOpen, 
  onClose, 
  item, 
  category, 
  onAddToCart, 
  navigationSource 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);

  // Extract all available images from the item
  useEffect(() => {
    if (!item) return;
    
    const availableImages = [];
    
    // Handle new structure (item.images object)
    if (item.images) {
      if (item.images.image1) availableImages.push(item.images.image1);
      if (item.images.image2) availableImages.push(item.images.image2);
      if (item.images.image3) availableImages.push(item.images.image3);
    } else {
      // Handle old structure (direct image1, image2, image3 fields)
      if (item.image1) availableImages.push(item.image1);
      if (item.image2) availableImages.push(item.image2);
      if (item.image3) availableImages.push(item.image3);
      // Fallback to old single image field
      if (item.image && availableImages.length === 0) {
        availableImages.push(item.image);
      }
    }
    
    // If no images found, use placeholder
    if (availableImages.length === 0) {
      availableImages.push('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=600&fit=crop');
    }
    
    setImages(availableImages);
    setCurrentImageIndex(0);
  }, [item]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

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
    if (item && !item.outOfStock) {
      onAddToCart(item);
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=600&fit=crop';
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
              <p className="text-sm text-gray-600">{category?.name || 'Category'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Navigation Source Badge */}
            {(navigationSource === 'eventbooking' || navigationSource === 'orderprocess') && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {navigationSource === 'eventbooking' ? '📅 Event Booking' : '📦 Order Process'}
              </div>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={images[currentImageIndex]}
                  alt={`${item.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
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

                {/* Price Overlay */}
                {item.price && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <div className="text-xl font-bold text-green-600">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                )}

                {/* Navigation Arrows (only show if multiple images) */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white rounded-full px-3 py-1 text-sm">
                    {currentImageIndex + 1} of {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Navigation */}
              {images.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        currentImageIndex === index
                          ? 'border-blue-500 scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${item.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Title and Description */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{item.name}</h1>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>

              {/* Price */}
              {item.price && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="text-sm text-green-700 mb-1">Price</div>
                  <div className="text-2xl font-bold text-green-600">{formatPrice(item.price)}</div>
                </div>
              )}

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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Continue Browsing
                </button>
                
                <button
                  onClick={handleAddToCart}
                  disabled={item.outOfStock}
                  className={`flex-1 px-6 py-3 rounded-xl transition-all duration-200 transform font-medium flex items-center justify-center gap-2 ${
                    item.outOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : navigationSource === 'eventbooking'
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                      : navigationSource === 'orderprocess'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {item.outOfStock 
                    ? 'Out of Stock' 
                    : navigationSource === 'eventbooking' ? 'Add to Booking' 
                    : navigationSource === 'orderprocess' ? 'Add to Order' 
                    : 'Add to Cart'
                  }
                </button>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
                <p className="text-blue-700 text-sm">
                  Have questions about this item? Contact our team for personalized assistance and recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;