// screens/user/HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight, Quote, MapPin } from 'lucide-react';
import { fetchProfile } from '../../store/slices/profile-slice'; 
import FloatingChatBox from '../../UI/floatingChatBox';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoSlideIndex, setAutoSlideIndex] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get profile data from Redux store
  const { userData, loading } = useSelector((state) => state.profile);

  // Fetch profile data on component mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);


  const heroSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop",
      title: `${userData.name || 'Premium Event'} Rentals`,
      subtitle: "Transform your special moments"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=800&fit=crop",
      title: "Wedding Perfection",
      subtitle: "Make your dream wedding reality"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop",
      title: "Corporate Events",
      subtitle: "Professional solutions for success"
    }
  ];


  const rentalCategories =  [
        { id: 1, name: "Tables & Chairs", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop" },
        { id: 2, name: "Linens & Decor", image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400&h=300&fit=crop" },
        { id: 3, name: "Lighting", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop" },
        { id: 4, name: "Tents & Canopies", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop" },
        { id: 5, name: "Audio Visual", image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop" },
        { id: 6, name: "Catering Equipment", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop" }
      ];

  // Auto-slide cards based on specializations or default
  const autoSlideCards = userData.specialize && userData.specialize.length > 0
    ? userData.specialize.map((spec, index) => ({
        id: index + 1,
        title: spec,
        desc: `Professional ${spec.toLowerCase()} services`,
        icon: ["✨", "🏆", "⭐", "🎯", "💎"][index % 5]
      }))
    : [
        { id: 1, title: "Premium Quality", desc: "Top-grade rental equipment", icon: "✨" },
        { id: 2, title: "Fast Delivery", desc: "Same-day setup available", icon: "🚀" },
        { id: 3, title: "Expert Support", desc: "Professional event planning", icon: "👥" },
        { id: 4, title: "Flexible Pricing", desc: "Packages for every budget", icon: "💰" },
        { id: 5, title: "24/7 Service", desc: "Round-the-clock assistance", icon: "🕐" }
      ];


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);


  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSlideIndex((prev) => (prev + 1) % autoSlideCards.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [autoSlideCards.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleCategoryClick = (category) => {
    navigate(`/category/${category.id}`, { state: { category } });
  };


  if (loading && !userData.name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes slide-left {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .animate-slide-left {
            animation: slide-left 20s linear infinite;
          }
        `}
      </style>

      {/* Hero Section with Slideshow */}
      <div className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/40" />
            </div>
          </div>
        ))}

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-gray-200">
              {heroSlides[currentSlide].subtitle}
            </p>
            {userData.bio && (
              <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto">
                {userData.bio}
              </p>
            )}
            
            <button 
              onClick={() => navigate('/quote')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center mx-auto"
            >
              <Quote className="mr-2 w-5 h-5" />
              Get Your Quote
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300 backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300 backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Pagination Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Our Rental Categories
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for your perfect event
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rentalCategories.map((category, index) => (
              <div
                key={category.id}
                className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleCategoryClick(category)}
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/50">
                  <div className="relative overflow-hidden">
                    <img
                      src={category.image || `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=400&h=300&fit=crop`}
                      alt={category.name}
                      className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-gray-600">Premium quality rentals for your special event</p>
                    {category.types && category.types.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        {category.types.length} item{category.types.length !== 1 ? 's' : ''} available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-sliding Cards Section */}
      <div className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            {userData.specialize && userData.specialize.length > 0 ? 'Our Specializations' : 'Why Choose Us'}
          </h2>
          <p className="text-xl text-center text-gray-600">
            Experience the difference with our premium service
          </p>
        </div>

        <div className="relative">
          <div className="flex animate-slide-left space-x-8">
            {[...autoSlideCards, ...autoSlideCards].map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50 transform hover:scale-105 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-gray-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Company Info Section */}
      {userData.joinDate && (
        <div className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">About {userData.name}</h2>
            <p className="text-lg text-gray-600 mb-6">{userData.bio}</p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-semibold">Established:</span>
                <span className="ml-2">{userData.joinDate}</span>
              </div>
              {userData.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{userData.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
         {/* Floating Chat Box Component */}
      <FloatingChatBox whatsappNumber="+2348142186524" />
    </>
  );
};

export default HomePage;