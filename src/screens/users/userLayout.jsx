import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Facebook,
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
  Smartphone,
  MessageCircle,
} from "lucide-react";
import logoimg from "../../assets/newiblooms.png";
import fullLogo from "../../assets/newiblooms.png";
import { fetchCompanyInfo } from "../../store/slices/publicCompanyInfoSlice";

const UserLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRentalsDropdownOpen, setIsRentalsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { companyInfo } = useSelector((state) => state.public);

  useEffect(() => {
    dispatch(fetchCompanyInfo());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategorySelect = (category) => {
    navigate(`/category/${category.id}`, { state: { category } });
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsRentalsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(".dropdown-container")) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { to: "/about", label: "About Us" },
    { to: "/faq", label: "FAQ" },
    { to: "/gallery", label: "Gallery" },
    { to: "/contact", label: "Contact" },
  ];

  const mobileNavLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/about", label: "About Us", icon: Info },
    { to: "/faq", label: "FAQ", icon: HelpCircle },
    { to: "/gallery", label: "Gallery", icon: ImageIcon },
    { to: "/contact", label: "Contact", icon: PhoneCall },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style>
        {`
          @keyframes slideInRight {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOutRight {
            0% { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
          }
          @keyframes fadeInUp {
            0% { transform: translateY(16px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeOutDown {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(16px); opacity: 0; }
          }

          .mobile-menu-enter { animation: slideInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
          .mobile-menu-exit { animation: slideOutRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
          .menu-item-enter { animation: fadeInUp 0.35s ease-out forwards; }
          .menu-item-exit { animation: fadeOutDown 0.2s ease-in forwards; }

          .menu-item-0 { animation-delay: 0.05s; }
          .menu-item-1 { animation-delay: 0.1s; }
          .menu-item-2 { animation-delay: 0.15s; }
          .menu-item-3 { animation-delay: 0.2s; }
          .menu-item-4 { animation-delay: 0.25s; }
          .menu-item-5 { animation-delay: 0.3s; }
          .menu-item-6 { animation-delay: 0.35s; }

          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(47, 93, 58, 0.3); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(47, 93, 58, 0.5); }

          .glass-nav {
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(20px) saturate(160%);
            -webkit-backdrop-filter: blur(20px) saturate(160%);
            border: 1px solid rgba(255, 255, 255, 0.5);
          }
          .glass-panel {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(18px) saturate(160%);
            -webkit-backdrop-filter: blur(18px) saturate(160%);
            border: 1px solid rgba(255, 255, 255, 0.6);
          }

          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>

      {/* Desktop / Tablet Navigation */}
      <nav className="hidden md:block fixed top-4 inset-x-0 z-50 px-4">
        <div
          className={`glass-nav mx-auto flex items-center justify-between rounded-full shadow-[0_8px_30px_rgb(163,43,94,0.1)] transition-all duration-500 ease-out ${
            isScrolled ? "max-w-3xl px-5 py-2" : "max-w-5xl px-8 py-3"
          }`}
        >
          <Link to="/" className="flex items-center shrink-0">
            <img
              src={logoimg}
              alt="Ibloom Decor Rentals"
              className={`w-auto transition-all duration-500 ${
                isScrolled ? "h-10" : "h-14"
              }`}
            />
          </Link>

          <div className="hidden lg:flex items-center gap-7 mx-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 hover:text-bloom-green transition-colors duration-200"
            >
              Home
            </Link>

            <div className="relative dropdown-container">
              <button
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-bloom-green transition-colors duration-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
              >
                Rentals
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 glass-panel rounded-2xl shadow-xl transition-all duration-200 ${
                  isMenuOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="p-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {companyInfo.categories &&
                  companyInfo.categories.length > 0 ? (
                    companyInfo.categories.map((category) => (
                      <button
                        key={category.id}
                        className="w-full text-left px-4 py-3 hover:bg-bloom-blush/50 rounded-xl transition-colors duration-150 flex items-center gap-3 group/item"
                        onClick={() => handleCategorySelect(category)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-bloom-blush flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform duration-150">
                          <span className="text-bloom-green font-semibold text-sm">
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

            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-gray-700 hover:text-bloom-green transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Tablet-only compact links */}
          <div className="hidden md:flex lg:hidden items-center gap-4 mx-4">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 hover:text-bloom-green transition-colors"
            >
              Home
            </Link>
            <div className="relative dropdown-container">
              <button
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-bloom-green transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                Rentals
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 glass-panel rounded-2xl shadow-xl transition-all duration-200 ${
                  isMenuOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {companyInfo.categories &&
                  companyInfo.categories.length > 0 ? (
                    companyInfo.categories.map((category) => (
                      <button
                        key={category.id}
                        className="w-full text-left px-3 py-2 hover:bg-bloom-blush/50 rounded-lg transition-colors duration-150 flex items-center gap-2"
                        onClick={() => handleCategorySelect(category)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-bloom-blush flex items-center justify-center shrink-0">
                          <span className="text-bloom-green font-semibold text-xs">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800 text-sm">
                          {category.name}
                        </span>
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
              className="text-sm font-medium text-gray-700 hover:text-bloom-green transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-700 hover:text-bloom-green transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/eventbooking")}
              className="hidden lg:inline-flex items-center bg-bloom-rose hover:bg-bloom-rose-dark text-white px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.03] shadow-md"
            >
              Book
            </button>
            <button
              onClick={() => navigate("/eventbooking")}
              className="lg:hidden p-2 rounded-full hover:bg-white/60 transition-colors"
              aria-label="View cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 glass-nav border-b border-white/40 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center">
            <img
              src={logoimg}
              alt="Ibloom Decor Rentals"
              className="h-10 w-auto"
            />
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/eventbooking")}
              className="p-2.5 hover:bg-white/60 rounded-full transition-colors duration-200"
              aria-label="View cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 hover:bg-white/60 rounded-full transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        <div
          className={`fixed inset-0 bg-gray-900/40 transition-opacity duration-300 z-40 ${
            isMobileMenuOpen
              ? "opacity-100 backdrop-blur-sm"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div
          className={`fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] h-screen glass-panel shadow-2xl border-l border-white/40 ${
            isMobileMenuOpen ? "mobile-menu-enter" : "mobile-menu-exit"
          }`}
        >
          <div className="flex flex-col h-screen">
            <div
              className={`flex items-center justify-between p-6 border-b border-gray-200/60 shrink-0 ${
                isMobileMenuOpen
                  ? "menu-item-enter menu-item-0"
                  : "menu-item-exit"
              }`}
            >
              <img
                src={fullLogo}
                alt="Ibloom Decor Rentals"
                className="h-10 w-auto"
              />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 space-y-1">
                <div
                  className={
                    isMobileMenuOpen
                      ? "menu-item-enter menu-item-1"
                      : "menu-item-exit"
                  }
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 hover:bg-bloom-blush/50 hover:text-bloom-green transition-colors duration-200 group"
                    onClick={() =>
                      setIsRentalsDropdownOpen(!isRentalsDropdownOpen)
                    }
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-bloom-blush transition-colors duration-200">
                        <Package className="w-5 h-5 group-hover:text-bloom-green" />
                      </div>
                      <span className="font-medium">Our Rentals</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        isRentalsDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isRentalsDropdownOpen
                        ? "max-h-64 opacity-100 mt-2"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="bg-gray-50/80 rounded-xl border border-gray-200/60 mx-4 overflow-y-auto custom-scrollbar max-h-60">
                      {companyInfo.categories &&
                      companyInfo.categories.length > 0 ? (
                        companyInfo.categories.map((category) => (
                          <button
                            key={category.id}
                            className="w-full text-left px-4 py-3 hover:bg-white transition-colors duration-150 flex items-center gap-3 border-b border-gray-200/40 last:border-b-0"
                            onClick={() => handleCategorySelect(category)}
                          >
                            <div className="w-8 h-8 rounded-lg bg-bloom-green flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0">
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

                {mobileNavLinks.map((link, index) => {
                  const IconComponent = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-bloom-blush/50 hover:text-bloom-green transition-colors duration-200 group ${
                        isMobileMenuOpen
                          ? `menu-item-enter menu-item-${index + 2}`
                          : "menu-item-exit"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-bloom-blush transition-colors duration-200">
                        <IconComponent className="w-5 h-5 group-hover:text-bloom-green" />
                      </div>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div
              className={`p-6 border-t border-gray-200/60 shrink-0 ${
                isMobileMenuOpen
                  ? `menu-item-enter menu-item-${mobileNavLinks.length + 2}`
                  : "menu-item-exit"
              }`}
            >
              <button
                onClick={() => {
                  navigate("/eventbooking");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-bloom-rose hover:bg-bloom-rose-dark text-white px-6 py-4 rounded-xl transition-all duration-200 shadow-lg font-semibold text-base hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Book Event Now
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="pt-16 md:pt-0">
        <main>
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="relative bg-bloom-charcoal text-white pt-20 pb-10 overflow-hidden">
        <div className="absolute inset-0 opacity-50 pointer-events-none">
          <div className="blob blob-a absolute -top-24 left-1/4 w-96 h-96 bg-bloom-green/25" />
          <div className="blob blob-b absolute -bottom-24 right-1/4 w-96 h-96 bg-bloom-rose/20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-4 md:col-span-1">
              <h3 className="font-display text-2xl font-semibold">
                {companyInfo.name || "Ibloom"}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {companyInfo.bio ||
                  "Your premier destination for event rentals. Making every occasion extraordinary."}
              </p>
              <div className="flex gap-3 pt-1">
                <a
                  href="https://facebook.com/ibloomrentals"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors duration-200"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com/ibloomrentals"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors duration-200"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://tiktok.com/@ibloomrentals"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.321 5.562a5.122 5.122 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.133-1.905-1.133-3.019V.833h-3.1v14.895c0 1.419-1.156 2.574-2.575 2.574s-2.575-1.155-2.575-2.574c0-1.42 1.156-2.575 2.575-2.575.284 0 .557.046.814.132V9.704a5.65 5.65 0 0 0-.814-.058c-3.145 0-5.693 2.548-5.693 5.693s2.548 5.693 5.693 5.693 5.693-2.548 5.693-5.693V8.235a8.626 8.626 0 0 0 4.925 1.526V6.643c-.584 0-1.149-.108-1.665-.315a4.472 4.472 0 0 1-.765-.381z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300 mb-4">
                Services
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {companyInfo?.specialize &&
                companyInfo?.specialize?.length > 0 ? (
                  companyInfo.specialize.slice(0, 4).map((service, index) => (
                    <li key={index}>
                      <span className="hover:text-white transition-colors duration-200 cursor-pointer">
                        {service}
                      </span>
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <span className="hover:text-white transition-colors duration-200 cursor-pointer">
                        Wedding Rentals
                      </span>
                    </li>
                    <li>
                      <span className="hover:text-white transition-colors duration-200 cursor-pointer">
                        Corporate Events
                      </span>
                    </li>
                    <li>
                      <span className="hover:text-white transition-colors duration-200 cursor-pointer">
                        Party Supplies
                      </span>
                    </li>
                    <li>
                      <span className="hover:text-white transition-colors duration-200 cursor-pointer">
                        Tent Rentals
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300 mb-4">
                Categories
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {companyInfo.categories && companyInfo.categories.length > 0 ? (
                  companyInfo.categories.slice(0, 4).map((category) => (
                    <li key={category.id}>
                      <Link
                        to={`/category/${category.id}`}
                        className="hover:text-white transition-colors duration-200"
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
                        className="hover:text-white transition-colors duration-200"
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/gallery"
                        className="hover:text-white transition-colors duration-200"
                      >
                        Gallery
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/faq"
                        className="hover:text-white transition-colors duration-200"
                      >
                        FAQ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/contact"
                        className="hover:text-white transition-colors duration-200"
                      >
                        Contact
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300 mb-4">
                Contact
              </h4>
              <div className="space-y-3 text-sm text-slate-400">
                {companyInfo.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-bloom-green-light shrink-0" />
                    <span>{companyInfo.phone}</span>
                  </div>
                )}

                {companyInfo.mobile && (
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{companyInfo.mobile}</span>
                  </div>
                )}

                {companyInfo.whatsapp && (
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <a
                      href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors duration-200 hover:underline"
                    >
                      {companyInfo.whatsapp}
                    </a>
                  </div>
                )}

                {companyInfo.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                    <a
                      href={`mailto:${companyInfo.email}`}
                      className="hover:text-white transition-colors duration-200 hover:underline"
                    >
                      {companyInfo.email}
                    </a>
                  </div>
                )}

                {companyInfo.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{companyInfo.location}</span>
                  </div>
                )}

                {!companyInfo.phone &&
                  !companyInfo.mobile &&
                  !companyInfo.whatsapp &&
                  !companyInfo.email &&
                  !companyInfo.location && (
                    <>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-bloom-green-light shrink-0" />
                        <span>0817-225-8085</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                        <a
                          href="mailto:adeoyemayopoelijah@gmail.com"
                          className="hover:text-white transition-colors duration-200 hover:underline"
                        >
                          adeoyemayopoelijah@gmail.com
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>85B, Lafiaji Way, Dolphin Estate</span>
                      </div>
                    </>
                  )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-14 pt-8 text-center text-sm text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} {companyInfo.name || "Ibloom"}.
              All rights reserved. &nbsp;|&nbsp; Privacy Policy &nbsp;|&nbsp;
              Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
