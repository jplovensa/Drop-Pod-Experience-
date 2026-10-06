const SCENES = [
  {
    key: "sumba",
    title: "The Sumba Masterplan",
    dur: 12000,
    video: "assets/sumba-resort.mp4",
    poster: "assets/sumba-resort.jpg",
    desc: "One hundred Drop Pods along the Waingapu shoreline, East Sumba — phase one of a five-hundred-unit programme.",
  },
  {
    key: "beach",
    title: "Beachfront Placement",
    dur: 12000,
    video: "assets/beachfront.mp4",
    poster: "assets/pod-hero.jpg",
    desc: "The catalogue P-Grade shell, placed where land meets sea — curled composite form, glazed front facing the surf.",
  },
  {
    key: "hero",
    title: "Life on the Veranda",
    dur: 7000,
    single: "assets/pod-hero.jpg",
    desc: "Human scale against the sculpted shell — the integrated veranda and cascading stair, twenty steps from the water.",
  },
  {
    key: "exterior",
    title: "The Approach",
    dur: 12000,
    video: "assets/exterior-pods.mp4",
    poster: "assets/arrival-med.jpg",
    desc: "A sculpted monolithic shell meets the landscape — the arched glass facade draws daylight deep into the pod.",
  },
  {
    key: "entry",
    title: "Veranda to Entrance",
    dur: 12000,
    video: "assets/walkthrough-entry.mp4",
    poster: "assets/lounge-med.jpg",
    desc: "Step from the veranda through the sliding glass wall — inside and out become one volume.",
  },
  {
    key: "reveal",
    title: "The Suite Reveal",
    dur: 12000,
    video: "assets/walkthrough-suite.mp4",
    poster: "assets/sleeping-med.jpg",
    desc: "One continuous glide through the open suite — kitchen, living wall and sleeping alcove in a single take.",
  },
  {
    key: "pano",
    title: "Inside the Pod",
    dur: 15000,
    pano: true,
    desc: "A full 360° panorama from the heart of the suite — drag to look in every direction.",
  },
  {
    key: "arrival",
    title: "Facade",
    dur: 7000,
    desc: "Pre-engineered rings, wrapped in a continuous elastomeric veil — built in weeks, not months.",
  },
  {
    key: "lounge",
    title: "Terrace Lounge",
    dur: 7000,
    desc: "A quiet threshold between inside and out, framed by the pod's signature circular aperture.",
  },
  {
    key: "dining",
    title: "Alfresco Dining",
    dur: 7000,
    desc: "Morning coffee or evening wine — the veranda extends the living space into the open air.",
  },
  {
    key: "living",
    title: "The Living Wall",
    dur: 7000,
    desc: "One continuous surface carries media, wardrobe and storage — the functional heart of the pod.",
  },
  {
    key: "suite",
    title: "The Open Suite",
    dur: 7000,
    desc: "Sleeping, cooking and living flow as one volume beneath the curved shell.",
  },
  {
    key: "kitchen",
    title: "The Kitchen",
    dur: 7000,
    desc: "A full working kitchen, compacted into a single elegant run of bamboo cabinetry.",
  },
  {
    key: "culinary",
    title: "Culinary Detail",
    dur: 7000,
    desc: "Tactile surfaces and warm task lighting — every touchpoint considered.",
  },
  {
    key: "dressing",
    title: "Dressing Gallery",
    dur: 7000,
    desc: "A calm corridor of wardrobes connects the wet cell to the suite.",
  },
  {
    key: "sleeping",
    title: "The Sleeping Suite",
    dur: 7000,
    desc: "The bed anchors the pod — a monolithic headboard wall, soft textiles, filtered light.",
  },
  {
    key: "morning",
    title: "Morning Light",
    dur: 7000,
    desc: "Sheer curtains temper the sun; the suite wakes with the site.",
  },
];
const KB = ["kb-a", "kb-b", "kb-c"];
const LOOK_SCALE = 1.32;

const stage = document.getElementById("stage");
const segWrap = document.getElementById("segments");
const capInner = document.getElementById("capInner");
const capNo = document.getElementById("capNo");
const capTitle = document.getElementById("capTitle");
const capDesc = document.getElementById("capDesc");
const counterCur = document.getElementById("counterCur");
const styleName = document.getElementById("styleName");
const modeName = document.getElementById("modeName");
const icoPlay = document.getElementById("icoPlay");
const icoPause = document.getElementById("icoPause");
const endcard = document.getElementById("endcard");
const tape = document.getElementById("tape");
const coordX = document.getElementById("coordX");
const coordY = document.getElementById("coordY");
const lookHint = document.getElementById("lookHint");
const badge360 = document.getElementById("badge360");

