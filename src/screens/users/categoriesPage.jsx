// screens/user/CategoriesPage.js - UPDATED WITH NAVIGATION SOURCE DETECTION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Package, Search, Filter } from 'lucide-react';
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

  // NEW: Detect navigation source from location state
  const navigationSource = location.state?.from || 'home'; // Default to 'home' if no source
  const fromEventBooking = navigationSource === 'eventbooking';
  const fromOrderProcess = navigationSource === 'orderprocess';
  const warehouseInfo = location.state?.warehouseInfo; // For order process

  console.log('🔍 Navigation source detected:', navigationSource);
  console.log('📍 From Event Booking:', fromEventBooking);
  console.log('📍 From Order Process:', fromOrderProcess);

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

  useEffect(() => {
    if (!category || !category.items) {
      setFilteredItems([]);
      return;
    }

    let items = [...category.items];

    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        items.sort((a, b) => {
          const priceA = parseFloat(a.price.toString().replace(/[₦\s,]/g, ''));
          const priceB = parseFloat(b.price.toString().replace(/[₦\s,]/g, ''));
          return priceA - priceB;
        });
        break;
      case 'price-high':
        items.sort((a, b) => {
          const priceA = parseFloat(a.price.toString().replace(/[₦\s,]/g, ''));
          const priceB = parseFloat(b.price.toString().replace(/[₦\s,]/g, ''));
          return priceB - priceA;
        });
        break;
      default:
        break;
    }

    setFilteredItems(items);
  }, [category, searchQuery, sortBy]);

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

  // UPDATED: Enhanced navigation logic based on source
  const navigateToCorrectScreen = (processedItem) => {
    console.log('🚀 Navigating based on source:', navigationSource);
    
    if (fromEventBooking) {
      console.log('📅 Navigating back to Event Booking');
      navigate('/eventbooking', { 
        state: { 
          selectedItem: processedItem, 
          category: category,
          fromBooking: true // Indicate we're returning to booking
        } 
      });
    } else if (fromOrderProcess) {
      console.log('📦 Navigating back to Order Process');
      navigate('/order-process', { 
        state: { 
          selectedItem: processedItem, 
          category: category,
          fromWarehouse: true,
          warehouseInfo: warehouseInfo // Pass warehouse info back
        } 
      });
    } else {
      // Default behavior - navigate to event booking for new users
      console.log('🏠 Default navigation to Event Booking');
      navigate('/eventbooking', { 
        state: { 
          selectedItem: processedItem, 
          category: category 
        } 
      });
    }
  };

  // UPDATED: Enhanced add to cart process with source-aware navigation
  const addToCartProcess = (item) => {
    console.log('🛒 Original item:', item);
    console.log('🛒 Original price:', item.price, typeof item.price);
    console.log('🛒 Navigation source:', navigationSource);
    
    let processedPrice;
    if (typeof item.price === 'string') {
      processedPrice = parseFloat(item.price.replace(/[₦\s,]/g, ''));
    } else {
      processedPrice = parseFloat(item.price);
    }
    
    if (isNaN(processedPrice) || processedPrice <= 0) {
      console.error('❌ Invalid price detected:', item.price);
      alert('Error: Invalid item price. Please contact support.');
      return;
    }
    
    const processedItem = {
      ...item,
      price: processedPrice
    };
    
    console.log('✅ Processed item price:', processedPrice);
    
    const isCartEmpty = cartItems.length === 0;
    
    // FIXED: For order process, always navigate back after adding item
    if (fromOrderProcess) {
      // Add item to cart
      dispatch(addToCart({ 
        item: processedItem,
        dates: null,
        allowDuplicates: false 
      }));
      
      // Always navigate back to order process for order flow
      console.log('📦 Navigating back to Order Process after adding item');
      navigate('/orderprocess', { 
        state: { 
          fromWarehouse: true,
          warehouseInfo: warehouseInfo,
          addedItem: processedItem // Pass added item info
        } 
      });
      return;
    }
    
    // For event booking or default behavior
    if (isCartEmpty) {
      // For empty cart, navigate directly to the appropriate screen
      navigateToCorrectScreen(processedItem);
    } else {
      // For non-empty cart, add item and show popup
      dispatch(addToCart({ 
        item: processedItem,
        dates: null,
        allowDuplicates: false 
      }));
      
      setSelectedItem(processedItem);
      setShowPopup(true);
    }
  };

  // UPDATED: Handle add to cart from modal with proper order process handling
  const handleModalAddToCart = (item) => {
    console.log('🛒 Adding to cart from modal:', item);
    console.log('🛒 Navigation source from modal:', navigationSource);
    
    // FIXED: For order process, always navigate back after adding item
    if (fromOrderProcess) {
      dispatch(addToCart({ 
        item: item,
        dates: null,
        allowDuplicates: false 
      }));
      
      handleCloseModal(); // Close modal first
      
      // Navigate back to order process
      console.log('📦 Navigating back to Order Process from modal');
      navigate('/order-process', { 
        state: { 
          fromWarehouse: true,
          warehouseInfo: warehouseInfo,
          addedItem: item // Pass added item info
        } 
      });
      return;
    }
    
    // For event booking or default behavior
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
      handleCloseModal(); // Close modal after adding to cart
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedItem(null);
  };

  // UPDATED: View cart with proper order process navigation
  const handleViewCart = () => {
    setShowPopup(false);
    setSelectedItem(null);
    
    // Navigate to the appropriate screen instead of opening cart sidebar
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
      // Default behavior - open cart sidebar
      dispatch(openCart());
    }
  };

  // UPDATED: Back button navigation with proper route
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
      navigate('/order-process', { // FIXED: Use correct route
        state: { 
          fromWarehouse: true,
          warehouseInfo: warehouseInfo 
        } 
      });
    } else {
      // Default - go back to home
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
      {/* Rectangular Hero Section */}
      <div className="relative h-80 overflow-hidden mt-20">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${category.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=600&fit=crop'})` 
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

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
              {/* NEW: Show navigation context */}
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
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredItems.length} of {category.itemCount || 0} items
            {searchQuery && (
              <span> for "{searchQuery}"</span>
            )}
            {/* NEW: Show navigation context in results */}
            {(fromEventBooking || fromOrderProcess) && (
              <span className="ml-2 text-blue-600 font-medium">
                • Adding to {fromEventBooking ? 'Event Booking' : 'Order Process'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Items Grid Section */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/50">
                    <div className="relative overflow-hidden">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'}
                        alt={item.name}
                        className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop';
                        }}
                        onClick={() => handleItemClick(item)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                        <div className="flex items-center text-green-600 font-semibold">
                          <span className="text-sm">₦</span>
                          <span className="ml-1">{formatPrice(item.price).replace('₦', '')}</span>
                        </div>
                      </div>

                      {/* NEW: Show navigation context badge */}
                      {(fromEventBooking || fromOrderProcess) && (
                        <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-sm text-white rounded-full px-2 py-1 text-xs font-medium">
                          {fromEventBooking ? '📅' : '📦'}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer"
                          onClick={() => handleItemClick(item)}>
                        {item.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleItemClick(item)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-300 font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => addToCartProcess(item)}
                          className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium ${
                            fromEventBooking 
                              ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                              : fromOrderProcess
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                        >
                          {fromEventBooking ? 'Add to Booking' : fromOrderProcess ? 'Add to Order' : 'Add To Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* UPDATED: Item Added Popup with source-aware messaging */}
      <ItemAddedPopup 
        isOpen={showPopup}
        onClose={handleClosePopup}
        item={selectedItem}
        category={category}
        onViewCart={handleViewCart}
        navigationSource={navigationSource} // Pass navigation source to popup
      />

      {/* Item Details Modal */}
      <ItemDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseModal}
        item={modalItem}
        category={category}
        onAddToCart={handleModalAddToCart}
        navigationSource={navigationSource} // Pass navigation source to modal
      />

      {/* Floating Chat Box Component */}
      <FloatingChatBox whatsappNumber="+2348142186524" />
    </>
  );
};

export default CategoriesPage;