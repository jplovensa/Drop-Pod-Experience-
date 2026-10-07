/* An entirely client-side visual development journey. */
const modal = document.querySelector("#design-modal");
const modalContent = document.querySelector("#modal-content");
const worlds = {
  med: {
    title: "Modern Mediterranean",
    description:
      "A quiet composition of mineral tones, pale surfaces, and warm natural accents. The curved shell remains the signature; the interior brings a coastal softness.",
    swatches: [
      ["Chalk", "#ded8cb"],
      ["Sand", "#c9b798"],
      ["Stone", "#9b998c"],
      ["Timber", "#8c7054"],
    ],
  },
  wo: {
    title: "Warm Organic",
    description:
      "A grounded palette of earthy neutrals, natural timber, and soft textiles. Warmth and texture bring an intimate character to the same architectural shell.",
    swatches: [
      ["Linen", "#e2daca"],
      ["Clay", "#b5997e"],
      ["Timber", "#785c40"],
      ["Moss", "#717c61"],
    ],
  },
};
worlds.el = window.INTERIOR_PALETTES.el;
function openDesign(content) {
  modalContent.innerHTML = content;
  modal.showModal();
}
document
  .querySelector("#close-modal")
  .addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    const rect = modal.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      modal.close();
  }
});
document.querySelectorAll("[data-palette]").forEach((button) =>
  button.addEventListener("click", () => {
    const key = button.dataset.palette,
      world = worlds[key];
    openDesign(
      `<h2 id="modal-title">${world.title}</h2><img src="${window.interiorImage("suite", key)}" alt="${world.title} suite"><p>${world.description}</p><div class="swatches">${world.swatches.map(([name, color]) => `<div class="swatch"><i style="background:${color}"></i><span>${name}</span></div>`).join("")}</div><p class="status">Concept color references. Final material specifications are selected for each project.</p><a class="button" href="experience-v4.html?style=${key}&v=20261008-steady4">Walk through this palette →</a>`,
    );
  }),
);
let studioPalette = "med",
  studioMood = "day";
const moods = { day: "Daylight", golden: "Golden hour", evening: "Evening" };
function updateStudio() {
  const image = document.querySelector("#ambiance-image");
  image.src = window.interiorImage("suite", studioPalette);
  image.alt = `${worlds[studioPalette].title} suite with ${moods[studioMood].toLowerCase()} treatment`;
  document.querySelector(".studio-preview").dataset.mood = studioMood;
  document.querySelector("#ambiance-title").textContent =
    `${worlds[studioPalette].title} · ${moods[studioMood]}`;
  document
    .querySelectorAll("[data-studio-palette]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.studioPalette === studioPalette),
      ),
    );
  document
    .querySelectorAll("button[data-mood]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.mood === studioMood),
      ),
    );
}
document.querySelectorAll("[data-studio-palette]").forEach((button) =>
  button.addEventListener("click", () => {
    studioPalette = button.dataset.studioPalette;
    updateStudio();
  }),
);
document.querySelectorAll("button[data-mood]").forEach((button) =>
  button.addEventListener("click", () => {
    studioMood = button.dataset.mood;
    updateStudio();
  }),
);
const library = [
  {
    key: "arrival",
    title: "The signature shell",
    category: "exterior",
    description:
      "A continuous curved form and glazed facade establish a recognizable architectural identity.",
  },
  {
    key: "lounge",
    title: "The outdoor threshold",
    category: "exterior",
    description: "A sheltered terrace links the architecture to its setting.",
  },
  {
    key: "suite",
    title: "The open suite",
    category: "interior",
    description:
      "Living, cooking, and sleeping share one continuous volume beneath the shell.",
  },
  {
    key: "living",
    title: "The living wall",
    category: "interior",
    description:
      "An integrated wall brings storage and daily rituals into a cohesive interior.",
  },
  {
    key: "kitchen",
    title: "The kitchen collection",
    category: "detail",
    description:
      "A compact run of cabinetry carries the material language into everyday use.",
  },
  {
    key: "dressing",
    title: "The dressing gallery",
    category: "detail",
    description:
      "Soft transitions and built-in storage make the compact footprint feel considered.",
  },
];
function renderLibrary(filter = "all") {
  const container = document.querySelector("#design-library");
  container.replaceChildren();
  library
    .filter((item) => filter === "all" || item.category === filter)
    .forEach((item) => {
      const button = document.createElement("button");
      button.className = "library-card";
      button.innerHTML = `<img src="assets/${item.key}-med.jpg" alt="${item.title}" loading="lazy"><span>${item.title} →</span>`;
      button.addEventListener("click", () => {
        openDesign(
          `<h2 id="modal-title">${item.title}</h2><img id="library-detail-image" src="assets/${item.key}-med.jpg" alt="${item.title} in Modern Mediterranean"><p>${item.description}</p><fieldset><legend>Compare material worlds</legend><button class="button" id="library-med">Mediterranean</button> <button class="button" id="library-wo">Warm Organic</button> <button class="button" id="library-el">Earthy Luxe</button></fieldset><p class="status">Concept imagery · Signature design collection</p>`,
        );
        ["med", "wo", "el"].forEach((key) =>
          document
            .querySelector(`#library-${key}`)
            .addEventListener("click", () => {
              const image = document.querySelector("#library-detail-image");
              image.src = window.interiorImage(item.key, key);
              image.alt = `${item.title} in ${worlds[key].title}`;
            }),
        );
      });
      container.append(button);
    });
}
document.querySelectorAll("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-filter]")
      .forEach((other) =>
        other.setAttribute("aria-pressed", String(other === button)),
      );
    renderLibrary(button.dataset.filter);
  }),
);
renderLibrary();
const countInput = document.querySelector("#pod-count"),
  layoutInput = document.querySelector("#site-layout"),
  spacingInput = document.querySelector("#pod-spacing"),
  plan = document.querySelector("#development-plan");
