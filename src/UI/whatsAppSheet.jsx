// UI/whatsAppSheet.jsx — shared line picker for every WhatsApp action.
// With one configured line it opens WhatsApp straight away; with more it asks
// which sales line to message.
import React, { useEffect, useRef } from "react";
import { X, ChevronRight } from "lucide-react";
import {
  WHATSAPP_LINES,
  openWhatsApp,
  formatPhoneForDisplay,
} from "../config/whatsapp";

export const WhatsAppIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// Call this from a button: sends immediately when there's a single line,
// otherwise returns false so the caller opens the sheet.
export const sendOrAsk = (message, setSheetOpen) => {
  if (WHATSAPP_LINES.length === 1) {
    openWhatsApp(WHATSAPP_LINES[0].phone, message);
    return true;
  }
  setSheetOpen(true);
  return false;
};

const WhatsAppSheet = ({
  isOpen,
  onClose,
  message,
  title = "Send on WhatsApp",
  subtitle = "Pick a sales line. WhatsApp opens with your message ready to send.",
  onSent,
}) => {
  const firstButtonRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      onCloseRef.current();
    };
    // Capture phase so Escape closes only this sheet, not the dialog under it.
    document.addEventListener("keydown", onKey, true);
    firstButtonRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey, true);
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePick = (phone) => {
    const text = typeof message === "function" ? message() : message;
    openWhatsApp(phone, text);
    onClose();
    onSent?.(phone);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-sheet-title"
    >
      <div
        className="absolute inset-0 bg-bloom-charcoal/50 backdrop-blur-[2px] wa-fade"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] wa-rise">
        <div className="sm:hidden mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 id="wa-sheet-title" className="font-display text-xl font-semibold text-bloom-charcoal">
              {title}
            </h2>
            <p className="text-sm text-gray-500 mt-1 leading-snug">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -m-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-bloom-green"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {WHATSAPP_LINES.map((line, i) => (
            <button
              key={line.phone}
              ref={i === 0 ? firstButtonRef : undefined}
              type="button"
              onClick={() => handlePick(line.phone)}
              className="w-full flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3.5 text-left transition-colors hover:border-[#25D366] hover:bg-[#25D366]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1DA851] group"
            >
              <span className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                <WhatsAppIcon className="w-5 h-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-gray-900">{line.label}</span>
                <span className="block text-sm text-gray-500 tabular-nums">
                  {formatPhoneForDisplay(line.phone)}
                </span>
              </span>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1DA851] transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes waFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes waRise { from { transform: translateY(24px); opacity: 0 } to { transform: none; opacity: 1 } }
        .wa-fade { animation: waFade .2s ease-out both; }
        .wa-rise { animation: waRise .28s cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .wa-fade, .wa-rise { animation: none; } }
      `}</style>
    </div>
  );
};

export default WhatsAppSheet;
