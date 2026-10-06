import * as THREE from "./vendor/three.module.js";
const finishes = [
  {
    id: "chalk",
    name: "Mineral Chalk",
    color: "#dfdcd0",
    roughness: 0.9,
    description: "A soft mineral tone with a matte surface.",
  },
  {
    id: "sand",
    name: "Warm Sand",
    color: "#c6ad88",
    roughness: 0.85,
    description: "A warm sandy finish with a soft, tactile grain.",
  },
  {
    id: "clay",
    name: "Earth Clay",
    color: "#a7755e",
    roughness: 0.95,
    description: "An earthy clay tone with a textured matte surface.",
  },
  {
    id: "graphite",
    name: "Graphite",
    color: "#4a5351",
    roughness: 0.6,
    description: "A deep graphite tone with a restrained satin surface.",
  },
];
const exterior = document.querySelector("#exterior-viewport");
const modal = document.querySelector("#walk-modal");
const walkViewport = document.querySelector("#walk-viewport");
let selectedFinish = finishes[0],
  preview,
  walk,
  yaw = 0,
  pitch = 0,
  lastTime = 0,
  frame;
const keys = new Set();
const obstacles = [
  [-2.7, -1.7, -2.8, 0.8],
  [0.8, 2.5, 0.1, 2.1],
  [-1.15, 1.15, -3.8, -1.1],
];
function grain() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  const data = context.createImageData(128, 128);
  let seed = 37;
  for (let i = 0; i < data.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const value = 175 + (seed % 65);
    data.data[i] = data.data[i + 1] = data.data[i + 2] = value;
    data.data[i + 3] = 255;
  }
  context.putImageData(data, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(14, 14);
  return texture;
}
function buildWorld(host) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#d5e3e4");
  scene.fog = new THREE.Fog("#d5e3e4", 35, 90);
  const camera = new THREE.PerspectiveCamera(65, 1, 0.08, 100);
  camera.rotation.order = "YXZ";
  scene.add(new THREE.HemisphereLight("#e4f1ff", "#99866d", 2));
  const sun = new THREE.DirectionalLight("#fff0d5", 3);
  sun.position.set(8, 14, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -15;
  sun.shadow.camera.right = 15;
  sun.shadow.camera.top = 15;
  sun.shadow.camera.bottom = -15;
  sun.shadow.bias = -0.001;
  scene.add(sun);
  const glow = new THREE.PointLight("#ffe4bd", 20, 12);
  glow.position.set(0, 2.8, -1);
  scene.add(glow);
  const material = (color, roughness = 0.8) =>
    new THREE.MeshStandardMaterial({ color, roughness });
  function box(w, h, d, x, y, z, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }
  box(100, 0.15, 100, 0, -0.22, 0, material("#aeb69a"));
  box(7, 0.22, 12, 0, -0.02, 1, material("#b7a18a"));
  box(6.3, 0.08, 8, 0, 0.12, 0, material("#d4c5ae"));
  const shellMaterial = new THREE.MeshStandardMaterial({
    color: selectedFinish.color,
    roughness: selectedFinish.roughness,
    bumpMap: grain(),
    bumpScale: 0.025,
    side: THREE.DoubleSide,
  });
  const arch = new THREE.Shape();
  arch.moveTo(-3.4, 0.16);
  arch.absellipse(0, 0.16, 3.4, 3.55, Math.PI, 0, true);
  arch.lineTo(3.13, 0.16);
  arch.absellipse(0, 0.16, 3.13, 3.28, 0, Math.PI, false);
  arch.closePath();
  const shell = new THREE.Mesh(
    new THREE.ExtrudeGeometry(arch, {
      depth: 8,
      steps: 1,
      bevelEnabled: false,
      curveSegments: 48,
    }),
    shellMaterial,
  );
  shell.position.z = -4;
  shell.castShadow = true;
  shell.receiveShadow = true;
  scene.add(shell);
  const liningShape = new THREE.Shape();
  liningShape.moveTo(-3.125, 0.16);
  liningShape.absellipse(0, 0.16, 3.125, 3.275, Math.PI, 0, true);
  liningShape.lineTo(3.08, 0.16);
  liningShape.absellipse(0, 0.16, 3.08, 3.23, 0, Math.PI, false);
  liningShape.closePath();
  const lining = new THREE.Mesh(
    new THREE.ExtrudeGeometry(liningShape, {
      depth: 7.95,
      bevelEnabled: false,
      curveSegments: 48,
    }),
    material("#e0d7c7"),
  );
  lining.position.z = -3.98;
  lining.receiveShadow = true;
  scene.add(lining);
  // Rear wall follows the arch; the front remains open for the walkthrough.
  const rearShape = new THREE.Shape();
  rearShape.moveTo(-3.13, 0.16);
  rearShape.absellipse(0, 0.16, 3.13, 3.28, Math.PI, 0, true);
  rearShape.closePath();
  const rear = new THREE.Mesh(
    new THREE.ShapeGeometry(rearShape, 48),
    material("#d6cbbb"),
  );
  rear.position.z = -4;
  scene.add(rear);
  const timber = material("#94765c"),
    fabric = material("#dfdfcf"),
    dark = material("#32483d"),
    white = material("#f1efe4");
  box(2.25, 0.28, 2.6, 0, 0.4, -2.45, timber);
  box(2.2, 0.23, 2.5, 0, 0.65, -2.45, white);
  box(2.25, 1, 0.12, 0, 0.65, -3.8, timber);
  box(0.8, 0.15, 0.45, -0.55, 0.83, -3.2, fabric);
  box(0.8, 0.15, 0.45, 0.55, 0.83, -3.2, fabric);
  box(2.25, 0.05, 1.3, 0, 0.79, -1.87, material("#849785"));
  box(0.8, 0.85, 3.4, -2.2, 0.58, -1, timber);
  box(0.86, 0.08, 3.45, -2.2, 1.04, -1, white);
  for (let z = -2.45; z < 0.7; z += 0.75)
    box(0.025, 0.58, 0.65, -1.79, 0.65, z, material("#ae9378"));
  box(0.62, 0.02, 0.7, -2.2, 1.09, -1.7, dark);
  box(0.46, 0.05, 0.65, -2.2, 1.09, -0.5, material("#6f7977"));
  box(1.35, 0.4, 1.8, 1.72, 0.48, 1.1, fabric);
  box(0.2, 0.55, 1.8, 2.3, 0.75, 1.1, fabric);
  box(1.4, 0.1, 1.85, 1.72, 0.72, 1.1, material("#c8c3b5"));
  box(0.65, 0.5, 1, 0.5, 0.42, 1.4, timber);
  // Facade framing retains the characteristic glazed opening.
  for (const x of [-2.6, 2.6]) box(0.08, 1.9, 0.08, x, 1.12, 4.02, dark);
  box(5.2, 0.08, 0.08, 0, 2.1, 4.02, dark);
  for (const x of [-2.85, 2.85]) box(0.15, 0.65, 1.2, x, 0.5, 5.4, timber);
  for (const x of [-6, 6, -8, 9]) {
    const z = x > 0 ? -5 : 2;
    box(0.2, 2.4, 0.2, x, 1, z, timber);
    const crown = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.3, 1),
      material("#657d58"),
    );
    crown.position.set(x, 2.4, z);
    scene.add(crown);
  }
  const resize = () => {
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  return { renderer, scene, camera, shellMaterial, resize };
}
function applyFinish(id) {
  selectedFinish = finishes.find((f) => f.id === id) || finishes[0];
  for (const world of [preview, walk])
    if (world) {
      world.shellMaterial.color.set(selectedFinish.color);
      world.shellMaterial.roughness = selectedFinish.roughness;
      world.shellMaterial.bumpScale =
        selectedFinish.id === "graphite" ? 0.008 : 0.025;
    }
  document.querySelector("#finish-title").textContent = selectedFinish.name;
  document.querySelector("#finish-description").textContent =
    selectedFinish.description;
  document
    .querySelectorAll("[data-finish]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.finish === selectedFinish.id),
      ),
    );
  document.querySelector("#walk-finish").value = selectedFinish.id;
  if (preview) preview.renderer.render(preview.scene, preview.camera);
}
for (const finish of finishes) {
  const button = document.createElement("button");
  button.dataset.finish = finish.id;
  button.setAttribute("aria-pressed", String(finish === selectedFinish));
  button.innerHTML = `<i style="background:${finish.color}"></i>${finish.name}`;
  button.addEventListener("click", () => applyFinish(finish.id));
  document.querySelector("#exterior-swatches").append(button);
  const option = new Option(finish.name, finish.id);
  document.querySelector("#walk-finish").add(option);
}
document
  .querySelector("#walk-finish")
  .addEventListener("change", (event) => applyFinish(event.target.value));
let angle = 0.65,
  elevation = 0.28,
  distance = 15,
  drag;
function orbit() {
  if (!preview) return;
  preview.camera.position.set(
    Math.sin(angle) * distance,
    3 + Math.sin(elevation) * distance,
    Math.cos(angle) * distance,
  );
  preview.camera.lookAt(0, 1.3, 0);
  preview.renderer.render(preview.scene, preview.camera);
}
exterior.addEventListener("pointerdown", (event) => {
  drag = { x: event.clientX, y: event.clientY };
  exterior.setPointerCapture(event.pointerId);
});
exterior.addEventListener("pointermove", (event) => {
  if (!drag) return;
  angle -= (event.clientX - drag.x) * 0.008;
  elevation = THREE.MathUtils.clamp(
    elevation + (event.clientY - drag.y) * 0.004,
    0.05,
    0.8,
  );
  drag = { x: event.clientX, y: event.clientY };
  orbit();
});
for (const name of ["pointerup", "pointercancel"])
  exterior.addEventListener(name, () => (drag = null));
exterior.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.015, 9, 23);
    orbit();
  },
  { passive: false },
);
try {
  preview = buildWorld(exterior);
  exterior.querySelector(".renderer-loading").remove();
  orbit();
  new ResizeObserver(orbit).observe(exterior);
} catch {
  exterior.querySelector(".renderer-loading").textContent =
    "The 3D finish studio needs WebGL. You can still explore the cinematic walkthrough and material library.";
}
function resetWalk() {
  if (!walk) return;
  walk.camera.position.set(0, 1.7, 6.2);
  yaw = pitch = 0;
  walk.camera.rotation.set(0, 0, 0);
  keys.clear();
}
function animate(time) {
  if (!modal.open || !walk) return;
  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;
  let forward = Number(keys.has("forward")) - Number(keys.has("backward")),
    side = Number(keys.has("right")) - Number(keys.has("left"));
  const length = Math.hypot(forward, side) || 1;
  forward /= length;
  side /= length;
  const dx = (side * Math.cos(yaw) - forward * Math.sin(yaw)) * dt * 2.2,
    dz = (-forward * Math.cos(yaw) - side * Math.sin(yaw)) * dt * 2.2;
  const pos = walk.camera.position;
  const valid = (x, z) =>
    x > -(z < 4 ? 2.45 : 2.8) &&
    x < (z < 4 ? 2.45 : 2.8) &&
    z > -3.6 &&
    z < 6.6 &&
    !obstacles.some(
      ([x1, x2, z1, z2]) =>
        x > x1 - 0.2 && x < x2 + 0.2 && z > z1 - 0.2 && z < z2 + 0.2,
    );
  if (valid(pos.x + dx, pos.z)) pos.x += dx;
  if (valid(pos.x, pos.z + dz)) pos.z += dz;
  walk.camera.rotation.set(pitch, yaw, 0);
  walk.renderer.render(walk.scene, walk.camera);
  document.querySelector("#walk-location").textContent =
    pos.z > 4 ? "Veranda" : pos.z > 0 ? "Living suite" : "Sleeping suite";
  frame = requestAnimationFrame(animate);
}
document.querySelectorAll("[data-open-walk]").forEach((button) =>
  button.addEventListener("click", () => {
    modal.showModal();
    document.body.style.overflow = "hidden";
    try {
      if (!walk) walk = buildWorld(walkViewport);
      walk.resize();
      applyFinish(selectedFinish.id);
      resetWalk();
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
      walkViewport.focus();
    } catch {
      walkViewport.innerHTML =
        '<p style="padding:120px 32px">Your browser could not start the 3D walkthrough. <a href="experience.html" style="color:white">Open the cinematic experience instead →</a></p>';
    }
  }),
);
document
  .querySelector("#close-walk")
  .addEventListener("click", () => modal.close());
