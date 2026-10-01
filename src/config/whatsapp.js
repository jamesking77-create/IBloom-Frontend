// config/whatsapp.js — single source of truth for every "Send to WhatsApp" action.
// Change the numbers here and every button on the site (item details, list bar,
// chat bubble, booking review) picks them up.

export const WHATSAPP_LINES = [
  { label: "Sales Line 1", phone: "2348172258085" },
  { label: "Sales Line 2", phone: "2348124862088" },
];

export const SHARE_BASE_URL = "https://ibloomrentals.com/share";

export const formatNaira = (price) => {
  const numeric =
    typeof price === "string"
      ? parseFloat(price.replace(/[₦\s,]/g, ""))
      : parseFloat(price);
  if (!numeric || isNaN(numeric)) return "";
  return `₦${numeric.toLocaleString("en-NG")}`;
};

// "+234 817 225 8085" style, for showing the number next to its label
export const formatPhoneForDisplay = (phone) =>
  phone.replace(/^(\d{3})(\d{3})(\d{3})(\d{4})$/, "+$1 $2 $3 $4");

export const buildWhatsAppUrl = (phone, message) =>
  `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const openWhatsApp = (phone, message) => {
  window.open(buildWhatsAppUrl(phone, message), "_blank", "noopener,noreferrer");
};

export const getItemShareUrl = (categoryId, itemId) =>
  categoryId && itemId ? `${SHARE_BASE_URL}/${categoryId}/${itemId}` : "";

const getItemImage = (item) =>
  item?.images?.image1 || item?.image1 || item?.image || "";

// Subcategory items are numbered 1, 2, 3… inside each subcategory, so their ids
// repeat; their share page needs the subcategory too:
// /share/:categoryId/sub/:subId/:itemId (the backend serves both forms).
export const getItemLink = (item, categoryId) => {
  const itemId = item?.itemId ?? item?.id;
  if (item?._subId == null) return getItemShareUrl(categoryId, itemId);
  return categoryId && itemId
    ? `${SHARE_BASE_URL}/${categoryId}/sub/${item._subId}/${itemId}`
    : getItemImage(item);
};

// One item, sent straight from the item details sheet.
export const buildItemMessage = ({ item, category, selectedColor }) => {
  const price = formatNaira(item.price);
  const link = getItemLink(item, category?.id);

  return [
    "Hi iBloom, I'm interested in this item:",
    "",
    `*${item.name}*${selectedColor ? ` (Colour: ${selectedColor})` : ""}`,
    category?.name
      ? `Category: ${category.name}${item._subName ? ` › ${item._subName}` : ""}`
      : "",
    price ? `Price: ${price}` : "",
    item.outOfStock ? "Currently out of stock: is there an alternative?" : "",
    link ? `\n${link}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
};

// The customer's whole list, sent without filling any form.
export const buildListMessage = (cartItems = []) => {
  const lines = cartItems.map((cartItem, index) => {
    const original = cartItem.originalData || {};
    const name = cartItem.itemName || cartItem.name || "Item";
    const qty = parseInt(cartItem.quantity) || 1;
    const price = formatNaira(cartItem.price);
    const link = getItemLink(
      { ...cartItem, ...original, id: original.id ?? cartItem.id },
      original.categoryId
    );

    return (
      `${index + 1}. *${name}* × ${qty}` +
      (price ? ` (${price} each)` : "") +
      (link ? `\n   ${link}` : "")
    );
  });

  const total = cartItems.reduce(
    (sum, i) => sum + (parseFloat(i.price) || 0) * (parseInt(i.quantity) || 1),
    0
  );

  return [
    "Hi iBloom, I'd like to rent these items:",
    "",
    lines.join("\n"),
    "",
    total > 0 ? `Items total: ${formatNaira(total)}` : "",
    "Event date: ",
    "Venue: ",
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");
};
