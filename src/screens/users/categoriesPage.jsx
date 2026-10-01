// screens/users/categoriesPage.jsx — browse one category and build a list.
// Adding an item keeps the customer on this page (the list bar at the bottom
// picks it up); sending to WhatsApp or booking happens from there or per item.
import React, { useState, useEffect, useMemo } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ArrowLeft,
  Search,
  Grid,
  List,
  Check,
  Plus,
  Minus,
  X,
  PackageOpen,
} from "lucide-react";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import {
  addToCart,
  selectCartItems,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} from "../../store/slices/cart-slice";
import { openList } from "../../store/slices/ui-slice";
import ItemDetailsModal from "../../UI/itemDetailsModal";
import WhatsAppSheet, { WhatsAppIcon, sendOrAsk } from "../../UI/whatsAppSheet";
import { buildItemMessage, formatNaira } from "../../config/whatsapp";
import { ITEM_PLACEHOLDER, pluralize } from "../../utils/itemPlaceholder";

const PLACEHOLDER = ITEM_PLACEHOLDER;

const parsePrice = (price) => {
  const n =
    typeof price === "string"
      ? parseFloat(price.replace(/[₦\s,]/g, ""))
      : parseFloat(price);
  return isNaN(n) ? 0 : n;
};

const getPrimaryImage = (item) =>
  item.images?.image1 || item.image1 || item.image || PLACEHOLDER;

const CategoriesPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [modalItem, setModalItem] = useState(null);
  const [justAdded, setJustAdded] = useState(null);
  const [waItem, setWaItem] = useState(null);

  // Where the customer came from: booking and order-by-date send people here
  // to pick items, and expect them back afterwards.
  const navigationSource = location.state?.from || "home";
  const fromEventBooking = navigationSource === "eventbooking";
  const fromOrderProcess = navigationSource === "orderprocess";
  const warehouseInfo = location.state?.warehouseInfo;

  const { categories, isLoading, error } = useSelector((state) => state.categories);
  const cartItems = useSelector(selectCartItems);

  const category =
    categories.find((cat) => cat.id === parseInt(categoryId)) ||
    location.state?.category;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId]);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  // "All" shows the category's own items plus everything in its subcategories.
  // Subcategory items are numbered 1, 2, 3… within each subcategory, so their
  // ids clash with each other; _uid gives every item a key that is unique
  // across the whole category (used for React keys and list lines).
  const allItems = useMemo(() => {
    if (!category) return [];
    return [
      ...(category.items || []).map((item) => ({ ...item, _uid: `c-${item.id}` })),
      ...(category.subCategories || []).flatMap((sub) =>
        (sub.items || []).map((item) => ({
          ...item,
          _uid: `s${sub.id}-${item.id}`,
          _subId: sub.id,
          _subName: sub.name,
        }))
      ),
    ];
  }, [category]);

  // Deep link: /category/:id?item=:itemId opens that item's details;
  // ?sub=:subId&item=:itemId for items inside a subcategory (their ids repeat).
  useEffect(() => {
    const itemId = parseInt(searchParams.get("item"), 10);
    if (Number.isNaN(itemId) || !allItems.length) return;
    const subParam = searchParams.get("sub");
    const subId = subParam === null ? null : parseInt(subParam, 10);
    const found =
      subId === null
        ? // Same lookup order as the old share links: top-level items first.
          allItems.find((i) => parseInt(i.id, 10) === itemId)
        : allItems.find(
            (i) => parseInt(i._subId, 10) === subId && parseInt(i.id, 10) === itemId
          );
    if (found) setModalItem(found);
  }, [searchParams, allItems]);

  // Search always covers the whole category, every subcategory included, and
  // matches item names, descriptions and subcategory names ("gold" finds the
  // Gold centerpieces). A chip only narrows the list when nothing is typed.
  const query = searchQuery.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    let items = query
      ? [...allItems]
      : selectedSubCategory
      ? allItems.filter((item) => item._subId === selectedSubCategory.id)
      : [...allItems];
    if (query) {
      const words = query.split(/\s+/);
      items = items.filter((item) => {
        const haystack = `${item.name || ""} ${item.description || ""} ${item._subName || ""}`.toLowerCase();
        return words.every((w) => haystack.includes(w));
      });
    }
    if (sortBy === "name") items.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "price-low") items.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (sortBy === "price-high") items.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    return items;
  }, [allItems, selectedSubCategory, query, sortBy]);

  const linesFor = (item) => cartItems.filter((ci) => ci.id === item._uid);

  const addItem = (item, selectedColor = item.selectedColor) => {
    const processedItem = {
      ...item,
      id: item._uid, // unique list line per item, even across subcategories
      itemId: item.itemId ?? item.id,
      name: selectedColor ? `${item.name} - Color: ${selectedColor}` : item.name,
      selectedColor,
      price: parsePrice(item.price),
      categoryId: category?.id,
    };

    dispatch(addToCart({ item: processedItem, dates: null, allowDuplicates: false }));

    if (fromOrderProcess) {
      navigate("/orderprocess", {
        state: { fromWarehouse: true, warehouseInfo, addedItem: processedItem },
      });
      return;
    }

    setJustAdded(item._uid);
    setTimeout(() => setJustAdded((cur) => (cur === item._uid ? null : cur)), 1400);
  };

  // Items with colours need one chosen first; the details sheet handles that.
  const handleAddClick = (item) => {
    if (item.colors?.length === 1) {
      addItem(item, item.colors[0]);
      return;
    }
    if (item.colors?.length > 1) {
      setModalItem(item);
      return;
    }
    addItem(item);
  };

  const handleModalAdd = (processedItem) => {
    addItem({ ...modalItem, ...processedItem, id: modalItem?.id, name: modalItem?.name || processedItem.name });
    setModalItem(null);
  };

  const handleBack = () => {
    if (fromEventBooking) navigate("/eventbooking", { state: { fromBooking: true } });
    else if (fromOrderProcess)
      navigate("/orderprocess", { state: { fromWarehouse: true, warehouseInfo } });
    else navigate("/", { state: { scrollToCategories: true } });
  };

  const askOnWhatsApp = (item) => {
    sendOrAsk(buildItemMessage({ item, category }), () => setWaItem(item));
  };

  // Before the first fetch finishes, categories is empty and isLoading is still
  // false, so a direct link would flash "not available". Treat that as loading.
  if (!category && (isLoading || (categories.length === 0 && !error))) {
    return (
      <div className="min-h-screen bg-bloom-ivory pt-8 md:pt-28 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white overflow-hidden animate-pulse">
              <div className="aspect-square bg-bloom-blush/50" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bloom-ivory px-4 md:pt-20">
        <div className="text-center max-w-sm">
          <PackageOpen className="w-12 h-12 text-bloom-green mx-auto mb-4" />
          <h1 className="font-display text-2xl font-semibold text-bloom-charcoal mb-2">
            This category isn't available
          </h1>
          <p className="text-gray-500 mb-6">It may have been renamed or removed. Pick another from the homepage.</p>
          <button
            onClick={() => navigate("/", { state: { scrollToCategories: true } })}
            className="inline-flex items-center gap-2 bg-bloom-green hover:bg-bloom-green-dark text-white px-6 py-3 rounded-full font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> See all categories
          </button>
        </div>
      </div>
    );
  }

  const contextLabel = fromEventBooking
    ? "Adding to your booking"
    : fromOrderProcess
    ? "Adding to your order"
    : null;

  const renderAddControl = (item, size = "md") => {
    const lines = linesFor(item);
    const qty = lines.reduce((s, l) => s + (parseInt(l.quantity) || 0), 0);
    const pad = size === "sm" ? "h-9 text-xs" : "h-10 text-sm";

    if (item.outOfStock) {
      return (
        <span className={`flex-1 inline-flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 font-semibold ${pad}`}>
          Out of stock
        </span>
      );
    }

    if (justAdded === item._uid) {
      return (
        <span className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-bloom-green text-white font-semibold ${pad}`} role="status">
          <Check className="w-4 h-4" /> Added
        </span>
      );
    }

    // One line in the list: adjust it right on the card.
    if (lines.length === 1) {
      const line = lines[0];
      return (
        <div className={`flex-1 flex items-center justify-between rounded-xl bg-bloom-green-50 ring-1 ring-bloom-green-200 ${pad}`}>
          <button
            type="button"
            onClick={() =>
              qty > 1 ? dispatch(decrementQuantity(line.cartId)) : dispatch(removeFromCart(line.cartId))
            }
            className="h-full px-2 sm:px-2.5 text-bloom-green-700 hover:bg-bloom-green-100 rounded-l-xl focus-visible:outline-2 focus-visible:outline-bloom-green"
            aria-label={qty > 1 ? `One less ${item.name}` : `Remove ${item.name} from list`}
          >
            {qty > 1 ? <Minus className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
          <span className="font-semibold text-bloom-green-800 tabular-nums whitespace-nowrap" aria-live="polite">
            {qty}
            <span className={size === "sm" ? "hidden sm:inline" : ""}> in list</span>
          </span>
          <button
            type="button"
            onClick={() => dispatch(incrementQuantity(line.cartId))}
            className="h-full px-2 sm:px-2.5 text-bloom-green-700 hover:bg-bloom-green-100 rounded-r-xl focus-visible:outline-2 focus-visible:outline-bloom-green"
            aria-label={`One more ${item.name}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      );
    }

    // Several colour variants in the list: point to the list to manage them.
    if (lines.length > 1) {
      return (
        <button
          type="button"
          onClick={() => dispatch(openList())}
          className={`flex-1 inline-flex items-center justify-center rounded-xl bg-bloom-green-50 ring-1 ring-bloom-green-200 text-bloom-green-800 font-semibold ${pad}`}
        >
          {qty} in list
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => handleAddClick(item)}
        className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-bloom-green hover:bg-bloom-green-dark text-white font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bloom-green ${pad}`}
      >
        <Plus className="w-4 h-4" />
        {item.colors?.length > 1 ? "Choose colour" : "Add to list"}
      </button>
    );
  };

  const waButton = (item, size = "md") => (
    <button
      type="button"
      onClick={() => askOnWhatsApp(item)}
      className={`shrink-0 inline-flex items-center justify-center rounded-xl bg-[#25D366]/15 text-[#128C4A] hover:bg-[#25D366] hover:text-[#0B3B1E] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1DA851] ${
        size === "sm" ? "w-9 h-9" : "w-10 h-10"
      }`}
      aria-label={`Ask about ${item.name} on WhatsApp`}
      title="Ask on WhatsApp"
    >
      <WhatsAppIcon className="w-[18px] h-[18px]" />
    </button>
  );

  return (
    <div className="bg-bloom-ivory min-h-screen">
      {/* Compact header: name + count, so items are visible on the first screen */}
      <header className="relative overflow-hidden">
        <img
          src={category.image || PLACEHOLDER}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bloom-charcoal/85 via-bloom-charcoal/55 to-bloom-charcoal/30" />
        <div className="relative max-w-7xl mx-auto px-4 pt-6 pb-7 md:pt-32 md:pb-12 text-white">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-4 sm:mb-6 rounded-full focus-visible:outline-2 focus-visible:outline-white"
          >
            <ArrowLeft className="w-4 h-4" />
            {fromEventBooking ? "Back to booking" : fromOrderProcess ? "Back to order" : "All categories"}
          </button>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold leading-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-2 text-white/75 max-w-2xl text-sm sm:text-base line-clamp-2">
              {category.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="rounded-full bg-white/15 backdrop-blur px-3 py-1">
              {allItems.length} {allItems.length === 1 ? "item" : "items"}
            </span>
            {contextLabel && (
              <span className="rounded-full bg-bloom-rose px-3 py-1 font-medium">{contextLabel}</span>
            )}
          </div>
        </div>
      </header>

      {/* Sticky search + subcategory chips */}
      <div className="sticky top-16 md:top-[5.25rem] z-30 bg-bloom-ivory/95 backdrop-blur border-b border-bloom-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Search {category.name}</span>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="search"
                placeholder={`Search ${category.name.toLowerCase()}…`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) setSelectedSubCategory(null);
                }}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white ring-1 ring-bloom-charcoal/10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-green-400"
              />
            </label>
            <label className="sr-only" htmlFor="sort-items">Sort items</label>
            <select
              id="sort-items"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 rounded-xl bg-white ring-1 ring-bloom-charcoal/10 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-bloom-green-400 max-w-[8.5rem] sm:max-w-none"
            >
              <option value="name">A–Z</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
            <div className="hidden sm:flex rounded-xl bg-white ring-1 ring-bloom-charcoal/10 p-1">
              {[
                { mode: "grid", Icon: Grid, label: "Grid view" },
                { mode: "list", Icon: List, label: "List view" },
              ].map((option) => {
                const ModeIcon = option.Icon;
                return (
                  <button
                    key={option.mode}
                    onClick={() => setViewMode(option.mode)}
                    aria-label={option.label}
                    aria-pressed={viewMode === option.mode}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === option.mode ? "bg-bloom-green text-white" : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <ModeIcon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {query && (
            <p className="text-sm text-gray-500" aria-live="polite">
              {pluralize(filteredItems.length, "result")} in all of {category.name}
            </p>
          )}

          {category.subCategories?.length > 0 && !query && (
            <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {[{ id: "__all", name: "All", items: allItems }, ...category.subCategories].map((sub) => {
                const isAll = sub.id === "__all";
                const active = isAll ? !selectedSubCategory : selectedSubCategory?.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubCategory(isAll ? null : sub);
                      setSearchQuery("");
                    }}
                    aria-pressed={active}
                    className={`shrink-0 inline-flex items-center gap-2 rounded-full pr-3.5 py-1 text-sm font-medium transition-colors ${
                      isAll ? "pl-3.5" : "pl-1"
                    } ${
                      active
                        ? "bg-bloom-charcoal text-white"
                        : "bg-white text-gray-700 ring-1 ring-bloom-charcoal/10 hover:ring-bloom-charcoal/25"
                    }`}
                  >
                    {!isAll && (
                      <img src={sub.image || PLACEHOLDER} alt="" className="w-7 h-7 rounded-full object-cover" />
                    )}
                    {sub.name}
                    <span className={`text-xs tabular-nums ${active ? "text-white/60" : "text-gray-400"}`}>
                      {sub.items?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <main className="max-w-7xl mx-auto px-4 py-5 sm:py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 max-w-sm mx-auto">
            <PackageOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h2 className="font-display text-xl font-semibold text-bloom-charcoal mb-1">
              {searchQuery ? `Nothing matches "${searchQuery}"` : "No items here yet"}
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              {searchQuery
                ? "Try a shorter word, or ask us on WhatsApp. We may have it in stock."
                : "Message us on WhatsApp and we'll tell you what's available."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="bg-bloom-green hover:bg-bloom-green-dark text-white px-5 py-2.5 rounded-full text-sm font-semibold"
              >
                Clear search
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredItems.map((item) => {
              const price = formatNaira(item.price);
              return (
                <li key={item._uid} className="group flex flex-col bg-white rounded-2xl overflow-hidden ring-1 ring-bloom-charcoal/[0.06] hover:shadow-[0_14px_34px_-18px_rgba(36,26,32,0.35)] transition-shadow">
                  <button
                    type="button"
                    onClick={() => setModalItem(item)}
                    className="relative aspect-square overflow-hidden bg-bloom-blush/40 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-bloom-green"
                    aria-label={`View ${item.name}`}
                  >
                    <img
                      src={getPrimaryImage(item)}
                      alt=""
                      loading="lazy"
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${item.outOfStock ? "grayscale opacity-70" : ""}`}
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER;
                      }}
                    />
                    {item.outOfStock && (
                      <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                        Out of stock
                      </span>
                    )}
                    {item.colors?.length > 0 && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                        {pluralize(item.colors.length, "colour")}
                      </span>
                    )}
                  </button>

                  <div className="flex flex-col flex-1 p-3 sm:p-4">
                    {item._subName && (!selectedSubCategory || query) && (
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-bloom-green/80 mb-1 line-clamp-1">
                        {item._subName}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setModalItem(item)}
                      className="text-left font-medium text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-bloom-green"
                    >
                      {item.name}
                    </button>
                    {price && (
                      <p className="mt-1 font-display text-base sm:text-lg font-semibold text-bloom-rose tabular-nums">
                        {price}
                      </p>
                    )}
                    <div className="flex-1" />
                    <div className="mt-3 flex items-center gap-2">
                      {renderAddControl(item, "sm")}
                      {waButton(item, "sm")}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-3">
            {filteredItems.map((item) => {
              const price = formatNaira(item.price);
              return (
                <li key={item._uid} className="flex items-center gap-4 bg-white rounded-2xl p-3 ring-1 ring-bloom-charcoal/[0.06]">
                  <button
                    type="button"
                    onClick={() => setModalItem(item)}
                    className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-bloom-blush/40"
                    aria-label={`View ${item.name}`}
                  >
                    <img
                      src={getPrimaryImage(item)}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER;
                      }}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => setModalItem(item)}
                      className="text-left font-medium text-gray-900 hover:text-bloom-green line-clamp-1"
                    >
                      {item.name}
                    </button>
                    {item.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
                    )}
                    <div className="mt-1 flex items-center gap-3 text-sm">
                      {price && <span className="font-display font-semibold text-bloom-rose tabular-nums">{price}</span>}
                      {item.colors?.length > 0 && <span className="text-gray-400">{pluralize(item.colors.length, "colour")}</span>}
                      {item.outOfStock && <span className="text-red-600 font-medium">Out of stock</span>}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 w-56">
                    {renderAddControl(item)}
                    {waButton(item)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <ItemDetailsModal
        isOpen={!!modalItem}
        onClose={() => setModalItem(null)}
        item={modalItem}
        category={category}
        onAddToCart={handleModalAdd}
        navigationSource={navigationSource}
      />

      <WhatsAppSheet
        isOpen={!!waItem}
        onClose={() => setWaItem(null)}
        message={() => (waItem ? buildItemMessage({ item: waItem, category }) : "")}
        title="Ask about this item"
      />
    </div>
  );
};

export default CategoriesPage;