modal.addEventListener("close", () => {
  cancelAnimationFrame(frame);
  keys.clear();
  document.body.style.overflow = "";
});
document.querySelector("#reset-walk").addEventListener("click", resetWalk);
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
window.addEventListener("keydown", (event) => {
  if (!modal.open || ["SELECT", "BUTTON"].includes(event.target.tagName))
    return;
  if (keyMap[event.code]) {
    event.preventDefault();
    keys.add(keyMap[event.code]);
  }
});
window.addEventListener("keyup", (event) => keys.delete(keyMap[event.code]));
window.addEventListener("blur", () => keys.clear());
document.addEventListener("visibilitychange", () => keys.clear());
let looking;
walkViewport.addEventListener("pointerdown", (event) => {
  looking = { x: event.clientX, y: event.clientY };
  walkViewport.setPointerCapture(event.pointerId);
  walkViewport.focus();
});
walkViewport.addEventListener("pointermove", (event) => {
  if (!looking) return;
  yaw -= (event.clientX - looking.x) * 0.004;
  pitch = THREE.MathUtils.clamp(
    pitch - (event.clientY - looking.y) * 0.004,
    -1.15,
    1.15,
  );
  looking = { x: event.clientX, y: event.clientY };
});
for (const name of ["pointerup", "pointercancel"])
  walkViewport.addEventListener(name, () => (looking = null));
document.querySelectorAll("[data-move]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    keys.add(button.dataset.move);
    button.setPointerCapture(event.pointerId);
  });
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
    button.addEventListener(name, () => keys.delete(button.dataset.move));
});
document.querySelector("#capture-walk").addEventListener("click", () => {
  if (!walk) return;
  walk.renderer.render(walk.scene, walk.camera);
  const link = document.createElement("a");
  link.download = "fjall-first-person-view.png";
  link.href = walk.renderer.domElement.toDataURL("image/png");
  link.click();
});
