// UI/floatingChatBox.jsx — "Chat with us" launcher, mounted once in UserLayout.
// WhatsApp is the main way to reach the team; the email form is still here as
// the secondary option for people who prefer it.
import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { post } from "../utils/api";
import { X, User, Mail, Send, CheckCircle, ArrowLeft, ChevronRight } from "lucide-react";
import {
  WHATSAPP_LINES,
  openWhatsApp,
  formatPhoneForDisplay,
} from "../config/whatsapp";
import { WhatsAppIcon } from "./whatsAppSheet";

const GREETING = "Hi iBloom, I'd like to ask about renting some items.";

const FloatingChatBox = ({ raised = false, emailServiceUrl = "/api/mailer/send-email" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("whatsapp"); // "whatsapp" | "email"
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const panelRef = useRef(null);
  const launcherRef = useRef(null);

  const { userData } = useSelector((state) => state.profile);
  const adminEmail = userData?.email || "adeoyemayopoelijah@gmail.com";
  const companyName = userData?.name || "IBLOOM";

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && close();
    const onClick = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !launcherRef.current?.contains(e.target)
      ) {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setView("whatsapp");
    setSubmitSuccess(false);
    setSubmitError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await post(emailServiceUrl, {
        to: adminEmail,
        subject: `New Contact Message from ${formData.name}`,
        html: `
        <h2 style="color: #333333; margin-bottom: 20px;">Hello ${companyName},</h2>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Message:</strong> ${formData.message}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `,
        from: { name: formData.name.trim(), email: formData.email.trim() },
      });
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError(error.message || "Message not sent. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    formData.name.trim() && formData.email.trim() && formData.message.trim() && !isSubmitting;

  const inputClass =
    "w-full bg-white border border-gray-200 rounded-xl py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-green-300 focus:border-bloom-green-400 transition";

  return (
    <div
      // With the list bar showing, phones already have a WhatsApp button in
      // the bar, so the floating one steps aside instead of covering cards.
      className={`fixed right-4 sm:right-6 z-[55] flex-col items-end gap-3 transition-[bottom] duration-300 ${
        raised ? "hidden sm:flex bottom-[6.25rem]" : "flex bottom-5 sm:bottom-6"
      }`}
    >
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Chat with us"
          className="w-[min(22rem,calc(100vw-2rem))] bg-bloom-ivory rounded-3xl shadow-[0_24px_60px_-20px_rgba(36,26,32,0.45)] ring-1 ring-bloom-charcoal/10 overflow-hidden chat-pop"
        >
          <div className="bg-bloom-green text-white px-5 pt-5 pb-6 relative">
            <button
              type="button"
              onClick={close}
              className="absolute top-3 right-3 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
            {view === "email" && (
              <button
                type="button"
                onClick={() => setView("whatsapp")}
                className="mb-2 -ml-1 inline-flex items-center gap-1 text-xs font-medium text-white/75 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to WhatsApp
              </button>
            )}
            <p className="font-display text-2xl font-semibold leading-tight">
              {view === "email" ? "Send us an email" : "Chat with iBloom"}
            </p>
            <p className="text-sm text-white/75 mt-1">
              {view === "email"
                ? "We reply within 24 hours."
                : "Ask about items, prices or your event date."}
            </p>
          </div>

          <div className="p-4 -mt-3 bg-bloom-ivory rounded-t-3xl relative">
            {view === "whatsapp" ? (
              <>
                <div className="space-y-2">
                  {WHATSAPP_LINES.map((line) => (
                    <button
                      key={line.phone}
                      type="button"
                      onClick={() => {
                        openWhatsApp(line.phone, GREETING);
                        close();
                      }}
                      className="w-full flex items-center gap-3 rounded-2xl bg-white ring-1 ring-bloom-charcoal/10 px-3.5 py-3 text-left hover:ring-[#25D366] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1DA851] group"
                    >
                      <span className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                        <WhatsAppIcon className="w-5 h-5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-semibold text-gray-900 text-sm">{line.label}</span>
                        <span className="block text-xs text-gray-500 tabular-nums">
                          {formatPhoneForDisplay(line.phone)}
                        </span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1DA851]" />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setView("email")}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-bloom-green rounded-xl focus-visible:outline-2 focus-visible:outline-bloom-green"
                >
                  <Mail className="w-4 h-4" /> Prefer email? Send a message
                </button>
              </>
            ) : submitSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-bloom-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-bloom-green" />
                </div>
                <p className="font-semibold text-gray-900">Message sent</p>
                <p className="text-sm text-gray-500 mt-1">We'll reply to your email within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                {submitError && (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {submitError}
                  </p>
                )}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    className={`${inputClass} pl-9 pr-3`}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email"
                    autoComplete="email"
                    required
                    className={`${inputClass} pl-9 pr-3`}
                  />
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="How can we help?"
                  required
                  rows={3}
                  className={`${inputClass} px-3 resize-none`}
                />
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-bloom-green hover:bg-bloom-green-dark disabled:bg-gray-300 disabled:cursor-not-allowed py-3 text-sm font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bloom-green"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close chat" : "Chat with us on WhatsApp"}
        className="group relative inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1FBE5B] text-[#0B3B1E] shadow-[0_12px_30px_-8px_rgba(37,211,102,0.65)] h-14 pl-4 pr-4 sm:pr-5 font-bold text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1DA851]"
      >
        {isOpen ? <X className="w-6 h-6" /> : <WhatsAppIcon className="w-6 h-6" />}
        <span className={`hidden sm:inline ${isOpen ? "sm:hidden" : ""}`}>Chat with us</span>
      </button>

      <style>{`
        @keyframes chatPop { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: none; } }
        .chat-pop { animation: chatPop .26s cubic-bezier(.2,.8,.2,1) both; transform-origin: bottom right; }
        @media (prefers-reduced-motion: reduce) { .chat-pop { animation: none; } }
      `}</style>
    </div>
  );
};

export default FloatingChatBox;