let cur = 0,
  style = "med",
  mode = "film",
  playing = false,
  elapsed = 0,
  raf = null,
  lastTs = 0;
let started = false;

/* ---------- build scene layers ---------- */
SCENES.forEach((s, i) => {
  const sc = document.createElement("div");
  sc.className = "scene";
  sc.style.setProperty("--dur", s.dur + "ms");
  const look = document.createElement("div");
  look.className = "look";
  if (s.pano) {
    const c = document.createElement("canvas");
    c.className = "pano";
    c.dataset.style = "both";
    look.appendChild(c);
  } else if (s.video) {
    const v = document.createElement("video");
    v.src = s.video;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.preload = "auto";
    if (s.poster) v.poster = s.poster;
    v.dataset.style = "both";
    look.appendChild(v);
  } else if (s.single) {
    const img = document.createElement("img");
    img.src = s.single;
    img.dataset.style = "both";
    img.alt = s.title;
    img.draggable = false;
    look.appendChild(img);
  } else {
    for (const st of ["med", "wo"]) {
      const img = document.createElement("img");
      img.src = `assets/${s.key}-${st}.jpg`;
      img.dataset.style = st;
      img.alt = `${s.title} — ${st === "med" ? "Modern Mediterranean" : "Warm Organic"}`;
      img.draggable = false;
      look.appendChild(img);
    }
  }
  sc.appendChild(look);
  stage.appendChild(sc);

  const seg = document.createElement("button");
  seg.className = "seg";
  seg.setAttribute("aria-label", s.title);
  seg.innerHTML = `<span class="fill"></span><span class="tip">${String(i + 1).padStart(2, "0")} · ${s.title}</span>`;
  seg.addEventListener("click", () => goTo(i));
  segWrap.appendChild(seg);
});
const sceneEls = [...stage.children];
const segEls = [...segWrap.children];
const PANO_INDEX = SCENES.findIndex((s) => s.pano);

/* compass tape */
{
  const cards = {
    0: "N",
    45: "NE",
    90: "E",
    135: "SE",
    180: "S",
    225: "SW",
    270: "W",
    315: "NW",
  };
  let html = "";
  for (let d = -180; d <= 540; d += 15) {
    const norm = ((d % 360) + 360) % 360;
    html += `<span class="${cards[norm] !== undefined ? "card" : ""}">${cards[norm] !== undefined ? cards[norm] : norm + "°"}</span>`;
  }
  tape.innerHTML = html;
}
function setCompass(deg) {
  tape.style.transform = `translateX(${(-(deg + 180) * 40) / 15 + 20}px)`;
}

function mediaOf(i) {
  return [...sceneEls[i].querySelectorAll("img,video,canvas")];
}

/* =========================================================
   Minimal WebGL equirectangular 360 viewer (no dependencies)
   ========================================================= */
const pano = {
  gl: null,
  canvas: null,
  prog: null,
  tex: {},
  yaw: 0,
  pitch: 0,
  tYaw: 0,
  tPitch: 0,
  vel: 0,
  running: false,
  dragging: false,
  lx: 0,
  ly: 0,
  lastMove: 0,
  ready: {},
};
function mat4Perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2),
    nf = 1 / (near - far);
  return [
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    -1,
    0,
    0,
    2 * far * near * nf,
    0,
  ];
}
function mat4Mul(a, b) {
  const o = new Array(16).fill(0);
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
}
function mat4RotY(d) {
  const c = Math.cos(d),
    s = Math.sin(d);
  return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
}
function mat4RotX(d) {
  const c = Math.cos(d),
    s = Math.sin(d);
  return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
}

function initPano() {
  if (pano.gl) return;
  const canvas = sceneEls[PANO_INDEX].querySelector("canvas");
  pano.canvas = canvas;
  const gl = canvas.getContext("webgl", { antialias: true });
  if (!gl) return;
  pano.gl = gl;
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(
    vs,
    "attribute vec3 p;attribute vec2 uv;uniform mat4 m;varying vec2 v;void main(){v=uv;gl_Position=m*vec4(p,1.);}",
  );
  gl.compileShader(vs);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(
    fs,
    "precision mediump float;varying vec2 v;uniform sampler2D t;void main(){gl_FragColor=texture2D(t,v);}",
  );
  gl.compileShader(fs);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);
  pano.prog = prog;
  // sphere (rendered from inside)
  const W = 64,
    H = 40,
    pos = [],
    uv = [],
    idx = [];
  for (let y = 0; y <= H; y++) {
    const th = (y / H) * Math.PI;
    for (let x = 0; x <= W; x++) {
      const ph = (x / W) * 2 * Math.PI;
      pos.push(
        -Math.cos(ph) * Math.sin(th),
        Math.cos(th),
        Math.sin(ph) * Math.sin(th),
      );
      uv.push(x / W, 1 - y / H);
    }
  }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const a = y * (W + 1) + x,
        b = a + W + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
  const pl = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(pl);
  gl.vertexAttribPointer(pl, 3, gl.FLOAT, false, 0, 0);
  const ub = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ub);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
  const ul = gl.getAttribLocation(prog, "uv");
  gl.enableVertexAttribArray(ul);
  gl.vertexAttribPointer(ul, 2, gl.FLOAT, false, 0, 0);
  const ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  pano.count = idx.length;
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.FRONT);
  loadPanoTex("med");
  loadPanoTex("wo");

  canvas.addEventListener("pointerdown", (e) => {
    pano.dragging = true;
    pano.lx = e.clientX;
    pano.ly = e.clientY;
    pano.vel = 0;
    pano.lastMove = performance.now();
    canvas.setPointerCapture(e.pointerId);
    e.stopPropagation();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!pano.dragging) return;
    const dx = e.clientX - pano.lx,
      dy = e.clientY - pano.ly;
    pano.lx = e.clientX;
    pano.ly = e.clientY;
    pano.tYaw -= dx * 0.12;
    pano.tPitch = Math.max(-85, Math.min(85, pano.tPitch + dy * 0.1));
    pano.vel = -dx * 0.12;
    pano.lastMove = performance.now();
    lookHint.style.display = "none";
    e.stopPropagation();
  });
  ["pointerup", "pointercancel"].forEach((ev) =>
    canvas.addEventListener(ev, (e) => {
      pano.dragging = false;
      pano.lastMove = performance.now();
      e.stopPropagation();
    }),
  );
}
function loadPanoTex(st) {
  const gl = pano.gl;
  const img = new Image();
  img.onload = () => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    pano.tex[st] = t;
    pano.ready[st] = true;
    if (st === style) pano.canvas.style.opacity = 1;
  };
  img.src = `assets/pano-${st}.jpg`;
}
function panoFrame() {
  if (!pano.running) return;
  const gl = pano.gl,
    canvas = pano.canvas;
  const dpr = Math.min(2, devicePixelRatio || 1);
  const w = (canvas.clientWidth * dpr) | 0,
    h = (canvas.clientHeight * dpr) | 0;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
  const now = performance.now();
  // auto-rotate: in film mode always; in explore after idle
  if (!pano.dragging) {
    if (Math.abs(pano.vel) > 0.002) {
      pano.tYaw += pano.vel;
      pano.vel *= 0.95;
    } else if (mode === "film" || now - pano.lastMove > 3500) {
      pano.tYaw += 0.045;
    }
  }
  pano.yaw += (pano.tYaw - pano.yaw) * 0.09;
  pano.pitch += (pano.tPitch - pano.pitch) * 0.09;
  const proj = mat4Perspective(1.22, w / h, 0.1, 10);
  const view = mat4Mul(
    mat4RotX((pano.pitch * Math.PI) / 180),
    mat4RotY((pano.yaw * Math.PI) / 180),
  );
  gl.uniformMatrix4fv(
    gl.getUniformLocation(pano.prog, "m"),
    false,
    new Float32Array(mat4Mul(proj, view)),
  );
  if (pano.tex[style]) gl.bindTexture(gl.TEXTURE_2D, pano.tex[style]);
  gl.drawElements(gl.TRIANGLES, pano.count, gl.UNSIGNED_SHORT, 0);
  requestAnimationFrame(panoFrame);
}
function panoStart() {
  if (!pano.running) {
    pano.running = true;
    requestAnimationFrame(panoFrame);
  }
}
function panoStop() {
  pano.running = false;
}

