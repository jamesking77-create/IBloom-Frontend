import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
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
import { fetchCompanyInfo } from "../../store/slices/publicCompanyInfoSlice";
import { getColorHex } from "../../utils/getHexColor";

// Performance optimized scroll hook
function useOptimizedScroll() {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      setScrollY(window.pageYOffset);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  return scrollY;
}

// Optimized Intersection Observer
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState({});
  const observerRef = useRef(null);

  const observe = useCallback((element, id) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible((prev) => ({
                ...prev,
                [entry.target.dataset.id]: true,
              }));
              observerRef.current.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "50px 0px", threshold: 0.1, ...options }
      );
    }

    if (element) {
      element.dataset.id = id;
      observerRef.current.observe(element);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { isVisible, observe };
};

// Highly optimized hero slide component
const HeroSlide = memo(({ slide, isActive, style }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(slide.optimizedImage || slide.image);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(
    (e) => {
      if (e.target.src !== slide.image) {
        setImageSrc(slide.image);
      }
    },
    [slide.image]
  );

  return (
    <div
      className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
        isActive ? "opacity-100 z-10" : "opacity-0 z-0"
      }`}
      style={style}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        </div>
      )}

      <img
        src={imageSrc}
        alt={slide.title}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading={isActive ? "eager" : "lazy"}
        onLoad={handleImageLoad}
        onError={handleImageError}
        decoding="async"
      />

      {imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20" />
      )}
    </div>
  );
});

// Optimized floating item component
const FloatingItem = memo(({ item, index, style }) => (
  <div
    className={`absolute floating-item ${
      index % 2 === 0 ? "animate-float" : "animate-float-reverse"
    }`}
    style={style}
  >
    <div className="group relative">
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-xl transform rotate-6 group-hover:rotate-0 transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/20">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 opacity-80 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        <div className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
          {item.name}
        </div>
      </div>
    </div>
  </div>
));

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroReady, setHeroReady] = useState(false);
  const [autoSlideIndex, setAutoSlideIndex] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const categoriesRef = useRef(null);
  const heroContentRef = useRef(null);
  const scrollY = useOptimizedScroll();
  const { isVisible, observe } = useIntersectionObserver();

  const { companyInfo, companyInfoLoading } = useSelector(
    (state) => state.public
  );

  // useEffect(() => {
  //   console.log("🏠 HomePage mounted");
  //   console.log("📊 Public state:", publicState);
  //   console.log("🚀 Dispatching fetchCompanyInfo...");

  //   dispatch(fetchCompanyInfo())
  //     .then((result) => {
  //       console.log("✅ Dispatch successful:", result);
  //     })
  //     .catch((error) => {
  //       console.error("❌ Dispatch failed:", error);
  //     });
  // }, [dispatch]);

  // // Log state changes
  // useEffect(() => {
  //   console.log("🔄 Public state changed:", publicState);
  // }, [publicState]);



  const { userData, loading: profileLoading } = useSelector(
    (state) => state.profile
  );
  const { categories, isLoading: categoriesLoading } = useSelector(
    (state) => state.categories
  );

  // Optimized map URL generation
  const getMapUrl = useCallback((location) => {
    if (!location) {
      return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.789!2d3.4347!3d6.4548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf50c5b1f5b5b%3A0x2d4e8f6a7c9b1234!2s178B%20Corporation%20Drive%2C%20Dolphin%20Estate%2C%20Ikoyi%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1735649200";
    }
    const encodedLocation = encodeURIComponent(location);
    return `https://maps.google.com/maps?width=100%25&height=600&hl=en&q=${encodedLocation}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  }, []);

  const getDirectionsUrl = useCallback((location) => {
    if (!location) {
      return "https://maps.google.com/dir/?api=1&destination=178B+Corporation+Drive+Dolphin+Estate+Ikoyi+Lagos+Nigeria";
    }
    const encodedLocation = encodeURIComponent(location);
    return `https://maps.google.com/dir/?api=1&destination=${encodedLocation}`;
  }, []);

  // Memoized hero slides with WebP optimization
  const heroSlides = useMemo(
    () => [
      {
        id: 1,
        image:
          "https://res.cloudinary.com/dc7jgb30v/image/upload/v1753951649/gabriel-domingues-leao-da-costa-cew-O_O5Bdg-unsplash_xbxxfb.jpg",
        optimizedImage:
          "https://res.cloudinary.com/dc7jgb30v/image/upload/w_1920,h_1080,c_fill,f_webp,q_auto:good/v1753951649/gabriel-domingues-leao-da-costa-cew-O_O5Bdg-unsplash_xbxxfb.jpg",
        title: `${companyInfo?.name || "Premium Event"} Rentals`,
        subtitle: "Transform your special moments",
      },
      {
        id: 2,
        image:
          "https://res.cloudinary.com/dc7jgb30v/image/upload/v1753951672/tom-pumford-WnmXzjtjRfw-unsplash_ztkhp8.jpg",
        optimizedImage:
          "https://res.cloudinary.com/dc7jgb30v/image/upload/w_1920,h_1080,c_fill,f_webp,q_auto:good/v1753951672/tom-pumford-WnmXzjtjRfw-unsplash_ztkhp8.jpg",
        title: "Wedding Perfection",
        subtitle: "Make your dream wedding reality",
      },
      {
        id: 3,
        image:
          "https://res.cloudinary.com/dc7jgb30v/image/upload/v1753951643/photos-by-lanty-O38Id_cyV4M-unsplash_rlneke.jpg",
        optimizedImage:
          "https://res.cloudinary.com/dc7jgb30v/image/upload/w_1920,h_1080,c_fill,f_webp,q_auto:good/v1753951643/photos-by-lanty-O38Id_cyV4M-unsplash_rlneke.jpg",
        title: "Corporate Events",
        subtitle: "Professional solutions for success",
      },
    ],
    [companyInfo?.name]
  );

  // Memoized data with proper fallbacks
  const rentalCategories = useMemo(
    () =>
      categories?.map((category) => ({
        id: category.id,
        name: category.name,
        image: category.image,
        description: category.description,
        itemCount: category.itemCount,
      })) || [],
    [categories]
  );

  const rentalItems = useMemo(
    () => [
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
    ],
    []
  );

  const autoSlideCards = useMemo(
    () =>
      companyInfo?.specialize?.length > 0
        ? userData.specialize.map((spec, index) => ({
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
          ],
    [companyInfo?.specialize]
  );

  const stats = useMemo(
    () => [
      { number: "500+", label: "Happy Clients", icon: "👥" },
      { number: "1000+", label: "Events Completed", icon: "🎉" },
      { number: "50+", label: "Rental Categories", icon: "📦" },
      { number: "24/7", label: "Customer Support", icon: "🔧" },
    ],
    []
  );

  // Optimized scroll to categories
  useEffect(() => {
    if (location.state?.scrollToCategories && categoriesRef.current) {
      const timer = setTimeout(() => {
        categoriesRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchCompanyInfo());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Preload hero images with better error handling
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = heroSlides.map((slide, index) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            if (index === 0) setHeroReady(true);
            resolve();
          };
          img.onerror = () => {
            const fallback = new Image();
            fallback.onload = () => {
              if (index === 0) setHeroReady(true);
              resolve();
            };
            fallback.onerror = resolve;
            fallback.src = slide.image;
          };
          img.src = slide.optimizedImage || slide.image;
        });
      });

      await Promise.allSettled(imagePromises);
    };

    preloadImages();
  }, [heroSlides]);

  // Auto-slide timers
  useEffect(() => {
    if (!heroReady) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length, heroReady]);

  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSlideIndex((prev) => (prev + 1) % autoSlideCards.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [autoSlideCards.length]);

  // Optimized intersection observer setup
  useEffect(() => {
    if (categoriesLoading) return;

    const timer = setTimeout(() => {
      const elements = [
        "floating-section",
        "stats",
        "categories-header",
        "specializations",
        "location-map",
        "company-info",
        "cta-section",
      ];

      elements.forEach((id) => {
        const element = document.querySelector(`[data-animate="${id}"]`);
        if (element) observe(element, id);
      });

      // Observe category items
      document.querySelectorAll('[data-animate^="category-"]').forEach((el) => {
        observe(el, el.dataset.animate);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [categoriesLoading, observe]);

  // Event handlers
  const handleCategoryClick = useCallback(
    (category) => {
      navigate(`/category/${category.id}`, { state: { category } });
    },
    [navigate]
  );

  // Optimized parallax effect
  useEffect(() => {
    if (heroContentRef.current && heroReady) {
      const parallaxOffset = scrollY * -0.02; // Reduced for better performance
      heroContentRef.current.style.transform = `translate3d(0, ${parallaxOffset}px, 0)`;
    }
  }, [scrollY, heroReady]);

  // Floating items positioning
  const floatingItemsStyle = useMemo(() => {
    const offset = scrollY * 0.05; // Reduced for better performance
    return rentalItems.map((_, index) => ({
      left:
        index === 0 ? "5%" : index === 1 ? "85%" : index === 2 ? "10%" : "80%",
      top:
        index === 0 ? "15%" : index === 1 ? "20%" : index === 2 ? "75%" : "70%",
      transform: `translate3d(0, ${
        offset * (index % 2 === 0 ? 1 : -1) * 0.5
      }px, 0)`,
      animationDelay: `${index * 1.2}s`,
    }));
  }, [scrollY, rentalItems]);

  return (
    <>
      <style>
        {`
          /* Optimized GPU-accelerated animations */
          @keyframes slide-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          
          @keyframes float {
            0%, 100% { transform: translate3d(0, 0px, 0) rotate(0deg); }
            50% { transform: translate3d(0, -20px, 0) rotate(2deg); }
          }
          
          @keyframes float-reverse {
            0%, 100% { transform: translate3d(0, 0px, 0) rotate(0deg); }
            50% { transform: translate3d(0, -15px, 0) rotate(-2deg); }
          }
          
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translate3d(0, 20px, 0); }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          
          @keyframes scaleIn {
            0% { opacity: 0; transform: scale3d(0.95, 0.95, 1); }
            100% { opacity: 1; transform: scale3d(1, 1, 1); }
          }
          
          @keyframes slideInLeft {
            0% { opacity: 0; transform: translate3d(-30px, 0, 0); }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          
          @keyframes slideInRight {
            0% { opacity: 0; transform: translate3d(30px, 0, 0); }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          
          /* Apply optimized animations */
          .animate-slide-left { 
            animation: slide-left 20s linear infinite; 
            will-change: transform;
          }
          .animate-float { 
            animation: float 6s ease-in-out infinite; 
            will-change: transform;
          }
          .animate-float-reverse { 
            animation: float-reverse 8s ease-in-out infinite; 
            will-change: transform;
          }
          .animate-fade-in-up { 
            animation: fadeInUp 0.6s ease-out forwards; 
          }
          .animate-scale-in { 
            animation: scaleIn 0.5s ease-out forwards; 
          }
          .animate-slide-in-left { 
            animation: slideInLeft 0.6s ease-out forwards; 
          }
          .animate-slide-in-right { 
            animation: slideInRight 0.6s ease-out forwards; 
          }
          
          .floating-item {
            will-change: transform;
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
          }

          /* Performance optimizations */
          .hero-section {
            contain: layout style paint;
          }
          
          .section-content {
            content-visibility: auto;
            contain-intrinsic-size: 1px 400px;
          }

          /* Reduce motion for users who prefer it */
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>

      {/* Optimized Hero Section */}
      <div className="hero-section relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <HeroSlide
            key={slide.id}
            slide={slide}
            isActive={index === currentSlide}
            style={{ willChange: index === currentSlide ? "opacity" : "auto" }}
          />
        ))}

        {/* Hero Content */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-center text-white z-20 transition-opacity duration-300 ${
            heroReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="max-w-4xl mx-auto px-4">
            <div ref={heroContentRef} style={{ willChange: "transform" }}>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-300 animate-fade-in-up">
                {heroSlides[currentSlide]?.title}
              </h1>
              <p
                className="text-xl md:text-2xl mb-4 text-white animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                {heroSlides[currentSlide]?.subtitle}
              </p>
              {companyInfo?.bio && (
                <p
                  className="text-lg mb-8 text-white max-w-2xl mx-auto animate-fade-in-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  {userData.bio}
                </p>
              )}

              <button
                onClick={() => navigate("/request-quote")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center mx-auto animate-scale-in"
                style={{ animationDelay: "0.3s" }}
              >
                <Quote className="mr-2 w-5 h-5" />
                Get Your Quote
              </button>
            </div>
          </div>
        </div>

        {/* Hero Pagination */}
        <div
          className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 transition-opacity duration-300 ${
            heroReady ? "opacity-100" : "opacity-0"
          }`}
        >
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

      <QuickActionsSection navigate={navigate} />

      {/* 3D Floating Items Section */}
      <div className="section-content relative py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"></div>
        </div>

        {/* Floating Items */}
        <div className="absolute inset-0 overflow-hidden">
          {rentalItems.map((item, index) => (
            <FloatingItem
              key={item.id}
              item={item}
              index={index}
              style={floatingItemsStyle[index]}
            />
          ))}
        </div>

        {/* Central Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div
            data-animate="floating-section"
            className={`transition-all duration-800 ${
              isVisible["floating-section"] ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="text-gray-200">Everything</span> You Need
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              From intimate gatherings to grand celebrations, we bring your
              vision to life with our premium rental collection
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-lg px-6 py-3 rounded-full text-gray-700 font-medium transform hover:scale-105 transition-all duration-300">
                <Sparkles className="inline-block w-5 h-5 mr-2" />
                Premium Quality
              </div>
              <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-lg px-6 py-3 rounded-full text-gray-700 font-medium transform hover:scale-105 transition-all duration-300">
                <Calendar className="inline-block w-5 h-5 mr-2" />
                Flexible Booking
              </div>
              <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-lg px-6 py-3 rounded-full text-gray-700 font-medium transform hover:scale-105 transition-all duration-300">
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
        className="section-content py-20 bg-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transform transition-all duration-600 ${
                  isVisible["stats"]
                    ? index % 2 === 0
                      ? "animate-slide-in-left"
                      : "animate-slide-in-right"
                    : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
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
        className="section-content py-20 bg-gradient-to-br from-gray-50 to-white"
        style={{
          backgroundImage: `
      radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
      radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div
            data-animate="categories-header"
            className={`text-center mb-16 transition-all duration-800 ${
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
          ) : categories.length === 0 ? (
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
              {categories.map((category, index) => {
                // Check if category has any items that are in stock
                const hasInStockItems =
                  category.items?.some((item) => !item.outOfStock) || false;
                const allOutOfStock =
                  category.items?.every((item) => item.outOfStock) || false;

                return (
                  <div
                    key={category.id}
                    data-animate={`category-${index}`}
                    className={`group cursor-pointer transform transition-all duration-600 hover:scale-105 ${
                      isVisible[`category-${index}`]
                        ? "animate-fade-in-up"
                        : "opacity-0"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/50 relative">
                      {/* Stock Status Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        {category.itemCount === 0 ? (
                          <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Coming Soon
                          </span>
                        ) : allOutOfStock ? (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Out of Stock
                          </span>
                        ) : hasInStockItems ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            In Stock
                          </span>
                        ) : (
                          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Limited Stock
                          </span>
                        )}
                      </div>

                      {/* Subcategory Badge */}
                      {category.subCategories &&
                        category.subCategories.length > 0 && (
                          <div className="absolute top-4 right-4 z-10">
                            <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              {category.subCategories.length} Sub
                              {category.subCategories.length > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}

                      {/* View Items Badge on Hover */}
                      <div className="absolute inset-x-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-center font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        View Items
                      </div>

                      <div className="relative overflow-hidden">
                        <img
                          src={
                            category.image ||
                            `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop`
                          }
                          alt={category.name}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                          decoding="async"
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

                        <p className="text-gray-600 mb-3 text-sm">
                          {category.description ||
                            "Premium quality rentals for your special event"}
                        </p>

                        {/* Item Count */}
                        <div className="mb-3">
                          {category.itemCount > 0 ? (
                            <p className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {category.itemCount} item
                              {category.itemCount !== 1 ? "s" : ""} available
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">
                              Items coming soon
                            </p>
                          )}
                        </div>

                        {/* Colors Display */}
                        {category.colors && category.colors.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                              Available Colors:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {category.colors
                                .slice(0, 4)
                                .map((color, colorIndex) => (
                                  <div
                                    key={colorIndex}
                                    className="flex items-center gap-1"
                                  >
                                    <div
                                      className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm"
                                      style={{
                                        backgroundColor: getColorHex(color),
                                      }}
                                      title={color}
                                    ></div>
                                    <span className="text-xs text-gray-600 capitalize">
                                      {color}
                                    </span>
                                  </div>
                                ))}
                              {category.colors.length > 4 && (
                                <span className="text-xs text-gray-400 px-2 py-1">
                                  +{category.colors.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Sizes Display */}
                        {category.sizes && category.sizes.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                              Available Sizes:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {category.sizes
                                .slice(0, 5)
                                .map((size, sizeIndex) => (
                                  <span
                                    key={sizeIndex}
                                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium"
                                  >
                                    {size}
                                  </span>
                                ))}
                              {category.sizes.length > 5 && (
                                <span className="text-xs text-gray-400 px-2 py-1">
                                  +{category.sizes.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quotes Badge */}
                        {category.hasQuotes && (
                          <div className="mt-3">
                            <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              💬 Custom Quotes Available
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Auto-sliding Cards Section */}
      <div className="section-content py-16 bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-transparent to-cyan-500/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-green-400/30 to-blue-500/30 rounded-full blur-3xl opacity-50"></div>

        <div
          data-animate="specializations"
          className={`max-w-7xl mx-auto px-4 mb-12 relative z-10 transition-all duration-800 ${
            isVisible["specializations"] ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className="text-4xl font-bold text-center text-white mb-4 drop-shadow-lg">
            {companyInfo?.specialize?.length > 0
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
        className={`section-content py-16 bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden ${
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
              src={getMapUrl(companyInfo?.location)}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
              title={`Company Location - ${
                companyInfo?.location || "Default Location"
              }`}
            ></iframe>

            <div className="absolute top-4 left-4 glass-effect px-4 py-2 rounded-full text-sm font-medium text-gray-700">
              📍{" "}
              {companyInfo?.location ||
                "178B Corporation Drive, Dolphin Estate, Ikoyi"}
            </div>

            <div className="absolute bottom-4 right-4 glass-effect px-3 py-1 rounded-full text-xs text-gray-600">
              <a
                href={getDirectionsUrl(companyInfo?.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
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
              <p className="text-sm text-gray-600">
                Centrally located with ample parking space
              </p>
            </div>

            <div className="glass-effect p-6 rounded-xl backdrop-blur-lg border border-gray-200/50 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Showroom Visits
              </h4>
              <p className="text-sm text-gray-600">
                See our equipment before you book
              </p>
            </div>

            <div className="glass-effect p-6 rounded-xl backdrop-blur-lg border border-gray-200/50 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Flexible Hours
              </h4>
              <p className="text-sm text-gray-600">
                Extended hours for your convenience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info Section */}
      {companyInfo?.joinDate && (
        <div
          data-animate="company-info"
          className={`section-content py-16 bg-white transition-all duration-800 ${
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
      <div className="section-content py-20 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-3xl"></div>
        </div>

        <div
          data-animate="cta-section"
          className={`relative z-10 max-w-4xl mx-auto px-4 text-center transition-all duration-800 ${
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
              onClick={() => navigate("/request-quote")}
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
