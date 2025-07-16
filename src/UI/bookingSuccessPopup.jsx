import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  Phone, 
  MessageCircle, 
  X,
  Calendar,
  User,
  Star,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingSuccessPopup = ({ isOpen, onClose, bookingId, customerInfo }) => {
  const navigate = useNavigate();
  
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full mx-4 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-green-500 to-blue-500 rounded-t-3xl p-4 text-white">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white hover:text-gray-200 transition-colors duration-200 bg-white bg-opacity-20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full p-2 inline-block mb-2">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-1">Booking Submitted Successfully!</h2>
                <p className="text-green-100 text-sm">
                  Thank you for choosing our services
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Booking ID */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6 border border-blue-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Your Booking Reference</p>
                  <p className="text-xl font-bold text-gray-800 font-mono">
                    #{bookingId || 'BK' + Date.now().toString().slice(-6)}
                  </p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Review Status */}
                <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                  <div className="flex items-center mb-3">
                    <div className="bg-yellow-100 rounded-full p-2 mr-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Under Review</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Your booking is currently being reviewed by our admin team. We'll carefully 
                    assess your requirements and prepare a customized service plan for your event.
                  </p>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                    What Happens Next:
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Review within 2-4 hours</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Contact via preferred method</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Discuss final details & confirmation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  We'll Contact You Soon Via:
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <Mail className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Email</p>
                      <p className="text-sm text-gray-600">{customerInfo?.email || 'Your registered email'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <MessageCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">WhatsApp</p>
                      <p className="text-sm text-gray-600">{customerInfo?.phone || 'Your registered phone'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <Phone className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Direct Call</p>
                      <p className="text-sm text-gray-600">Personal consultation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Message */}
              <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-sm text-gray-600">
                  Thank you for trusting us with your special event. We're committed to making it memorable!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 rounded-b-3xl p-4 text-center border-t border-gray-200">
              <button
                onClick={() => {
                  onClose();
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingSuccessPopup;