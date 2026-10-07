import * as THREE from "./vendor/three.module.js";
import { createPodWorld, finishes } from "./pod-model.js";
const exterior = document.querySelector("#exterior-viewport"),
  modal = document.querySelector("#walk-modal"),
  viewport = document.querySelector("#walk-viewport");
let preview,
  walk,
  selectedFinish = finishes[0].id,
  angle = -0.66,
  elevation = 0.07,
  distance = 15,
  orbitDrag,
  looking,
  yaw = 0,
  pitch = 0,
  frame,
  lastTime;
const movement = new Set();
function applyFinish(id) {
  selectedFinish = id;
  const finish = finishes.find((f) => f.id === id) || finishes[0];
  for (const world of [preview, walk]) if (world) world.setFinish(id);
  document.querySelector("#finish-title").textContent = finish.name;
  document.querySelector("#finish-description").textContent =
    finish.description;
  document
    .querySelectorAll("[data-finish]")
    .forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.finish === id)),
    );
  document.querySelector("#walk-finish").value = id;
  if (preview) preview.renderer.render(preview.scene, preview.camera);
}
for (const finish of finishes) {
  const button = document.createElement("button");
  button.dataset.finish = finish.id;
  button.setAttribute("aria-pressed", String(finish.id === selectedFinish));
  button.innerHTML = `<i style="background:${finish.color}"></i>${finish.name}`;
  button.addEventListener("click", () => applyFinish(finish.id));
  document.querySelector("#exterior-swatches").append(button);
  document
    .querySelector("#walk-finish")
    .add(new Option(finish.name, finish.id));
}
function orbit() {
  if (!preview) return;
  preview.camera.position.set(
    Math.sin(angle) * distance,
    2 + Math.sin(elevation) * distance,
    Math.cos(angle) * distance,
  );
  preview.camera.lookAt(0, 2, 0.4);
  preview.renderer.render(preview.scene, preview.camera);
}
exterior.addEventListener("pointerdown", (e) => {
  orbitDrag = { x: e.clientX, y: e.clientY };
  exterior.setPointerCapture(e.pointerId);
});
exterior.addEventListener("pointermove", (e) => {
  if (!orbitDrag) return;
  angle -= (e.clientX - orbitDrag.x) * 0.008;
  elevation = THREE.MathUtils.clamp(
    elevation + (e.clientY - orbitDrag.y) * 0.004,
    -0.06,
    0.7,
  );
  orbitDrag = { x: e.clientX, y: e.clientY };
  orbit();
});
["pointerup", "pointercancel"].forEach((name) =>
  exterior.addEventListener(name, () => (orbitDrag = null)),
);
exterior.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    distance = THREE.MathUtils.clamp(distance + e.deltaY * 0.015, 11, 25);
    orbit();
  },
  { passive: false },
);
try {
  preview = createPodWorld(exterior);
  preview.camera.fov = 45;
  preview.camera.updateProjectionMatrix();
  exterior.querySelector(".renderer-loading").remove();
  orbit();
  new ResizeObserver(orbit).observe(exterior);
} catch {
  exterior.querySelector(".renderer-loading").textContent =
    "WebGL is unavailable. The original rendered experience is still available below.";
}
const viewpoints = [
  { name: "Veranda", x: 0, z: 5.15, yaw: 0 },
  { name: "Living suite", x: -0.15, z: 1.7, yaw: -0.35 },
  { name: "Kitchen", x: -0.55, z: -1.65, yaw: 0 },
  { name: "Sleeping suite", x: -0.2, z: 0.4, yaw: -1.05 },
];
function jump(index) {
  if (!walk) return;
  const view = viewpoints[index];
  walk.camera.position.set(view.x, 2.52, view.z);
  yaw = view.yaw;
  pitch = 0;
  movement.clear();
  viewport.focus();
}
viewpoints.forEach((view, index) => {
  const button = document.createElement("button");
  button.textContent = view.name;
  button.addEventListener("click", () => jump(index));
  document.querySelector("#tour-scenes").append(button);
});
const obstacles = [
  [-2.75, -0.75, 3.6, 5.2],
  [0.36, 2.25, -1.9, 0.82],
  [0.8, 1.9, 0.83, 1.95],
  [-1.92, -1, 0.58, 2.2],
  [-2.4, 2.25, -4.1, -3.15],
];
function valid(x, z) {
  return (
    x > -2.2 &&
    x < 2.45 &&
    z > -3.05 &&
    z < 5.45 &&
    !obstacles.some(
      ([a, b, c, d]) =>
        x > a - 0.16 && x < b + 0.16 && z > c - 0.16 && z < d + 0.16,
    )
  );
}
function loop(time) {
  if (!modal.open || !walk) return;
  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;
  let f = Number(movement.has("forward")) - Number(movement.has("backward")),
    s = Number(movement.has("right")) - Number(movement.has("left"));
  const len = Math.hypot(f, s) || 1;
  f /= len;
  s /= len;
  const dx = (s * Math.cos(yaw) - f * Math.sin(yaw)) * dt * 2,
    dz = (-f * Math.cos(yaw) - s * Math.sin(yaw)) * dt * 2;
  const pos = walk.camera.position;
  if (valid(pos.x + dx, pos.z)) pos.x += dx;
  if (valid(pos.x, pos.z + dz)) pos.z += dz;
  walk.camera.rotation.set(pitch, yaw, 0);
  walk.renderer.render(walk.scene, walk.camera);
  document.querySelector("#walk-location").textContent =
    pos.z > 3.45
      ? "Veranda"
      : pos.z < -1
        ? "Kitchen & storage"
        : "Living & sleeping suite";
  frame = requestAnimationFrame(loop);
}
document.querySelectorAll("[data-open-walk]").forEach((button) =>
  button.addEventListener("click", () => {
    modal.showModal();
    document.body.style.overflow = "hidden";
    try {
      if (!walk) walk = createPodWorld(viewport);
      walk.resize();
      applyFinish(selectedFinish);
      walk.setPalette(document.querySelector("#tour-palette").value);
      jump(0);
      lastTime = performance.now();
      frame = requestAnimationFrame(loop);
    } catch {
      viewport.innerHTML =
        '<p style="padding:220px 32px">WebGL could not start. <a href="experience.html?v=20261007-sequence2" style="color:white">Open the rendered experience →</a></p>';
    }
  }),
);
document
  .querySelector("#close-walk")
  .addEventListener("click", () => modal.close());
