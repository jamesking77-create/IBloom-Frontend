// components/FloatingChatBox.js
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, User, Mail, Zap, CheckCircle } from 'lucide-react';

const FloatingChatBox = ({ 
  adminEmail = "admin@yourcompany.com", 
  companyName = "Your Company",
  emailServiceUrl = "/api/send-email" // Your backend endpoint
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const chatBoxRef = useRef(null);
  const nameInputRef = useRef(null);

  // Focus on name input when chat opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimizing(false);
    setSubmitSuccess(false);
    setSubmitError('');
  };

  const handleClose = () => {
    setIsMinimizing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsMinimizing(false);
      setSubmitSuccess(false);
      setSubmitError('');
    }, 200);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (submitError) {
      setSubmitError('');
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setSubmitError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Example API call - replace with your actual email service
      const response = await fetch(emailServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: adminEmail,
          subject: `New Message from ${formData.name} - ${companyName} Website`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">New Contact Message</h2>
              
              <div style="margin: 20px 0;">
                <h3 style="color: #4F46E5; margin-bottom: 10px;">Contact Information:</h3>
                <p><strong>Name:</strong> ${formData.name}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
              </div>
              
              <div style="margin: 20px 0;">
                <h3 style="color: #4F46E5; margin-bottom: 10px;">Message:</h3>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #4F46E5;">
                  ${formData.message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
                <p>This message was sent from your ${companyName} website contact form.</p>
                <p>Sent on: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          `,
          from: {
            name: formData.name,
            email: formData.email
          }
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // Reset form after success
        setTimeout(() => {
          setFormData({ name: '', email: '', message: '' });
          handleClose();
        }, 3000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          
          @keyframes slideInUp {
            from { 
              transform: translateY(100%) scale(0.8); 
              opacity: 0; 
            }
            to { 
              transform: translateY(0) scale(1); 
              opacity: 1; 
            }
          }
          
          @keyframes slideOutDown {
            from { 
              transform: translateY(0) scale(1); 
              opacity: 1; 
            }
            to { 
              transform: translateY(100%) scale(0.8); 
              opacity: 0; 
            }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          @keyframes bounce-in {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .pulse-ring::before {
            content: '';
            position: absolute;
            inset: -4px;
            border: 2px solid rgba(59, 130, 246, 0.5);
            border-radius: 50%;
            animation: pulse-ring 2s infinite;
          }
          
          .slide-in-up {
            animation: slideInUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          .slide-out-down {
            animation: slideOutDown 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19);
          }
          
          .shimmer-button {
            background: linear-gradient(
              90deg,
              rgba(59, 130, 246, 1) 0%,
              rgba(147, 51, 234, 1) 25%,
              rgba(59, 130, 246, 1) 50%,
              rgba(147, 51, 234, 1) 75%,
              rgba(59, 130, 246, 1) 100%
            );
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }
          
          .bounce-in {
            animation: bounce-in 0.6s ease-out;
          }
          
          .glass-morphism {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .input-glow:focus {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            border-color: rgba(59, 130, 246, 0.5);
          }
          
          .error-shake {
            animation: shake 0.5s ease-in-out;
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}
      </style>

      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleOpen}
            className="relative group animate-float pulse-ring bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110"
          >
            <MessageCircle className="w-6 h-6" />
            
            {/* Notification Badge */}
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              1
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                Send us a message
                <div className="absolute top-full right-4 w-2 h-2 bg-gray-800 transform rotate-45"></div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div 
          ref={chatBoxRef}
          className={`fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] z-50 ${
            isMinimizing ? 'slide-out-down' : 'slide-in-up'
          }`}
        >
          <div className="glass-morphism rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Contact Us</h3>
                    <p className="text-sm text-blue-100">We'll get back to you soon!</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {submitSuccess ? (
                <div className="text-center py-8 bounce-in">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Message Sent!</h3>
                  <p className="text-gray-600">Thank you for reaching out. We'll respond within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-center mb-6">
                    <p className="text-gray-600">
                      Send us a message and we'll get back to you as soon as possible!
                    </p>
                  </div>

                  {/* Error Message */}
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 error-shake">
                      <p className="text-red-600 text-sm">{submitError}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Name Input */}
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                      <input
                        ref={nameInputRef}
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your Name"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none input-glow transition-all duration-200 placeholder-gray-400"
                      />
                    </div>

                    {/* Email Input */}
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Your Email Address"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none input-glow transition-all duration-200 placeholder-gray-400"
                      />
                    </div>

                    {/* Message Input */}
                    <div className="relative">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="How can we help you today?"
                        required
                        rows="4"
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none input-glow transition-all duration-200 placeholder-gray-400 resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.name.trim() || !formData.email.trim() || !formData.message.trim()}
                    className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : formData.name.trim() && formData.email.trim() && formData.message.trim()
                        ? 'shimmer-button hover:shadow-xl'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  {/* Footer */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500">
                      We respect your privacy and will never share your information
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatBox;