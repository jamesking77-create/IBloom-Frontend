// screens/user/CategoriesPage.js - OPTIMIZED WITH SUBCATEGORIES AND ENHANCED UI
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Package, Search, Filter, AlertTriangle, CheckCircle, Palette, Ruler, Grid, List, Eye, Check } from 'lucide-react';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import { addToCart, selectCartItems, openCart } from '../../store/slices/cart-slice';
import FloatingChatBox from '../../UI/floatingChatBox';
import ItemAddedPopup from '../../UI/itemAddedPopup';
import ItemDetailsModal from '../../UI/itemDetailsModal';

const CategoriesPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filteredItems, setFilteredItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedColors, setSelectedColors] = useState({});

  // Navigation source detection
  const navigationSource = location.state?.from || 'home';
  const fromEventBooking = navigationSource === 'eventbooking';
  const fromOrderProcess = navigationSource === 'orderprocess';
  const warehouseInfo = location.state?.warehouseInfo;

  // Get categories data from Redux store
  const { categories, isLoading } = useSelector((state) => state.categories);
  const cartItems = useSelector(selectCartItems);
  
  // Get the specific category
  const category = categories.find(cat => cat.id === parseInt(categoryId)) || location.state?.category;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // Update filtered items based on selected subcategory
  useEffect(() => {
    if (!category) {
      setFilteredItems([]);
      return;
    }

    let items = [];
    
    // If a subcategory is selected, show only its items
    if (selectedSubCategory) {
      items = [...(selectedSubCategory.items || [])];
    } else {
      // Show direct category items
      items = [...(category.items || [])];
    }

    // Apply search filter
    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        items.sort((a, b) => {
          const priceA = parseFloat(a.price?.toString().replace(/[₦\s,]/g, '') || 0);
          const priceB = parseFloat(b.price?.toString().replace(/[₦\s,]/g, '') || 0);
          return priceA - priceB;
        });
        break;
      case 'price-high':
        items.sort((a, b) => {
          const priceA = parseFloat(a.price?.toString().replace(/[₦\s,]/g, '') || 0);
          const priceB = parseFloat(b.price?.toString().replace(/[₦\s,]/g, '') || 0);
          return priceB - priceA;
        });
        break;
      default:
        break;
    }

    setFilteredItems(items);
  }, [category, selectedSubCategory, searchQuery, sortBy]);

  const handleColorSelect = (itemId, color) => {
  setSelectedColors(prev => ({
    ...prev,
    [itemId]: color
  }));
};

  // Handle subcategory selection
  const handleSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setSearchQuery(''); // Clear search when switching subcategories
  };

  // Handle showing all items
  const handleShowAllItems = () => {
    setSelectedSubCategory(null);
    setSearchQuery(''); // Clear search when showing all
  };

  // Handle item click to open modal
  const handleItemClick = (item) => {
    console.log('Opening details modal for item:', item);
    setModalItem(item);
    setShowDetailsModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setModalItem(null);
  };

  // Price formatting function
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

  // Get primary image for item
  const getPrimaryImage = (item) => {
    return item.images?.image1 || item.image1 || item.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop';
  };

  // Enhanced navigation logic
  const navigateToCorrectScreen = (processedItem) => {
    console.log('🚀 Navigating based on source:', navigationSource);
    
    if (fromEventBooking) {
      console.log('📅 Navigating back to Event Booking');
      navigate('/eventbooking', { 
        state: { 
          selectedItem: processedItem, 
          category: category,
          fromBooking: true
        } 
      });
    } else if (fromOrderProcess) {
      console.log('📦 Navigating back to Order Process');
      navigate('/order-process', { 
        state: { 
          selectedItem: processedItem, 
          category: category,
          fromWarehouse: true,
          warehouseInfo: warehouseInfo
        } 
      });
    } else {
      console.log('🏠 Default navigation to Event Booking');
      navigate('/eventbooking', { 
        state: { 
          selectedItem: processedItem, 
          category: category 
        } 
      });
    }
  };

  // Enhanced add to cart process
const addToCartProcess = (item) => {
  console.log('🛒 Original item:', item);
  console.log('🛒 Navigation source:', navigationSource);
  
  let processedPrice;
  if (typeof item.price === 'string') {
    processedPrice = parseFloat(item.price.replace(/[₦\s,]/g, ''));
  } else {
    processedPrice = parseFloat(item.price || 0);
  }
  
  if (isNaN(processedPrice) || processedPrice <= 0) {
    console.error('❌ Invalid price detected:', item.price);
    alert('Error: Invalid item price. Please contact support.');
    return;
  }
  
  // NEW: Get selected color for this item
  const selectedColor = selectedColors[item.id];
  
  // NEW: Append color to item name if selected
  const itemName = selectedColor 
    ? `${item.name} - Color: ${selectedColor}`
    : item.name;
  
  const processedItem = {
    ...item,
    name: itemName,  // ← Modified name with color
    selectedColor: selectedColor, // ← Store selected color separately too
    price: processedPrice
  };
  
  console.log('✅ Processed item with color:', processedItem);
  
  const isCartEmpty = cartItems.length === 0;
  
  // For order process, always navigate back after adding item
  if (fromOrderProcess) {
    dispatch(addToCart({ 
      item: processedItem,
      dates: null,
      allowDuplicates: false 
    }));
    
    console.log('📦 Navigating back to Order Process after adding item');
    navigate('/orderprocess', { 
      state: { 
        fromWarehouse: true,
        warehouseInfo: warehouseInfo,
        addedItem: processedItem
      } 
    });
    return;
  }
  
  // For event booking or default behavior
  if (isCartEmpty) {
    navigateToCorrectScreen(processedItem);
  } else {
    dispatch(addToCart({ 
      item: processedItem,
      dates: null,
      allowDuplicates: false 
    }));
    
    setSelectedItem(processedItem);
    setShowPopup(true);
  }
};

