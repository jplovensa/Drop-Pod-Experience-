/* Rendered images and films, independent of the 3D finish studio and WebGL. */
(() => {
  const scenes = [
    {
      title: "Arrival",
      key: "arrival",
      description: "The signature shell in its setting.",
    },
    {
      title: "Veranda to entrance",
      video: "walkthrough-entry",
      poster: "lounge",
      description: "A rendered camera journey across the threshold.",
    },
    {
      title: "Suite reveal",
      video: "walkthrough-suite",
      poster: "sleeping",
      description: "A continuous rendered camera journey into the suite.",
    },
    {
      title: "Terrace lounge",
      key: "lounge",
      description: "An open threshold between architecture and landscape.",
    },
    {
      title: "Open suite",
      key: "suite",
      description: "Living, sleeping, and cooking in one continuous volume.",
    },
    {
      title: "Living wall",
      key: "living",
      description: "An integrated composition of storage and living.",
    },
    {
      title: "Kitchen",
      key: "kitchen",
      description: "Warm cabinetry and a compact working surface.",
    },
    {
      title: "Sleeping suite",
      key: "sleeping",
      description: "The quiet heart of the pod.",
    },
  ];
  const modal = document.querySelector("#walk-modal"),
    viewport = document.querySelector("#walk-viewport"),
    palette = document.querySelector("#tour-palette"),
    playButton = document.querySelector("#tour-play");
  let current = 0,
    playing = true,
    media,
    drag,
    offsetX = 0,
    offsetY = 0;
  function scenePath(scene) {
    return scene.video
      ? `assets/${scene.video}.mp4`
      : `assets/${scene.key}-${palette.value}.jpg`;
  }
  function show(index) {
    current = (index + scenes.length) % scenes.length;
    if (media?.tagName === "VIDEO") media.pause();
    const scene = scenes[current];
    offsetX = offsetY = 0;
    drag = null;
    media = document.createElement(scene.video ? "video" : "img");
    media.className = "rendered-scene";
    if (scene.video) {
      media.src = scenePath(scene);
      media.poster = `assets/${scene.poster}-med.jpg`;
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = "auto";
      media.setAttribute("aria-label", scene.title);
      if (playing)
        media.play().catch(() => {
          playing = false;
          updatePlay();
        });
    } else {
      media.src = scenePath(scene);
      media.alt = `${scene.title} · ${palette.selectedOptions[0].textContent}`;
      media.draggable = false;
    }
    viewport.replaceChildren(media);
    document.querySelector("#walk-location").textContent =
      `${String(current + 1).padStart(2, "0")} / ${scenes.length} · ${scene.title}`;
    document.querySelector("#tour-hint").textContent = scene.video
      ? "Rendered film · Shared architecture · Arrow keys to navigate"
      : "Drag to inspect the render · Arrow keys to navigate";
    palette.disabled = Boolean(scene.video);
    palette.title = scene.video
      ? "The supplied films show one shared material treatment."
      : "";
    document
      .querySelectorAll("[data-tour-scene]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(Number(button.dataset.tourScene) === current),
        ),
      );
    playButton.hidden = !scene.video;
    updatePlay();
    media.addEventListener("error", () => {
      const message = document.createElement("p");
      message.className = "tour-error";
      message.textContent =
        "This scene could not load. Choose another space to continue.";
      viewport.replaceChildren(message);
    });
  }
  function updatePlay() {
    playButton.textContent = playing ? "Pause film" : "Play film";
  }
  scenes.forEach((scene, index) => {
    const button = document.createElement("button");
    button.dataset.tourScene = index;
    button.textContent = scene.title;
    button.addEventListener("click", () => show(index));
    document.querySelector("#tour-scenes").append(button);
  });
  document.querySelectorAll("[data-open-walk]").forEach((button) =>
    button.addEventListener("click", () => {
      modal.showModal();
      document.body.style.overflow = "hidden";
      playing = true;
      show(0);
      viewport.focus();
    }),
  );
  document
    .querySelector("#close-walk")
    .addEventListener("click", () => modal.close());
  modal.addEventListener("close", () => {
    if (media?.tagName === "VIDEO") media.pause();
    drag = null;
    document.body.style.overflow = "";
  });
  document
    .querySelector("#tour-next")
    .addEventListener("click", () => show(current + 1));
  document
    .querySelector("#tour-prev")
    .addEventListener("click", () => show(current - 1));
  palette.addEventListener("change", () => show(current));
  playButton.addEventListener("click", () => {
    if (media?.tagName !== "VIDEO") return;
    playing = !playing;
    if (playing)
      media.play().catch(() => {
        playing = false;
        updatePlay();
      });
    else media.pause();
    updatePlay();
  });
  window.addEventListener("keydown", (event) => {
    if (!modal.open || event.target.tagName === "SELECT") return;
    if (event.code === "ArrowRight" || event.code === "ArrowLeft") {
      event.preventDefault();
      show(current + (event.code === "ArrowRight" ? 1 : -1));
    }
  });
  viewport.addEventListener("pointerdown", (event) => {
    if (media?.tagName !== "IMG") return;
    drag = { x: event.clientX, y: event.clientY };
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!drag) return;
    offsetX = Math.max(
      -6,
      Math.min(
        6,
        offsetX + ((event.clientX - drag.x) / viewport.clientWidth) * 100,
      ),
    );
    offsetY = Math.max(
      -6,
      Math.min(
        6,
        offsetY + ((event.clientY - drag.y) / viewport.clientHeight) * 100,
      ),
    );
    media.style.transform = `translate(${offsetX}%,${offsetY}%) scale(1.15)`;
    drag = { x: event.clientX, y: event.clientY };
  });
  ["pointerup", "pointercancel"].forEach((name) =>
    viewport.addEventListener(name, () => (drag = null)),
  );
  document.querySelector("#capture-walk").addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = scenePath(scenes[current]);
    link.download = `fjall-${scenes[current].video || scenes[current].key}.${scenes[current].video ? "mp4" : "jpg"}`;
    link.click();
  });
})();
