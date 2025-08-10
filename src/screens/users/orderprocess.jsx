// screens/user/OrderProcess.js - Wrapper component for order process steps
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Package, CheckCircle, Calendar, User, CreditCard, MapPin } from 'lucide-react';
import OrderDateCustomerStep from '../../components/users/orderDateCustomerStep';
import { selectCartItems } from '../../store/slices/cart-slice';

const OrderProcess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the step from location state, default to 'categories'
  const initialStep = location.state?.step || 'categories';
  const warehouseInfo = location.state?.warehouseInfo;
  const selectedItem = location.state?.selectedItem;
  const fromWarehouse = location.state?.fromWarehouse;
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [customerInfo, setCustomerInfo] = useState({});
  const [selectedDates, setSelectedDates] = useState(null);
  const [error, setError] = useState('');
  
  // Get cart items to check if we have items
  const cartItems = useSelector(selectCartItems);
  
  console.log('📦 OrderProcess initialized with:', {
    step: initialStep,
    warehouseInfo,
    selectedItem,
    fromWarehouse,
    cartItems: cartItems.length
  });

  // Steps configuration
  const steps = [
    { key: 'categories', label: 'Browse Items', icon: Package, completed: cartItems.length > 0 },
    { key: 'order-date-customer', label: 'Date & Details', icon: Calendar, completed: false },
    { key: 'review', label: 'Review Order', icon: CheckCircle, completed: false },
    { key: 'payment', label: 'Payment', icon: CreditCard, completed: false }
  ];

  // Auto-advance to order-date-customer if we have items and coming from warehouse
  useEffect(() => {
    if (fromWarehouse && cartItems.length > 0 && currentStep === 'categories') {
      setCurrentStep('order-date-customer');
    }
  }, [fromWarehouse, cartItems.length, currentStep]);

  // Handle navigation between steps
  const handleNext = () => {
    switch (currentStep) {
      case 'categories':
        if (cartItems.length > 0) {
          setCurrentStep('order-date-customer');
        } else {
          setError('Please add at least one item to your cart');
        }
        break;
      case 'order-date-customer':
        setCurrentStep('review');
        break;
      case 'review':
        setCurrentStep('payment');
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'order-date-customer':
        navigate('/categories', { 
          state: { 
            warehouseInfo,
            fromWarehouse: true 
          } 
        });
        break;
      case 'review':
        navigate('/orderprocess', { 
          state: { 
            fromWarehouse: true,
            warehouseInfo,
            step: 'payment'
          } 
        });
        break;
      case 'payment':
        navigate('/orderprocess', { 
          state: { 
            fromWarehouse: true,
            warehouseInfo,
            step: 'review'
          } 
        });
        break;
      default:
        navigate('/categories');
        break;
    }
  };

  const handleAddMoreItems = () => {
    navigate('/categories', { 
      state: { 
        from: 'orderprocess',
        warehouseInfo: warehouseInfo
      } 
    });
  };

  const handleDateChange = (dates) => {
    console.log('📅 Date changed in OrderProcess:', dates);
    setSelectedDates(dates);
  };

  const handleCustomerInfoChange = (info) => {
    console.log('👤 Customer info changed in OrderProcess:', info);
    setCustomerInfo(info);
  };

  // Get current step index for progress indicator
  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Progress Indicator */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Back Button and Title */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </button>
            
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Order Process
            </h1>
            
            <div className="w-16 sm:w-20"> {/* Spacer for centering */}</div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const isActive = step.key === currentStep;
              const isCompleted = step.completed || index < currentStepIndex;
              const isPast = index < currentStepIndex;
              
              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center flex-1">
                    {/* Step Icon */}
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                          : isCompleted || isPast
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted || isPast ? (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                    </div>
                    
                    {/* Step Label */}
                    <span
                      className={`mt-2 text-xs sm:text-sm font-medium text-center transition-colors duration-300 ${
                        isActive
                          ? 'text-blue-600'
                          : isCompleted || isPast
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  
                  {/* Progress Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-2 sm:mx-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          index < currentStepIndex
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 w-full'
                            : 'bg-gray-200 w-0'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {currentStep === 'categories' && (
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <Package className="w-16 h-16 mx-auto text-blue-600 mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Browse Our Categories
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Start by selecting items from our premium rental collection
            </p>
            <button
              onClick={handleAddMoreItems}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Browse Categories
            </button>
          </div>
        )}

        {currentStep === 'order-date-customer' && (
          <OrderDateCustomerStep
            customerInfo={customerInfo}
            selectedDates={selectedDates}
            onDateChange={handleDateChange}
            onCustomerInfoChange={handleCustomerInfoChange}
            onNext={handleNext}
            onAddMoreItems={handleAddMoreItems}
            cartItems={cartItems}
            error={error}
            warehouseInfo={warehouseInfo}
          />
        )}

        {currentStep === 'review' && (
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Review Your Order
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Review and confirm your order details
            </p>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <p className="text-gray-600">Order review component will be implemented here</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentStep('order-date-customer')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300"
              >
                Back to Details
              </button>
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        )}

        {currentStep === 'payment' && (
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <CreditCard className="w-16 h-16 mx-auto text-purple-600 mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Payment
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Complete your order with secure payment
            </p>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <p className="text-gray-600">Payment component will be implemented here</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentStep('review')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300"
              >
                Back to Review
              </button>
              <button
                onClick={() => {
                  // Handle order completion
                  console.log('Order completed!');
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Complete Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderProcess;