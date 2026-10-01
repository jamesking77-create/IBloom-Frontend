// UI/itemDetailsModal.jsx — item details sheet: photos, price, colour, and the
// two actions that matter: send this item on WhatsApp, or add it to the list.
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  X,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Ruler,
} from "lucide-react";
import { addToCart } from "../store/slices/cart-slice";
import { buildItemMessage, formatNaira, getItemLink } from "../config/whatsapp";
import WhatsAppSheet, { WhatsAppIcon, sendOrAsk } from "./whatsAppSheet";
import { ITEM_PLACEHOLDER } from "../utils/itemPlaceholder";

const PLACEHOLDER = ITEM_PLACEHOLDER;

const collectImages = (item) => {
  if (!item) return [];
  const out = [];
  const push = (src) => src && !out.includes(src) && out.push(src);
  push(item.image);
  if (item.images && typeof item.images === "object" && !Array.isArray(item.images)) {
    push(item.images.image1);
    push(item.images.image2);
    push(item.images.image3);
  }
  push(item.image1);
  push(item.image2);
  push(item.image3);
  if (Array.isArray(item.images)) item.images.forEach(push);
  return out.length ? out : [PLACEHOLDER];
};

const ItemDetailsModal = ({
  isOpen,
  onClose,
  item,
  category,
  onAddToCart,
  navigationSource,
  warehouseInfo,
  onShowAddedPopup,
}) => {
  const dispatch = useDispatch();
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorHint, setColorHint] = useState(false);
  const [added, setAdded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const images = useMemo(() => collectImages(item), [item]);
  const fromOrderProcess = navigationSource === "orderprocess";
  const fromEventBooking = navigationSource === "eventbooking";
  const addLabel = fromOrderProcess ? "Add to order" : fromEventBooking ? "Add to booking" : "Add to list";

  // Parents pass an inline onClose, so read it through a ref instead of
  // re-running the effects below on every parent render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    setImageIndex(0);
    setSelectedColor(item?.colors?.length === 1 ? item.colors[0] : null);
    setColorHint(false);
    setAdded(false);
    setSheetOpen(false);
  }, [isOpen, item]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (sheetOpen) return;
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "ArrowRight") setImageIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setImageIndex((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, images.length, sheetOpen]);

  if (!isOpen || !item) return null;

  const needsColor = item.colors?.length > 0;
  const price = formatNaira(item.price);
  const message = () => buildItemMessage({ item, category, selectedColor });

  const handleAdd = () => {
    if (item.outOfStock) return;
    if (needsColor && !selectedColor) {
      setColorHint(true);
      return;
    }
    const numericPrice =
      typeof item.price === "string"
        ? parseFloat(item.price.replace(/[₦\s,]/g, "")) || 0
        : parseFloat(item.price) || 0;
    const processedItem = {
      ...item,
      name: selectedColor ? `${item.name} - Color: ${selectedColor}` : item.name,
      selectedColor,
      price: numericPrice,
      categoryId: category?.id,
    };

    if (onAddToCart) {
      onAddToCart(processedItem);
      return;
    }
    dispatch(addToCart({ item: processedItem, dates: null, allowDuplicates: false }));
    setAdded(true);
    setTimeout(() => {
      onClose();
      onShowAddedPopup?.(processedItem, category, navigationSource, warehouseInfo);
    }, 900);
  };

  const handleShare = async () => {
    const link = getItemLink(item, category?.id);
    const url = link.includes("/share/") ? link : window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.name, url });
      } catch {
        /* dismissed */
      }
    } else {
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-title"
    >
      <div className="absolute inset-0 bg-bloom-charcoal/60 backdrop-blur-sm item-fade" onClick={onClose} />

      <div className="relative w-full sm:max-w-4xl max-h-[94vh] sm:max-h-[88vh] flex flex-col bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl item-rise">
        {/* Top controls float over the photo */}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur text-gray-700 hover:bg-white flex items-center justify-center shadow-sm focus-visible:outline-2 focus-visible:outline-bloom-green"
            aria-label={copied ? "Link copied" : "Share item"}
          >
            {copied ? <Check className="w-4 h-4 text-bloom-green" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur text-gray-700 hover:bg-white flex items-center justify-center shadow-sm focus-visible:outline-2 focus-visible:outline-bloom-green"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 sm:grid sm:grid-cols-2">
          {/* Photos */}
          <div className="bg-bloom-blush/30 sm:sticky sm:top-0 sm:self-start">
            <div className="relative aspect-square">
              <img
                src={images[imageIndex]}
                alt={`${item.name}, photo ${imageIndex + 1} of ${images.length}`}
                className={`w-full h-full object-cover ${item.outOfStock ? "grayscale" : ""}`}
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER;
                }}
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white flex items-center justify-center shadow-sm"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white flex items-center justify-center shadow-sm"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImageIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${i === imageIndex ? "w-5 bg-white" : "w-1.5 bg-white/60"}`}
                        aria-label={`Photo ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="p-5 sm:p-7 space-y-5">
            <div>
              {category?.name && (
                <p className="text-xs font-semibold uppercase tracking-wider text-bloom-green mb-1.5">
                  {category.name}
                </p>
              )}
              <h2 id="item-title" className="font-display text-2xl sm:text-3xl font-semibold text-bloom-charcoal leading-tight">
                {item.name}
              </h2>
              <div className="mt-2 flex items-center gap-3">
                {price && (
                  <span className="font-display text-2xl font-semibold text-bloom-rose tabular-nums">{price}</span>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 ${
                    item.outOfStock ? "bg-red-50 text-red-700" : "bg-bloom-green-50 text-bloom-green-700"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${item.outOfStock ? "bg-red-500" : "bg-bloom-green-500"}`} />
                  {item.outOfStock ? "Out of stock" : "Available"}
                </span>
              </div>
            </div>

            {needsColor && (
              <fieldset>
                <legend className="text-sm font-semibold text-gray-900 mb-2">
                  Colour{" "}
                  <span className={`font-normal ${colorHint && !selectedColor ? "text-bloom-rose" : "text-gray-500"}`}>
                    {selectedColor ? `· ${selectedColor}` : "· choose one to add to your list"}
                  </span>
                </legend>
                <div className={`flex flex-wrap gap-2 rounded-2xl ${colorHint && !selectedColor ? "item-shake" : ""}`}>
                  {item.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-pressed={selectedColor === color}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bloom-green ${
                        selectedColor === color
                          ? "bg-bloom-charcoal text-white"
                          : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-gray-400"
                      }`}
                    >
                      {selectedColor === color && <Check className="w-3.5 h-3.5" />}
                      {color}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {item.sizes?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-gray-400" /> Sizes
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.sizes.map((size) => (
                    <span key={size} className="px-3 py-1.5 rounded-lg bg-gray-50 ring-1 ring-gray-200 text-sm text-gray-700">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {item.description && (
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            )}

            {Array.isArray(item.features) && item.features.length > 0 && (
              <ul className="space-y-1.5">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-bloom-green mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            <p className="text-sm text-gray-500 bg-bloom-ivory rounded-xl px-4 py-3">
              Delivery and setup are available. We confirm the cost for your venue on WhatsApp.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-4 sm:px-7 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleAdd}
            disabled={item.outOfStock || added}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm sm:text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bloom-green disabled:cursor-not-allowed ${
              added
                ? "bg-bloom-green text-white"
                : item.outOfStock
                ? "bg-gray-100 text-gray-400"
                : "bg-bloom-green-50 text-bloom-green-800 ring-1 ring-bloom-green-200 hover:bg-bloom-green-100"
            }`}
          >
            {added ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {added ? "Added" : item.outOfStock ? "Out of stock" : addLabel}
          </button>
          <button
            type="button"
            onClick={() => sendOrAsk(message(), setSheetOpen)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm sm:text-base font-bold bg-[#25D366] hover:bg-[#1FBE5B] text-[#0B3B1E] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1DA851]"
          >
            <WhatsAppIcon className="w-5 h-5" />
            <span>
              <span className="sm:hidden">WhatsApp</span>
              <span className="hidden sm:inline">Send to WhatsApp</span>
            </span>
          </button>
        </div>
      </div>

      <WhatsAppSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        message={message}
        title="Ask about this item"
      />

      <style>{`
        @keyframes itemFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes itemRise { from { transform: translateY(32px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes itemShake { 0%,100% { transform: none } 25% { transform: translateX(-4px) } 75% { transform: translateX(4px) } }
        .item-fade { animation: itemFade .2s ease-out both; }
        .item-rise { animation: itemRise .3s cubic-bezier(.2,.8,.2,1) both; }
        .item-shake { animation: itemShake .3s ease-in-out 2; }
        @media (prefers-reduced-motion: reduce) { .item-fade, .item-rise, .item-shake { animation: none; } }
      `}</style>
    </div>
  );
};

export default ItemDetailsModal;