const handleModalAddToCart = (item) => {
  console.log('🛒 Adding to cart from modal:', item);
  
  // Item already has selectedColor if it was set in modal
  // No need to modify here, just pass it through
  
  if (fromOrderProcess) {
    dispatch(addToCart({ 
      item: item,
      dates: null,
      allowDuplicates: false 
    }));
    
    handleCloseModal();
    
    console.log('📦 Navigating back to Order Process from modal');
    navigate('/order-process', { 
      state: { 
        fromWarehouse: true,
        warehouseInfo: warehouseInfo,
        addedItem: item
      } 
    });
    return;
  }
  
  const isCartEmpty = cartItems.length === 0;
  
  if (isCartEmpty) {
    navigateToCorrectScreen(item);
  } else {
    dispatch(addToCart({ 
      item: item,
      dates: null,
      allowDuplicates: false 
    }));
    
    setSelectedItem(item);
    setShowPopup(true);
    handleCloseModal();
  }
};  

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedItem(null);
  };

  // View cart with proper navigation
  const handleViewCart = () => {
    setShowPopup(false);
    setSelectedItem(null);
    
    if (fromEventBooking) {
      console.log('📅 Returning to Event Booking from popup');
      navigate('/eventbooking', { 
        state: { 
          fromBooking: true 
        } 
      });
    } else if (fromOrderProcess) {
      console.log('📦 Returning to Order Process from popup');
      navigate('/order-process', { 
        state: { 
          fromWarehouse: true,
          warehouseInfo: warehouseInfo 
        } 
      });
    } else {
      dispatch(openCart());
    }
  };

  // Back button navigation
  const handleBackNavigation = () => {
    if (fromEventBooking) {
      console.log('📅 Going back to Event Booking');
      navigate('/eventbooking', { 
        state: { 
          fromBooking: true 
        } 
      });
    } else if (fromOrderProcess) {
      console.log('📦 Going back to Order Process');
      navigate('/order-process', {
        state: { 
          fromWarehouse: true,
          warehouseInfo: warehouseInfo 
        } 
      });
    } else {
      navigate('/');
    }
  };

  if (isLoading && !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Category Not Found</h2>
          <p className="text-gray-500 mb-6">The category you're looking for doesn't exist.</p>
          <button
            onClick={handleBackNavigation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300 flex items-center mx-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section with Colors and Sizes */}
      <div className="relative h-80 overflow-hidden mt-20">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${category.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=600&fit=crop'})` 
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Colors and Sizes Display - Top Right */}
        {((category.colors && category.colors.length > 0) || (category.sizes && category.sizes.length > 0)) && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg max-w-xs">
            {category.colors && category.colors.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Palette className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Colors</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {category.colors.slice(0, 4).map((color, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {color}
                    </span>
                  ))}
                  {category.colors.length > 4 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      +{category.colors.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {category.sizes && category.sizes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Ruler className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Sizes</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {category.sizes.slice(0, 4).map((size, index) => (
                    <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {size}
                    </span>
                  ))}
                  {category.sizes.length > 4 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      +{category.sizes.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10">
          <div className="max-w-4xl mx-auto px-4">
            <button
              onClick={handleBackNavigation}
              className="mb-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-300 backdrop-blur-sm flex items-center mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {category.name}
            </h1>
            
            <p className="text-lg md:text-xl mb-4 text-gray-200 max-w-2xl mx-auto">
              {category.description || 'Premium quality rentals for your special event'}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-300">
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2" />
                <span>{category.itemCount || 0} items available</span>
              </div>
              {(fromEventBooking || fromOrderProcess) && (
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-medium">
                    {fromEventBooking ? '📅 Event Booking' : '📦 Order Process'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories Section - Only show if category has subcategories */}
      {category.subCategories && category.subCategories.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Subcategories</h2>
              <button
                onClick={handleShowAllItems}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !selectedSubCategory 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Items
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {category.subCategories.map((subCategory) => (
                <div
                  key={subCategory.id}
                  onClick={() => handleSubCategoryClick(subCategory)}
                  className={`cursor-pointer rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                    selectedSubCategory?.id === subCategory.id 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={subCategory.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=150&fit=crop'}
                      alt={subCategory.name}
                      className="w-full h-24 sm:h-32 object-cover"
                    />
                    <div className={`absolute inset-0 ${
                      selectedSubCategory?.id === subCategory.id 
                        ? 'bg-blue-600/20' 
                        : 'bg-black/20'
                    }`} />
                    
                    {/* Item count badge */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                      <span className="text-xs font-medium text-gray-700">
                        {subCategory.items?.length || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white">
                    <h3 className="font-medium text-sm text-gray-800 mb-1 line-clamp-1">
                      {subCategory.name}
                    </h3>
                    
                    {/* Colors and Sizes for Subcategory */}
                    <div className="space-y-1">
                      {subCategory.colors && subCategory.colors.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Palette className="w-3 h-3 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {subCategory.colors.slice(0, 2).map((color, index) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                {color}
                              </span>
                            ))}
                            {subCategory.colors.length > 2 && (
                              <span className="text-xs text-gray-400">+{subCategory.colors.length - 2}</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {subCategory.sizes && subCategory.sizes.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Ruler className="w-3 h-3 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {subCategory.sizes.slice(0, 2).map((size, index) => (
                              <span key={index} className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                {size}
                              </span>
                            ))}
                            {subCategory.sizes.length > 2 && (
                              <span className="text-xs text-gray-400">+{subCategory.sizes.length - 2}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredItems.length} items
            {selectedSubCategory && (
              <span> in "{selectedSubCategory.name}"</span>
            )}
            {searchQuery && (
              <span> for "{searchQuery}"</span>
            )}
            {(fromEventBooking || fromOrderProcess) && (
              <span className="ml-2 text-blue-600 font-medium">
                • Adding to {fromEventBooking ? 'Event Booking' : 'Order Process'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="py-16 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">
                {searchQuery ? '🔍' : '📦'}
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                {searchQuery ? 'No items found' : 'No items available'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? `No items match your search for "${searchQuery}"`
                  : selectedSubCategory
                  ? `No items in "${selectedSubCategory.name}" yet.`
                  : 'Items will appear here once they are added to this category.'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "space-y-4"
            }>
{filteredItems.map((item, index) => (
  <div
    key={item.id}
    className={
      viewMode === 'grid' 
        ? "group transform transition-all duration-500 hover:scale-105"
        : "group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-4"
    }
    style={viewMode === 'grid' ? { animationDelay: `${index * 100}ms` } : {}}
  >
    {viewMode === 'grid' ? (
      // Grid View
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/50">
        {/* IMAGE SECTION - This opens modal */}
        <div 
          className="relative overflow-hidden cursor-pointer"
          onClick={() => handleItemClick(item)}
        >
          <img
            src={getPrimaryImage(item)}
            alt={item.name}
            className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Price Badge */}
          {item.price && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
              <div className="flex items-center text-green-600 font-semibold">
                <span className="text-sm">₦</span>
                <span className="ml-1">{formatPrice(item.price).replace('₦', '')}</span>
              </div>
            </div>
          )}

          {/* Stock Status Badge */}
          <div className="absolute top-4 left-4">
            {item.outOfStock ? (
              <div className="bg-red-500/90 backdrop-blur-sm text-white rounded-full px-2 py-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-medium">Out of Stock</span>
              </div>
            ) : (
              <div className="bg-green-500/90 backdrop-blur-sm text-white rounded-full px-2 py-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span className="text-xs font-medium">In Stock</span>
              </div>
            )}
          </div>

          {/* Navigation context badge */}
          {(fromEventBooking || fromOrderProcess) && (
            <div className="absolute bottom-4 left-4 bg-blue-600/90 backdrop-blur-sm text-white rounded-full px-2 py-1 text-xs font-medium">
              {fromEventBooking ? '📅' : '📦'}
            </div>
          )}
        </div>
        
        {/* CONTENT SECTION - NOT clickable to open modal */}
        <div className="p-6">
          {/* Title - This opens modal */}
          <h3 
            className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            {item.name}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {item.description}
          </p>
          
          {/* Item Colors and Sizes - ISOLATED, won't trigger modal */}
          <div className="space-y-2 mb-4">
            {/* COLOR SELECTION - FIXED */}
            {item.colors && item.colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">
                    {selectedColors[item.id] ? `Selected: ${selectedColors[item.id]}` : 'Select Color:'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.colors.map((color, colorIndex) => (
                    <button
                      key={colorIndex}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleColorSelect(item.id, color);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 ${
                        selectedColors[item.id] === color
                          ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                      type="button"
                    >
                      {color}
                      {selectedColors[item.id] === color && (
                        <Check className="w-3 h-3 inline ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* SIZES - Display only */}
            {item.sizes && item.sizes.length > 0 && (
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {item.sizes.slice(0, 3).map((size, sizeIndex) => (
                    <span key={sizeIndex} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      {size}
                    </span>
                  ))}
                  {item.sizes.length > 3 && (
                    <span className="text-xs text-gray-400">+{item.sizes.length - 3}</span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* ACTION BUTTONS */}
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleItemClick(item);
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-300 font-medium flex items-center justify-center gap-2"
              type="button"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Check if color is required but not selected
                if (item.colors && item.colors.length > 0 && !selectedColors[item.id]) {
                  alert('Please select a color first');
                  return;
                }
                
                addToCartProcess(item);
              }}
              disabled={item.outOfStock}
              className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                item.outOfStock
                  ? 'bg-gray-300 text-gray-500'
                  : fromEventBooking 
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                  : fromOrderProcess
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              }`}
              type="button"
            >
              {item.outOfStock 
                ? 'Out of Stock' 
                : fromEventBooking ? 'Add to Booking' 
                : fromOrderProcess ? 'Add to Order' 
                : 'Add To Cart'
              }
            </button>
          </div>
        </div>
      </div>
    ) : (
      // List View - Keep existing structure
      <>
        <div className="relative flex-shrink-0">
          <img
            src={getPrimaryImage(item)}
            alt={item.name}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=200&fit=crop';
            }}
            onClick={() => handleItemClick(item)}
          />
          <div className="absolute -top-1 -right-1">
            {item.outOfStock ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleItemClick(item)}>
                {item.name}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                {item.description}
              </p>
              
              {/* Colors and sizes in list view */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                {item.colors && item.colors.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Palette className="w-3 h-3" />
                    {selectedColors[item.id] ? (
                      <span className="font-bold text-blue-600">{selectedColors[item.id]}</span>
                    ) : (
                      <span>{item.colors.length} colors</span>
                    )}
                  </div>
                )}
                {item.sizes && item.sizes.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    <span>{item.sizes.length} sizes</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {item.outOfStock ? (
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  ) : (
                    <span className="text-green-600 font-medium">In Stock</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {item.price && (
                <div className="text-lg font-semibold text-green-600">
                  {formatPrice(item.price)}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleItemClick(item);
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm flex items-center gap-1"
                  type="button"
                >
                  <Eye className="w-4 h-4" />
                  Details
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (item.colors && item.colors.length > 0 && !selectedColors[item.id]) {
                      alert('Please select a color first');
                      return;
                    }
                    
                    addToCartProcess(item);
                  }}
                  disabled={item.outOfStock}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    item.outOfStock
                      ? 'bg-gray-300 text-gray-500'
                      : fromEventBooking 
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : fromOrderProcess
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  type="button"
                >
                  {item.outOfStock 
                    ? 'Out of Stock' 
                    : fromEventBooking ? 'Add to Booking' 
                    : fromOrderProcess ? 'Add to Order' 
                    : 'Add To Cart'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
))}

            </div>
          )}
        </div>
      </div>

      {/* Item Added Popup */}
      <ItemAddedPopup 
        isOpen={showPopup}
        onClose={handleClosePopup}
        item={selectedItem}
        category={category}
        onViewCart={handleViewCart}
        navigationSource={navigationSource}
      />

      {/* Enhanced Item Details Modal */}
      <ItemDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseModal}
        item={modalItem}
        category={category}
        onAddToCart={handleModalAddToCart}view
        navigationSource={navigationSource}
      />

      {/* Floating Chat Box Component */}
      <FloatingChatBox whatsappNumber="+2348142186524" />
    </>
  );
};

export default CategoriesPage;