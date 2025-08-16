// components/FloatingChatBox.js
import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { get, post } from "../utils/api";
import {
  MessageCircle,
  Send,
  X,
  User,
  Mail,
  Zap,
  CheckCircle,
  Move,
} from "lucide-react";

const FloatingChatBox = ({ emailServiceUrl = "/api/mailer/send-email" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({
    x: typeof window !== "undefined" ? window.innerWidth - 120 : 0,
    y: typeof window !== "undefined" ? window.innerHeight - 120 : 0,
  });

  const chatBoxRef = useRef(null);
  const nameInputRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, time: 0 });
  const hasDraggedRef = useRef(false);

  const { userData } = useSelector((state) => state.profile);

  // Get admin email and company name from Redux, with fallbacks
  const adminEmail = userData?.email || "adeoyemayopoelijah@gmail.com";
  const companyName = userData?.name || "IBLOOM";

  // Get viewport dimensions for mobile responsiveness
  const getViewportDimensions = () => {
    if (typeof window === "undefined") return { width: 0, height: 0 };
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  // Focus on name input when chat opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Handle window resize to keep chat box in bounds
  useEffect(() => {
    const handleResize = () => {
      const { width, height } = getViewportDimensions();
      const chatBoxWidth = isOpen ? Math.min(384, width - 32) : 80; // 384px max width with 16px margin on each side
      const chatBoxHeight = isOpen ? Math.min(600, height - 100) : 80;

      setPosition((prev) => ({
        x: Math.min(prev.x, width - chatBoxWidth),
        y: Math.min(prev.y, height - chatBoxHeight),
      }));
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      handleResize(); // Call once on mount
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, [isOpen]);

  // Handle click outside to close (only when not dragging)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignore if we're dragging or if it's the floating button itself
      if (
        chatBoxRef.current &&
        !chatBoxRef.current.contains(event.target) &&
        !isDragging &&
        isOpen &&
        !event.target.closest("[data-floating-button]")
      ) {
        handleClose();
      }
    };

    if (isOpen && !isDragging) {
      // Small delay to prevent immediate closing on mobile
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
      }, 300);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }
  }, [isOpen, isDragging]);

  // Simple click handler for button - prevent double events on mobile
  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging && !hasDraggedRef.current && !isOpen) {
      handleOpen();
    }
  };

  // Touch-specific click handler to prevent conflicts
  const handleButtonTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging && !hasDraggedRef.current && !isOpen) {
      handleOpen();
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    // Don't start drag on form elements or close button
    if (
      e.target.closest("input") ||
      e.target.closest("textarea") ||
      e.target.closest('button[type="submit"]') ||
      e.target.closest("[data-close-button]")
    ) {
      return;
    }

    setIsDragging(false); // Start with false
    hasDraggedRef.current = false;

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };

    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });

    // Add event listeners immediately
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    // Check if user has actually dragged (moved more than 3px)
    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartRef.current.x, 2) +
        Math.pow(e.clientY - dragStartRef.current.y, 2)
    );

    if (dragDistance > 3 && !hasDraggedRef.current) {
      setIsDragging(true);
      hasDraggedRef.current = true;
    }

    if (hasDraggedRef.current) {
      e.preventDefault();

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep within screen bounds
      const { width, height } = getViewportDimensions();
      const chatBoxWidth = isOpen ? Math.min(384, width - 32) : 80;
      const chatBoxHeight = isOpen ? Math.min(600, height - 100) : 80;

      setPosition({
        x: Math.max(16, Math.min(newX, width - chatBoxWidth - 16)),
        y: Math.max(16, Math.min(newY, height - chatBoxHeight - 16)),
      });
    }
  };

  const handleMouseUp = (e) => {
    // Clean up event listeners
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    // If it was just a click (no drag), open the chat
    if (!hasDraggedRef.current && !isOpen) {
      handleOpen();
    }

    setIsDragging(false);
    hasDraggedRef.current = false;
  };

  // Touch drag handlers for mobile
  const handleTouchStart = (e) => {
    // Don't start drag on form elements or close button
    if (
      e.target.closest("input") ||
      e.target.closest("textarea") ||
      e.target.closest('button[type="submit"]') ||
      e.target.closest("[data-close-button]")
    ) {
      return;
    }

    const touch = e.touches[0];
    setIsDragging(false); // Start with false
    hasDraggedRef.current = false;

    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    setDragOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });

    // Add event listeners immediately
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];

    // Check if user has actually dragged
    const dragDistance = Math.sqrt(
      Math.pow(touch.clientX - dragStartRef.current.x, 2) +
        Math.pow(touch.clientY - dragStartRef.current.y, 2)
    );

    if (dragDistance > 8 && !hasDraggedRef.current) {
      // Slightly higher threshold for touch
      setIsDragging(true);
      hasDraggedRef.current = true;
      e.preventDefault(); // Prevent scrolling only when actually dragging
    }

    if (hasDraggedRef.current) {
      e.preventDefault();

      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;

      const { width, height } = getViewportDimensions();
      const chatBoxWidth = isOpen ? Math.min(384, width - 32) : 80;
      const chatBoxHeight = isOpen ? Math.min(600, height - 100) : 80;

      setPosition({
        x: Math.max(16, Math.min(newX, width - chatBoxWidth - 16)),
        y: Math.max(16, Math.min(newY, height - chatBoxHeight - 16)),
      });
    }
  };

  const handleTouchEnd = (e) => {
    // Clean up event listeners
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);

    // If it was just a tap (no drag), open the chat
    if (!hasDraggedRef.current && !isOpen) {
      e.preventDefault(); // Prevent mouse events from firing
      e.stopPropagation();
      handleOpen();
    }

    setIsDragging(false);
    hasDraggedRef.current = false;
  };

  // Remove the complex global event listener effect
  // The new approach handles events directly in the mouse/touch handlers

  const handleOpen = () => {
    if (isDragging || hasDraggedRef.current) return;
    setIsOpen(true);
    setIsMinimizing(false);
    setSubmitSuccess(false);
    setSubmitError("");
  };

  const handleClose = () => {
    setIsMinimizing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsMinimizing(false);
      setSubmitSuccess(false);
      setSubmitError("");
    }, 200);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (submitError) {
      setSubmitError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const payload = {
        to: adminEmail,
        subject: `New Contact Message from ${formData.name}`,
        html: `
        <h2 style="color: #333333; margin-bottom: 20px;">Hello ${companyName},</h2>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Message:</strong> ${formData.message}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `,
        from: {
          name: formData.name.trim(),
          email: formData.email.trim(),
        },
      };

      console.log("Sending payload:", payload); // Debug log

      const response = await post(emailServiceUrl, payload);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError(error.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate responsive dimensions
  const { width: viewportWidth } = getViewportDimensions();
  const isMobile = viewportWidth < 768;
  const chatBoxWidth = Math.min(384, viewportWidth - 32);

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.4); opacity: 0; }
          }
          
          @keyframes slideInUp {
            from { 
              transform: translateY(100%) scale(0.9); 
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
              transform: translateY(100%) scale(0.9); 
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
            animation: float 2.5s ease-in-out infinite;
          }
          
          .pulse-ring::before {
            content: '';
            position: absolute;
            inset: -3px;
            border: 2px solid rgba(59, 130, 246, 0.4);
            border-radius: 50%;
            animation: pulse-ring 2s infinite;
          }
          
          .slide-in-up {
            animation: slideInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.175);
          }
          
          .slide-out-down {
            animation: slideOutDown 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19);
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
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
          }
          
          .input-glow:focus {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.5);
          }
          
          .error-shake {
            animation: shake 0.5s ease-in-out;
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            75% { transform: translateX(3px); }
          }
          
          .draggable {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            touch-action: none;
          }
          
          .dragging {
            cursor: grabbing !important;
          }
          
          .drag-handle {
            cursor: grab;
          }
          
          .drag-handle:active {
            cursor: grabbing;
          }

          @media (max-width: 768px) {
            .mobile-safe-area {
              padding-bottom: env(safe-area-inset-bottom);
            }
          }
        `}
      </style>

      {/* Floating Chat Button */}
      {!isOpen && (
        <div
          className="fixed z-50 draggable"
          data-floating-button="true"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <button
            onClick={!isMobile ? handleButtonClick : undefined}
            onTouchEnd={isMobile ? handleButtonTouch : undefined}
            className={`relative group pulse-ring bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white ${
              isMobile ? "p-3" : "p-4"
            } rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
              !isDragging ? "animate-float" : ""
            }`}
          >
            <MessageCircle className={`${isMobile ? "w-5 h-5" : "w-6 h-6"}`} />

            {/* Notification Badge */}
            <div
              className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full ${
                isMobile ? "w-5 h-5" : "w-6 h-6"
              } flex items-center justify-center animate-bounce font-bold`}
            >
              1
            </div>

            {/* Tooltip - Hidden on mobile */}
            {!isMobile && (
              <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                  Send us a message • Drag to move
                  <div className="absolute top-full right-4 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                </div>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div
          ref={chatBoxRef}
          className={`fixed z-50 draggable ${
            isMinimizing ? "slide-out-down" : "slide-in-up"
          } ${isDragging ? "dragging" : ""}`}
          style={{
            left: `${Math.min(
              position.x,
              viewportWidth - chatBoxWidth - 16
            )}px`,
            top: `${position.y}px`,
            width: `${chatBoxWidth}px`,
            maxHeight: isMobile ? "85vh" : "600px",
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="glass-morphism rounded-2xl shadow-2xl overflow-hidden mobile-safe-area">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 sm:p-4 text-white relative overflow-hidden drag-handle">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div
                    className={`${
                      isMobile ? "w-8 h-8" : "w-10 h-10"
                    } bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0`}
                  >
                    <Mail className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`font-semibold ${
                        isMobile ? "text-sm" : "text-base"
                      } truncate`}
                    >
                      Contact Us
                    </h3>
                    <p
                      className={`${
                        isMobile ? "text-xs" : "text-sm"
                      } text-blue-100 truncate`}
                    >
                      We'll get back to you soon!
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  {!isMobile && (
                    <div className="w-6 h-6 text-white/60 flex items-center justify-center">
                      <Move className="w-4 h-4" />
                    </div>
                  )}
                  <button
                    onClick={handleClose}
                    data-close-button="true"
                    className={`${
                      isMobile ? "w-7 h-7" : "w-8 h-8"
                    } bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0`}
                  >
                    <X className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div
              className={`${isMobile ? "p-4" : "p-6"} overflow-y-auto`}
              style={{ maxHeight: isMobile ? "calc(85vh - 60px)" : "540px" }}
            >
              {submitSuccess ? (
                <div className="text-center py-6 sm:py-8 bounce-in">
                  <div
                    className={`${
                      isMobile ? "w-12 h-12" : "w-16 h-16"
                    } bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}
                  >
                    <CheckCircle
                      className={`${
                        isMobile ? "w-6 h-6" : "w-8 h-8"
                      } text-green-600`}
                    />
                  </div>
                  <h3
                    className={`${
                      isMobile ? "text-base" : "text-lg"
                    } font-semibold text-gray-800 mb-2`}
                  >
                    Message Sent!
                  </h3>
                  <p
                    className={`${
                      isMobile ? "text-sm" : "text-base"
                    } text-gray-600`}
                  >
                    Thank you for reaching out. We'll respond within 24 hours.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className={`space-y-${isMobile ? "3" : "4"}`}
                >
                  <div className="text-center mb-4 sm:mb-6">
                    <p
                      className={`${
                        isMobile ? "text-sm" : "text-base"
                      } text-gray-600`}
                    >
                      Send us a message and we'll get back to you as soon as
                      possible!
                    </p>
                  </div>

                  {/* Error Message */}
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 error-shake">
                      <p
                        className={`text-red-600 ${
                          isMobile ? "text-sm" : "text-base"
                        }`}
                      >
                        {submitError}
                      </p>
                    </div>
                  )}

                  <div className={`space-y-${isMobile ? "3" : "4"}`}>
                    {/* Name Input */}
                    <div className="relative group">
                      <User
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          isMobile ? "w-4 h-4" : "w-5 h-5"
                        } text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200`}
                      />
                      <input
                        ref={nameInputRef}
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your Name"
                        required
                        className={`w-full ${
                          isMobile
                            ? "pl-9 pr-3 py-2.5 text-sm"
                            : "pl-10 pr-4 py-3 text-base"
                        } bg-gray-50 border border-gray-200 rounded-xl focus:outline-none input-glow transition-all duration-200 placeholder-gray-400`}
                      />
                    </div>

                    {/* Email Input */}
                    <div className="relative group">
                      <Mail
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          isMobile ? "w-4 h-4" : "w-5 h-5"
                        } text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200`}
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Your Email Address"
                        required
                        className={`w-full ${
                          isMobile
                            ? "pl-9 pr-3 py-2.5 text-sm"
                            : "pl-10 pr-4 py-3 text-base"
                        } bg-gray-50 border border-gray-200 rounded-xl focus:outline-none input-glow transition-all duration-200 placeholder-gray-400`}
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
                        rows={isMobile ? "3" : "4"}
                        className={`w-full ${
                          isMobile ? "p-3 text-sm" : "p-4 text-base"
                        } bg-gray-50 border border-gray-200 rounded-xl focus:outline-none input-glow transition-all duration-200 placeholder-gray-400 resize-none`}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !formData.name.trim() ||
                      !formData.email.trim() ||
                      !formData.message.trim()
                    }
                    className={`w-full ${
                      isMobile ? "py-2.5" : "py-3"
                    } rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : formData.name.trim() &&
                          formData.email.trim() &&
                          formData.message.trim()
                        ? "shimmer-button hover:shadow-xl"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div
                          className={`${
                            isMobile ? "w-4 h-4" : "w-5 h-5"
                          } border-2 border-white/30 border-t-white rounded-full animate-spin`}
                        ></div>
                        <span className={isMobile ? "text-sm" : "text-base"}>
                          Sending...
                        </span>
                      </>
                    ) : (
                      <>
                        <Send
                          className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`}
                        />
                        <span className={isMobile ? "text-sm" : "text-base"}>
                          Send Message
                        </span>
                      </>
                    )}
                  </button>

                  {/* Footer */}
                  <div className="text-center pt-2">
                    <p
                      className={`${
                        isMobile ? "text-xs" : "text-sm"
                      } text-gray-500`}
                    >
                      We respect your privacy and will never share your
                      information
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
