import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfile } from "../../store/slices/profile-slice";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Mail,
  Truck,
  Package,
  AlertCircle,
  CheckCircle,
  Star,
  Info,
  Navigation,
  Timer,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  User,
  Building2,
} from "lucide-react";

const WarehouseInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { selectedItem, category } = location.state || {};

  const { userData, loading, error } = useSelector((state) => state.profile);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!userData && !loading && !error) {
      dispatch(fetchProfile());
    }
  }, [dispatch, userData, loading, error]);

  const warehouseInfo = {
    name: userData?.name 
      ? `${userData.name}'s Warehouse` 
      : "Event Rentals Warehouse",
    address: userData?.location || "178B Corporation Drive, Dolphin Estate, Ikoyi, Lagos",
    phone: userData?.phone || "+234 814 218 6524",
    email: userData?.email || "info@eventrentals.com",
    logo: userData?.avatar?.url || userData?.avatar || null,
    specialties: userData?.categories?.map(cat => cat.name) || [],
    services: userData?.specialize || [],
    operatingHours: {
      weekdays: "8:00 AM - 6:00 PM",
      saturday: "9:00 AM - 4:00 PM",
      sunday: "Closed",
    },
    features: [
      "Secure storage facility",
      "Quality inspection before pickup",
      "Professional packaging",
      "Easy parking access",
      "Friendly customer service",
      ...(userData?.categories?.length > 0 
        ? [`Specialized in ${userData.categories.map(c => c.name).join(', ')}`]
        : []
      ),
      ...(userData?.specialize?.length > 0 
        ? userData.specialize.map(service => `Expert ${service} services`)
        : []
      ),
    ],
  };

  const terms = [
    {
      title: "Pickup Policy",
      icon: Package,
      items: [
        "Items must be picked up during operating hours",
        "Valid ID required for pickup verification",
        "All items are inspected before release",
        "Pickup must be completed within 2 hours of scheduled time",
      ],
    },
    {
      title: "Delivery Service",
      icon: Truck,
      items: [
        "Delivery available within Lagos metropolis",
        "Delivery fees calculated based on distance",
        "Same-day delivery available for orders placed before 2 PM",
        "Customer must be present to receive delivery",
      ],
    },
    {
      title: "Payment & Deposits",
      icon: CreditCard,
      items: [
        "Refundable deposit required for all rentals",
        "Payment accepted: Cash, Transfer, Card",
        "Deposit refunded upon return of items in good condition",
        "Damage/loss costs deducted from deposit",
      ],
    },
    {
      title: "Return Policy",
      icon: ShieldCheck,
      items: [
        "Items must be returned clean and in original condition",
        "Late returns incur additional daily charges",
        "Damaged items subject to repair/replacement fees",
        "Return inspection conducted upon drop-off",
      ],
    },
  ];

  const handleContinue = () => {
    if (!acceptedTerms) {
      alert("Please accept the terms and conditions to continue.");
      return;
    }

    setIsAnimating(true);
    
    setTimeout(() => {
      navigate("/orderprocess", {
        state: {
          selectedItem,
          category,
          fromWarehouse: true,
          warehouseInfo,
        },
      });
    }, 500);
  };

  const getDirectionsUrl = () => {
    const encodedAddress = encodeURIComponent(warehouseInfo.address);
    return `https://maps.google.com/dir/?api=1&destination=${encodedAddress}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading warehouse information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 transition-opacity duration-500 ${
      isAnimating ? "opacity-0" : "opacity-100"
    }`}>
      {/* Header - Mobile Optimized */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => navigate(-1)}
                className="mr-2 sm:mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              {warehouseInfo.logo ? (
                <img
                  src={warehouseInfo.logo}
                  alt="Warehouse Logo"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg mr-2 sm:mr-3 border object-cover flex-shrink-0"
                />
              ) : userData?.name && (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg mr-2 sm:mr-3 border bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                  {warehouseInfo.name}
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm truncate">
                  Pickup location and rental terms
                </p>
              </div>
            </div>
            
            {/* Selected Item - Hidden on mobile, shown on larger screens */}
            {selectedItem && (
              <div className="hidden lg:flex items-center bg-slate-50 rounded-lg px-3 py-2 flex-shrink-0 ml-4">
                <Package className="w-4 h-4 text-slate-600 mr-2" />
                <span className="text-sm font-medium text-slate-700">
                  Selected: {selectedItem.name}
                </span>
              </div>
            )}
          </div>
          
          {/* Mobile Selected Item */}
          {selectedItem && (
            <div className="lg:hidden mt-3 pt-3 border-t">
              <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2">
                <Package className="w-4 h-4 text-slate-600 mr-2" />
                <span className="text-sm font-medium text-slate-700">
                  Selected: {selectedItem.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          
          {/* Main Warehouse Info Section */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 lg:p-8">
            <div className="flex items-center mb-4 sm:mb-6">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900 mr-3" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex-1 min-w-0">
                <span className="truncate block">{warehouseInfo.name}</span>
              </h2>
              {userData?.name && (
                <span className="ml-3 bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded flex-shrink-0">
                  Personal Warehouse
                </span>
              )}
            </div>

            {/* Specialties and Services - Mobile Optimized */}
            {(warehouseInfo.specialties.length > 0 || warehouseInfo.services.length > 0) && (
              <div className="mb-6 space-y-4">
                {warehouseInfo.specialties.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Categories:</h3>
                    <div className="flex flex-wrap gap-2">
                      {warehouseInfo.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="bg-slate-100 text-slate-700 text-xs font-medium px-2 sm:px-3 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {warehouseInfo.services.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Specializations:</h3>
                    <div className="flex flex-wrap gap-2">
                      {warehouseInfo.services.map((service, index) => (
                        <span
                          key={index}
                          className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2 sm:px-3 py-1 rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact and Hours Grid - Responsive */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-4 sm:space-y-6">
                {/* Contact Information */}
                <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Contact Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mt-1 mr-3 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-slate-900 break-words">{warehouseInfo.address}</p>
                        {userData?.location }
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="w-4 h-4 mt-1 mr-3 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500">Phone</p>
                        <a 
                          href={`tel:${warehouseInfo.phone}`}
                          className="font-medium text-slate-900 hover:text-slate-700 break-all"
                        >
                          {warehouseInfo.phone}
                        </a>
                        {userData?.phone }
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Mail className="w-4 h-4 mt-1 mr-3 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500">Email</p>
                        <a 
                          href={`mailto:${warehouseInfo.email}`}
                          className="font-medium text-slate-900 hover:text-slate-700 break-all"
                        >
                          {warehouseInfo.email}
                        </a>
                        {userData?.email }
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <a
                      href={getDirectionsUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-slate-900 hover:text-slate-700 font-medium text-sm"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </a>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Operating Hours
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Monday - Friday:</span>
                      <span className="font-medium text-slate-900 text-right">{warehouseInfo.operatingHours.weekdays}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Saturday:</span>
                      <span className="font-medium text-slate-900 text-right">{warehouseInfo.operatingHours.saturday}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Sunday:</span>
                      <span className="font-medium text-slate-900 text-right">{warehouseInfo.operatingHours.sunday}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Warehouse Features */}
                <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Warehouse Features
                  </h3>
                  
                  <div className="space-y-2">
                    {warehouseInfo.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-slate-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

           
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 lg:p-8">
            <div className="flex items-center mb-4 sm:mb-6">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900 mr-3" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Terms & Conditions
              </h2>
            </div>

            {/* Terms Grid - Mobile Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {terms.map((section, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <section.icon className="w-5 h-5 mr-2 text-slate-700 flex-shrink-0" />
                    <h3 className="font-semibold text-slate-900">{section.title}</h3>
                  </div>
                  
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-slate-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Additional Information */}
            <div className="mt-6 sm:mt-8 bg-slate-50 rounded-lg p-4 sm:p-6">
              <div className="flex items-center mb-4">
                <Timer className="w-5 h-5 mr-2 text-slate-700" />
                <h3 className="font-semibold text-slate-900">Additional Information</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm text-slate-700">
                <div>
                  <h4 className="font-medium mb-1">Rental Duration</h4>
                  <p>Daily rates apply. Multi-day discounts available for extended rentals.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Cancellation Policy</h4>
                  <p>Free cancellation up to 24 hours before pickup time.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Security Deposit</h4>
                  <p>Deposit amount varies by item value and rental duration.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Quality Guarantee</h4>
                  <p>All items are professionally cleaned and inspected before rental.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accept Terms and Continue - Mobile Optimized */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 lg:p-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-slate-900 focus:ring-slate-500 border-gray-300 rounded flex-shrink-0"
                />
                <label htmlFor="acceptTerms" className="text-slate-700 text-sm sm:text-base">
                  I have read and agree to the terms and conditions, pickup policy, and rental agreement for{" "}
                  <span className="font-semibold text-slate-900">{warehouseInfo.name}</span>.
                </label>
              </div>
              
              <div className="flex justify-center sm:justify-end pt-2">
                <button
                  onClick={handleContinue}
                  disabled={!acceptedTerms}
                  className={`w-full sm:w-auto flex items-center justify-center px-6 sm:px-8 py-3 rounded-lg transition-all duration-200 font-semibold text-sm ${
                    acceptedTerms
                      ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span>Continue to Order</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseInfoPage;