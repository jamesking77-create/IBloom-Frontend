// UI/searchPalette.jsx — site-wide catalogue search.
// Opens from the homepage search bar, the header search icon, "/" or Ctrl/⌘+K.
// Searches every item in every category and subcategory as you type; choosing a
// result opens that exact item. Full-screen on phones, a floating panel on PC.
import React, { useEffect, useMemo, useRef, useState, useDeferredValue } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, X, ArrowLeft, CornerDownLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { closeSearch } from "../store/slices/ui-slice";
import { fetchCategories } from "../store/slices/categoriesSlice";
import {
  buildCatalogIndex,
  searchCatalog,
  itemHref,
  groupHref,
  highlightParts,
  itemImageOf,
} from "../utils/catalogSearch";
import { ITEM_PLACEHOLDER } from "../utils/itemPlaceholder";
import { formatNaira } from "../config/whatsapp";
import WhatsAppSheet, { WhatsAppIcon, sendOrAsk } from "./whatsAppSheet";

// Shown before typing; only those that actually return results are offered.
const SUGGESTIONS = ["Candelabra", "Mirror ball", "LED", "Chair", "Backdrop", "Vase", "Lantern", "Dance floor"];

const Highlight = ({ text, query }) =>
  highlightParts(text, query).map((part, i) =>
    part.match ? (
      <mark key={i} className="bg-transparent text-bloom-rose font-semibold">
        {part.text}
      </mark>
    ) : (
      <React.Fragment key={i}>{part.text}</React.Fragment>
    )
  );

const SearchPalette = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((state) => state.ui.isSearchOpen);
  const { categories, isLoading } = useSelector((state) => state.categories);

  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [active, setActive] = useState(0);
  const [waOpen, setWaOpen] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const index = useMemo(() => buildCatalogIndex(categories || []), [categories]);
  const results = useMemo(() => searchCatalog(index, deferredQuery), [index, deferredQuery]);
  const suggestions = useMemo(
    () => SUGGESTIONS.filter((s) => searchCatalog(index, s, { itemLimit: 1 }).totalItems > 0).slice(0, 6),
    [index]
  );

  // Items first (that's what people search for), then matching categories.
  const rows = useMemo(
    () => [
      ...results.items.map((entry) => ({ kind: "item", entry, href: itemHref(entry) })),
      ...results.groups.map((entry) => ({ kind: "group", entry, href: groupHref(entry) })),
    ],
    [results]
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!categories?.length && !isLoading) dispatch(fetchCategories());
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
    // Only on open; categories loading is handled by the fetch above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => setActive(0), [deferredQuery]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-row="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!isOpen) return null;

  const close = () => {
    dispatch(closeSearch());
    setWaOpen(false);
  };

  const go = (row) => {
    if (!row) return;
    navigate(row.href, { state: { category: row.entry.category } });
    close();
    setQuery("");
  };

  const askOnWhatsApp = () =>
    sendOrAsk(`Hi iBloom, do you have "${query.trim()}" available to rent?`, setWaOpen);

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (query) setQuery("");
      else close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (rows.length) go(rows[active]);
      else if (query.trim()) askOnWhatsApp();
    }
  };

  const hasQuery = deferredQuery.trim().length > 0;
  const loading = isLoading && !categories?.length;
  let rowIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[75] sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search items"
      onKeyDown={(e) => {
        // The input handles its own Escape (clears first); elsewhere it closes.
        if (e.key === "Escape" && e.target !== inputRef.current) close();
      }}
    >
      <div className="absolute inset-0 bg-bloom-charcoal/55 backdrop-blur-sm search-fade" onClick={close} />

      <div className="relative h-full sm:h-auto sm:max-h-[76vh] sm:mt-[9vh] sm:max-w-2xl sm:mx-auto flex flex-col bg-bloom-ivory sm:rounded-3xl shadow-2xl overflow-hidden search-pop">
        {/* Search field */}
        <div className="flex items-center gap-2 px-3 sm:px-5 py-3 sm:py-4 border-b border-bloom-charcoal/10 bg-white">
          <button
            type="button"
            onClick={close}
            className="sm:hidden p-2 -ml-1 rounded-full text-gray-600 hover:bg-gray-100"
            aria-label="Close search"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Search className="hidden sm:block w-5 h-5 text-bloom-green shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search candelabras, backdrops, chairs…"
            className="flex-1 min-w-0 bg-transparent text-base sm:text-lg text-gray-900 placeholder-gray-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            role="combobox"
            aria-expanded={rows.length > 0}
            aria-controls="search-results"
            aria-activedescendant={rows.length ? `search-row-${active}` : undefined}
            autoComplete="off"
            enterKeyHint="search"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center h-6 px-2 rounded-md border border-gray-200 bg-gray-50 text-[11px] font-semibold text-gray-500">
            Esc
          </kbd>
        </div>

        {/* Body */}
        <div ref={listRef} id="search-results" className="flex-1 overflow-y-auto overscroll-contain" role="listbox">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-14 h-14 rounded-xl bg-bloom-blush/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 bg-gray-200/70 rounded" />
                    <div className="h-3 w-1/3 bg-gray-200/70 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : !hasQuery ? (
            <div className="p-4 sm:p-5 space-y-6">
              {suggestions.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 mb-2.5">
                    Popular searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setQuery(s);
                          inputRef.current?.focus();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-bloom-charcoal/10 px-3.5 py-2 text-sm text-gray-700 hover:ring-bloom-green hover:text-bloom-green transition"
                      >
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                        {s}
                      </button>
                    ))}
                  </div>
                </section>
              )}
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 mb-2.5">
                  Browse categories
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(categories || []).map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => go({ href: groupHref({ category }), entry: { category } })}
                      className="flex items-center gap-2.5 rounded-2xl bg-white ring-1 ring-bloom-charcoal/[0.07] p-2 text-left hover:ring-bloom-green/40 transition"
                    >
                      <img
                        src={category.image || ITEM_PLACEHOLDER}
                        alt=""
                        loading="lazy"
                        className="w-10 h-10 rounded-xl object-cover bg-bloom-blush/40 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = ITEM_PLACEHOLDER;
                        }}
                      />
                      <span className="text-sm font-medium text-gray-800 leading-tight line-clamp-2">
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-14 text-center max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-bloom-blush/60 text-bloom-green flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6" />
              </div>
              <p className="font-display text-xl font-semibold text-bloom-charcoal">
                Nothing matches "{deferredQuery.trim()}"
              </p>
              <p className="text-sm text-gray-500 mt-1.5 mb-5">
                Try a shorter word, or ask us. We may have it even if it isn't listed yet.
              </p>
              <button
                type="button"
                onClick={askOnWhatsApp}
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1FBE5B] px-5 py-3 text-sm font-bold text-[#0B3B1E]"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Ask on WhatsApp
              </button>
            </div>
          ) : (
            <div className="py-2">
              {results.items.length > 0 && (
                <h3 className="px-4 sm:px-5 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  Items
                  <span className="ml-1.5 normal-case tracking-normal font-medium text-gray-400">
                    {results.totalItems > results.items.length
                      ? `top ${results.items.length} of ${results.totalItems}`
                      : results.totalItems}
                  </span>
                </h3>
              )}
              {results.items.map((entry) => {
                rowIndex += 1;
                const i = rowIndex;
                const price = formatNaira(entry.item.price);
                return (
                  <button
                    key={entry.key}
                    id={`search-row-${i}`}
                    data-row={i}
                    type="button"
                    role="option"
                    aria-selected={active === i}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(rows[i])}
                    className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 text-left transition-colors ${
                      active === i ? "bg-white shadow-[inset_3px_0_0_var(--color-bloom-rose)]" : ""
                    }`}
                  >
                    <img
                      src={itemImageOf(entry.item) || ITEM_PLACEHOLDER}
                      alt=""
                      loading="lazy"
                      className={`w-14 h-14 rounded-xl object-cover bg-bloom-blush/40 shrink-0 ${
                        entry.item.outOfStock ? "grayscale opacity-70" : ""
                      }`}
                      onError={(e) => {
                        e.currentTarget.src = ITEM_PLACEHOLDER;
                      }}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15px] text-gray-900 leading-snug truncate">
                        <Highlight text={entry.item.name} query={deferredQuery} />
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5 truncate">
                        {entry.category.name}
                        {entry.sub && <> › {entry.sub.name}</>}
                        {entry.item.outOfStock && <span className="text-red-600"> · Out of stock</span>}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      {price ? (
                        <span className="block font-display font-semibold text-bloom-rose tabular-nums">{price}</span>
                      ) : (
                        <span className="block text-xs text-gray-500">Ask for price</span>
                      )}
                    </span>
                  </button>
                );
              })}

              {results.groups.length > 0 && (
                <h3 className="px-4 sm:px-5 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  Categories
                </h3>
              )}
              {results.groups.map((entry) => {
                rowIndex += 1;
                const i = rowIndex;
                return (
                  <button
                    key={entry.key}
                    id={`search-row-${i}`}
                    data-row={i}
                    type="button"
                    role="option"
                    aria-selected={active === i}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(rows[i])}
                    className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 text-left transition-colors ${
                      active === i ? "bg-white shadow-[inset_3px_0_0_var(--color-bloom-rose)]" : ""
                    }`}
                  >
                    <span className="w-14 h-14 rounded-xl bg-bloom-green/10 text-bloom-green flex items-center justify-center shrink-0 overflow-hidden">
                      {entry.image ? (
                        <img src={entry.image} alt="" loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <LayoutGrid className="w-5 h-5" />
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15px] text-gray-900 truncate">
                        <Highlight text={entry.name} query={deferredQuery} />
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {entry.type === "subcategory" ? `In ${entry.category.name} · ` : "Category · "}
                        {entry.count} {entry.count === 1 ? "item" : "items"}
                      </span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Keyboard hints (PC) */}
        <div className="hidden sm:flex items-center gap-4 px-5 py-2.5 border-t border-bloom-charcoal/10 bg-white/60 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 rounded border border-gray-200 bg-white">↑</kbd>
            <kbd className="px-1.5 rounded border border-gray-200 bg-white">↓</kbd> to move
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 rounded border border-gray-200 bg-white">
              <CornerDownLeft className="w-3 h-3 inline" />
            </kbd>{" "}
            to open
          </span>
          <span className="ml-auto">Searches every category and subcategory</span>
        </div>
      </div>

      <WhatsAppSheet
        isOpen={waOpen}
        onClose={() => setWaOpen(false)}
        message={`Hi iBloom, do you have "${query.trim()}" available to rent?`}
        title="Ask about this item"
      />

      <style>{`
        @keyframes searchFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes searchPop { from { opacity: 0; transform: translateY(-10px) scale(.985) } to { opacity: 1; transform: none } }
        .search-fade { animation: searchFade .18s ease-out both; }
        .search-pop { animation: searchPop .24s cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .search-fade, .search-pop { animation: none; } }
      `}</style>
    </div>
  );
};

export default SearchPalette;