modal.addEventListener("close", () => {
  cancelAnimationFrame(frame);
  movement.clear();
  looking = null;
  document.body.style.overflow = "";
});
document.querySelector("#reset-walk").addEventListener("click", () => jump(0));
document
  .querySelector("#walk-finish")
  .addEventListener("change", (e) => applyFinish(e.target.value));
document.querySelector("#tour-palette").addEventListener("change", (e) => {
  for (const world of [preview, walk])
    if (world) world.setPalette(e.target.value);
  orbit();
});
const keyMap = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};
window.addEventListener("keydown", (e) => {
  if (!modal.open || e.target.tagName === "SELECT") return;
  if (keyMap[e.code]) {
    e.preventDefault();
    movement.add(keyMap[e.code]);
  }
});
window.addEventListener("keyup", (e) => movement.delete(keyMap[e.code]));
window.addEventListener("blur", () => movement.clear());
document.addEventListener("visibilitychange", () => movement.clear());
viewport.addEventListener("pointerdown", (e) => {
  looking = { x: e.clientX, y: e.clientY };
  viewport.setPointerCapture(e.pointerId);
  viewport.focus();
});
viewport.addEventListener("pointermove", (e) => {
  if (!looking) return;
  yaw -= (e.clientX - looking.x) * 0.004;
  pitch = THREE.MathUtils.clamp(
    pitch - (e.clientY - looking.y) * 0.004,
    -1.05,
    1.05,
  );
  looking = { x: e.clientX, y: e.clientY };
});
["pointerup", "pointercancel"].forEach((name) =>
  viewport.addEventListener(name, () => (looking = null)),
);
document.querySelectorAll("[data-move]").forEach((button) => {
  button.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    movement.add(button.dataset.move);
    button.setPointerCapture(e.pointerId);
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((name) =>
    button.addEventListener(name, () => movement.delete(button.dataset.move)),
  );
});
document.querySelector("#capture-walk").addEventListener("click", () => {
  if (!walk) return;
  walk.renderer.render(walk.scene, walk.camera);
  const link = document.createElement("a");
  link.download = "fjall-drop-pod-view.png";
  link.href = walk.renderer.domElement.toDataURL("image/png");
  link.click();
});
