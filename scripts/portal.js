/* Browser-local project review. No credentials or server storage are implied. */
const STORAGE_KEY = "fjall-drop-pod-review-v1";
const palettes = { med: "Modern Mediterranean", wo: "Warm Organic" };
const form = document.querySelector("#review-form");
const noteInput = document.querySelector("#review-note");
const topicInput = document.querySelector("#review-topic");
const reviewStatus = document.querySelector("#review-status");
let review = {};
try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (stored && typeof stored === "object") review = stored;
} catch {
  reviewStatus.textContent =
    "Browser storage is unavailable. You can still download your review.";
}
if (typeof review.note === "string") noteInput.value = review.note;
if ([...topicInput.options].some((option) => option.value === review.topic))
  topicInput.value = review.topic;
if (review.savedAt && Number.isFinite(Date.parse(review.savedAt))) {
  reviewStatus.textContent = `Review saved · ${new Date(review.savedAt).toLocaleString()}`;
}
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(review));
    return true;
  } catch {
    reviewStatus.textContent =
      "Could not save in this browser. Download your review to keep a copy.";
    return false;
  }
}
function renderPreference() {
  document.querySelectorAll("[data-select]").forEach((button) => {
    const selected = button.dataset.select === review.palette;
    button.setAttribute("aria-pressed", String(selected));
    button.textContent = selected ? "Selected ✓" : "Save preference";
    button.closest(".material-card").classList.toggle("selected", selected);
  });
  document.querySelector("#preference-status").textContent = palettes[
    review.palette
  ]
    ? `Your preference: ${palettes[review.palette]}. You can change this at any time.`
    : "No palette selected yet.";
}
document.querySelectorAll("[data-select]").forEach((button) => {
  button.addEventListener("click", () => {
    review.palette = button.dataset.select;
    persist();
    renderPreference();
  });
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!noteInput.value.trim()) {
    noteInput.setCustomValidity("Please enter a review note.");
    noteInput.reportValidity();
    return;
  }
  review = {
    ...review,
    topic: topicInput.value,
    note: noteInput.value.trim(),
    savedAt: new Date().toISOString(),
  };
  if (persist())
    reviewStatus.textContent = `Review saved · ${new Date(review.savedAt).toLocaleString()}`;
});
noteInput.addEventListener("input", () => noteInput.setCustomValidity(""));
document.querySelector("#download-review").addEventListener("click", () => {
  const content = [
    "FJÄLL GROUP — Drop Pod Villas",
    "Development design brief",
    "",
    `Material preference: ${palettes[review.palette] || "Not selected"}`,
    `Review focus: ${topicInput.value}`,
    `Ambiance: ${document.querySelector("#ambiance-title").textContent}`,
    `Development: ${document.querySelector("#pod-count").value} pods · ${document.querySelector("#site-layout").selectedOptions[0].textContent} · ${document.querySelector("#pod-spacing").value} spacing`,
    "Development arrangement is an illustrative concept, not a dimensioned site plan.",
    "",
    "Notes:",
    noteInput.value.trim() || "No notes entered.",
    "",
    `Exported: ${new Date().toISOString()}`,
    "Concept imagery and preferences are for design discussion.",
  ].join("\n");
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "fjall-project-review.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  reviewStatus.textContent =
    "Review downloaded. Share the file with your project team.";
});
renderPreference();
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting)
        document.querySelectorAll("nav a").forEach((link) => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
    }
  },
  { rootMargin: "-10% 0px -60% 0px" },
);
document
  .querySelectorAll("main section[id]")
  .forEach((section) => observer.observe(section));
