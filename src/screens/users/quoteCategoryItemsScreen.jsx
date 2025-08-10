// screens/user/QuoteCategoryItemsScreen.js - Modified with Preview Button
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Package,
  Search,
  Filter,
  Grid3X3,
  List,
  Quote,
  Star,
  Calendar,
  MapPin,
  ChevronRight,
  Award,
  Clock,
  ShoppingCart,
  X,
  Plus,
  Minus,
  FileText,
  Sparkles,
  Send,
  Heart,
  Share2,
  Eye,
  CheckCircle
} from 'lucide-react';
import { 
  fetchCategoryById, 
  selectCurrentCategory, 
  selectLoading,
  selectError
} from '../../store/slices/categoriesSlice';
import FloatingChatBox from '../../UI/floatingChatBox';

// Quote Cart Hook for managing cart state
const useQuoteCart = () => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // Add item to cart
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Update cart count and total when cart changes
  useEffect(() => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
    // For quotes, we don't calculate total price
    setCartTotal(0);
  }, [cart]);

  return {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
};

// Enhanced Intersection Observer hook for animations
const useIntersectionObserver = () => {
  const [isVisible, setIsVisible] = useState({});
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.dataset.animate]: true
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '20px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return isVisible;
};

// Simple Cart Preview Modal - Just for quantity adjustments
const QuickCartModal = ({ cart, cartCount, updateQuantity, removeFromCart, isOpen, onClose }) => {
  if (!isOpen || cartCount === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      {/* Mobile: slides up from bottom, Desktop: centered modal */}
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-emerald-50 to-blue-50">
          {/* Mobile drag indicator */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden"></div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-emerald-600 flex-shrink-0" />
                <span className="truncate">Quick Cart Edit</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {cartCount} item{cartCount !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 sm:p-2 -mr-2 touch-manipulation"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Cart Items - Scrollable area */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-xl bg-white"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=80&h=80&fit=crop'}
                      alt={item.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base line-clamp-1 sm:line-clamp-none">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 sm:line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                    {/* Mobile: Show price if available */}
                    {item.price && (
                      <p className="text-sm font-medium text-emerald-600 mt-1 sm:hidden">
                        ${item.price}
                      </p>
                    )}
                  </div>
                  
                  {/* Quantity Controls - Stacked on mobile for narrow screens */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2">
                    {/* Quantity Controls Row */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center touch-manipulation transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <span className="w-8 sm:w-10 text-center font-medium text-sm sm:text-base">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center touch-manipulation transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-100 hover:bg-red-200 active:bg-red-300 flex items-center justify-center touch-manipulation transition-colors"
                      aria-label="Remove item"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t bg-gray-50 p-4 sm:p-6">
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-3.5 sm:py-3 rounded-xl font-medium text-base sm:text-base touch-manipulation transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

const QuoteCategoryItemsScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId } = useParams();
  const dispatch = useDispatch();
  const isVisible = useIntersectionObserver();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [filteredItems, setFilteredItems] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showQuickCart, setShowQuickCart] = useState(false);

  // Quote cart functionality
  const {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useQuoteCart();

  // Get category data from Redux store
  const currentCategory = useSelector(selectCurrentCategory);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  // Get profile data for company info
  const { userData } = useSelector((state) => state.profile);

  // Get category from location state or fetch it
  const category = location.state?.category || currentCategory;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!category && categoryId) {
      dispatch(fetchCategoryById(categoryId));
    }
  }, [dispatch, category, categoryId]);

  // Filter and sort items locally
  useEffect(() => {
    if (!category?.items) return;

    let filtered = [...category.items];

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredItems(filtered);
  }, [category?.items, searchQuery, sortBy]);

  // Handle search query change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
  };

  // Handle add to cart
  const handleAddToCart = (item) => {
    addToCart(item);
  };

  // Handle preview quote - Navigate to CustomerInfoForm
  const handlePreviewQuote = () => {
    navigate('/quote-customer-info', { 
      state: { 
        cart,
        cartCount,
        category,
        from: 'quote-items'
      }
    });
  };

  // Check if item is in cart
  const isInCart = (itemId) => {
    return cart.some(item => item.id === itemId);
  };

  // Get item quantity in cart
  const getCartQuantity = (itemId) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-4xl sm:text-6xl mb-4">❌</div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">Error Loading Category</h2>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => navigate('/request-quote')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors duration-300 text-sm sm:text-base"
          >
            Back to Quote Categories
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading.fetchById || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg">Loading category items...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Hero Section */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600">
        {/* Category Background Image */}
        {category.image && (
          <div className="absolute inset-0 opacity-20">
            <img 
              src={category.image} 
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 sm:top-10 sm:left-10 w-24 h-24 sm:w-32 sm:h-32 lg:w-72 lg:h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10 w-32 h-32 sm:w-48 sm:h-48 lg:w-96 lg:h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10 px-4">
          <div className="max-w-4xl mx-auto w-full">
            <button
              onClick={() => navigate('/request-quote')}
              className="mb-3 sm:mb-4 lg:mb-6 bg-white/20 hover:bg-white/30 rounded-full p-2 sm:p-3 transition-all duration-300 backdrop-blur-sm flex items-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </button>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent animate-fade-in-up">
              {category.name}
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 text-gray-200 max-w-2xl mx-auto animate-fade-in-up px-2" style={{ animationDelay: '0.2s' }}>
              {category.description || 'Select items for your custom quote request'}
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-3 lg:px-4 py-1 sm:py-2">
                <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>{category.itemCount || category.items?.length || 0} Items</span>
              </div>
              <div className="flex items-center bg-emerald-500/30 backdrop-blur-sm rounded-full px-2 sm:px-3 lg:px-4 py-1 sm:py-2">
                <Quote className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>Quote Available</span>
              </div>
              <div className="flex items-center bg-yellow-500/30 backdrop-blur-sm rounded-full px-2 sm:px-3 lg:px-4 py-1 sm:py-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>No Prices Shown</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Section */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 lg:py-6">
          <div className="space-y-4">
            {/* Top Row - Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              />
            </div>

            {/* Bottom Row - Filters and Controls */}
            <div className="flex items-center justify-between gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 sm:hidden bg-gray-100 px-3 py-2 rounded-lg text-sm"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              {/* Desktop Filters */}
              <div className="hidden sm:flex items-center gap-3 lg:gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm lg:text-base"
                  >
                    <option value="name">Sort A-Z</option>
                    <option value="name-desc">Sort Z-A</option>
                  </select>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 rounded-md transition-all duration-300 ${
                    viewMode === 'grid' ? 'bg-white shadow-md text-emerald-600' : 'text-gray-600'
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 rounded-md transition-all duration-300 ${
                    viewMode === 'list' ? 'bg-white shadow-md text-emerald-600' : 'text-gray-600'
                  }`}
                >
                  <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Filter Panel */}
            {showMobileFilters && (
              <div className="sm:hidden bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-700">Sort Options</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    handleSortChange(e.target.value);
                    setShowMobileFilters(false);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="name">Sort A-Z</option>
                  <option value="name-desc">Sort Z-A</option>
                </select>
              </div>
            )}

            {/* Results Summary */}
            <div className="text-xs sm:text-sm text-gray-600 px-1">
              <span>Showing {filteredItems.length} of {category.items?.length || 0} items</span>
              {searchQuery && (
                <span> for "{searchQuery}"</span>
              )}
              <span className="ml-2 text-emerald-600 font-medium">
                • Add to quote cart (no prices shown)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Items Section */}
      <div className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="text-4xl sm:text-6xl mb-4">
                {searchQuery ? '🔍' : '📦'}
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
                {searchQuery ? 'No items found' : 'No items available'}
              </h3>
              <p className="text-gray-500 mb-6 text-sm sm:text-base px-4">
                {searchQuery 
                  ? `No items match your search for "${searchQuery}"`
                  : 'Items will appear here once they are added to this category.'
                }
              </p>
              {searchQuery ? (
                <button
                  onClick={() => handleSearchChange('')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors duration-300 text-sm sm:text-base"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={() => navigate('/request-quote')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors duration-300 text-sm sm:text-base"
                >
                  Back to Categories
                </button>
              )}
            </div>
          ) : (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8' 
                : 'space-y-4 sm:space-y-6'
            }`}>
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  data-animate={`item-${index}`}
                  className={`group transform transition-all duration-700 ${
                    isVisible[`item-${index}`] ? "animate-fade-in-up" : ""
                  } ${viewMode === 'list' ? 'max-w-4xl mx-auto' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {viewMode === 'grid' ? (
                    // Enhanced Grid View for Quote Items
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/50 relative">
                      {/* Quote Badge */}
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium z-10">
                        📋 Quote Item
                      </div>
                      
                      {/* Cart Status Badge */}
                      {isInCart(item.id) && (
                        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {getCartQuantity(item.id)}
                        </div>
                      )}
                      
                      <div className="relative overflow-hidden">
                        <img
                          src={
                            item.image ||
                            `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop`
                          }
                          alt={item.name}
                          className="w-full h-36 sm:h-48 lg:h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      <div className="p-3 sm:p-4 lg:p-6">
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-2 line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 text-xs sm:text-sm lg:text-base">
                          {item.description || "Premium quality rental item available for quote"}
                        </p>
                        
                        {/* No Price Display */}
                        <div className="mb-4">
                          <div className="bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium text-center">
                            💎 Custom Pricing Available
                          </div>
                        </div>
                        
                        {/* Add to Cart Button */}
                        <button
                          onClick={() => handleAddToCart(item)}
                          className={`w-full py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center text-sm sm:text-base ${
                            isInCart(item.id)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white'
                          }`}
                        >
                          {isInCart(item.id) ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Added to Quote ({getCartQuantity(item.id)})
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Quote
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Enhanced List View for Quote Items
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/50 p-4 sm:p-6">
                      <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
                        <div className="flex-shrink-0 relative">
                          <img
                            src={
                              item.image ||
                              `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=120&h=120&fit=crop`
                            }
                            alt={item.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.src = `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=120&h=120&fit=crop`;
                            }}
                          />
                          {isInCart(item.id) && (
                            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                              {getCartQuantity(item.id)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2 line-clamp-1">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 mb-2 sm:mb-3 line-clamp-2 text-sm sm:text-base">
                            {item.description || "Premium quality rental item available for quote"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                              <Quote className="w-3 h-3 mr-1" />
                              <span className="text-xs font-medium">Quote Available</span>
                            </div>
                            <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              <span className="text-xs font-medium">Custom Pricing</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleAddToCart(item)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center text-sm ${
                              isInCart(item.id)
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white'
                            }`}
                          >
                            {isInCart(item.id) ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Add to Quote</span>
                                <span className="sm:hidden">Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Buttons - Shows when cart has items */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
          {/* Preview Quote Button */}
          <button
            onClick={handlePreviewQuote}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 font-medium"
          >
            <Eye className="w-5 h-5" />
            <span> Continue  ({cartCount})</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Quick Edit Cart Button */}
          <button
            onClick={() => setShowQuickCart(true)}
            className="bg-white hover:bg-gray-50 text-gray-800 px-4 py-3 rounded-full shadow-lg border border-gray-200 transition-all duration-300 hover:scale-105 flex items-center space-x-2 text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Edit Cart</span>
          </button>

          {/* Cart Count Indicator */}
          <div className="bg-emerald-100 text-emerald-700 rounded-full px-3 py-2 text-sm font-medium border border-emerald-200">
            {cartCount} items selected
          </div>
        </div>
      )}

      {/* Quick Cart Modal */}
      <QuickCartModal
        cart={cart}
        cartCount={cartCount}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        isOpen={showQuickCart}
        onClose={() => setShowQuickCart(false)}
      />

      {/* Floating Chat Box */}
      <FloatingChatBox whatsappNumber="+2348142186524" />

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% { 
            opacity: 0; 
            transform: translate3d(0, 30px, 0); 
          }
          100% { 
            opacity: 1; 
            transform: translate3d(0, 0, 0); 
          }
        }

        @keyframes slideUp {
          0% { 
            opacity: 0; 
            transform: translateY(100%); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in-up { 
          animation: fadeInUp 0.8s ease-out forwards; 
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Enhanced responsive breakpoints */
        @media (max-width: 480px) {
          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          
          .fixed.bottom-6.right-6 {
            bottom: 1rem;
            right: 1rem;
          }
          
          .fixed.bottom-6.right-6 button {
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
          }
        }

        @media (max-width: 350px) {
          .text-2xl { font-size: 1.25rem; }
          .text-3xl { font-size: 1.5rem; }
          .text-4xl { font-size: 1.875rem; }
        }

        /* Touch-friendly hover states for mobile */
        @media (hover: none) and (pointer: coarse) {
          .group:hover .group-hover\\:scale-110 {
            transform: scale(1);
          }
          .group:active .group-hover\\:scale-110 {
            transform: scale(1.05);
          }
        }

        /* Floating button animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Success feedback animation */
        @keyframes successPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .success-pulse {
          animation: successPulse 0.6s ease-out;
        }

        /* Enhanced backdrop blur */
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
      `}</style>
    </>
  );
};

export default QuoteCategoryItemsScreen;