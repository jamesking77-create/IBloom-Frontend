// screens/users/ContactPage.js
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { post } from "../../utils/api";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const ContactPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { userData } = useSelector((state) => state.profile);

  // Admin email fallback
  const adminEmail = userData?.email || "adeoyemayopoelijah@gmail.com";

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");

    // Simulate form submission
    try {
      const payload = {
        to: adminEmail,
        subject: `New Contact Inquiry from ${formData.name} - ${
          formData.eventType || "General"
        }`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">New Contact Message</h2>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone || "Not provided"}</p>
            <p><strong>Event Type:</strong> ${
              formData.eventType || "Not specified"
            }</p>
            <p><strong>Event Date:</strong> ${
              formData.eventDate || "Not specified"
            }</p>
            <p><strong>Message:</strong> ${formData.message.replace(
              /\n/g,
              "<br>"
            )}</p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">Sent on: ${new Date().toLocaleString()}</p>
          </div>
        `,
        from: {
          name: formData.name.trim(),
          email: formData.email.trim(),
        },
      };

      // Send to /api/mailer/send-email (adjust if your base URL prefix is different)
      await post("/api/mailer/send-email", payload);

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        eventType: "",
        eventDate: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error.message || "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  // Helper function to generate map URL based on location
  const getMapUrl = (location) => {
    if (!location) {
      // Fallback to default location
      return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.789!2d3.4347!3d6.4548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf50c5b1f5b5b%3A0x2d4e8f6a7c9b1234!2s178B%20Corporation%20Drive%2C%20Dolphin%20Estate%2C%20Ikoyi%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1735649200";
    }

    // Create a search-based embed URL that doesn't require API key
    const encodedLocation = encodeURIComponent(location);
    return `https://maps.google.com/maps?width=100%25&height=600&hl=en&q=${encodedLocation}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  };

  // Helper function to get Google Maps directions URL
  const getDirectionsUrl = (location) => {
    if (!location) {
      return "https://maps.google.com/dir/?api=1&destination=178B+Corporation+Drive+Dolphin+Estate+Ikoyi+Lagos+Nigeria";
    }
    const encodedLocation = encodeURIComponent(location);
    return `https://maps.google.com/dir/?api=1&destination=${encodedLocation}`;
  };

  // Helper function to get Google Maps search URL
  const getLocationSearchUrl = (location) => {
    if (!location) {
      return "https://maps.google.com/?q=Corporation+Drive+Dolphin+Estate+Ikoyi+Lagos";
    }
    const encodedLocation = encodeURIComponent(location);
    return `https://maps.google.com/?q=${encodedLocation}`;
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: userData?.phone || "No phone number available",
      href: userData?.phone ? `tel:${userData.phone}` : "#",
      color: "text-green-600",
      available: !!userData?.phone,
    },
    {
      icon: Mail,
      title: "Email",
      details: userData?.email || "No email available",
      href: userData?.email ? `mailto:${userData.email}` : "#",
      color: "text-blue-600",
      available: !!userData?.email,
    },
    {
      icon: MapPin,
      title: "Location",
      details: userData?.location || "No location available",
      href: getLocationSearchUrl(userData?.location),
      color: "text-red-600",
      available: !!userData?.location,
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Mon - Sat: 8AM - 8PM",
      href: "#",
      color: "text-purple-600",
      available: true,
    },
  ];

  const eventTypes = [
    "Wedding",
    "Birthday Party",
    "Corporate Event",
    "Anniversary",
    "Baby Shower",
    "Graduation",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-teal-600 via-blue-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div
            className={`text-white transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <MessageCircle className="w-16 h-16 mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Get In Touch
            </h1>
            <p className="text-xl md:text-2xl leading-relaxed">
              Ready to plan your perfect event? We're here to help make it
              extraordinary.
            </p>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/10 rounded-full animate-ping"></div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 text-center group transform transition-all duration-500 hover:-translate-y-2 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                } ${!info.available ? "opacity-60" : ""}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div
                  className={`w-12 h-12 ${info.color} bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <info.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {info.title}
                </h3>
                {info.available && info.href !== "#" ? (
                  <a
                    href={info.href}
                    target={info.title === "Location" ? "_blank" : "_self"}
                    rel={info.title === "Location" ? "noopener noreferrer" : ""}
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm break-words"
                  >
                    {info.details}
                  </a>
                ) : (
                  <span className="text-gray-600 text-sm break-words">
                    {info.details}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div
              className={`transform transition-all duration-1000 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-10 opacity-0"
              }`}
            >
              <div className="bg-gray-50 p-8 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Send Us a Message
                </h2>
                <p className="text-gray-600 mb-8">
                  Fill out the form below and we'll get back to you within 24
                  hours.
                </p>

                {/* Status Messages */}
                {submitStatus === "success" && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    Message sent successfully! We'll get back to you soon.
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    Something went wrong. Please try again.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Type
                      </label>
                      <select
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select event type</option>
                        {eventTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Tell us about your event requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transform hover:scale-105 disabled:scale-100 transition-all duration-300 shadow-lg flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-3" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Map & Additional Info */}
            <div
              className={`transform transition-all duration-1000 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
            >
              <div className="h-full flex flex-col">
                {/* Interactive Map */}
                <div className="rounded-2xl h-64 mb-6 overflow-hidden shadow-lg border border-gray-200 relative group">
                  {userData?.location ? (
                    <iframe
                      src={getMapUrl(userData.location)}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`IBLOOM Location - ${userData.location}`}
                    ></iframe>
                  ) : (
                    // Fallback map when no location data is available
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.789!2d3.4347!3d6.4548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf50c5b1f5b5b%3A0x2d4e8f6a7c9b1234!2s178B%20Corporation%20Drive%2C%20Dolphin%20Estate%2C%20Ikoyi%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1735649200"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="IBLOOM Location - Default Location"
                    ></iframe>
                  )}

                  {/* Map overlay with company info */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-gray-800">
                      {userData?.name || "IBLOOM Rentals"}
                    </p>
                    <p className="text-xs text-gray-600 max-w-xs truncate">
                      {userData?.location
                        ? userData.location.split(",")[0]
                        : "No 178B Corporation Drive"}
                    </p>
                  </div>
                </div>

                {/* Get Directions Button */}
                <div className="mb-8">
                  <a
                    href={getDirectionsUrl(userData?.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center transform hover:scale-105 transition-all duration-300 shadow-lg ${
                      !userData?.location ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <MapPin className="w-5 h-5 mr-3" />
                    Get Directions
                  </a>
                </div>

                {/* Additional Info Cards */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      Quick Response Guarantee
                    </h3>
                    <p className="text-gray-600">
                      We respond to all inquiries within 24 hours. For urgent
                      requests, please call us directly{" "}
                      {userData?.phone
                        ? `at ${userData.phone}`
                        : "via the contact form"}
                      .
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl border border-green-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      Free Consultation
                    </h3>
                    <p className="text-gray-600">
                      Schedule a free consultation to discuss your event needs
                      and get personalized recommendations from our experts.
                    </p>
                  </div>

                  {/* Social Media */}
                  <div className="bg-gray-900 p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Follow Us
                    </h3>
                    <div className="flex space-x-4">
                      <a
                        href="https://facebook.com/ibloomrentals"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transform hover:scale-110 transition-all duration-300"
                      >
                        <Facebook className="w-5 h-5 text-white" />
                      </a>
                      <a
                        href="https://instagram.com/ibloomrentals"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transform hover:scale-110 transition-all duration-300"
                      >
                        <Instagram className="w-5 h-5 text-white" />
                      </a>
                      <a
                        href="https://twitter.com/ibloomrentals"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transform hover:scale-110 transition-all duration-300"
                      >
                        <Twitter className="w-5 h-5 text-white" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Have Questions?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Check out our frequently asked questions or get in touch directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-gray-800 px-6 py-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 font-medium">
                View FAQ
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 font-medium">
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
