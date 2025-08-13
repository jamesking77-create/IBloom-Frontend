// screens/user/CategoriesScreen.js - Enhanced Responsive Categories Screen
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Package,
  Search,
  Filter,
  Grid3X3,
  List,
  Sparkles,
  Star,
  Users,
  Calendar,
  MapPin,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  ShoppingCart,
  X,
  Menu
} from 'lucide-react';
import { 
  fetchCategories, 
  selectCategories, 
  selectIsLoading,
  selectError,
  setSearchQuery,
  setFilterBy
} from '../../store/slices/categoriesSlice';
import FloatingChatBox from '../../UI/floatingChatBox';

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

const SmartCategoriesScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isVisible = useIntersectionObserver();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get categories data from Redux store using proper selectors
  const categories = useSelector(selectCategories);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  
  // Get profile data for company info
  const { userData } = useSelector((state) => state.profile);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // Filter and sort categories locally
  useEffect(() => {
    let filtered = [...categories];

    if (searchQuery) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'items-high':
        filtered.sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0));
        break;
      case 'items-low':
        filtered.sort((a, b) => (a.itemCount || 0) - (b.itemCount || 0));
        break;
      default:
        break;
    }

    setFilteredCategories(filtered);
  }, [categories, searchQuery, sortBy]);

  // Handle search query change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    dispatch(setSearchQuery(value));
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    dispatch(setFilterBy(value));
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    console.log('🏷️ Navigating to category with ORDER source:', category);
    navigate(`/category/${category.id}`, { 
      state: { 
        category,
        from: 'orderprocess',
        warehouseInfo: userData
      } 
    });
  };

  const stats = [
    { number: `${categories.length}+`, label: "Categories", icon: "📦" },
    { number: `${categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0)}+`, label: "Total Items", icon: "🎉" },
    { number: "24/7", label: "Support", icon: "🔧" },
    { number: "100%", label: "Quality", icon: "⭐" },
  ];

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-4xl sm:text-6xl mb-4">❌</div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">Error Loading Categories</h2>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => dispatch(fetchCategories())}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors duration-300 text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Hero Section */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 sm:top-10 sm:left-10 w-24 h-24 sm:w-32 sm:h-32 lg:w-72 lg:h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10 w-32 h-32 sm:w-48 sm:h-48 lg:w-96 lg:h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-40 sm:h-40 lg:w-80 lg:h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10 px-4">
          <div className="max-w-4xl mx-auto w-full">
            <button
              onClick={() => navigate(-1)}
              className="mb-3 sm:mb-4 lg:mb-6 bg-white/20 hover:bg-white/30 rounded-full p-2 sm:p-3 transition-all duration-300 backdrop-blur-sm flex items-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </button>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent animate-fade-in-up">
              Rental Categories
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 text-gray-200 max-w-2xl mx-auto animate-fade-in-up px-2" style={{ animationDelay: '0.2s' }}>
              Browse our premium collection of rental items for your perfect event
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-3 lg:px-4 py-1 sm:py-2">
                <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>{categories.length} Categories</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-3 lg:px-4 py-1 sm:py-2">
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>Order Process</span>
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
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
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
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="items-high">Most Items</option>
                    <option value="items-low">Least Items</option>
                  </select>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 rounded-md transition-all duration-300 ${
                    viewMode === 'grid' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 rounded-md transition-all duration-300 ${
                    viewMode === 'list' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600'
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="items-high">Most Items</option>
                  <option value="items-low">Least Items</option>
                </select>
              </div>
            )}

            {/* Results Summary */}
            <div className="text-xs sm:text-sm text-gray-600 px-1">
              <span>Showing {filteredCategories.length} of {categories.length} categories</span>
              {searchQuery && (
                <span> for "{searchQuery}"</span>
              )}
              <span className="ml-2 text-blue-600 font-medium">
                • Ready for Order Process
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div 
            data-animate="stats"
            className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 transition-all duration-1000 ${
              isVisible["stats"] ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center transform transition-all duration-700 hover:scale-105"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl mb-1 sm:mb-2 lg:mb-4">{stat.icon}</div>
                <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Categories Section */}
      <div className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="text-4xl sm:text-6xl mb-4">
                {searchQuery ? '🔍' : '📦'}
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
                {searchQuery ? 'No categories found' : 'No categories available'}
              </h3>
              <p className="text-gray-500 mb-6 text-sm sm:text-base px-4">
                {searchQuery 
                  ? `No categories match your search for "${searchQuery}"`
                  : 'Categories will appear here once they are added to the system.'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors duration-300 text-sm sm:text-base"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8' 
                : 'space-y-4 sm:space-y-6'
            }`}>
              {filteredCategories.map((category, index) => (
                <div
                  key={category.id}
                  data-animate={`category-${index}`}
                  className={`group cursor-pointer transform transition-all duration-700 hover:scale-105 ${
                    isVisible[`category-${index}`] ? "animate-fade-in-up" : ""
                  } ${viewMode === 'list' ? 'max-w-4xl mx-auto' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleCategoryClick(category)}
                >
                  {viewMode === 'grid' ? (
                    // Enhanced Grid View
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/50 relative">
                      {/* Order Process Badge */}
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        📦 Add to Order
                      </div>
                      
                      <div className="relative overflow-hidden">
                        <img
                          src={
                            category.image ||
                            `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop`
                          }
                          alt={category.name}
                          className="w-full h-36 sm:h-48 lg:h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      <div className="p-3 sm:p-4 lg:p-6">
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300 line-clamp-1">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 text-xs sm:text-sm lg:text-base">
                          {category.description ||
                            "Premium quality rentals for your special event"}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs sm:text-sm text-gray-500">
                            <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span>{category.itemCount || 0} items</span>
                          </div>
                          <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm group-hover:text-purple-600 transition-colors duration-300">
                            <span className="hidden sm:inline">Browse Items</span>
                            <span className="sm:hidden">Browse</span>
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Enhanced List View
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/50 p-4 sm:p-6">
                      <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
                        <div className="flex-shrink-0">
                          <img
                            src={
                              category.image ||
                              `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=120&h=120&fit=crop`
                            }
                            alt={category.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=120&h=120&fit=crop`;
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
                            {category.name}
                          </h3>
                          <p className="text-gray-600 mb-2 sm:mb-3 line-clamp-2 text-sm sm:text-base">
                            {category.description ||
                              "Premium quality rentals for your special event"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <div className="flex items-center">
                              <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span>{category.itemCount || 0} items</span>
                            </div>
                            <div className="flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              <span className="text-xs font-medium">Order Process</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
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

      {/* Enhanced Company Info Section */}
      {userData?.name && (
        <div className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div 
              data-animate="company-info"
              className={`transition-all duration-1000 ${
                isVisible["company-info"] ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <div className="mb-6 sm:mb-8">
                <Award className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-blue-600 mb-3 sm:mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 px-4">
                  {userData.name}
                </h2>
              </div>
              
              {userData.bio && (
                <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed px-4">
                  {userData.bio}
                </p>
              )}
              
              <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 px-4">
                {userData.location && (
                  <div className="flex items-center bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-md">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600" />
                    <span>{userData.location}</span>
                  </div>
                )}
                <div className="flex items-center bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-md">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-600" />
                  <span>Professional Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Call to Action Section */}
      <div className="py-12 sm:py-16 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-4 sm:top-10 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 sm:bottom-10 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div 
          data-animate="cta-section"
          className={`relative z-10 max-w-4xl mx-auto px-4 text-center transition-all duration-1000 ${
            isVisible["cta-section"] ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Start Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block mt-1 sm:mt-2">Order Process?</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto px-4">
            Browse our categories, select your items, and create your perfect rental order with our streamlined process.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <button
              onClick={() => navigate('/eventbooking')}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center"
            >
              <Calendar className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              Event Booking
            </button>
            <button
              onClick={() => navigate('/quote')}
              className="w-full sm:w-auto bg-white/10 backdrop-blur-lg text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center hover:bg-white/20 border border-white/20"
            >
              <Package className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              Get Quote
            </button>
          </div>
        </div>
      </div>

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
        
        .animate-fade-in-up { 
          animation: fadeInUp 0.8s ease-out forwards; 
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
          .group:hover .group-hover\\:translate-x-1 {
            transform: translateX(0);
          }
          .group:active .group-hover\\:scale-110 {
            transform: scale(1.05);
          }
          .group:active .group-hover\\:translate-x-1 {
            transform: translateX(4px);
          }
        }
      `}</style>
    </>
  );
};

export default SmartCategoriesScreen;