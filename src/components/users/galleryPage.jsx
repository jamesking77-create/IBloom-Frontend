// screens/users/GalleryPage.js
import React, { useState, useEffect } from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Camera,
  Play,
  Eye,
  Heart,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const GalleryPage = () => {
  const navigate = useNavigate();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredImage, setHoveredImage] = useState(null);

  // Loading animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
            setIsVisible(true);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const categories = [
    { id: "all", name: "All Events" },
    { id: "weddings", name: "Weddings" },
    { id: "corporate", name: "Corporate" },
    { id: "birthdays", name: "Birthdays" },
    { id: "parties", name: "Parties" },
  ];

  const galleryImages = [
    {
      id: 1,
      category: "weddings",
      src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
      title: "Elegant Wedding Setup",
      description: "Beautiful outdoor wedding with premium decor",
    },
    {
      id: 2,
      category: "corporate",
      src: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop",
      title: "Corporate Event",
      description: "Professional corporate gathering setup",
    },
    {
      id: 3,
      category: "birthdays",
      src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop",
      title: "Birthday Celebration",
      description: "Colorful and fun birthday party setup",
    },
    {
      id: 4,
      category: "weddings",
      src: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=600&h=400&fit=crop",
      title: "Garden Wedding",
      description: "Romantic garden wedding with fairy lights",
    },
    {
      id: 5,
      category: "parties",
      src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop",
      title: "Evening Party",
      description: "Sophisticated evening party atmosphere",
    },
    {
      id: 6,
      category: "corporate",
      src: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&h=400&fit=crop",
      title: "Conference Setup",
      description: "Modern conference and seminar setup",
    },
    {
      id: 7,
      category: "weddings",
      src: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&h=400&fit=crop",
      title: "Beach Wedding",
      description: "Stunning beachside wedding ceremony",
    },
    {
      id: 8,
      category: "birthdays",
      src: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&h=400&fit=crop",
      title: "Kids Birthday",
      description: "Fun and colorful kids birthday party",
    },
    {
      id: 9,
      category: "parties",
      src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
      title: "Cocktail Party",
      description: "Elegant cocktail party with premium setup",
    },
  ];

  const filteredImages =
    selectedCategory === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-24 h-24 bg-purple-500/10 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-500/10 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-green-500/10 rounded-full animate-pulse"></div>
        </div>

        <div className="text-center relative z-10 px-4">
          <Camera className="w-20 h-20 mx-auto mb-8 text-white animate-bounce" />

          <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 tracking-wider">
            GALLERY
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-12">
            LOADING
          </h2>

          <p className="text-lg md:text-xl text-gray-300 mb-16 max-w-md mx-auto">
            ALMOST READY
          </p>

          {/* Progress Bar */}
          <div className="w-80 md:w-96 mx-auto mb-16">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>0%</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <div className="text-center text-white text-lg font-semibold mt-4">
              {loadingProgress}%
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center space-x-8">
            <div className="w-12 h-12 border-2 border-gray-600 rounded-full flex items-center justify-center hover:border-blue-500 transition-colors duration-300 cursor-pointer group">
              <Facebook className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="w-12 h-12 border-2 border-gray-600 rounded-full flex items-center justify-center hover:border-pink-500 transition-colors duration-300 cursor-pointer group">
              <Instagram className="w-6 h-6 text-gray-400 group-hover:text-pink-500 transition-colors" />
            </div>
            <div className="w-12 h-12 border-2 border-gray-600 rounded-full flex items-center justify-center hover:border-blue-400 transition-colors duration-300 cursor-pointer group">
              <Twitter className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div
            className={`text-white transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <Camera className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Event Gallery
            </h1>
            <p className="text-xl md:text-2xl leading-relaxed">
              Explore our stunning collection of memorable events and
              celebrations
            </p>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
      </section>

      {/* Filter Tabs */}
      <section className="py-12 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div
            className={`flex flex-wrap justify-center gap-4 transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-700 hover:-translate-y-2 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredImage(image.id)}
                onMouseLeave={() => setHoveredImage(null)}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                      hoveredImage === image.id ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                      <p className="text-gray-200 text-sm mb-4">
                        {image.description}
                      </p>

                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full hover:bg-white/30 transition-colors">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">View</span>
                        </button>
                        <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full hover:bg-white/30 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">Like</span>
                        </button>
                        <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full hover:bg-white/30 transition-colors">
                          <Share2 className="w-4 h-4" />
                          <span className="text-sm">Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div
            className={`text-center mb-12 transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Event Highlights
            </h2>
            <p className="text-gray-600 text-lg">
              Watch some of our most memorable event moments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                thumbnail:
                  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop",
                title: "Wedding Ceremony Highlights",
                duration: "2:45",
              },
              {
                thumbnail:
                  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
                title: "Corporate Event Setup",
                duration: "1:30",
              },
            ].map((video, index) => (
              <div
                key={index}
                className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transform transition-all duration-500 hover:scale-105 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="aspect-video relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-gray-800 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-semibold mb-1">
                      {video.title}
                    </h3>
                    <span className="text-sm text-gray-200">
                      {video.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Create Your Own Memorable Event?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Let us help you bring your vision to life with our premium rental
              services.
            </p>
            <button
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
              onClick={() => {
                navigate("/", { state: { scrollToCategories: true } });
              }}
            >
              Start Planning Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