/* ---------- look (pan/tilt for stills & video) ---------- */
const look = {
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  vx: 0,
  vy: 0,
  dragging: false,
  lx: 0,
  ly: 0,
  lastMove: 0,
  gyro: false,
  gx: 0,
  gy: 0,
};
function maxX() {
  return ((LOOK_SCALE - 1) / 2) * innerWidth;
}
function maxY() {
  return ((LOOK_SCALE - 1) / 2) * innerHeight;
}
function resetLook() {
  look.x = look.y = look.tx = look.ty = look.vx = look.vy = 0;
}

function lookLoop(t) {
  if (mode !== "explore") return;
  if (SCENES[cur].pano) {
    // HUD driven by the 360 viewer's true heading
    const deg = ((pano.yaw % 360) + 360) % 360;
    setCompass(deg);
    coordX.textContent = deg.toFixed(1).padStart(5, "0") + "°";
    coordY.textContent =
      (pano.pitch >= 0 ? "+" : "−") +
      Math.abs(pano.pitch).toFixed(1).padStart(4, "0") +
      "°";
    requestAnimationFrame(lookLoop);
    return;
  }
  const mX = maxX(),
    mY = maxY();
  if (!look.dragging && !look.gyro && t - look.lastMove > 3000) {
    look.tx = mX * 0.45 * Math.sin(t * 0.00035);
    look.ty = mY * 0.3 * Math.sin(t * 0.00023 + 1.7);
  }
  if (look.gyro) {
    look.tx = Math.max(-mX, Math.min(mX, (-look.gx / 40) * mX));
    look.ty = Math.max(-mY, Math.min(mY, (look.gy / 35) * mY));
  }
  if (
    !look.dragging &&
    (Math.abs(look.vx) > 0.05 || Math.abs(look.vy) > 0.05)
  ) {
    look.tx = Math.max(-mX, Math.min(mX, look.tx + look.vx));
    look.ty = Math.max(-mY, Math.min(mY, look.ty + look.vy));
    look.vx *= 0.93;
    look.vy *= 0.93;
  }
  look.x += (look.tx - look.x) * 0.085;
  look.y += (look.ty - look.y) * 0.085;
  sceneEls[cur].querySelector(".look").style.transform =
    `translate(${look.x}px,${look.y}px) scale(${LOOK_SCALE})`;
  const hx = (-look.x / mX) * 60,
    hy = (-look.y / mY) * 28;
  coordX.textContent =
    (hx >= 0 ? "+" : "−") + Math.abs(hx).toFixed(1).padStart(5, "0") + "°";
  coordY.textContent =
    (hy >= 0 ? "+" : "−") + Math.abs(hy).toFixed(1).padStart(5, "0") + "°";
  setCompass(((hx % 360) + 360) % 360);
  requestAnimationFrame(lookLoop);
}

