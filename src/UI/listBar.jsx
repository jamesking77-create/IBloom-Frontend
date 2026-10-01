// UI/listBar.jsx — the customer's item list, always one tap away.
// Collapsed: a sticky bar at the bottom of every public page once something is
// added. Expanded: a drawer to adjust quantities, then send the list on WhatsApp
// (primary) or continue to booking with dates (secondary).
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, Minus, Plus, Trash2, X, ChevronUp } from "lucide-react";
import {
  selectCartItems,
  selectCartItemCount,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} from "../store/slices/cart-slice";
import { openList, closeList } from "../store/slices/ui-slice";
import { buildListMessage, formatNaira } from "../config/whatsapp";
import WhatsAppSheet, { WhatsAppIcon, sendOrAsk } from "./whatsAppSheet";
import { ITEM_PLACEHOLDER } from "../utils/itemPlaceholder";

// Pages with their own cart UI don't need the bar on top of it.
const HIDDEN_ON = ["/eventbooking", "/orderprocess"];

export const getCartItemImage = (item) =>
  item?.images?.image1 ||
  item?.image1 ||
  item?.image ||
  (Array.isArray(item?.images) ? item.images[0] : null) ||
  item?.originalData?.images?.image1 ||
  null;

export const useListBarVisible = () => {
  const { pathname } = useLocation();
  const count = useSelector(selectCartItems).length;
  return count > 0 && !HIDDEN_ON.includes(pathname);
};

const Thumb = ({ item, className = "" }) => (
  <img
    src={getCartItemImage(item) || ITEM_PLACEHOLDER}
    alt=""
    className={`object-cover bg-bloom-blush ${className}`}
    loading="lazy"
    onError={(e) => {
      e.currentTarget.src = ITEM_PLACEHOLDER;
    }}
  />
);

const ListBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const totalQty = useSelector(selectCartItemCount);
  const isOpen = useSelector((state) => state.ui.isListOpen);
  const visible = useListBarVisible();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bump, setBump] = useState(false);

  // Small pulse on the counter whenever the list grows, so adding an item
  // from a card gives feedback without leaving the page.
  useEffect(() => {
    if (!items.length) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(t);
  }, [items.length]);

  useEffect(() => {
    if (!items.length && isOpen) dispatch(closeList());
  }, [items.length, isOpen, dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && dispatch(closeList());
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, dispatch]);

  if (!visible) return null;

  const total = items.reduce(
    (sum, i) => sum + (parseFloat(i.price) || 0) * (parseInt(i.quantity) || 1),
    0
  );
  const message = () => buildListMessage(items);
  const handleSend = () => sendOrAsk(message(), setSheetOpen);
  const handleBook = () => {
    dispatch(closeList());
    navigate("/eventbooking");
  };
  const itemLabel = `${totalQty} ${totalQty === 1 ? "item" : "items"}`;

  return (
    <>
      {/* Collapsed bar */}
      <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-2xl flex items-center gap-2 rounded-2xl bg-bloom-charcoal text-white p-2 pl-2.5 shadow-[0_18px_40px_-12px_rgba(36,26,32,0.55)] ring-1 ring-white/10 list-bar-in">
          <button
            type="button"
            onClick={() => dispatch(openList())}
            className="flex flex-1 min-w-0 items-center gap-3 rounded-xl px-1.5 py-1 text-left hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-white/70"
            aria-label={`Your list, ${itemLabel}. Open to review.`}
          >
            <span className="flex -space-x-3 shrink-0">
              {items.slice(0, 3).map((item) => (
                <Thumb
                  key={item.cartId}
                  item={item}
                  className="w-9 h-9 rounded-full ring-2 ring-bloom-charcoal text-sm"
                />
              ))}
            </span>
            <span className="min-w-0">
              <span className={`block text-sm font-semibold leading-tight ${bump ? "list-bump" : ""}`}>
                {itemLabel}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/55 leading-tight">
                Your list <ChevronUp className="w-3 h-3" />
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={handleBook}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2.5 text-sm font-semibold text-white/90 ring-1 ring-white/20 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white/70"
            aria-label="Book with dates"
          >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Book</span>
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1FBE5B] px-4 py-2.5 text-sm font-bold text-[#0B3B1E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>
              Send<span className="hidden sm:inline"> on WhatsApp</span>
            </span>
          </button>
        </div>
      </div>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="list-title">
          <div className="absolute inset-0 bg-bloom-charcoal/50 backdrop-blur-[2px] wa-fade" onClick={() => dispatch(closeList())} />
          <aside className="absolute inset-x-0 bottom-0 max-h-[88vh] sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[420px] flex flex-col bg-bloom-ivory rounded-t-3xl sm:rounded-none shadow-2xl list-drawer-in">
            <header className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-bloom-charcoal/10">
              <div>
                <h2 id="list-title" className="font-display text-2xl font-semibold text-bloom-charcoal">
                  Your list
                </h2>
                <p className="text-sm text-gray-500">{itemLabel}{total > 0 && <> · {formatNaira(total)}</>}</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(closeList())}
                className="p-2 rounded-full text-gray-500 hover:bg-bloom-charcoal/5 focus-visible:outline-2 focus-visible:outline-bloom-green"
                aria-label="Close list"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <ul className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-bloom-charcoal/10">
              {items.map((item) => {
                const qty = parseInt(item.quantity) || 1;
                return (
                  <li key={item.cartId} className="flex items-center gap-3 py-3">
                    <Thumb item={item} className="w-14 h-14 rounded-xl shrink-0 text-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 leading-snug line-clamp-2">
                        {item.itemName || item.name}
                      </p>
                      {formatNaira(item.price) && (
                        <p className="text-sm text-gray-500 tabular-nums">{formatNaira(item.price)} each</p>
                      )}
                    </div>
                    <div className="flex items-center rounded-full bg-white ring-1 ring-bloom-charcoal/10">
                      <button
                        type="button"
                        onClick={() =>
                          qty > 1
                            ? dispatch(decrementQuantity(item.cartId))
                            : dispatch(removeFromCart(item.cartId))
                        }
                        className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-bloom-charcoal/5 focus-visible:outline-2 focus-visible:outline-bloom-green"
                        aria-label={qty > 1 ? `Decrease ${item.name}` : `Remove ${item.name}`}
                      >
                        {qty > 1 ? <Minus className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                      <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => dispatch(incrementQuantity(item.cartId))}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-bloom-charcoal/5 focus-visible:outline-2 focus-visible:outline-bloom-green"
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] border-t border-bloom-charcoal/10 bg-white/60 space-y-2.5">
              <button
                type="button"
                onClick={handleSend}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] hover:bg-[#1FBE5B] py-4 text-base font-bold text-[#0B3B1E] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1DA851]"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Send list on WhatsApp
              </button>
              <button
                type="button"
                onClick={handleBook}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-bloom-rose ring-1 ring-bloom-rose/30 hover:bg-bloom-rose-50 focus-visible:outline-2 focus-visible:outline-bloom-rose"
              >
                <CalendarDays className="w-4 h-4" />
                Book with dates
              </button>
              <p className="text-xs text-center text-gray-500">
                Delivery and setup are priced with you in the chat.
              </p>
            </footer>
          </aside>
        </div>
      )}

      <WhatsAppSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        message={message}
        title="Send your list"
      />

      <style>{`
        @keyframes listBarIn { from { transform: translateY(120%); } to { transform: none; } }
        @keyframes listDrawerUp { from { transform: translateY(100%); } to { transform: none; } }
        @keyframes listDrawerSide { from { transform: translateX(100%); } to { transform: none; } }
        @keyframes listBump { 0%,100% { transform: none; } 40% { transform: scale(1.18); color: #F3D9E3; } }
        @keyframes waFade { from { opacity: 0 } to { opacity: 1 } }
        .list-bar-in { animation: listBarIn .35s cubic-bezier(.2,.8,.2,1) both; }
        .list-drawer-in { animation: listDrawerUp .32s cubic-bezier(.2,.8,.2,1) both; }
        @media (min-width: 640px) { .list-drawer-in { animation-name: listDrawerSide; } }
        .list-bump { display: inline-block; transform-origin: left center; animation: listBump .45s ease-out; }
        .wa-fade { animation: waFade .2s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .list-bar-in, .list-drawer-in, .list-bump, .wa-fade { animation: none; }
        }
      `}</style>
    </>
  );
};

export default ListBar;
