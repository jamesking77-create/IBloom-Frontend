import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronDown,
  Quote,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Menu,
  X,
  Home,
  Info,
  HelpCircle,
  Image as ImageIcon,
  PhoneCall,
  ShoppingCart,
  Package,
  Calendar,
} from "lucide-react";
import {
  fetchProfile,
  fetchPublicProfile,
} from "../../store/slices/profile-slice";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import logoimg from "../../assets/ibloomcut.png";
import fullLogo from "../../assets/ibloomcut.png";

const UserLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRentalsDropdownOpen, setIsRentalsDropdownOpen] = useState(false);

  // Local state for profile data with fallbacks
  const [profileData, setProfileData] = useState({
    name: "IBLOOM",
    bio: "Your premier destination for event rentals. Making every occasion extraordinary.",
    phone: "0817-225-8085",
    email: "adeoyemayopoelijah@gmail.com",
    location: "85B, Lafiaji Way, Dolphin Estate",
    specialize: [],
    categories: [],
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get profile data from Redux store
  const { userData, loading, isPublicData } = useSelector(
    (state) => state.profile
  );
  const { categories } = useSelector((state) => state.categories);

  useEffect(() => {
    console.log("=== PROFILE DATA DEBUG ===");
    console.log("userData from Redux:", userData);
    console.log("categories from Redux:", categories);
    console.log("profileData state:", profileData);
    console.log("loading:", loading);
    console.log("isPublicData:", isPublicData);
    console.log("=========================");
  }, [userData, categories, profileData, loading, isPublicData]);

  // Load profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        console.log("UserLayout: Loading profile data...");

        // Try authenticated profile first, with automatic public fallback
        await dispatch(
          fetchProfile({
            fallbackToPublic: true,
            useCache: true,
          })
        ).unwrap();

        // Also fetch categories
        await dispatch(fetchCategories()).unwrap();

        console.log("UserLayout: Profile data loaded successfully");
      } catch (error) {
        console.warn(
          "UserLayout: Profile fetch failed, trying public profile directly:",
          error
        );

        // If the automatic fallback didn't work, try public profile directly
        try {
          await dispatch(fetchPublicProfile({ useCache: true })).unwrap();
          console.log("UserLayout: Public profile loaded successfully");
        } catch (publicError) {
          console.warn(
            "UserLayout: Public profile fetch also failed:",
            publicError
          );
          // Will use fallback data from useState
        }
      }
    };

    loadProfileData();
  }, [dispatch]);

  // Update local profile state whenever Redux userData changes
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      console.log("UserLayout: Updating local profile state with:", userData);
      setProfileData((prevData) => ({
        ...prevData,
        name: userData.name || prevData.name,
        bio: userData.bio || prevData.bio,
        phone: userData.phone || prevData.phone,
        email: userData.email || prevData.email,
        location: userData.location || prevData.location,
        specialize: userData.specialize || prevData.specialize,
        categories: userData.categories || categories || prevData.categories,
      }));
    }
  }, [userData, categories]);

  // Handle scroll behavior for navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategorySelect = (category) => {
    navigate(`/category/${category.id}`, { state: { category } });
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsRentalsDropdownOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(".dropdown-container")) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navigationLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/about", label: "About Us", icon: Info },
    { to: "/faq", label: "FAQ", icon: HelpCircle },
    { to: "/gallery", label: "Gallery", icon: ImageIcon },
    { to: "/contact", label: "Contact", icon: PhoneCall },
  ];

  return (
    <div className="min-h-screen bg-gray-200">
      <style>
        {`
          /* Professional Mobile Menu Animations */
          @keyframes slideInRight {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideOutRight {
            0% {
              transform: translateX(0);
              opacity: 1;
            }
            100% {
              transform: translateX(100%);
              opacity: 0;
            }
          }

          @keyframes fadeInUp {
            0% {
              transform: translateY(20px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes fadeOutDown {
            0% {
              transform: translateY(0);
              opacity: 1;
            }
            100% {
              transform: translateY(20px);
              opacity: 0;
            }
          }

          .mobile-menu-enter {
            animation: slideInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }

          .mobile-menu-exit {
            animation: slideOutRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }

          .menu-item-enter {
            animation: fadeInUp 0.4s ease-out forwards;
          }

          .menu-item-exit {
            animation: fadeOutDown 0.2s ease-in forwards;
          }

          /* Staggered animation delays */
          .menu-item-0 { animation-delay: 0.05s; }
          .menu-item-1 { animation-delay: 0.1s; }
          .menu-item-2 { animation-delay: 0.15s; }
          .menu-item-3 { animation-delay: 0.2s; }
          .menu-item-4 { animation-delay: 0.25s; }
          .menu-item-5 { animation-delay: 0.3s; }
          .menu-item-6 { animation-delay: 0.35s; }

          /* Custom scrollbar */
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(243, 244, 246, 0.5);
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.6);
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.8);
          }

          /* Enhanced backdrop */
          .professional-backdrop {
            backdrop-filter: blur(20px) saturate(150%);
            background: rgba(255, 255, 255, 0.95);
          }

          /* Hamburger animation */
          .hamburger-line {
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transform-origin: center;
          }
        `}
      </style>

      {/* Desktop Navigation - Hidden on mobile */}
      <nav className="hidden md:block fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-700 ease-out">
        {/* Expanded Nav (Default State) */}
        <div
          className={`bg-gray-200/80 backdrop-blur-lg rounded-full px-16 py-4 shadow-xl border border-gray-200/50 transition-all duration-700 ease-out w-[75vw] max-w-none ${
            isScrolled
              ? "opacity-0 scale-90 translate-y-2 pointer-events-none"
              : "opacity-100 scale-100 translate-y-0"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            {/* Left Navigation Links */}
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium"
              >
                Home
              </Link>

              {/* Rentals Dropdown */}
              <div className="relative dropdown-container">
                <button
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  Rentals{" "}
                  <ChevronDown
                    className={`ml-1 w-4 h-4 transition-transform duration-300 ${
                      isMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-72 bg-white/95 rounded-xl shadow-xl border border-gray-200/50 backdrop-blur-lg transition-all duration-300 z-50 ${
                    isMenuOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="p-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {profileData.categories &&
                    profileData.categories.length > 0 ? (
                      profileData.categories.map((category) => (
                        <button
                          key={category.id}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center space-x-3 group/item"
                          onClick={() => handleCategorySelect(category)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-200">
                            <span className="text-blue-600 font-semibold text-sm">
                              {category.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {category.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Premium quality rentals
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">
                        No categories available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* First half of navigation links */}
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium"
              >
                About Us
              </Link>

              <Link
                to="/faq"
                className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium"
              >
                FAQ
              </Link>
            </div>

            {/* Centered Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <div className="h-12 w-auto">
                <img
                  src={fullLogo}
                  alt="Dashboard Logo"
                  className="h-full w-auto"
                />
              </div>
            </div>

            {/* Right Navigation Links */}
            <div className="flex items-center space-x-8">
              <Link
                to="/gallery"
                className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium"
              >
                Gallery
              </Link>

              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium"
              >
                Contact
              </Link>

              <button
                onClick={() => navigate("/eventbooking")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
              >
                BOOK
              </button>
            </div>
          </div>
        </div>

        {/* Compact Nav (Scrolled State) */}
        <div
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-lg rounded-2xl px-6 py-3 shadow-lg border border-gray-200/50 transition-all duration-700 ease-out ${
            isScrolled
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-90 translate-y-2 pointer-events-none"
          }`}
        >
          <div className="flex items-center space-x-8">
            <Link to="/" className="font-bold text-xl text-green-200">
              <div className="h-10 w-auto">
                <img
                  src={logoimg}
                  alt="Dashboard Logo"
                  className="h-full w-auto"
                />
              </div>
            </Link>

            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/eventbooking")}
            >
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-blue-600 transition-colors duration-300" />
            </div>
          </div>
        </div>
      </nav>

      {/* Professional Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 professional-backdrop border-b border-gray-200/30 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="h-8 w-auto">
              <img
                src={logoimg}
                alt="Dashboard Logo"
                className="h-full w-auto"
              />
            </div>
          </Link>

          {/* Mobile Menu Icons */}
          <div className="flex items-center space-x-3">
            {/* Cart Icon */}
            <button
              onClick={() => navigate("/eventbooking")}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-all duration-300 transform hover:scale-105 relative"
              aria-label="View cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
            </button>

            {/* Professional Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-all duration-300 transform hover:scale-105 relative"
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5 flex flex-col justify-center">
                <span
                  className={`hamburger-line absolute w-5 h-0.5 bg-gray-700 ${
                    isMobileMenuOpen
                      ? "rotate-45 translate-y-0"
                      : "-translate-y-1.5"
                  }`}
                ></span>
                <span
                  className={`hamburger-line absolute w-5 h-0.5 bg-gray-700 ${
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`hamburger-line absolute w-5 h-0.5 bg-gray-700 ${
                    isMobileMenuOpen
                      ? "-rotate-45 translate-y-0"
                      : "translate-y-1.5"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 transition-all duration-300 z-40 ${
            isMobileMenuOpen
              ? "opacity-100 backdrop-blur-sm"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Professional Mobile Menu Panel */}
        <div
          className={`fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] h-screen professional-backdrop shadow-xl border-l border-gray-200/30 ${
            isMobileMenuOpen ? "mobile-menu-enter" : "mobile-menu-exit"
          }`}
        >
          <div className="flex flex-col h-screen">
            {/* Header */}
            <div
              className={`flex items-center justify-between p-6 border-b border-gray-200/30 shrink-0 ${
                isMobileMenuOpen
                  ? "menu-item-enter menu-item-0"
                  : "menu-item-exit"
              }`}
            >
              <div className="h-8 w-auto">
                <img
                  src={fullLogo}
                  alt="Dashboard Logo"
                  className="h-full w-auto"
                />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-1">
                {/* Rentals Section - Moved to Top */}
                <div
                  className={`${
                    isMobileMenuOpen
                      ? "menu-item-enter menu-item-1"
                      : "menu-item-exit"
                  }`}
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-all duration-300 group"
                    onClick={() =>
                      setIsRentalsDropdownOpen(!isRentalsDropdownOpen)
                    }
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-50 transition-colors duration-300">
                        <Package className="w-5 h-5 group-hover:text-blue-600" />
                      </div>
                      <span className="font-medium">Our Rentals</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                        isRentalsDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Categories Dropdown */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isRentalsDropdownOpen
                        ? "max-h-64 opacity-100 mt-2"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="bg-gray-50 rounded-lg border border-gray-200/50 mx-4 overflow-y-auto custom-scrollbar max-h-60">
                      {profileData.categories &&
                      profileData.categories.length > 0 ? (
                        profileData.categories.map((category, index) => (
                          <button
                            key={category.id}
                            className="w-full text-left px-4 py-3 hover:bg-white transition-all duration-200 flex items-center space-x-3 group/item border-b border-gray-200/30 last:border-b-0"
                            onClick={() => handleCategorySelect(category)}
                          >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0">
                              {category.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 text-sm truncate">
                                {category.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                View collection
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-sm">
                            No categories available
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Other Navigation Links */}
                {navigationLinks.map((link, index) => {
                  const IconComponent = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-all duration-300 group ${
                        isMobileMenuOpen
                          ? `menu-item-enter menu-item-${index + 2}`
                          : "menu-item-exit"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-50 transition-colors duration-300">
                        <IconComponent className="w-5 h-5 group-hover:text-blue-600" />
                      </div>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom CTA Button */}
            <div
              className={`p-6 border-t border-gray-200/30 shrink-0 ${
                isMobileMenuOpen
                  ? `menu-item-enter menu-item-${navigationLinks.length + 2}`
                  : "menu-item-exit"
              }`}
            >
              <button
                onClick={() => {
                  navigate("/eventbooking");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-lg transition-all duration-300 shadow-lg font-semibold text-base transform hover:scale-[1.02] hover:-translate-y-0.5 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center justify-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Event Now
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Add top padding to account for fixed navigation */}
      <div className="pt-16 md:pt-0">
        {/* Page Content */}
        <main>
          <Outlet />
        </main>
      </div>

      {/* Footer with Profile Data */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">{profileData.name}</h3>
              <p className="text-gray-400">{profileData.bio}</p>
              <div className="flex space-x-4">
                {/* Social Media Icons */}
                <a
                  href="https://facebook.com/ibloomrentals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 text-blue-600 hover:text-blue-700 transform hover:scale-110 transition-all duration-300"
                >
                  <Facebook />
                </a>
                <a
                  href="https://instagram.com/ibloomrentals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 text-pink-500 hover:text-pink-600 transform hover:scale-110 transition-all duration-300"
                >
                  <Instagram />
                </a>
                <a
                  href="https://twitter.com/ibloomrentals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 text-blue-400 hover:text-blue-500 transform hover:scale-110 transition-all duration-300"
                >
                  <Twitter />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                {profileData?.specialize &&
                profileData?.specialize?.length > 0 ? (
                  profileData.specialize.slice(0, 4).map((service, index) => (
                    <li key={index}>
                      <span className="hover:text-white transition-colors duration-300 cursor-pointer">
                        {service}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No services available</li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                {profileData.categories && profileData.categories.length > 0 ? (
                  profileData.categories.slice(0, 4).map((category) => (
                    <li key={category.id}>
                      <Link
                        to={`/category/${category.id}`}
                        className="hover:text-white transition-colors duration-300"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No categories available</li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3 text-gray-400">
                {profileData.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-3" />
                    <span>{profileData.phone}</span>
                  </div>
                )}
                {profileData.email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-3" />
                    <span>{profileData.email}</span>
                  </div>
                )}
                {profileData.location && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-3" />
                    <span>{profileData.location}</span>
                  </div>
                )}
                {!profileData.phone &&
                  !profileData.email &&
                  !profileData.location && (
                    <div className="text-gray-500">
                      Contact information not available
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 {profileData.name}. All rights reserved. | Privacy
              Policy | Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
