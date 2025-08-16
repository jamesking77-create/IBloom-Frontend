// screens/users/AboutPage.js
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Award,
  Users,
  Calendar,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const { userData } = useSelector((state) => state.profile);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: Calendar, number: "500+", label: "Events Completed" },
    { icon: Users, number: "1000+", label: "Happy Clients" },
    { icon: Award, number: "5+", label: "Years Experience" },
    { icon: Star, number: "4.9", label: "Average Rating" },
  ];

  const features = [
    "Premium Quality Equipment",
    "Professional Setup Service",
    "24/7 Customer Support",
    "Flexible Rental Packages",
    "Expert Event Consultation",
    "Timely Delivery & Pickup",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div
            className={`text-center text-white transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About {userData?.name || "IBLOOM"}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              {userData?.bio ||
                "Your premier destination for exceptional event rentals, creating unforgettable experiences for every occasion."}
            </p>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-ping"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transform transition-all duration-700 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transform transition-all duration-1000 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-10 opacity-0"
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Founded with a passion for creating extraordinary events,{" "}
                {userData?.name || "IBLOOM"} has been at the forefront of the
                event rental industry. We understand that every celebration is
                unique, and we're committed to providing the perfect elements to
                bring your vision to life.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                From intimate gatherings to grand celebrations, our extensive
                collection of premium rental items and dedicated team ensures
                your event is nothing short of spectacular.
              </p>
              <div className="flex flex-wrap gap-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`transform transition-all duration-1000 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300"></div>
                  <div className="h-32 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300"></div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300"></div>
                  <div className="h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div
            className={`text-center mb-12 transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              What We Specialize In
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We offer a comprehensive range of services to make your event
              planning seamless and stress-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(userData?.specialize && userData.specialize.length > 0
              ? userData.specialize
              : [
                  "Wedding Rentals",
                  "Corporate Events",
                  "Birthday Parties",
                  "Anniversary Celebrations",
                  "Graduation Parties",
                  "Baby Showers",
                ]
            ).map((service, index) => (
              <div
                key={index}
                className={`group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 transform transition-all duration-500 hover:-translate-y-2 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {service}
                </h3>
                <p className="text-gray-600">
                  Professional {service.toLowerCase()} with premium quality
                  equipment and exceptional service.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Let's work together to make your next event unforgettable.
            </p>
            <button
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
              onClick={() => {
                navigate("/", { state: { scrollToCategories: true } });
              }}
            >
              Get Started Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
