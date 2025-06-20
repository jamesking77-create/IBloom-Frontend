// screens/user/UserLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown, Quote, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { fetchProfile } from '../../store/slices/profile-slice'; // Adjust path as needed

const UserLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategorySelect = (category) => {
    navigate(`/category/${category.id}`, { state: { category } });
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.dropdown-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dynamic Floating Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-700 ease-out">
        {/* Expanded Nav (Default State) */}
        <div className={`bg-white/95 backdrop-blur-lg rounded-2xl px-8 py-4 shadow-xl border border-gray-200/50 transition-all duration-700 ease-out ${
          isScrolled ? 'opacity-0 scale-90 translate-y-2 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'
        }`}>
          <div className="flex items-center space-x-8 whitespace-nowrap">
            <Link to="/" className="font-bold text-xl text-gray-800">
              {userData.name || 'RentalPro'}
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium">
                Home
              </Link>
              
              {/* Rentals Dropdown */}
              <div className="relative dropdown-container">
                <button 
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  Rentals <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-72 bg-white/95 rounded-xl shadow-xl border border-gray-200/50 backdrop-blur-lg transition-all duration-300 ${
                  isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}>
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
                            <div className="font-medium text-gray-800">{category.name}</div>
                            <div className="text-xs text-gray-500">Premium quality rentals</div>
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
              
              <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium">
                About Us
              </Link>
              <Link to="/faq" className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium">
                FAQ
              </Link>
              <Link to="/gallery" className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium">
                Gallery
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-medium">
                Contact
              </Link>
            </div>

            <button 
              onClick={() => navigate('/quote')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
            >
              Get Quote
            </button>
          </div>
        </div>

        {/* Compact Nav (Scrolled State) */}
        <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-lg rounded-2xl px-6 py-3 shadow-lg border border-gray-200/50 transition-all duration-700 ease-out ${
          isScrolled ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2 pointer-events-none'
        }`}>
          <div className="flex items-center space-x-8">
            <Link to="/" className="font-bold text-xl text-gray-800">
              {userData.name || 'RentalPro'}
            </Link>
            <div className="text-gray-500 text-sm">Scroll up to expand</div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer with Redux Data */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">{userData.name || 'RentalPro'}</h3>
              <p className="text-gray-400">
                {userData.bio || 'Your premier destination for event rentals. Making every occasion extraordinary.'}
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
                {userData.specialize && userData.specialize.length > 0 ? (
                  userData.specialize.slice(0, 4).map((service, index) => (
                    <li key={index}>
                      <span className="hover:text-white transition-colors duration-300 cursor-pointer">
                        {service}
                      </span>
                    </li>
                  ))
                ) : (
                  <>
                    <li><span className="hover:text-white transition-colors duration-300 cursor-pointer">Wedding Rentals</span></li>
                    <li><span className="hover:text-white transition-colors duration-300 cursor-pointer">Corporate Events</span></li>
                    <li><span className="hover:text-white transition-colors duration-300 cursor-pointer">Party Supplies</span></li>
                    <li><span className="hover:text-white transition-colors duration-300 cursor-pointer">Tent Rentals</span></li>
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
                    <li><Link to="/about" className="hover:text-white transition-colors duration-300">About Us</Link></li>
                    <li><Link to="/gallery" className="hover:text-white transition-colors duration-300">Gallery</Link></li>
                    <li><Link to="/faq" className="hover:text-white transition-colors duration-300">FAQ</Link></li>
                    <li><Link to="/contact" className="hover:text-white transition-colors duration-300">Contact</Link></li>
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
                {(!userData.phone && !userData.email && !userData.location) && (
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
            <p>&copy; 2025 {userData.name || 'RentalPro'}. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;