stage.addEventListener("pointerdown", (e) => {
  if (mode !== "explore" || SCENES[cur].pano) return;
  look.dragging = true;
  look.lx = e.clientX;
  look.ly = e.clientY;
  look.vx = look.vy = 0;
  look.lastMove = performance.now();
  stage.classList.add("dragging");
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener("pointermove", (e) => {
  if (!look.dragging) return;
  const dx = e.clientX - look.lx,
    dy = e.clientY - look.ly;
  look.lx = e.clientX;
  look.ly = e.clientY;
  look.tx = Math.max(-maxX(), Math.min(maxX(), look.tx + dx));
  look.ty = Math.max(-maxY(), Math.min(maxY(), look.ty + dy));
  look.vx = dx;
  look.vy = dy;
  look.lastMove = performance.now();
  lookHint.style.display = "none";
});
["pointerup", "pointercancel"].forEach((ev) =>
  stage.addEventListener(ev, () => {
    look.dragging = false;
    stage.classList.remove("dragging");
    look.lastMove = performance.now();
  }),
);

/* device orientation */
const btnMotion = document.getElementById("btnMotion");
if (window.DeviceOrientationEvent && "ontouchstart" in window)
  btnMotion.style.display = "grid";
btnMotion.addEventListener("click", async () => {
  try {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const r = await DeviceOrientationEvent.requestPermission();
      if (r !== "granted") return;
    }
    look.gyro = !look.gyro;
    btnMotion.style.borderColor = look.gyro ? "var(--teal)" : "";
    btnMotion.style.color = look.gyro ? "var(--teal)" : "";
  } catch (e) {}
});
window.addEventListener("deviceorientation", (e) => {
  if (!look.gyro) return;
  if (SCENES[cur] && SCENES[cur].pano) {
    if (e.gamma != null) pano.tYaw += e.gamma * 0.02;
    if (e.beta != null)
      pano.tPitch = Math.max(-85, Math.min(85, (e.beta - 45) * 1.2));
    return;
  }
  if (e.gamma != null) look.gx = e.gamma;
  if (e.beta != null) look.gy = e.beta - 45;
});

/* ---------- scene display ---------- */
function show(i, { reset = true } = {}) {
  sceneEls.forEach((el, idx) => {
    el.classList.toggle("active", idx === i);
    if (idx !== i) {
      el.querySelector(".look").style.transform = "";
      const v = el.querySelector("video");
      if (v) v.pause();
    }
  });
  if (SCENES[i].pano) {
    initPano();
    pano.canvas.style.opacity = pano.ready[style] ? 1 : 0;
    pano.tYaw = pano.yaw = 0;
    pano.tPitch = pano.pitch = 0;
    panoStart();
    badge360.classList.add("show");
  } else {
    panoStop();
    badge360.classList.remove("show");
  }
  mediaOf(i).forEach((m) => {
    const on = m.dataset.style === "both" || m.dataset.style === style;
    m.classList.toggle("show", on);
    m.classList.remove("kb-a", "kb-b", "kb-c");
    if (on && m.tagName === "IMG") {
      void m.offsetWidth;
      m.classList.add(KB[i % 3]);
    }
    if (on && m.tagName === "VIDEO") {
      m.currentTime = 0;
      m.play().catch(() => {});
    }
    if (on && m.tagName === "CANVAS") {
      m.classList.add("show");
    }
  });
  resetLook();
  segEls.forEach((s, idx) => {
    s.classList.toggle("done", idx < i);
    s.querySelector(".fill").style.width = idx < i ? "100%" : "0";
  });
  capNo.textContent = `${String(i + 1).padStart(2, "0")} — ${String(SCENES.length).padStart(2, "0")}`;
  capTitle.textContent = SCENES[i].title;
  capDesc.textContent = SCENES[i].desc;
  counterCur.textContent = String(i + 1).padStart(2, "0");
  capInner.classList.remove("cap-anim");
  void capInner.offsetWidth;
  capInner.classList.add("cap-anim");
  if (reset) {
    elapsed = 0;
  }
}

function goTo(i) {
  endcard.classList.remove("show");
  cur = (i + SCENES.length) % SCENES.length;
  show(cur);
}
function next() {
  cur === SCENES.length - 1 ? finish() : goTo(cur + 1);
}
function prev() {
  goTo(cur - 1);
}
function finish() {
  pause();
  segEls.forEach((s) => {
    s.classList.add("done");
    s.querySelector(".fill").style.width = "100%";
  });
  endcard.classList.add("show");
  document.body.classList.remove("hidden-chrome");
}

/* film timer */
function loop(ts) {
  if (!playing) return;
  if (!lastTs) lastTs = ts;
  elapsed += ts - lastTs;
  lastTs = ts;
  const p = Math.min(1, elapsed / SCENES[cur].dur);
  segEls[cur].querySelector(".fill").style.width = p * 100 + "%";
  if (p >= 1) {
    lastTs = 0;
    next();
    if (playing) raf = requestAnimationFrame(loop);
    return;
  }
  raf = requestAnimationFrame(loop);
}
function play() {
  if (playing) return;
  playing = true;
  lastTs = 0;
  icoPlay.style.display = "none";
  icoPause.style.display = "block";
  raf = requestAnimationFrame(loop);
  wake();
}
function pause() {
  playing = false;
  cancelAnimationFrame(raf);
  icoPlay.style.display = "block";
  icoPause.style.display = "none";
}

/* ---------- modes ---------- */
function setMode(m) {
  if (m === mode) return;
  mode = m;
  document.body.classList.toggle("film", m === "film");
  document.body.classList.toggle("explore", m === "explore");
  document.getElementById("mdFilm").classList.toggle("on", m === "film");
  document.getElementById("mdExplore").classList.toggle("on", m === "explore");
  modeName.textContent = m === "film" ? "Film" : "Explore VR";
  lookHint.style.display = "";
  if (m === "explore") {
    pause();
    document.body.classList.remove("hidden-chrome");
    resetLook();
    requestAnimationFrame(lookLoop);
  } else {
    sceneEls[cur].querySelector(".look").style.transform = "";
    show(cur);
    play();
  }
}
document
  .getElementById("mdFilm")
  .addEventListener("click", () => setMode("film"));
document
  .getElementById("mdExplore")
  .addEventListener("click", () => setMode("explore"));

/* ---------- style switch ---------- */
function setStyle(st) {
  if (st === style) return;
  style = st;
  document.getElementById("swMed").classList.toggle("on", st === "med");
  document.getElementById("swWo").classList.toggle("on", st === "wo");
  styleName.textContent =
    st === "med" ? "Modern Mediterranean" : "Warm Organic";
  if (SCENES[cur].pano) {
    pano.canvas.style.opacity = pano.ready[st] ? 1 : 0;
  } else {
    mediaOf(cur).forEach((m) => {
      const on = m.dataset.style === "both" || m.dataset.style === st;
      m.classList.remove("kb-a", "kb-b", "kb-c");
      if (on && m.tagName === "IMG") {
        void m.offsetWidth;
        m.classList.add(KB[cur % 3]);
      }
      m.classList.toggle("show", on);
    });
    [cur + 1, cur + 2].forEach((k) => {
      if (k < SCENES.length && !SCENES[k].video && !SCENES[k].pano) {
        const im = new Image();
        im.src = `assets/${SCENES[k].key}-${st}.jpg`;
      }
    });
  }
}
document
  .getElementById("swMed")
  .addEventListener("click", () => setStyle("med"));
document.getElementById("swWo").addEventListener("click", () => setStyle("wo"));

/* ---------- transport ---------- */
document
  .getElementById("btnPlay")
  .addEventListener("click", () => (playing ? pause() : play()));
document.getElementById("btnNext").addEventListener("click", () => {
  endcard.classList.remove("show");
  goTo(cur + 1 > SCENES.length - 1 ? 0 : cur + 1);
});
document.getElementById("btnPrev").addEventListener("click", prev);
document.getElementById("btnFull").addEventListener("click", () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(() => {});
});

