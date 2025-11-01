import React, { useState, useEffect, useCallback } from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Camera,
  Play,
  Eye,
  Heart,
  Share2,
  X,
  Download,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { get } from "../../utils/api";


const GalleryPage = () => {
  const navigate = useNavigate();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredImage, setHoveredImage] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [fetchingGallery, setFetchingGallery] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Fetch gallery from API
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await get("/api/gallery?limit=100");
        setGalleryItems(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
        setGalleryItems([]);
      } finally {
        setFetchingGallery(false);
      }
    };

    fetchGallery();
  }, []);

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
    { id: "all", name: "All Media" },
    { id: "image", name: "Images" },
    { id: "video", name: "Videos" },
  ];

  // Filter items by category
  const filteredItems =
    selectedCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.type === selectedCategory);

  // Separate images and videos for organized display
  const images = filteredItems.filter((item) => item.type === "image");
  const videos = filteredItems.filter((item) => item.type === "video");

  // Open image lightbox
  const openLightbox = useCallback(
    (item, index) => {
      setCurrentMedia(item);
      setCurrentIndex(index);
      setLightboxOpen(true);
      document.body.style.overflow = "hidden";
    },
    []
  );

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setCurrentMedia(null);
    document.body.style.overflow = "auto";
  }, []);

  // Navigate lightbox
  const navigateLightbox = useCallback(
    (direction) => {
      const displayItems = selectedCategory === "video" ? videos : selectedCategory === "image" ? images : galleryItems;
      const newIndex =
        direction === "next"
          ? (currentIndex + 1) % displayItems.length
          : (currentIndex - 1 + displayItems.length) % displayItems.length;
      setCurrentIndex(newIndex);
      setCurrentMedia(displayItems[newIndex]);
    },
    [currentIndex, selectedCategory, images, videos, galleryItems]
  );

  // Open video modal
  const openVideoModal = useCallback((video) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  // Close video modal
  const closeVideoModal = useCallback(() => {
    setVideoModalOpen(false);
    setSelectedVideo(null);
    document.body.style.overflow = "auto";
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen && !videoModalOpen) return;
      
      if (e.key === "Escape") {
        if (lightboxOpen) closeLightbox();
        if (videoModalOpen) closeVideoModal();
      } else if (lightboxOpen) {
        if (e.key === "ArrowLeft") navigateLightbox("prev");
        if (e.key === "ArrowRight") navigateLightbox("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, videoModalOpen, closeLightbox, closeVideoModal, navigateLightbox]);

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
      {(selectedCategory === "all" || selectedCategory === "image") && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            {selectedCategory === "all" && images.length > 0 && (
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Images</h2>
            )}

            {fetchingGallery ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[4/3] bg-gray-200 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {images.map((item, index) => (
                  <div
                    key={item._id || item.id}
                    className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-700 hover:-translate-y-2 cursor-pointer ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                    onMouseEnter={() => setHoveredImage(item._id || item.id)}
                    onMouseLeave={() => setHoveredImage(null)}
                    onClick={() => openLightbox(item, index)}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                      <img
                        src={item.url}
                        alt={item.filename || "Gallery image"}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />

                      {/* Overlay */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                          hoveredImage === (item._id || item.id)
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      >
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <h3 className="text-xl font-bold mb-2">
                            {item.filename || "Image"}
                          </h3>
                          <p className="text-gray-200 text-sm mb-4">
                            {item.formattedSize || ""}
                          </p>

                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full hover:bg-white/30 transition-colors">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">View</span>
                            </button>
                            <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full hover:bg-white/30 transition-colors">
                              <Maximize2 className="w-4 h-4" />
                              <span className="text-sm">Expand</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Camera className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No images available yet</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Video Section */}
      {(selectedCategory === "all" || selectedCategory === "video") && videos.length > 0 && (
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
              {videos.map((video, index) => (
                <div
                  key={video._id || video.id}
                  className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transform transition-all duration-500 hover:scale-105 ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                  onClick={() => openVideoModal(video)}
                >
                  <div className="aspect-video relative bg-gray-900">
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-8 h-8 text-gray-800 ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-lg font-semibold mb-1">
                        {video.filename || "Video"}
                      </h3>
                      <span className="text-sm text-gray-200">
                        {video.formattedSize || ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* Image Lightbox */}
      {lightboxOpen && currentMedia && currentMedia.type === "image" && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation Arrows */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 p-3 rounded-full z-50"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox("prev");
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 p-3 rounded-full z-50"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox("next");
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div
            className="max-w-7xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentMedia.url}
              alt={currentMedia.filename}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <h3 className="text-white text-xl font-bold mb-2">
                {currentMedia.filename}
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm">
                  {currentMedia.formattedSize}
                </span>
                {currentMedia.width && currentMedia.height && (
                  <span className="text-gray-300 text-sm">
                    {currentMedia.width} × {currentMedia.height}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {videoModalOpen && selectedVideo && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeVideoModal}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
            onClick={closeVideoModal}
          >
            <X className="w-8 h-8" />
          </button>

          <div
            className="max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selectedVideo.url}
              controls
              autoPlay
              className="w-full rounded-lg shadow-2xl"
            />
            <div className="bg-black/60 backdrop-blur-sm p-6 rounded-b-lg mt-2">
              <h3 className="text-white text-xl font-bold mb-2">
                {selectedVideo.filename}
              </h3>
              <div className="flex items-center space-x-4 text-gray-300 text-sm">
                <span>{selectedVideo.formattedSize}</span>
                {selectedVideo.duration && (
                  <span>{Math.round(selectedVideo.duration)}s</span>
                )}
                {selectedVideo.width && selectedVideo.height && (
                  <span>
                    {selectedVideo.width} × {selectedVideo.height}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;