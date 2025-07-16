// screens/user/UserLayout.js
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
} from "lucide-react";
import { fetchProfile } from "../../store/slices/profile-slice"; // Adjust path as needed
import logoimg from "../../assets/ibloomcut.png";
import fullLogo from "../../assets/Screenshot 2025-05-09 144927.png"

const UserLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRentalsDropdownOpen, setIsRentalsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get profile data from Redux store
  const { userData, loading } = useSelector((state) => state.profile);

  // Fetch profile data on component mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Handle scroll behavior for navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100); // Shrink after scrolling 100px
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navigationLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/faq", label: "FAQ" },
    { to: "/gallery", label: "Gallery" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation - Hidden on mobile */}
      <nav className="hidden md:block fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-700 ease-out">
        {/* Expanded Nav (Default State) */}
        <div
          className={`bg-white backdrop-blur-lg rounded-2xl px-8 py-4 shadow-xl border border-gray-200/50 transition-all duration-700 ease-out ${
            isScrolled
              ? "opacity-0 scale-90 translate-y-2 pointer-events-none"
              : "opacity-100 scale-100 translate-y-0"
          }`}
        >
          <div className="flex items-center space-x-8 whitespace-nowrap">
            <div className="h-10 w-auto">
              <img
                src={fullLogo}
                alt="Dashboard Logo"
                className="h-full w-auto"
              />
            </div>

            <div className="flex items-center space-x-6">
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
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-72 bg-white/95 rounded-xl shadow-xl border border-gray-200/50 backdrop-blur-lg transition-all duration-300 ${
                    isMenuOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="p-2 max-h-96 overflow-y-auto">
                    {userData.categories && userData.categories.length > 0 ? (
                      userData.categories.map((category) => (
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

              {navigationLinks.slice(1).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <button
              onClick={() => navigate("/eventbooking")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
            >
              BOOK
            </button>
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

            <div className="relative cursor-pointer" onClick={() => navigate('/eventbooking')}>
              <div className="text-4xl animate-bounce">🛒</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
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
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <button
              onClick={() => navigate('/eventbooking')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <div className="text-2xl">🛒</div>
            </button>

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Mobile Menu Panel */}
        <div
          className={`fixed top-0 right-0  z-50 w-80 max-w-[55vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="h-8 w-auto">
                <img
                  src={fullLogo}
                  alt="Dashboard Logo"
                  className="h-full w-auto"
                />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block px-6 py-4 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Rentals Section */}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200 font-medium"
                  onClick={() => setIsRentalsDropdownOpen(!isRentalsDropdownOpen)}
                >
                  <span>Rentals</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isRentalsDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Categories Dropdown */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isRentalsDropdownOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="bg-gray-50 px-4 py-2">
                    {userData.categories && userData.categories.length > 0 ? (
                      userData.categories.map((category) => (
                        <button
                          key={category.id}
                          className="w-full text-left px-4 py-3 hover:bg-white rounded-lg transition-all duration-200 flex items-center space-x-3 group/item"
                          onClick={() => handleCategorySelect(category)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-200">
                            <span className="text-blue-600 font-semibold text-xs">
                              {category.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">
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
            </div>

            {/* Bottom CTA */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  navigate("/eventbooking");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full transition-all duration-300 shadow-lg font-medium"
              >
                BOOK NOW
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tablet Navigation (768px - 1023px) */}
      <nav className="hidden md:block lg:hidden fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-700 ease-out">
        <div
          className={`bg-white backdrop-blur-lg rounded-2xl px-6 py-3 shadow-xl border border-gray-200/50 transition-all duration-700 ease-out ${
            isScrolled
              ? "opacity-0 scale-90 translate-y-2 pointer-events-none"
              : "opacity-100 scale-100 translate-y-0"
          }`}
        >
          <div className="flex items-center space-x-4 whitespace-nowrap">
            <div className="h-8 w-auto">
              <img
                src={fullLogo}
                alt="Dashboard Logo"
                className="h-full w-auto"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium text-sm"
              >
                Home
              </Link>

              {/* Rentals Dropdown for Tablet */}
              <div className="relative dropdown-container">
                <button
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium text-sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  Rentals{" "}
                  <ChevronDown
                    className={`ml-1 w-3 h-3 transition-transform duration-300 ${
                      isMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-64 bg-white/95 rounded-xl shadow-xl border border-gray-200/50 backdrop-blur-lg transition-all duration-300 ${
                    isMenuOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {userData.categories && userData.categories.length > 0 ? (
                      userData.categories.map((category) => (
                        <button
                          key={category.id}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center space-x-2 group/item"
                          onClick={() => handleCategorySelect(category)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-200">
                            <span className="text-blue-600 font-semibold text-xs">
                              {category.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">
                              {category.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Premium quality rentals
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No categories available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium text-sm"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium text-sm"
              >
                Contact
              </Link>
            </div>

            <button
              onClick={() => navigate("/eventbooking")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg font-medium text-sm"
            >
              BOOK
            </button>
          </div>
        </div>

        {/* Tablet Compact Nav */}
        <div
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-lg rounded-2xl px-4 py-2 shadow-lg border border-gray-200/50 transition-all duration-700 ease-out ${
            isScrolled
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-90 translate-y-2 pointer-events-none"
          }`}
        >
          <div className="flex items-center space-x-6">
            <Link to="/" className="font-bold text-xl text-green-200">
              <div className="h-8 w-auto">
                <img
                  src={logoimg}
                  alt="Dashboard Logo"
                  className="h-full w-auto"
                />
              </div>
            </Link>

            <div className="relative cursor-pointer" onClick={() => navigate('/eventbooking')}>
              <div className="text-3xl animate-bounce">🛒</div>
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

      {/* Footer with Redux Data */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                {userData.name || "IBLOOM"}
              </h3>
              <p className="text-gray-400">
                {userData.bio ||
                  "Your premier destination for event rentals. Making every occasion extraordinary."}
              </p>
              <div className="flex space-x-4">
                <Facebook className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors duration-300" />
                <Twitter className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors duration-300" />
                <Instagram className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors duration-300" />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                {userData?.specialize && userData?.specialize?.length > 0 ? (
                  userData.specialize.slice(0, 4).map((service, index) => (
                    <li key={index}>
                      <span className="hover:text-white transition-colors duration-300 cursor-pointer">
                        {service}
                      </span>
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <span className="hover:text-white transition-colors duration-300 cursor-pointer">
                        Wedding Rentals
                      </span>
                    </li>
                    <li>
                      <span className="hover:text-white transition-colors duration-300 cursor-pointer">
                        Corporate Events
                      </span>
                    </li>
                    <li>
                      <span className="hover:text-white transition-colors duration-300 cursor-pointer">
                        Party Supplies
                      </span>
                    </li>
                    <li>
                      <span className="hover:text-white transition-colors duration-300 cursor-pointer">
                        Tent Rentals
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                {userData.categories && userData.categories.length > 0 ? (
                  userData.categories.slice(0, 4).map((category) => (
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
                  <>
                    <li>
                      <Link
                        to="/about"
                        className="hover:text-white transition-colors duration-300"
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/gallery"
                        className="hover:text-white transition-colors duration-300"
                      >
                        Gallery
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/faq"
                        className="hover:text-white transition-colors duration-300"
                      >
                        FAQ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/contact"
                        className="hover:text-white transition-colors duration-300"
                      >
                        Contact
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3 text-gray-400">
                {userData.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-3" />
                    <span>{userData.phone}</span>
                  </div>
                )}
                {userData.email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-3" />
                    <span>{userData.email}</span>
                  </div>
                )}
                {userData.location && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-3" />
                    <span>{userData.location}</span>
                  </div>
                )}
                {!userData.phone && !userData.email && !userData.location && (
                  <>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3" />
                      <span>(555) 123-4567</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-3" />
                      <span>info@rentalpro.com</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-3" />
                      <span>123 Event Street, City, State 12345</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 {userData.name || "IBLOOM"}. All rights reserved. |
              Privacy Policy | Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;