document.addEventListener("keydown", (e) => {
  if (!started) {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      start();
    }
    return;
  }
  switch (e.code) {
    case "Space":
      e.preventDefault();
      if (mode === "film") {
        playing ? pause() : play();
      }
      break;
    case "ArrowRight":
      goTo(cur + 1 > SCENES.length - 1 ? 0 : cur + 1);
      break;
    case "ArrowLeft":
      prev();
      break;
    case "KeyV":
      setMode(mode === "film" ? "explore" : "film");
      break;
    case "KeyM":
      setStyle("med");
      break;
    case "KeyW":
      setStyle("wo");
      break;
    case "KeyF":
      document.getElementById("btnFull").click();
      break;
  }
});

/* idle chrome hide (film mode only) */
let idleTimer = null;
function wake() {
  document.body.classList.remove("hidden-chrome");
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (playing && mode === "film")
      document.body.classList.add("hidden-chrome");
  }, 3200);
}
["mousemove", "touchstart", "keydown"].forEach((ev) =>
  document.addEventListener(ev, wake, { passive: true }),
);

/* ---------- start ---------- */
function start() {
  started = true;
  document.getElementById("intro").classList.add("gone");
  document.body.classList.remove("hidden-chrome");
  const iv = document.querySelector("#intro video.bg");
  if (iv) iv.pause();
  const requestedStyle = new URLSearchParams(location.search).get("style");
  if (requestedStyle === "wo") setStyle("wo");
  show(0);
  play();
}
document.getElementById("begin").addEventListener("click", start);
document.getElementById("replay").addEventListener("click", () => {
  endcard.classList.remove("show");
  goTo(0);
  if (mode === "film") play();
});

/* preload current-style stills during intro */
window.addEventListener("load", () => {
  SCENES.forEach((s) => {
    if (!s.video && !s.pano && !s.single) {
      const im = new Image();
      im.src = `assets/${s.key}-med.jpg`;
    }
  });
});
