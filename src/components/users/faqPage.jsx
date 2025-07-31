// screens/users/FAQPage.js
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';

const FaqPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const faqData = [
    {
      category: "Booking & Reservations",
      questions: [
        {
          question: "How far in advance should I book my rental items?",
          answer: "We recommend booking at least 2-4 weeks in advance for most events. For peak seasons (spring/summer weddings, holidays), we suggest booking 6-8 weeks ahead to ensure availability of your desired items."
        },
        {
          question: "Can I modify or cancel my booking?",
          answer: "Yes, you can modify your booking up to 48 hours before your event date. Cancellations made 7+ days in advance receive a full refund minus processing fees. Please refer to our terms and conditions for detailed cancellation policies."
        },
        {
          question: "Do you require a deposit?",
          answer: "Yes, we require a 50% deposit to secure your booking. The remaining balance is due 24 hours before your event date. We accept major credit cards, bank transfers, and cash payments."
        }
      ]
    },
    {
      category: "Delivery & Setup",
      questions: [
        {
          question: "Do you offer delivery and pickup services?",
          answer: "Absolutely! We provide full delivery, setup, and pickup services within our service area. Our professional team will handle everything so you can focus on enjoying your event."
        },
        {
          question: "What are your delivery charges?",
          answer: "Delivery charges vary based on distance and order size. Local deliveries (within 15 miles) start at $50. We offer free delivery for orders over $500 within our standard service area."
        },
        {
          question: "Can I pick up items myself?",
          answer: "Yes, you can choose to pick up items from our warehouse to save on delivery costs. Please schedule your pickup time in advance, and bring a suitable vehicle for transportation."
        }
      ]
    },
    {
      category: "Pricing & Payments",
      questions: [
        {
          question: "How is pricing calculated?",
          answer: "Pricing is based on the rental duration (typically 1-3 days), item type, and quantity. We offer competitive rates with transparent pricing - no hidden fees. Volume discounts are available for large orders."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express), bank transfers, cash, and mobile payments. Payment plans are available for large events upon request."
        },
        {
          question: "Are there any additional fees?",
          answer: "Additional fees may include delivery charges, damage waiver (optional but recommended), overtime fees for extended rentals, and cleaning fees for excessively soiled items."
        }
      ]
    },
    {
      category: "Equipment & Maintenance",
      questions: [
        {
          question: "What condition are the rental items in?",
          answer: "All our rental items are professionally cleaned, inspected, and maintained after each use. We take pride in providing high-quality, well-maintained equipment for your events."
        },
        {
          question: "What happens if something gets damaged?",
          answer: "Minor wear and tear is expected and included. For significant damage, repair costs will be assessed. We strongly recommend our damage waiver insurance for peace of mind."
        },
        {
          question: "Do you have backup equipment available?",
          answer: "Yes, we maintain backup inventory for most popular items. In the rare case of equipment failure, we'll quickly provide replacement items at no additional cost."
        }
      ]
    }
  ];

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className={`text-white transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <HelpCircle className="w-16 h-16 mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl leading-relaxed">
              Find answers to common questions about our rental services, booking process, and policies.
            </p>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/10 rounded-full animate-ping"></div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          {faqData.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className={`mb-12 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${categoryIndex * 200}ms` }}
            >
              {/* Category Header */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {category.category}
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {category.questions.map((item, questionIndex) => {
                  const isActive = activeIndex === `${categoryIndex}-${questionIndex}`;
                  
                  return (
                    <div 
                      key={questionIndex}
                      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      <button
                        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                      >
                        <h3 className="text-lg font-semibold text-gray-800 pr-4">
                          {item.question}
                        </h3>
                        <div className={`transform transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}>
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        </div>
                      </button>
                      
                      <div                   className={`overflow-hidden transition-all duration-300 ${isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <div className="px-6 pb-5">
                          <div className="w-full h-px bg-gray-200 mb-4"></div>
                          <p className="text-gray-600 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <MessageCircle className="w-12 h-12 mx-auto mb-6 text-blue-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our friendly customer support team is here to help you with any questions or concerns.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <a
                href="tel:0817-225-8085"
                className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Phone className="w-5 h-5 mr-3" />
                Call Us Now
              </a>
              
              <a
                href="mailto:ibloomrentals@gmail.com"
                className="flex items-center justify-center bg-white text-gray-800 px-6 py-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Mail className="w-5 h-5 mr-3" />
                Send Email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tips Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className={`text-center mb-12 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Quick Tips for a Smooth Rental Experience
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Plan Ahead",
                description: "Book your rentals 2-4 weeks in advance, especially during peak seasons.",
                icon: "📅"
              },
              {
                title: "Measure Your Space",
                description: "Ensure you have accurate measurements of your venue space before ordering.",
                icon: "📏"
              },
              {
                title: "Consider Weather",
                description: "For outdoor events, discuss weather contingency plans with our team.",
                icon: "🌤️"
              }
            ].map((tip, index) => (
              <div
                key={index}
                className={`bg-white p-6 rounded-xl shadow-lg text-center transform transition-all duration-700 hover:-translate-y-2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{tip.title}</h3>
                <p className="text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;