// utils/catalogSearch.js — search across every category, subcategory and item.
// Pure functions so the ranking can be reasoned about (and tested) apart from UI.

const norm = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9₦]+/g, " ")
    .trim();

export const itemImageOf = (item) =>
  item?.images?.image1 || item?.image1 || item?.image || "";

// Flattens the categories payload into one searchable list. Subcategory items
// carry their subcategory, because their ids are only unique inside it.
export const buildCatalogIndex = (categories = []) => {
  const items = [];
  const groups = [];

  categories.forEach((category) => {
    const subs = category.subCategories || [];
    const count =
      (category.items?.length || 0) +
      subs.reduce((n, s) => n + (s.items?.length || 0), 0);

    groups.push({
      type: "category",
      key: `cat-${category.id}`,
      name: category.name,
      image: category.image,
      count,
      category,
      text: norm(category.name),
    });

    (category.items || []).forEach((item) => {
      items.push({
        type: "item",
        key: `item-${category.id}-${item.id}`,
        item,
        category,
        sub: null,
        name: norm(item.name),
        context: norm(category.name),
        description: norm(item.description),
      });
    });

    subs.forEach((sub) => {
      groups.push({
        type: "subcategory",
        key: `sub-${category.id}-${sub.id}`,
        name: sub.name,
        image: sub.image,
        count: sub.items?.length || 0,
        category,
        sub,
        text: norm(`${sub.name} ${category.name}`),
      });

      (sub.items || []).forEach((item) => {
        items.push({
          type: "item",
          key: `item-${category.id}-s${sub.id}-${item.id}`,
          item,
          category,
          sub,
          name: norm(item.name),
          context: norm(`${sub.name} ${category.name}`),
          description: norm(item.description),
        });
      });
    });
  });

  return { items, groups };
};

// Every word must appear somewhere; where it appears decides the score.
const scoreItem = (entry, words, phrase) => {
  let score = 0;
  for (const w of words) {
    if (entry.name.startsWith(w) || entry.name.includes(` ${w}`)) score += 30;
    else if (entry.name.includes(w)) score += 18;
    else if (entry.context.includes(w)) score += 10;
    else if (entry.description.includes(w)) score += 3;
    else return 0;
  }
  if (entry.name === phrase) score += 60;
  else if (entry.name.startsWith(phrase)) score += 25;
  if (entry.item.outOfStock) score -= 8;
  return score;
};

export const searchCatalog = (index, query, { itemLimit = 8, groupLimit = 4 } = {}) => {
  const phrase = norm(query);
  if (!phrase) return { items: [], groups: [], totalItems: 0 };
  const words = phrase.split(" ");

  const scored = index.items
    .map((entry) => ({ entry, score: scoreItem(entry, words, phrase) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name));

  const groups = index.groups
    .filter((g) => words.every((w) => g.text.includes(w)))
    .sort((a, b) => (a.type === b.type ? 0 : a.type === "category" ? -1 : 1))
    .slice(0, groupLimit);

  return {
    items: scored.slice(0, itemLimit).map((r) => r.entry),
    groups,
    totalItems: scored.length,
  };
};

// Link that opens the exact item (subcategory items need their subcategory).
export const itemHref = ({ category, sub, item }) =>
  `/category/${category.id}?${sub ? `sub=${sub.id}&` : ""}item=${item.id}`;

export const groupHref = ({ category, sub }) =>
  `/category/${category.id}${sub ? `?sub=${sub.id}` : ""}`;

// Splits text into [{ text, match }] so matched words can be highlighted.
export const highlightParts = (text, query) => {
  const words = norm(query).split(" ").filter(Boolean);
  if (!words.length || !text) return [{ text, match: false }];
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const splitter = new RegExp(`(${escaped.join("|")})`, "gi");
  const lowerWords = new Set(words);
  return String(text)
    .split(splitter)
    .filter(Boolean)
    .map((part) => ({ text: part, match: lowerWords.has(part.toLowerCase()) }));
};
