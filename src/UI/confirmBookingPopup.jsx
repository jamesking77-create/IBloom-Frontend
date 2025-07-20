// components/ConfirmBookingPopup.jsx
import React, { useState, useEffect } from 'react';
import { Check, X, Home, Mail, MessageCircle } from 'lucide-react';

const ConfettiPiece = ({ delay, duration, startX, color }) => (
  <div
    className="absolute w-2 h-2 opacity-80"
    style={{
      left: `${startX}%`,
      backgroundColor: color,
      animation: `confettiFall ${duration}s ease-out ${delay}s forwards`,
      transform: 'translateY(-100vh)',
    }}
  />
);

const ConfirmBookingPopup = ({ 
  bookingId,
  onClose, 
  onBackToHome 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  const confettiColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
    '#dda0dd', '#98d8c8', '#ff7675', '#74b9ff', '#00b894'
  ];

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    startX: Math.random() * 100,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
  }));

  useEffect(() => {
    // Start confetti immediately when component mounts
    setShowConfetti(true);
    // Stop confetti after 4 seconds
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes modalSlideIn {
          0% {
            opacity: 0;
            transform: scale(0.7) translateY(-50px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes checkBounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        .modal-enter {
          animation: modalSlideIn 0.5s ease-out forwards;
        }
        
        .check-bounce {
          animation: checkBounce 2s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-4">
        
        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
            {confettiPieces.map((piece) => (
              <ConfettiPiece
                key={piece.id}
                delay={piece.delay}
                duration={piece.duration}
                startX={piece.startX}
                color={piece.color}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 modal-enter relative overflow-hidden z-50">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Content */}
          <div className="p-6 sm:p-8 text-center">
            
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg check-bounce">
                <Check className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Main Message */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Booking Created!
            </h2>
            
            <p className="text-lg text-green-600 font-semibold mb-4">
              Thank you for trusting Ibloom Rentals services!
            </p>

            {/* Booking ID */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-600">Booking ID</p>
              <p className="text-lg font-mono font-semibold text-gray-800">{bookingId}</p>
            </div>

            {/* Status Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></div>
                Under Review
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Your booking is currently under review. You will receive a response with your invoice and confirmation within the next 24 hours.
              </p>
              
              <div className="flex items-center text-sm text-blue-600 space-x-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  <span>Email</span>
                </div>
                <div className="flex items-center opacity-70">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  <span>WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onBackToHome}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Homepage
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
              >
                Continue Browsing
              </button>
            </div>

            {/* Footer note */}
            <p className="text-xs text-gray-500 mt-4">
              Check your email regularly for updates
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmBookingPopup;