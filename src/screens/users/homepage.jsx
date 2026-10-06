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
  Quote,
  MapPin,
  Star,
  Calendar,
  Users,
  Award,
  Sparkles,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { fetchProfile } from "../../store/slices/profile-slice";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import QuickActionsSection from "../../components/users/quickActionSection";
import { fetchCompanyInfo } from "../../store/slices/publicCompanyInfoSlice";
import { getColorHex } from "../../utils/getHexColor";
import WhatsAppSheet, { WhatsAppIcon, sendOrAsk } from "../../UI/whatsAppSheet";
import { ITEM_PLACEHOLDER } from "../../utils/itemPlaceholder";
import { openSearch } from "../../store/slices/ui-slice";

const HOME_GREETING = "Hi iBloom, I'd like to ask about renting some items for my event.";
const SLIDE_MS = 6000;

const formatNairaShort = (price) => {
  const n = typeof price === "string" ? parseFloat(price.replace(/[₦\s,]/g, "")) : parseFloat(price);
  return n > 0 ? `₦${n.toLocaleString("en-NG")}` : "";
};
const itemImage = (item) => item?.images?.image1 || item?.image1 || item?.image || "";

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
        <div className="absolute inset-0 bg-gray-800">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        </div>
      )}

      <img
        src={imageSrc}
        alt=""
        className={`w-full h-full object-cover ${imageLoaded ? "opacity-100" : "opacity-0"} ${
          isActive ? "scale-[1.07]" : "scale-100"
        }`}
        // Slow push-in while a slide is showing; eases back while it fades out.
        style={{ transition: "opacity 500ms ease, transform 7000ms cubic-bezier(.2,.6,.2,1)" }}
        loading={isActive ? "eager" : "lazy"}
        onLoad={handleImageLoad}
        onError={handleImageError}
        decoding="async"
      />
    </div>
  );
});

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
        label: "Rentals",
        title: `${companyInfo?.name || "Premium Event"} Rentals`,
        subtitle: "Transform your special moments",
      },
      {
        id: 2,
        image:
          "https://res.cloudinary.com/dc7jgb30v/image/upload/v1753951672/tom-pumford-WnmXzjtjRfw-unsplash_ztkhp8.jpg",
        optimizedImage:
          "https://res.cloudinary.com/dc7jgb30v/image/upload/w_1920,h_1080,c_fill,f_webp,q_auto:good/v1753951672/tom-pumford-WnmXzjtjRfw-unsplash_ztkhp8.jpg",
        label: "Weddings",
        title: "Wedding Perfection",
        subtitle: "Make your dream wedding reality",
      },
      {
        id: 3,
        image:
          "https://res.cloudinary.com/dc7jgb30v/image/upload/v1753951643/photos-by-lanty-O38Id_cyV4M-unsplash_rlneke.jpg",
        optimizedImage:
          "https://res.cloudinary.com/dc7jgb30v/image/upload/w_1920,h_1080,c_fill,f_webp,q_auto:good/v1753951643/photos-by-lanty-O38Id_cyV4M-unsplash_rlneke.jpg",
        label: "Corporate",
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

  const valueProps = useMemo(
    () => [
      {
        icon: Sparkles,
        title: "Premium Quality",
        desc: "Every piece inspected and styled before it leaves our warehouse",
      },
      {
        icon: Calendar,
        title: "Flexible Booking",
        desc: "Reserve by date or build your event now — your call",
      },
      {
        icon: Users,
        title: "Expert Setup",
        desc: "Our team delivers, installs, and strikes down after",
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
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, SLIDE_MS);
    return () => clearTimeout(timer);
  }, [currentSlide, heroSlides.length, heroReady]);

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

  const [waSheetOpen, setWaSheetOpen] = useState(false);
  const shelfRef = useRef(null);

  // One in-stock, photographed piece from each category for the hero shelf.
  // Top-level items only: their ids are unique, so the deep link opens the
  // right item (subcategory item ids repeat).
  const featuredItems = useMemo(
    () =>
      (categories || [])
        .map((category) => {
          const item = (category.items || []).find(
            (i) => !i.outOfStock && itemImage(i)
          );
          return item ? { item, category } : null;
        })
        .filter(Boolean)
        .slice(0, 12),
    [categories]
  );

  const scrollShelf = useCallback((direction) => {
    const el = shelfRef.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  // Real count for the search bar ("Search 207 items…"), subcategories included.
  const totalItems = useMemo(
    () =>
      (categories || []).reduce(
        (n, c) =>
          n +
          (c.items?.length || 0) +
          (c.subCategories || []).reduce((m, s) => m + (s.items?.length || 0), 0),
        0
      ),
    [categories]
  );

  const heroEyebrow = /lagos/i.test(companyInfo?.location || "")
    ? "Event decor rentals · Lagos"
    : "Event decor rentals";

  const scrollToCategories = useCallback(() => {
    categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleWhatsApp = useCallback(() => {
    sendOrAsk(HOME_GREETING, setWaSheetOpen);
  }, []);

  // Optimized parallax effect
  useEffect(() => {
    if (heroContentRef.current && heroReady) {
      const parallaxOffset = scrollY * -0.02; // Reduced for better performance
      heroContentRef.current.style.transform = `translate3d(0, ${parallaxOffset}px, 0)`;
    }
  }, [scrollY, heroReady]);

  return (
    <>
      <style>
        {`
          /* Optimized GPU-accelerated animations */
          @keyframes slide-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
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
          .marquee-pause-group:hover .animate-slide-left {
            animation-play-state: paused;
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

          .text-brand {
            color: #A32B5E;
          }

          .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .glass-panel-light {
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(47, 93, 58, 0.1);
            box-shadow: 0 4px 24px rgba(36, 26, 32, 0.06);
          }

          /* Hero: headline words rise out of a mask on each slide change */
          .hero-word-mask {
            display: inline-block;
            overflow: hidden;
            vertical-align: bottom;
            padding: 0 0.08em 0.1em 0;
            margin-bottom: -0.1em;
          }
          .hero-word {
            display: inline-block;
            animation: heroWordUp 0.85s cubic-bezier(.2,.8,.2,1) both;
          }
          @keyframes heroWordUp {
            from { transform: translate3d(0, 105%, 0); }
            to { transform: none; }
          }
          .hero-sub { animation: fadeInUp 0.7s 0.35s ease-out both; }
          .hero-progress {
            transform-origin: left center;
            animation-name: heroProgress;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
          }
          @keyframes heroProgress {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }

          /* Shelf: first card lines up with the page content (max-w-7xl + its
             padding); the rest of the row runs off the right edge to scroll */
          .hero-shelf {
            --shelf-inset: 1.25rem;
            padding-inline: var(--shelf-inset);
            scroll-padding-inline: var(--shelf-inset);
          }
          @media (min-width: 640px) { .hero-shelf { --shelf-inset: 2rem; } }
          @media (min-width: 1280px) {
            .hero-shelf { --shelf-inset: calc((100% - 80rem) / 2 + 2rem); }
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

      {/* Hero — an editorial cover: the headline sits on the photo, and a shelf
          of real items with prices straddles its bottom edge. */}
      <section
        className="hero-section relative h-[88svh] min-h-[680px] md:h-screen md:min-h-[760px] overflow-hidden bg-bloom-charcoal"
        aria-label="Welcome"
      >
        {heroSlides.map((slide, index) => (
          <HeroSlide
            key={slide.id}
            slide={slide}
            isActive={index === currentSlide}
            style={{ willChange: index === currentSlide ? "opacity" : "auto" }}
          />
        ))}

        {/* Scrims: heavier on the reading side and along the bottom, where the shelf overlaps */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-bloom-charcoal/85 via-bloom-charcoal/40 to-bloom-charcoal/0" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 z-10 pointer-events-none bg-gradient-to-t from-bloom-charcoal via-bloom-charcoal/45 to-transparent" />

        <div
          // Text shows straight away, even before the photo arrives: on a slow
          // connection the headline and buttons are what people need first.
          className="relative z-20 h-full max-w-7xl mx-auto px-5 sm:px-8 flex flex-col justify-end pb-36 sm:pb-40 md:pb-48"
        >
          <div ref={heroContentRef} className="max-w-3xl text-white" style={{ willChange: "transform" }}>
            <p className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/70 mb-4 sm:mb-6">
              <span className="w-8 h-px bg-bloom-blush/80" aria-hidden="true" />
              {heroEyebrow}
            </p>

            <h1
              key={currentSlide}
              className="font-display font-semibold text-white leading-[0.98] tracking-[-0.02em] text-[clamp(2.6rem,7.5vw,6.25rem)]"
            >
              {(heroSlides[currentSlide]?.title || "").split(" ").map((word, i, words) => (
                <React.Fragment key={i}>
                <span className="hero-word-mask">
                  <span
                    className={`hero-word ${
                      i === words.length - 1 && words.length > 1
                        ? "italic font-medium text-bloom-blush"
                        : ""
                    }`}
                    style={{ animationDelay: `${60 + i * 90}ms` }}
                  >
                    {word}
                  </span>
                </span>
                {/* Space sits outside the inline-block mask, where it would collapse */}
                {i < words.length - 1 && " "}
                </React.Fragment>
              ))}
            </h1>

            <p key={`sub-${currentSlide}`} className="hero-sub mt-4 sm:mt-6 text-base sm:text-xl text-white/80 max-w-md">
              {heroSlides[currentSlide]?.subtitle}
            </p>

            {/* Search bar: opens the site-wide search panel (every item and subcategory) */}
            <button
              type="button"
              onClick={() => dispatch(openSearch())}
              className="group mt-6 sm:mt-8 w-full max-w-xl flex items-center gap-3 h-14 sm:h-16 pl-4 sm:pl-5 pr-2 rounded-full bg-white/95 text-left shadow-[0_20px_50px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/40 hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Search all items"
            >
              <Search className="w-5 h-5 text-bloom-green shrink-0" />
              <span className="flex-1 min-w-0 truncate text-[15px] sm:text-base text-gray-500">
                {totalItems > 0 ? `Search ${totalItems} items` : "Search items"}
                <span className="hidden sm:inline">: candelabras, backdrops…</span>
              </span>
              <kbd className="hidden md:inline-flex items-center h-6 px-2 rounded-md border border-gray-200 bg-gray-50 text-[11px] font-semibold text-gray-500">
                /
              </kbd>
              <span className="shrink-0 h-10 sm:h-12 px-4 sm:px-5 rounded-full bg-bloom-charcoal text-white text-sm font-semibold inline-flex items-center group-hover:bg-bloom-green transition-colors">
                Search
              </span>
            </button>

            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={scrollToCategories}
                className="bg-bloom-rose hover:bg-bloom-rose-dark text-white px-7 py-4 rounded-full text-base sm:text-lg font-semibold transition-colors duration-300 shadow-2xl inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Browse items
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                onClick={handleWhatsApp}
                className="bg-[#25D366] hover:bg-[#1FBE5B] text-[#0B3B1E] px-7 py-4 rounded-full text-base sm:text-lg font-bold transition-colors duration-300 shadow-2xl inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Chat on WhatsApp
              </button>
            </div>
            <button
              onClick={() => navigate("/request-quote")}
              className="mt-4 sm:mt-5 inline-flex items-center gap-1.5 text-sm text-white/65 hover:text-white underline-offset-4 hover:underline"
            >
              <Quote className="w-4 h-4" />
              Need a formal quote? Request one
            </button>
          </div>

          {/* Slide tabs: the line under the current one fills as the slide plays */}
          <div className="mt-8 sm:mt-12 flex items-end gap-4 sm:gap-8" role="tablist" aria-label="Featured events">
            {heroSlides.map((slide, index) => {
              const active = index === currentSlide;
              return (
                <button
                  key={slide.id}
                  role="tab"
                  aria-selected={active}
                  aria-label={slide.label}
                  onClick={() => setCurrentSlide(index)}
                  className="group text-left py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded"
                >
                  <span
                    className={`hidden sm:block text-[11px] font-semibold uppercase tracking-[0.16em] mb-2 transition-colors ${
                      active ? "text-white" : "text-white/45 group-hover:text-white/80"
                    }`}
                  >
                    {slide.label}
                  </span>
                  <span className="block h-[2px] w-10 sm:w-24 bg-white/25 rounded-full overflow-hidden">
                    {active && (
                      <span
                        key={currentSlide}
                        className="hero-progress block h-full w-full bg-bloom-blush"
                        style={{ animationDuration: `${SLIDE_MS}ms` }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* The shelf: real pieces with prices, half on the photo, half on the page */}
      {(categoriesLoading || featuredItems.length > 0) && (
        <section
          className="relative z-30 -mt-28 sm:-mt-32 bg-[linear-gradient(to_bottom,transparent_7rem,var(--color-bloom-ivory)_7rem)] sm:bg-[linear-gradient(to_bottom,transparent_8rem,var(--color-bloom-ivory)_8rem)]"
          aria-labelledby="shelf-title"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-end justify-between mb-3 sm:mb-4">
            <h2 id="shelf-title" className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              From the collection
            </h2>
            <div className="hidden md:flex gap-2">
              <button
                type="button"
                onClick={() => scrollShelf(-1)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-white"
                aria-label="Scroll pieces left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollShelf(1)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-white"
                aria-label="Scroll pieces right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ul
            ref={shelfRef}
            className="hero-shelf flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categoriesLoading && featuredItems.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="shrink-0 w-[44vw] max-w-[14rem] sm:w-56 flex">
                    <div className="w-full rounded-[1.25rem] bg-white/90 overflow-hidden animate-pulse">
                      <div className="aspect-[4/5] bg-bloom-blush/60" />
                      <div className="p-3.5 space-y-2.5">
                        <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
                        <div className="h-4 w-full bg-gray-100 rounded" />
                        <div className="h-4 w-2/3 bg-gray-100 rounded" />
                        <div className="h-px bg-gray-100" />
                        <div className="h-5 w-1/3 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </li>
                ))
              : featuredItems.map(({ item, category }) => {
                  const price = formatNairaShort(item.price);
                  return (
                    // Every card has the same structure and height: one-line
                    // category, two-line name (space reserved), then a footer
                    // with the price (or "Ask for price") and a "View" cue.
                    <li key={`${category.id}-${item.id}`} className="snap-start shrink-0 w-[44vw] max-w-[14rem] sm:w-56 flex">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/category/${category.id}?item=${item.id}`, { state: { category } })
                        }
                        title={item.name}
                        aria-label={`View ${item.name}${price ? `, ${price}` : ""}`}
                        className="group w-full flex flex-col text-left bg-white rounded-[1.25rem] overflow-hidden ring-1 ring-black/5 shadow-[0_24px_48px_-24px_rgba(36,26,32,0.7)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_30px_56px_-24px_rgba(36,26,32,0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bloom-rose"
                      >
                        <span className="relative block aspect-[4/5] overflow-hidden bg-bloom-blush/40">
                          <img
                            src={itemImage(item)}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                            onError={(e) => {
                              e.currentTarget.src = ITEM_PLACEHOLDER;
                            }}
                          />
                          <span className="absolute top-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-bloom-green">
                            {category.name}
                          </span>
                        </span>

                        <span className="flex flex-col flex-1 px-3.5 pt-3 pb-3.5">
                          <span className="mb-3 text-sm font-medium leading-5 text-gray-900 line-clamp-2 min-h-[2.5rem]">
                            {item.name}
                          </span>
                          <span className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-gray-100">
                            {price ? (
                              <span className="font-display text-[17px] font-semibold text-bloom-rose tabular-nums">
                                {price}
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-gray-500">Ask for price</span>
                            )}
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-bloom-charcoal/70 group-hover:text-bloom-rose transition-colors">
                              View
                              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
          </ul>
        </section>
      )}

      {/* Categories Section */}
      <div
        ref={categoriesRef}
        id="categories"
        className="section-content pt-6 pb-14 md:pt-10 md:pb-20 bg-bloom-ivory relative overflow-hidden scroll-mt-16 md:scroll-mt-24"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='%232F5D3A' fill-opacity='0.12'/%3E%3C/svg%3E\")",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div
            data-animate="categories-header"
            className={`text-center mb-8 md:mb-14 transition-all duration-800 ${
              isVisible["categories-header"]
                ? "animate-fade-in-up"
                : "opacity-0"
            }`}
          >
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-gray-800 mb-3">
              Browse by category
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
              Pick a category, add what you need, then send your list on
              WhatsApp or book your date.
            </p>
          </div>

          {/* Categories Grid */}
          {categoriesLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gray-300 aspect-[4/3] w-full"></div>
                    <div className="p-3 sm:p-6">
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 items-stretch">
              {categories.map((category, index) => {
                // Check if category (including items nested in subcategories) has any in stock.
                // Was only looking at category.items, so a category with all its real items
                // living in subCategories had an empty items array — and [].every() is
                // vacuously true, so it always showed "Out of Stock" no matter what.
                const allCategoryItems = [
                  ...(category.items || []),
                  ...(category.subCategories?.flatMap((sub) => sub.items || []) || []),
                ];
                const hasInStockItems = allCategoryItems.some(
                  (item) => !item.outOfStock
                );
                const allOutOfStock =
                  allCategoryItems.length > 0 &&
                  allCategoryItems.every((item) => item.outOfStock);

                const stockBadge =
                  category.itemCount === 0
                    ? { label: "Coming Soon", dot: "bg-gray-400" }
                    : allOutOfStock
                    ? { label: "Out of Stock", dot: "bg-red-500" }
                    : hasInStockItems
                    ? { label: "In Stock", dot: "bg-emerald-500" }
                    : { label: "Limited Stock", dot: "bg-amber-500" };

                const extraColors = category.colors?.length
                  ? category.colors.length - 4
                  : 0;

                return (
                  <div
                    key={category.id}
                    data-animate={`category-${index}`}
                    className={`group h-full cursor-pointer transform transition-all duration-500 hover:-translate-y-1 ${
                      isVisible[`category-${index}`]
                        ? "animate-fade-in-up"
                        : "opacity-0"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleCategoryClick(category)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCategoryClick(category)
                    }
                  >
                    <div className="h-full flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-500 overflow-hidden border border-gray-100">
                      {/* Image */}
                      <div className="relative overflow-hidden aspect-[4/3] sm:aspect-auto sm:h-48 shrink-0">
                        <img
                          src={
                            category.image ||
                            ITEM_PLACEHOLDER
                          }
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.src = ITEM_PLACEHOLDER;
                          }}
                        />

                        {/* Stock Status */}
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium text-gray-700 shadow-sm">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${stockBadge.dot}`}
                          />
                          {stockBadge.label}
                        </div>

                        {/* Subcategory Badge */}
                        {category.subCategories?.length > 0 && (
                          <div className="hidden sm:block absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm">
                            {category.subCategories.length} sub
                            {category.subCategories.length > 1 ? "s" : ""}
                          </div>
                        )}

                        {/* Hover reveal: view items + extra detail */}
                        <div className="absolute inset-0 bg-gradient-to-t from-bloom-charcoal/75 via-bloom-charcoal/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          {(category.colors?.length > 0 ||
                            category.sizes?.length > 0) && (
                            <div className="mb-2 flex flex-wrap items-center gap-1.5">
                              {category.colors?.slice(0, 4).map((color, i) => (
                                <span
                                  key={i}
                                  title={color}
                                  className="w-4 h-4 rounded-full border border-white/60 shadow-sm"
                                  style={{
                                    backgroundColor: getColorHex(color),
                                  }}
                                />
                              ))}
                              {extraColors > 0 && (
                                <span className="text-[11px] text-white/80">
                                  +{extraColors}
                                </span>
                              )}
                              {category.sizes?.length > 0 && (
                                <span className="text-[11px] text-white/80 ml-1">
                                  {category.sizes.length} size
                                  {category.sizes.length > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          )}
                          <span className="inline-flex items-center justify-center bg-bloom-rose text-white px-4 py-2 rounded-full text-sm font-medium self-start">
                            View Items
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-1 p-3 sm:p-6">
                        <h3 className="font-display text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-1.5 line-clamp-2 sm:line-clamp-1 group-hover:text-bloom-green transition-colors duration-300">
                          {category.name}
                        </h3>

                        <p className="hidden sm:block text-gray-500 text-sm leading-relaxed line-clamp-2 min-h-[2.6em]">
                          {category.description ||
                            "Premium quality rentals for your special event"}
                        </p>

                        {/* Spacer pushes footer to the bottom so every card aligns */}
                        <div className="flex-1" />

                        <div className="mt-2 sm:mt-4 sm:pt-3 sm:border-t border-gray-100 flex items-center justify-between">
                          {category.itemCount > 0 ? (
                            <span className="text-xs sm:text-sm font-medium text-bloom-green">
                              {category.itemCount} item
                              {category.itemCount !== 1 ? "s" : ""} available
                            </span>
                          ) : (
                            <span className="text-xs sm:text-sm text-gray-400">
                              Items coming soon
                            </span>
                          )}

                          {category.hasQuotes && (
                            <span className="hidden sm:inline text-xs font-medium text-bloom-rose">
                              Custom quotes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <QuickActionsSection navigate={navigate} />

      {/* Value Proposition Section */}
      <div className="section-content relative py-32 md:py-36 bg-bloom-charcoal overflow-hidden">
        {/* Wobbly, hand-drawn edges instead of a straight cut into the ivory sections above/below */}
        <svg
          className="absolute top-0 left-0 w-full h-14 md:h-20 z-10"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,0 L0,42 C90,78 180,8 290,38 C400,68 470,14 580,52 C690,90 780,22 900,58 C1020,94 1110,26 1230,50 C1320,68 1380,34 1440,48 L1440,0 Z"
            className="fill-bloom-ivory"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-full h-14 md:h-20 z-10 rotate-180"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,0 L0,50 C100,20 190,88 300,54 C410,20 500,80 610,42 C720,4 820,72 940,40 C1060,8 1150,66 1260,38 C1340,18 1400,44 1440,32 L1440,0 Z"
            className="fill-bloom-ivory"
          />
        </svg>

        <div className="blob blob-a absolute top-10 -left-10 w-80 h-80 bg-bloom-green/25" />
        <div className="blob blob-b absolute bottom-0 right-0 w-96 h-96 bg-bloom-rose/15" />
        <div className="blob blob-c absolute top-1/2 left-1/2 w-56 h-56 bg-bloom-gold/10" />

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div
            data-animate="floating-section"
            className={`text-center mb-16 transition-all duration-800 ${
              isVisible["floating-section"] ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <h2 className="font-display text-5xl md:text-7xl font-semibold text-white mb-6">
              <span className="text-white/50">Everything</span> You Need
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              From intimate gatherings to grand celebrations, we bring your
              vision to life with our premium rental collection
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
            {valueProps.map((prop, i) => {
              const Icon = prop.icon;
              return (
                <div
                  key={prop.title}
                  className={`glass-effect rounded-2xl p-8 text-center transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.15] ${
                    isVisible["floating-section"]
                      ? "animate-fade-in-up"
                      : "opacity-0"
                  }`}
                  style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-bloom-green flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white mb-2">
                    {prop.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {prop.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate("/eventbooking")}
              className="bg-bloom-rose hover:bg-bloom-rose-dark text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              Explore Our Collection
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div
        data-animate="stats"
        className="section-content py-20 bg-bloom-ivory relative overflow-hidden"
      >
        <div className="blob blob-c absolute -top-16 right-1/4 w-72 h-72 bg-bloom-blush/50" />
        <div className="blob blob-a absolute bottom-0 -left-16 w-64 h-64 bg-bloom-green/10" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`glass-panel-light rounded-2xl py-8 text-center transition-all duration-500 ${
                  isVisible["stats"]
                    ? index % 2 === 0
                      ? "animate-slide-in-left"
                      : "animate-slide-in-right"
                    : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="font-display text-4xl font-semibold text-brand mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-500 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us — auto-sliding cards */}
      <div className="section-content py-24 md:py-28 bg-bloom-rose-dark relative overflow-hidden marquee-pause-group">
        {/* Bold, irregular wobble — deliberately a different rhythm from the value-prop section's edge */}
        <svg
          className="absolute top-0 left-0 w-full h-16 md:h-24 z-10"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,0 L0,60 C160,10 260,95 420,45 C560,2 660,80 820,55 C980,28 1100,90 1260,35 C1350,4 1400,55 1440,30 L1440,0 Z"
            className="fill-bloom-ivory"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-full h-16 md:h-24 z-10 rotate-180"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,0 L0,35 C140,85 240,5 400,50 C540,90 650,15 810,48 C970,80 1080,8 1240,52 C1330,80 1390,20 1440,45 L1440,0 Z"
            className="fill-bloom-ivory"
          />
        </svg>

        <div className="blob blob-a absolute top-0 left-1/4 w-96 h-96 bg-white/10" />
        <div className="blob blob-c absolute bottom-0 right-1/4 w-80 h-80 bg-bloom-gold/15" />

        <div
          data-animate="specializations"
          className={`max-w-7xl mx-auto px-4 mb-12 relative z-10 transition-all duration-800 ${
            isVisible["specializations"] ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-center text-white mb-4">
            {companyInfo?.specialize?.length > 0
              ? "Our Specializations"
              : "Why Choose Us"}
          </h2>
          <p className="text-lg text-center text-white/80">
            Experience the difference with our premium service
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex animate-slide-left space-x-6">
            {[...autoSlideCards, ...autoSlideCards].map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className="flex-shrink-0 w-80 glass-effect rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.18] hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Company Location Map Section */}
      <div
        data-animate="location-map"
        className={`section-content py-20 bg-bloom-ivory relative overflow-hidden ${
          isVisible["location-map"] ? "animate-fade-in-up" : "opacity-0"
        }`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='%232F5D3A' fill-opacity='0.12'/%3E%3C/svg%3E\")",
        }}
      >

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-gray-800 mb-4">
              Find Us Here
            </h2>
            <p className="text-xl text-gray-600">
              Visit our location or get in touch with us
            </p>
            <div className="w-16 h-1 bg-bloom-rose mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Full Width Map */}
          <div className="relative mb-12">
            <div className="blob blob-a absolute -top-10 -left-10 w-56 h-56 bg-bloom-rose/20 -z-10" />
            <div className="blob blob-b absolute -bottom-10 -right-10 w-64 h-64 bg-bloom-green/20 -z-10" />

            {/* Photo-mat frame around the map */}
            <div className="bg-white p-3 md:p-4 rounded-[2.5rem] shadow-2xl">
              <div className="w-full h-80 md:h-96 rounded-[2rem] rounded-tr-[3.5rem] overflow-hidden relative">
                <iframe
                  src={getMapUrl(companyInfo?.location)}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full grayscale-[15%]"
                  title={`Company Location - ${
                    companyInfo?.location || "Default Location"
                  }`}
                ></iframe>
              </div>

              {/* Caption bar — kept off the map itself so it never collides with Google's own labels */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2 pt-4 pb-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 min-w-0">
                  <MapPin className="w-4 h-4 text-bloom-rose shrink-0" />
                  <span className="truncate">
                    {companyInfo?.location ||
                      "178B Corporation Drive, Dolphin Estate, Ikoyi"}
                  </span>
                </div>
                <a
                  href={getDirectionsUrl(companyInfo?.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-bloom-green-600 hover:text-bloom-green-700 transition-colors shrink-0"
                >
                  Get Directions →
                </a>
              </div>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel-light rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-bloom-green rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Easy to Find</h4>
              <p className="text-sm text-gray-600">
                Centrally located with ample parking space
              </p>
            </div>

            <div className="glass-panel-light rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-bloom-rose rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Showroom Visits
              </h4>
              <p className="text-sm text-gray-600">
                See our equipment before you book
              </p>
            </div>

            <div className="glass-panel-light rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-bloom-gold rounded-full flex items-center justify-center mx-auto mb-4">
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

      {/* Company Info Section — blended into the ivory zone above it, no seam */}
      {userData?.name && (
        <div
          data-animate="company-info"
          className={`section-content pt-4 pb-24 bg-bloom-ivory relative overflow-hidden transition-all duration-800 ${
            isVisible["company-info"] ? "animate-fade-in-up" : "opacity-0"
          }`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='%232F5D3A' fill-opacity='0.12'/%3E%3C/svg%3E\")",
          }}
        >
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="mb-8">
              <Award className="w-14 h-14 mx-auto text-brand mb-4" />
              <h2 className="font-display text-3xl font-semibold text-gray-800 mb-4">
                About {userData.name}
              </h2>
            </div>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {userData.bio}
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
              {userData.joinDate && dayjs(userData.joinDate).isValid() && (
                <div className="flex items-center glass-panel-light px-4 py-2 rounded-full">
                  <span className="font-semibold">Established:</span>
                  <span className="ml-2">
                    {dayjs(userData.joinDate).format("DD/MM/YYYY")}
                  </span>
                </div>
              )}
              {userData.location && (
                <div className="flex items-center glass-panel-light px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{userData.location}</span>
                </div>
              )}
              {companyInfo?.specialize?.slice(0, 4).map((spec) => (
                <div
                  key={spec}
                  className="flex items-center glass-panel-light px-4 py-2 rounded-full"
                >
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Wobbly bookend into the dark CTA section below */}
          <svg
            className="absolute bottom-0 left-0 w-full h-14 md:h-20 rotate-180"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,0 L0,42 C90,78 180,8 290,38 C400,68 470,14 580,52 C690,90 780,22 900,58 C1020,94 1110,26 1230,50 C1320,68 1380,34 1440,48 L1440,0 Z"
              className="fill-bloom-charcoal"
            />
          </svg>
        </div>
      )}

      {/* Call to Action Section */}
      <div className="section-content py-24 bg-bloom-charcoal relative overflow-hidden">
        <div className="blob blob-a absolute top-10 left-10 w-72 h-72 bg-bloom-green/25" />
        <div className="blob blob-b absolute bottom-10 right-10 w-96 h-96 bg-bloom-rose/20" />

        <div
          data-animate="cta-section"
          className={`relative z-10 max-w-4xl mx-auto px-4 text-center transition-all duration-800 ${
            isVisible["cta-section"] ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className="font-display text-4xl md:text-6xl font-semibold text-white mb-6">
            Ready to Create Your
            <span className="block mt-2 text-bloom-rose-light">
              Perfect Event?
            </span>
          </h2>
          <p className="text-xl text-white/70 mb-8 leading-relaxed max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their most
            important moments. Let's make your next event unforgettable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/eventbooking")}
              className="bg-bloom-rose hover:bg-bloom-rose-dark text-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center"
            >
              <Calendar className="mr-2 w-5 h-5" />
              Book Your Event
            </button>
            <button
              onClick={handleWhatsApp}
              className="bg-[#25D366] hover:bg-[#1FBE5B] text-[#0B3B1E] px-8 py-4 rounded-full text-lg font-bold transition-colors duration-300 shadow-2xl flex items-center"
            >
              <WhatsAppIcon className="mr-2 w-5 h-5" />
              Chat on WhatsApp
            </button>
          </div>
          <button
            onClick={() => navigate("/request-quote")}
            className="mt-6 text-sm text-white/60 hover:text-white underline-offset-4 hover:underline"
          >
            Prefer a formal written quote? Request one
          </button>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="flex items-center text-white/60">
              <Star className="w-5 h-5 text-bloom-gold mr-2" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
            <div className="flex items-center text-white/60">
              <Users className="w-5 h-5 mr-2" />
              <span className="text-sm">500+ Happy Clients</span>
            </div>
            <div className="flex items-center text-white/60">
              <Award className="w-5 h-5 mr-2" />
              <span className="text-sm">Premium Quality</span>
            </div>
          </div>
        </div>
      </div>

      <WhatsAppSheet
        isOpen={waSheetOpen}
        onClose={() => setWaSheetOpen(false)}
        message={HOME_GREETING}
        title="Chat on WhatsApp"
      />
    </>
  );
};

export default HomePage;