function renderPlan() {
  const count = Number(countInput.value),
    layout = layoutInput.value,
    compact = spacingInput.value === "compact";
  document.querySelector("#pod-count-label").value = count;
  document.querySelector("#cluster-count").textContent = count / 6;
  document.querySelector("#scale-name").textContent =
    count <= 6
      ? "Private collection"
      : count <= 24
        ? "Boutique retreat"
        : count <= 60
          ? "Destination resort"
          : "Destination district";
  document
    .querySelectorAll("[data-count]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(Number(button.dataset.count) === count),
      ),
    );
  let svg = `<title id="plan-title">${count} Drop Pods · ${layoutInput.selectedOptions[0].textContent}</title><desc id="plan-desc">Illustrative ${spacingInput.value} arrangement of ${count} pods in ${count / 6} collections. Not to scale.</desc><rect width="900" height="600" fill="#e5eadd"/><path d="M0 520 Q230 450 450 500 T900 470 V600 H0Z" fill="${layout === "coastal" ? "#bdcfcb" : "#cdd7bc"}"/><path d="M40 70 Q200 0 300 100 T850 60" stroke="#d4ddc6" stroke-width="55" fill="none"/>`;
  const columns = Math.ceil(Math.sqrt((count / 6) * 1.6)),
    rows = Math.ceil(count / 6 / columns);
  const cellW = 750 / columns,
    cellH = 370 / rows;
  svg +=
    '<path d="M55 470 H845" stroke="#b1bca5" stroke-width="8" fill="none"/>';
  for (let c = 0; c < count / 6; c++) {
    const cx = 75 + ((c % columns) + 0.5) * cellW,
      cy = 65 + (Math.floor(c / columns) + 0.5) * cellH;
    const radius = Math.min(cellW, cellH) * (compact ? 0.23 : 0.34);
    svg += `<path d="M${cx} ${cy} V470" stroke="#c1cab6" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${radius * 0.4}" fill="#cbd6bb"/>`;
    for (let n = 0; n < 6; n++) {
      let x, y, angle;
      if (layout === "coastal") {
        x = cx + ((n % 3) - 1) * radius;
        y = cy + (Math.floor(n / 3) - 0.5) * radius;
        angle = 0;
      } else {
        angle = n * 60;
        x = cx + Math.cos((angle * Math.PI) / 180) * radius;
        y = cy + Math.sin((angle * Math.PI) / 180) * radius;
      }
      const w = Math.min(32, radius * 0.55),
        h = w * 0.65;
      svg += `<g class="plan-pod" transform="translate(${x} ${y}) rotate(${angle})"><rect x="${-w / 2 + 2}" y="${-h / 2 + 3}" width="${w}" height="${h}" rx="${h / 2}" fill="#0002"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="#f4f1e5" stroke="#537162" stroke-width="1.2"/><path d="M${-w / 4} ${h / 2 - 2} H${w / 4}" stroke="#537162" stroke-width="2"/></g>`;
    }
    if (layout === "courtyard")
      svg += `<rect x="${cx - radius * 1.4}" y="${cy - radius * 1.4}" width="${radius * 2.8}" height="${radius * 2.8}" rx="10" fill="none" stroke="#a8b797" stroke-dasharray="3 5"/>`;
  }
  svg +=
    '<text x="40" y="565" font-family="sans-serif" font-size="14" fill="#365446">FJÄLL · Signature development collection</text>';
  plan.innerHTML = svg;
}
[countInput, layoutInput, spacingInput].forEach((input) =>
  input.addEventListener("input", renderPlan),
);
document.querySelectorAll("[data-count]").forEach((button) =>
  button.addEventListener("click", () => {
    countInput.value = button.dataset.count;
    renderPlan();
  }),
);
document.querySelector("#download-plan").addEventListener("click", () => {
  const copy = plan.cloneNode(true);
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(copy)], {
      type: "image/svg+xml",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `fjall-${countInput.value}-pod-concept.svg`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
renderPlan();

// The collection preserves all ten supplied reference views.
function openEarthyView(index) {
  const views = window.EARTHY_LUXE_VIEWS;
  const item = views[(index + views.length) % views.length];
  openDesign(
    `<h2 id="modal-title">Earthy Luxe / ${item.title}</h2><img src="assets/earthy-luxe/v${item.view}.webp" alt="Earthy Luxe ${item.title}"><p>${worlds.el.description}</p><div class="form-actions"><button class="button" id="el-prev">← Previous</button><span>${index + 1} / ${views.length}</span><button class="button" id="el-next">Next →</button><a href="assets/earthy-luxe/v${item.view}.webp" download>Download view ↓</a></div><p class="status">Supplied perspective render · Earthy Luxe collection</p><a class="button" href="experience-v4.html?style=el&v=20261008-steady4">Open the Earthy Luxe experience →</a>`,
  );
  document
    .querySelector("#el-prev")
    .addEventListener("click", () =>
      openEarthyView((index + views.length - 1) % views.length),
    );
  document
    .querySelector("#el-next")
    .addEventListener("click", () =>
      openEarthyView((index + 1) % views.length),
    );
}
window.EARTHY_LUXE_VIEWS.forEach((item, index) => {
  const button = document.createElement("button");
  button.className = "library-card";
  button.innerHTML = `<img src="assets/earthy-luxe/v${item.view}.webp" alt="Earthy Luxe ${item.title}" loading="lazy"><span>${String(index + 1).padStart(2, "0")} / ${item.title} →</span>`;
  button.addEventListener("click", () => openEarthyView(index));
  document.querySelector("#earthy-luxe-gallery").append(button);
});
