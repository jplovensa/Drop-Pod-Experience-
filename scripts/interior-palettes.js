/* Shared reference mapping for the supplied interior collections. */
window.INTERIOR_PALETTES = {
  med: { title: "Modern Mediterranean" },
  wo: { title: "Warm Organic" },
  el: {
    title: "Earthy Luxe",
    description:
      "Warm oak, pale veined stone, layered linen, and dark accents. A softly illuminated interior with tactile finishes and integrated storage.",
    swatches: [
      ["Warm oak", "#a18b6e"],
      ["Veined stone", "#e2dbce"],
      ["Linen", "#c8c2b8"],
      ["Dark accents", "#383733"],
    ],
  },
};
window.EARTHY_LUXE_VIEWS = [
  { view: 1, title: "Suite composition", key: "suite" },
  { view: 2, title: "Living & sleeping", key: "living" },
  { view: 3, title: "Kitchen & island", key: "culinary" },
  { view: 4, title: "Kitchen detail", key: "kitchen" },
  { view: 5, title: "Sleeping suite", key: "sleeping" },
  { view: 6, title: "Living wall", key: "morning" },
  { view: 7, title: "Storage gallery", key: "dressing" },
  { view: 8, title: "Terrace seating", key: "lounge" },
  { view: 9, title: "Outdoor lounge", key: "dining" },
  { view: 10, title: "Terrace & facade", key: "arrival" },
];
window.interiorImage = (key, palette) => {
  if (palette === "el") {
    const item =
      window.EARTHY_LUXE_VIEWS.find((view) => view.key === key) ||
      window.EARTHY_LUXE_VIEWS[0];
    return `assets/earthy-luxe/v${item.view}.webp`;
  }
  return `assets/${key}-${palette}.jpg`;
};
