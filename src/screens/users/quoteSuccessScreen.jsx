// screens/user/QuoteSuccessScreen.js - Quote Submission Success Page
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Mail,
  Phone,
  FileText,
  Home,
  Package,
  Calendar,
  Users,
  Star,
  ArrowRight
} from 'lucide-react';

const QuoteSuccessScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get quote data from location state
  const quoteData = location.state?.quoteData;
  const message = location.state?.message || 'Your quote request has been submitted successfully!';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // If no quote data, redirect to home
  useEffect(() => {
    if (!quoteData) {
      navigate('/', { replace: true });
    }
  }, [quoteData, navigate]);

  if (!quoteData) {
    return null; // Will redirect
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Quote Request Submitted!
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {message}
            </p>
          </div>

          {/* Quote Summary Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden mb-8">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                    <FileText className="w-6 h-6 mr-2" />
                    Quote Request Details
                  </h2>
                  <p className="text-emerald-100 mt-1">
                    Reference ID: QR-{Date.now().toString().slice(-8)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-100 text-sm">Submitted</p>
                  <p className="font-semibold">
                    {new Date(quoteData.requestedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
              {/* Category Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Category</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-800">{quoteData.categoryName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {quoteData.totalItems} item{quoteData.totalItems !== 1 ? 's' : ''} requested
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Requested Items</h3>
                <div className="space-y-3">
                  {quoteData.items.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=80&h=80&fit=crop'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=80&h=80&fit=crop';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">Qty: {item.quantity}</p>
                        <p className="text-xs text-emerald-600 font-medium">Custom pricing</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-blue-600" />
              What Happens Next?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Review Process</h3>
                <p className="text-sm text-gray-600">
                  Our team will review your request and prepare a detailed quote
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-emerald-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Custom Pricing</h3>
                <p className="text-sm text-gray-600">
                  We'll calculate pricing based on your specific needs and duration
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Response</h3>
                <p className="text-sm text-gray-600">
                  You'll receive your detailed quote within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-xl text-white p-6 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Questions About Your Quote?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Call Us</h3>
                  <p className="text-gray-300">+234 814 218 6524</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Email Us</h3>
                  <p className="text-gray-300">quotes@company.com</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-gray-300">
                💡 <strong>Pro Tip:</strong> Save this page or take a screenshot of your reference ID for easy tracking.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            
            <button
              onClick={() => navigate('/request-quote')}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-200 flex items-center justify-center"
            >
              <Package className="w-5 h-5 mr-2" />
              Request Another Quote
            </button>
            
            <button
              onClick={() => navigate('/smartcategory')}
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Browse All Categories
            </button>
          </div>

          {/* Additional Info Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">24-Hour Response</h3>
              <p className="text-sm text-gray-600">
                We guarantee a response to all quote requests within 24 hours during business days.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Best Prices</h3>
              <p className="text-sm text-gray-600">
                Our quotes are competitive and tailored to your specific event requirements.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Expert Support</h3>
              <p className="text-sm text-gray-600">
                Our experienced team will help you plan the perfect event with professional advice.
              </p>
            </div>
          </div>

          {/* Footer Message */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-emerald-100 to-blue-100 rounded-xl p-6 border border-emerald-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Thank You for Choosing Us! 🎉
              </h3>
              <p className="text-gray-600">
                We're excited to help make your event unforgettable. Our team is already working on your custom quote!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-30px,0);
          }
          70% {
            transform: translate3d(0,-15px,0);
          }
          90% {
            transform: translate3d(0,-4px,0);
          }
        }

        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Enhanced responsive design */
        @media (max-width: 480px) {
          .text-3xl { font-size: 1.5rem; }
          .text-4xl { font-size: 1.875rem; }
          .text-5xl { font-size: 2.25rem; }
        }

        /* Success animation */
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-scale {
          animation: fadeInScale 0.6s ease-out forwards;
        }

        /* Hover effects for cards */
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
};

export default QuoteSuccessScreen;