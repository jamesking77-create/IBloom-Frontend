import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  MapPin,
  Star,
  Calendar,
  Users,
  Award,
  Sparkles,
} from "lucide-react";
import { fetchProfile } from "../../store/slices/profile-slice";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import FloatingChatBox from "../../UI/floatingChatBox";
import QuickActionsSection from "../../components/users/quickActionSection";

// Optimized scroll hook with RAF
function useOptimizedScroll() {
  const rafRef = useRef();
  const lastScrollY = useRef(0);
  const [scrollY, setScrollY] = useState(0);
  
  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    
    rafRef.current = requestAnimationFrame(() => {
      const currentScrollY = window.pageYOffset;
      lastScrollY.current = currentScrollY;
      setScrollY(currentScrollY);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  return scrollY;
}

// Shared Intersection Observer Manager
class IntersectionManager {
  constructor() {
    this.elementMap = new Map();
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '50px 0px -50px 0px',
        threshold: 0.1
      }
    );
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      const callback = this.elementMap.get(entry.target);
      if (callback) {
        callback(entry.isIntersecting, entry.intersectionRatio);
      }
    });
  }

  observe(element, callback) {
    this.elementMap.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element) {
    this.elementMap.delete(element);
    this.observer.unobserve(element);
  }
}

const intersectionManager = new IntersectionManager();

// Memoized hero slide component
const HeroSlide = memo(({ slide, isActive, isPrevious }) => {
  return (
    <div
      className={`absolute inset-0 w-full h-full transition-all duration-700 ${
        isActive ? 'opacity-100' : 'opacity-0'
      } ${isActive ? '' : isPrevious ? 'hero-slide-previous' : 'hero-slide-next'}`}
      style={{
        transform: isActive ? 'translateX(0)' : isPrevious ? 'translateX(-100%)' : 'translateX(100%)',
        willChange: isActive ? 'transform' : 'auto'
      }}
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="w-full h-full object-cover"
        loading={isActive ? "eager" : "lazy"}
      />
 <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.85) 100%)'
      }} />
    </div>
  );
});

// Memoized floating item component
const FloatingItem = memo(({ item, index, floatingOffset }) => {
  const ref = useRef();
  
  useEffect(() => {
    if (ref.current) {
      ref.current.style.transform = `translate3d(0, ${floatingOffset * (index % 2 === 0 ? 1 : -1) * 0.5}px, 0)`;
    }
  }, [floatingOffset, index]);

  return (
    <div
      ref={ref}
      className={`absolute floating-item ${
        index % 2 === 0 ? "animate-float" : "animate-float-reverse"
      }`}
      style={{
        left: index === 0 ? '5%' : index === 1 ? '85%' : index === 2 ? '10%' : '80%',
        top: index === 0 ? '15%' : index === 1 ? '20%' : index === 2 ? '75%' : '70%',
        animationDelay: `${index * 1.2}s`,
        willChange: 'transform'
      }}
    >
      <div className="group relative">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-xl transform rotate-6 group-hover:rotate-0 transition-all duration-300 bg-white/10 backdrop-blur-lg border border-white/20 blur-sm group-hover:blur-none">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          <div className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
            {item.name}
          </div>
        </div>
      </div>
    </div>
  );
});

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoSlideIndex, setAutoSlideIndex] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const categoriesRef = useRef(null);
  const heroContentRef = useRef(null);
  const scrollY = useOptimizedScroll();

  // Get profile data from Redux store
  const { userData, loading: profileLoading } = useSelector(
    (state) => state.profile
  );

  // Get categories data from Redux store
  const { categories, isLoading: categoriesLoading } = useSelector(
    (state) => state.categories
  );

  // Optimized Intersection Observer
  useEffect(() => {
    if (categoriesLoading) return;

    const timer = setTimeout(() => {
      const animateElements = document.querySelectorAll("[data-animate]");
      animateElements.forEach((el) => {
        intersectionManager.observe(el, (isIntersecting) => {
          if (isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [el.dataset.animate]: true,
            }));
            intersectionManager.unobserve(el);
          }
        });
      });
    }, 200);

    return () => {
      clearTimeout(timer);
      const animateElements = document.querySelectorAll("[data-animate]");
      animateElements.forEach((el) => intersectionManager.unobserve(el));
    };
  }, [categoriesLoading, categories]);

  useEffect(() => {
    if (location.state?.scrollToCategories && categoriesRef.current) {
      categoriesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  // Fetch profile and categories data on component mount
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Memoized data
  const heroSlides = useMemo(() => [
    {
      id: 1,
      image:
        "https://res.cloudinary.com/dc7jgb30v/image/upload/v1753951649/gabriel-domingues-leao-da-costa-cew-O_O5Bdg-unsplash_xbxxfb.jpg",
      title: `${userData.name || "Premium Event"} Rentals`,
      subtitle: "Transform your special moments",
    },
    {
      id: 2,
      image:
        "https://res.cloudinary.com/dc7jgb30v/image/upload/v1753951672/tom-pumford-WnmXzjtjRfw-unsplash_ztkhp8.jpg",
      title: "Wedding Perfection",
      subtitle: "Make your dream wedding reality",
    },
    {
      id: 3,
      image:
        "https://res.cloudinary.com/dc7jgb30v/image/upload/v1753951643/photos-by-lanty-O38Id_cyV4M-unsplash_rlneke.jpg",
      title: "Corporate Events",
      subtitle: "Professional solutions for success",
    },
  ], [userData.name]);

  const rentalCategories = useMemo(() => 
    categories.map((category) => ({
      id: category.id,
      name: category.name,
      image: category.image,
      description: category.description,
      itemCount: category.itemCount,
    })), [categories]
  );

  const rentalItems = useMemo(() => [
    {
      id: 1,
      name: "Elegant Chairs",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
      category: "Furniture",
    },
    {
      id: 2,
      name: "Wedding Tent",
      image:
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=300&fit=crop",
      category: "Tents",
    },
    {
      id: 3,
      name: "Sound System",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      category: "Audio",
    },
    {
      id: 4,
      name: "Dining Table",
      image:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop",
      category: "Tables",
    },
  ], []);

  const autoSlideCards = useMemo(() => 
    userData?.specialize && userData?.specialize?.length > 0
      ? userData?.specialize.map((spec, index) => ({
          id: index + 1,
          title: spec,
          desc: `Professional ${spec.toLowerCase()} services`,
          icon: ["✨", "🏆", "⭐", "🎯", "💎"][index % 5],
        }))
      : [
          {
            id: 1,
            title: "Premium Quality",
            desc: "Top-grade rental equipment",
            icon: "✨",
          },
          {
            id: 2,
            title: "Fast Delivery",
            desc: "Same-day setup available",
            icon: "🚀",
          },
          {
            id: 3,
            title: "Expert Support",
            desc: "Professional event planning",
            icon: "👥",
          },
          {
            id: 4,
            title: "Flexible Pricing",
            desc: "Packages for every budget",
            icon: "💰",
          },
          {
            id: 5,
            title: "24/7 Service",
            desc: "Round-the-clock assistance",
            icon: "🕐",
          },
        ], [userData?.specialize]
  );

  const stats = useMemo(() => [
    { number: "500+", label: "Happy Clients", icon: "👥" },
    { number: "1000+", label: "Events Completed", icon: "🎉" },
    { number: "50+", label: "Rental Categories", icon: "📦" },
    { number: "24/7", label: "Customer Support", icon: "🔧" },
  ], []);

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

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  }, [heroSlides.length]);

  const handleCategoryClick = useCallback((category) => {
    navigate(`/category/${category.id}`, { state: { category } });
  }, [navigate]);

  // Optimized parallax with direct DOM manipulation
  useEffect(() => {
    if (heroContentRef.current) {
      const parallaxOffset = scrollY * -0.05;
      heroContentRef.current.style.transform = `translate3d(0, ${parallaxOffset}px, 0)`;
    }
  }, [scrollY]);

  const floatingOffset = scrollY * 0.1;

  return (
    <>
      <style>
        {`
          /* GPU-accelerated animations */
          @keyframes slide-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          
          @keyframes float {
            0%, 100% { transform: translate3d(0, 0px, 0) rotate(0deg); }
            50% { transform: translate3d(0, -20px, 0) rotate(5deg); }
          }
          
          @keyframes float-reverse {
            0%, 100% { transform: translate3d(0, 0px, 0) rotate(0deg); }
            50% { transform: translate3d(0, -15px, 0) rotate(-3deg); }
          }
          
          @keyframes fadeInUp {
            0% { 
              opacity: 0; 
              transform: translate3d(0, 40px, 0); 
            }
            100% { 
              opacity: 1; 
              transform: translate3d(0, 0, 0); 
            }
          }
          
          @keyframes scaleIn {
            0% { 
              opacity: 0; 
              transform: scale3d(0.8, 0.8, 1); 
            }
            100% { 
              opacity: 1; 
              transform: scale3d(1, 1, 1); 
            }
          }
          
          @keyframes slideInLeft {
            0% { 
              opacity: 0; 
              transform: translate3d(-50px, 0, 0); 
            }
            100% { 
              opacity: 1; 
              transform: translate3d(0, 0, 0); 
            }
          }
          
          @keyframes slideInRight {
            0% { 
              opacity: 0; 
              transform: translate3d(50px, 0, 0); 
            }
            100% { 
              opacity: 1; 
              transform: translate3d(0, 0, 0); 
            }
          }
          
          /* Apply GPU acceleration */
          .animate-slide-left { 
            animation: slide-left 20s linear infinite; 
            will-change: transform;
          }
          .animate-float { 
            animation: float 6s ease-in-out infinite; 
            transform: translateZ(0);
          }
          .animate-float-reverse { 
            animation: float-reverse 8s ease-in-out infinite; 
            transform: translateZ(0);
          }
          .animate-fade-in-up { 
            animation: fadeInUp 0.8s ease-out forwards; 
          }
          .animate-scale-in { 
            animation: scaleIn 0.6s ease-out forwards; 
          }
          .animate-slide-in-left { 
            animation: slideInLeft 0.8s ease-out forwards; 
          }
          .animate-slide-in-right { 
            animation: slideInRight 0.8s ease-out forwards; 
          }
          
          .floating-item {
            transition: transform 0.3s ease;
            transform: translateZ(0);
          }
          
          .floating-item:hover {
            transform: scale3d(1.1, 1.1, 1) rotate(5deg);
          }
          
          .text-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transform: translateZ(0);
          }
          
          /* Hero slide transitions */
          .hero-slide-next {
            transform: translateX(100%);
          }
          
          .hero-slide-previous {
            transform: translateX(-100%);
          }
          
          /* Performance optimizations */
          .contain-layout {
            contain: layout style paint;
          }
          
          .offscreen-content {
            content-visibility: auto;
          }
        `}
      </style>

      {/* Optimized Hero Section */}
      <div className="relative h-screen overflow-hidden contain-layout">
        {heroSlides.map((slide, index) => (
          <HeroSlide 
            key={slide.id}
            slide={slide}
            isActive={index === currentSlide}
            isPrevious={index === (currentSlide - 1 + heroSlides.length) % heroSlides.length}
          />
        ))}

        {/* Hero Content with optimized parallax */}
        <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10">
          <div className="max-w-4xl mx-auto px-4">
            <div
              ref={heroContentRef}
              className="transform transition-transform duration-0 ease-out"
              style={{ willChange: 'transform' }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-300 animate-fade-in-up">
                {heroSlides[currentSlide].title}
              </h1>
              <p
                className="text-xl md:text-2xl mb-4 text-white animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                {heroSlides[currentSlide].subtitle}
              </p>
              {userData.bio && (
                <p
                  className="text-lg mb-8 text-white max-w-2xl mx-auto animate-fade-in-up"
                  style={{ animationDelay: "0.4s" }}
                >
                  {userData.bio}
                </p>
              )}

              <button
                onClick={() => navigate("/quote")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center mx-auto animate-scale-in"
                style={{ animationDelay: "0.6s" }}
              >
                <Quote className="mr-2 w-5 h-5" />
                Get Your Quote
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 glass-effect hover:bg-white/20 rounded-full p-3 transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 glass-effect hover:bg-white/20 rounded-full p-3 transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Pagination */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 w-8 shadow-lg"
                  : "bg-white/50 hover:bg-white/70 w-2"
              }`}
            />
          ))}
        </div>
      </div>

      <QuickActionsSection navigate={navigate}/>

      {/* Optimized 3D Floating Items Section */}
      <div className="relative py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden contain-layout">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        {/* Optimized Floating Rental Items */}
        <div className="absolute inset-0 overflow-hidden">
          {rentalItems.map((item, index) => (
            <FloatingItem 
              key={item.id}
              item={item}
              index={index}
              floatingOffset={floatingOffset}
            />
          ))}
        </div>

        {/* Central Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div
            data-animate="floating-section"
            className={`transition-all duration-1000 ${
              isVisible["floating-section"] ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="text-gray-200">Everything</span> You Need
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              From intimate gatherings to grand celebrations, we bring your vision to life with our premium rental collection
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-lg px-6 py-3 rounded-full text-gray-700 font-medium transform hover:scale-105 transition-all duration-300 hover:bg-white/90">
                <Sparkles className="inline-block w-5 h-5 mr-2" />
                Premium Quality
              </div>
              <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-lg px-6 py-3 rounded-full text-gray-700 font-medium transform hover:scale-105 transition-all duration-300 hover:bg-white/90">
                <Calendar className="inline-block w-5 h-5 mr-2" />
                Flexible Booking
              </div>
              <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-lg px-6 py-3 rounded-full text-gray-700 font-medium transform hover:scale-105 transition-all duration-300 hover:bg-white/90">
                <Users className="inline-block w-5 h-5 mr-2" />
                Expert Setup
              </div>
            </div>

            <button
              onClick={() => navigate("/eventbooking")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-full text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Explore Our Collection
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div
        data-animate="stats"
        className="py-20 bg-white relative overflow-hidden contain-layout"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transform transition-all duration-700 ${
                  isVisible["stats"]
                    ? index % 2 === 0
                      ? "animate-slide-in-left"
                      : "animate-slide-in-right"
                    : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-6xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div
        ref={categoriesRef}
        className="py-20 bg-gradient-to-br from-gray-50 to-white contain-layout"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div
            data-animate="categories-header"
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["categories-header"]
                ? "animate-fade-in-up"
                : "opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Our Rental Categories
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for your perfect event
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-8 rounded-full"></div>
          </div>

          {/* Categories Grid */}
          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gray-300 h-48 w-full"></div>
                    <div className="p-6">
                      <div className="bg-gray-300 h-6 w-3/4 mb-2 rounded"></div>
                      <div className="bg-gray-300 h-4 w-full mb-2 rounded"></div>
                      <div className="bg-gray-300 h-4 w-1/2 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : rentalCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                No Categories Available
              </h3>
              <p className="text-gray-500">
                Categories will appear here once they are added to the system.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rentalCategories.map((category, index) => (
                <div
                  key={category.id}
                  data-animate={`category-${index}`}
                  className={`group cursor-pointer transform transition-all duration-700 hover:scale-105 ${
                    isVisible[`category-${index}`]
                      ? "animate-fade-in-up"
                      : "opacity-0"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/50 relative">
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      View Items
                    </div>
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          category.image ||
                          `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop`
                        }
                        alt={category.name}
                        className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {category.description ||
                          "Premium quality rentals for your special event"}
                      </p>
                      {category.itemCount > 0 && (
                        <p className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {category.itemCount} item
                          {category.itemCount !== 1 ? "s" : ""} available
                        </p>
                      )}
                      {category.itemCount === 0 && (
                        <p className="text-sm text-gray-400">
                          Items coming soon
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auto-sliding Cards Section */}
      <div className="py-16 bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 relative overflow-hidden contain-layout">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-transparent to-cyan-500/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-green-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div
          data-animate="specializations"
          className={`max-w-7xl mx-auto px-4 mb-12 relative z-10 transition-all duration-1000 ${
            isVisible["specializations"] ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className="text-4xl font-bold text-center text-white mb-4 drop-shadow-lg">
            {userData?.specialize && userData?.specialize?.length > 0
              ? "Our Specializations"
              : "Why Choose Us"}
          </h2>
          <p className="text-xl text-center text-white/90 drop-shadow-md">
            Experience the difference with our premium service
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex animate-slide-left space-x-8">
            {[...autoSlideCards, ...autoSlideCards].map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className="flex-shrink-0 w-80 glass-effect rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-300 hover:bg-white/15"
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-semibold text-white/90 mb-2">
                  {card.title}
                </h3>
                <p className="text-white/70">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Company Location Map Section */}
      <div
        data-animate="location-map"
        className={`py-16 bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden contain-layout ${
          isVisible["location-map"] ? "animate-fade-in-up" : "opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Find Us Here
            </h2>
            <p className="text-xl text-gray-600">
              Visit our location or get in touch with us
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4 rounded-full"></div>
          </div>
          
          {/* Full Width Map */}
          <div className="w-full h-96 rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50 relative mb-12">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.789!2d3.4347!3d6.4548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf50c5b1f5b5b%3A0x2d4e8f6a7c9b1234!2s178B%20Corporation%20Drive%2C%20Dolphin%20Estate%2C%20Ikoyi%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1735649200"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
              title="Company Location - 178B Corporation Drive, Dolphin Estate, Ikoyi, Lagos"
            ></iframe>
            <div className="absolute top-4 left-4 glass-effect px-4 py-2 rounded-full text-sm font-medium text-gray-700">
              📍 {userData.location || "178B Corporation Drive, Dolphin Estate, Ikoyi"}
            </div>
            <div className="absolute bottom-4 right-4 glass-effect px-3 py-1 rounded-full text-xs text-gray-600">
              <a href="https://maps.google.com/dir/?api=1&destination=178B+Corporation+Drive+Dolphin+Estate+Ikoyi+Lagos+Nigeria" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="hover:text-blue-600 transition-colors">
                Get Directions →
              </a>
            </div>
          </div>
          
          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-effect p-6 rounded-xl backdrop-blur-lg border border-gray-200/50 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Easy to Find</h4>
              <p className="text-sm text-gray-600">Centrally located with ample parking space</p>
            </div>
            
            <div className="glass-effect p-6 rounded-xl backdrop-blur-lg border border-gray-200/50 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Showroom Visits</h4>
              <p className="text-sm text-gray-600">See our equipment before you book</p>
            </div>
            
            <div className="glass-effect p-6 rounded-xl backdrop-blur-lg border border-gray-200/50 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Flexible Hours</h4>
              <p className="text-sm text-gray-600">Extended hours for your convenience</p>
            </div>
          </div>
        </div>
      </div>


      {/* Company Info Section */}
      {userData.joinDate && (
        <div
          data-animate="company-info"
          className={`py-16 bg-white transition-all duration-1000 contain-layout ${
            isVisible["company-info"] ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="mb-8">
              <Award className="w-16 h-16 mx-auto text-gradient mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                About {userData.name}
              </h2>
            </div>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {userData.bio}
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center glass-effect px-4 py-2 rounded-full">
                <span className="font-semibold">Established:</span>
                <span className="ml-2">
                  {dayjs(userData.joinDate).format("DD/MM/YYYY")}
                </span>
              </div>
              {userData.location && (
                <div className="flex items-center glass-effect px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{userData.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Call to Action Section */}
      <div className="py-20 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden contain-layout">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div
          data-animate="cta-section"
          className={`relative z-10 max-w-4xl mx-auto px-4 text-center transition-all duration-1000 ${
            isVisible["cta-section"] ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Create Your
            <span className="text-gradient block mt-2">Perfect Event?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their most
            important moments. Let's make your next event unforgettable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/eventbooking")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center"
            >
              <Calendar className="mr-2 w-5 h-5" />
              Book Your Event
            </button>
            <button
              onClick={() => navigate("/quote")}
              className="glass-effect text-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center hover:bg-white/20"
            >
              <Quote className="mr-2 w-5 h-5" />
              Get Free Quote
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="flex items-center text-gray-400">
              <Star className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Users className="w-5 h-5 mr-2" />
              <span className="text-sm">500+ Happy Clients</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Award className="w-5 h-5 mr-2" />
              <span className="text-sm">Premium Quality</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Box Component */}
      <FloatingChatBox whatsappNumber="+2348142186524" />
    </>
  );
};

export default HomePage;