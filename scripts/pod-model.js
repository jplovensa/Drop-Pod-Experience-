import * as THREE from "./vendor/three.module.js";
export const finishes = [
  {
    id: "chalk",
    name: "Mineral Chalk",
    color: "#e6e1d4",
    roughness: 0.85,
    description: "Fine mineral grain with a soft matte surface.",
  },
  {
    id: "sand",
    name: "Warm Sand",
    color: "#c9b18d",
    roughness: 0.82,
    description: "A warm limestone tone with a fine tactile grain.",
  },
  {
    id: "clay",
    name: "Earth Clay",
    color: "#a57560",
    roughness: 0.9,
    description: "An earthy mineral finish with a textured matte surface.",
  },
  {
    id: "graphite",
    name: "Graphite",
    color: "#485251",
    roughness: 0.55,
    description: "A deep graphite shell with a restrained satin surface.",
  },
];
// A reference-derived asymmetric teardrop, not a dimensioned production model.
function profile(inset = 0) {
  const s = new THREE.Shape();
  s.moveTo(-3.25, 0.82);
  s.bezierCurveTo(-3.9, 1.2, -2.45, 3.35, -1, 4.68);
  s.bezierCurveTo(-0.58, 5.06, -0.18, 4.96, 0.25, 4.53);
  s.bezierCurveTo(1.24, 3.55, 3.18, 2.37, 3.35, 1.48);
  s.bezierCurveTo(3.58, 0.48, 2.63, 0.75, 1.85, 0.75);
  s.lineTo(-2.62, 0.75);
  s.bezierCurveTo(-2.94, 0.75, -3.14, 0.76, -3.25, 0.82);
  if (inset) {
    const pts = s
      .getPoints(100)
      .map(
        (p) =>
          new THREE.Vector2(
            p.x * (1 - inset),
            0.86 + (p.y - 0.86) * (1 - inset),
          ),
      );
    return new THREE.Shape(pts);
  }
  return s;
}
function texture(kind) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  let seed = 73;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const image = ctx.createImageData(256, 256);
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4;
      let value =
        kind === "wood"
          ? 220 + 10 * Math.sin(x * 0.28 + Math.sin(y * 0.035) * 2) + rand() * 5
          : kind === "fabric"
            ? 205 + (x % 3 === 0 || y % 3 === 0 ? -30 : 0) + rand() * 15
            : 210 + rand() * 35;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = value;
      image.data[i + 3] = 255;
    }
  ctx.putImageData(image, 0, 0);
  if (kind === "floor") {
    ctx.strokeStyle = "#a49c8b";
    ctx.lineWidth = 2;
    for (let i = 0; i < 256; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, 128);
    ctx.lineTo(256, 128);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(kind === "wood" ? 2 : 6, kind === "wood" ? 2 : 6);
  return t;
}
function environment(renderer) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#789eb5");
  g.addColorStop(0.45, "#d2e1e5");
  g.addColorStop(0.52, "#f7ead1");
  g.addColorStop(1, "#8a8874");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  const sun = ctx.createRadialGradient(350, 90, 0, 350, 90, 65);
  sun.addColorStop(0, "#fff8e8");
  sun.addColorStop(1, "#fff8e800");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, 512, 256);
  const map = new THREE.CanvasTexture(c);
  map.mapping = THREE.EquirectangularReflectionMapping;
  map.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromEquirectangular(map);
  pmrem.dispose();
  map.dispose();
  return target.texture;
}
export function createPodWorld(host) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#d6e2e6");
  scene.fog = new THREE.Fog("#d6e2e6", 35, 90);
  scene.environment = environment(renderer);
  scene.background = scene.environment;
  scene.backgroundBlurriness = 0.05;
  const camera = new THREE.PerspectiveCamera(60, 1, 0.06, 110);
  camera.rotation.order = "YXZ";
  scene.add(new THREE.HemisphereLight("#dce8ed", "#b2a387", 0.65));
  const sun = new THREE.DirectionalLight("#ffebcc", 3);
  sun.position.set(-7, 12, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -12,
    right: 12,
    top: 12,
    bottom: -12,
    near: 0.5,
    far: 40,
  });
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.025;
  scene.add(sun);
  const materials = {
    shell: new THREE.MeshStandardMaterial({
      color: finishes[0].color,
      roughness: 0.85,
      bumpMap: texture("mineral"),
      bumpScale: 0.012,
    }),
    lining: new THREE.MeshStandardMaterial({
      color: "#e6ddca",
      roughness: 0.9,
    }),
    timber: new THREE.MeshStandardMaterial({
      color: "#a38a69",
      roughness: 0.6,
      map: texture("wood"),
      bumpMap: texture("wood"),
      bumpScale: 0.005,
    }),
    fabric: new THREE.MeshStandardMaterial({
      color: "#ede8df",
      roughness: 1,
      map: texture("fabric"),
      bumpMap: texture("fabric"),
      bumpScale: 0.007,
    }),
    stone: new THREE.MeshStandardMaterial({
      color: "#c8bca4",
      roughness: 0.8,
      map: texture("floor"),
      bumpMap: texture("floor"),
      bumpScale: 0.008,
    }),
    metal: new THREE.MeshStandardMaterial({
      color: "#242c2a",
      metalness: 0.75,
      roughness: 0.25,
    }),
    leather: new THREE.MeshStandardMaterial({
      color: "#a58b6f",
      roughness: 0.65,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#cee0df",
      metalness: 0.08,
      roughness: 0.06,
      transparent: true,
      opacity: 0.19,
      depthWrite: false,
      clearcoat: 1,
      side: THREE.DoubleSide,
    }),
    linen: new THREE.MeshStandardMaterial({
      color: "#efeadb",
      roughness: 1,
      transparent: true,
      opacity: 0.82,
      map: texture("fabric"),
      side: THREE.DoubleSide,
    }),
  };
  for (const mat of Object.values(materials))
    mat.envMapIntensity = mat === materials.glass ? 1 : 0.55;
  const add = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = mat !== materials.glass;
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };
  const box = (w, h, d, x, y, z, mat) =>
    add(new THREE.BoxGeometry(w, h, d), mat, x, y, z);
  function rounded(w, h, d, r, x, y, z, mat) {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return add(
      new THREE.ExtrudeGeometry(shape, {
        depth: d - r * 2,
        bevelEnabled: true,
        bevelThickness: r,
        bevelSize: r * 0.5,
        bevelSegments: 3,
        steps: 1,
        curveSegments: 12,
      }),
      mat,
      x,
      y,
      z - d / 2 + r,
    );
  }
  // Loft both skins along the pod, tapering the rear and blending a rounded front lip.
  const outer = profile().getSpacedPoints(160),
    inner = profile(0.095).getSpacedPoints(160);
  const positions = [],
    uvs = [],
    indices = [];
  const slices = 32,
    n = outer.length;
  for (let skin = 0; skin < 2; skin++)
    for (let j = 0; j <= slices; j++) {
      const t = j / slices,
        z = 4.6 - t * 9.2;
      const scale = 1 - 0.12 * t + 0.015 * Math.sin(t * Math.PI);
      const pts = skin ? inner : outer;
      for (let i = 0; i < n; i++) {
        positions.push(pts[i].x * scale, 0.86 + (pts[i].y - 0.86) * scale, z);
        uvs.push((i / (n - 1)) * 3, t * 3);
      }
    }
  for (let skin = 0; skin < 2; skin++)
    for (let j = 0; j < slices; j++)
      for (let i = 0; i < n - 1; i++) {
        const a = skin * (slices + 1) * n + j * n + i,
          b = a + n;
        if (!skin) indices.push(a, a + 1, b, b, a + 1, b + 1);
        else indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.addGroup(0, slices * (n - 1) * 6, 0);
  geometry.addGroup(slices * (n - 1) * 6, slices * (n - 1) * 6, 1);
  geometry.computeVertexNormals();
  const shell = add(geometry, [materials.shell, materials.lining]);
  shell.castShadow = true;
  const ring = profile();
  ring.holes.push(new THREE.Path(inner));
  const lip = add(
    new THREE.ExtrudeGeometry(ring, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.035,
      bevelSegments: 3,
      curveSegments: 96,
    }),
    materials.shell,
    0,
    0,
    4.45,
  );
  const rear = add(
    new THREE.ShapeGeometry(profile(0.095), 64),
    materials.lining,
    0,
    0,
    -4.6,
  );
  rear.scale.set(0.88, 0.88, 1);
  rear.position.y = 0.86 * (1 - 0.88);
  box(6.1, 0.18, 10.5, 0, 0.76, 0.3, materials.shell);
  box(5.85, 0.07, 8.3, 0, 0.88, -0.2, materials.stone);
  for (let i = 0; i < 5; i++) {
    const z = 5.6 + i * 0.42;
    rounded(2.8, 0.17, 0.58, 0.075, -0.9, 0.68 - i * 0.16, z, materials.shell);
    box(
      2.4,
      0.016,
      0.024,
      -0.9,
      0.77 - i * 0.16,
      z + 0.23,
      new THREE.MeshStandardMaterial({
        color: "#ffe0a1",
        emissive: "#ffc675",
        emissiveIntensity: 2,
      }),
    );
  }
  for (const x of [-2.5, 2.5])
    for (const z of [-3, 3]) box(0.28, 0.8, 0.28, x, 0.34, z, materials.metal);
  // Recessed facade: a perimeter frame, glazing and open central sliding doorway.
  const facadePts = profile(0.115).getSpacedPoints(100);
  const frameCurve = new THREE.CatmullRomCurve3(
    facadePts.map((p) => new THREE.Vector3(p.x, p.y, 3.48)),
    true,
  );
  add(new THREE.TubeGeometry(frameCurve, 150, 0.045, 6, true), materials.metal);
  function clip(points, bound, keepLeft) {
    const result = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length];
      const ain = keepLeft ? a.x <= bound : a.x >= bound,
        bin = keepLeft ? b.x <= bound : b.x >= bound;
      if (ain) result.push(a);
      if (ain !== bin) {
        const t = (bound - a.x) / (b.x - a.x);
        result.push(new THREE.Vector2(bound, a.y + (b.y - a.y) * t));
      }
    }
    return result;
  }
  for (const left of [true, false])
    add(
      new THREE.ShapeGeometry(
        new THREE.Shape(clip(facadePts, left ? -0.8 : 0.8, left)),
      ),
      materials.glass,
      0,
      0,
      3.48,
    );
  for (const x of [-2, -0.8, 0.8, 2]) {
    const height = x < -1 ? 2.55 : x > 1 ? 2.05 : 3.2;
    box(0.045, height, 0.055, x, 0.9 + height / 2, 3.48, materials.metal);
  }
  box(4.9, 0.045, 0.06, 0, 2.92, 3.48, materials.metal);
  // Pleated linen curtains flank the open entrance.
  for (const side of [-1, 1])
    for (let i = 0; i < 15; i++) {
      const x = side * (2.08 + i * 0.032);
      box(
        0.035,
        1.95,
        0.06 + Math.sin(i) * 0.045,
        x,
        1.94,
        3.23,
        materials.linen,
      );
    }
  const aoCanvas = document.createElement("canvas");
  aoCanvas.width = aoCanvas.height = 128;
  const aoContext = aoCanvas.getContext("2d");
  const gradient = aoContext.createRadialGradient(64, 64, 10, 64, 64, 64);
  gradient.addColorStop(0, "#000000aa");
  gradient.addColorStop(0.55, "#00000050");
  gradient.addColorStop(1, "#00000000");
  aoContext.fillStyle = gradient;
  aoContext.fillRect(0, 0, 128, 128);
  const aoMap = new THREE.CanvasTexture(aoCanvas);
  function contact(x, z, w, d) {
    const mesh = add(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({
        map: aoMap,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      }),
      x,
      0.925,
      z,
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.castShadow = false;
  }
  contact(1.32, -0.55, 2.5, 3.1);
  contact(-1.45, 1.35, 1.5, 2);
  contact(-0.1, -3.65, 5, 1.4);
  // Reference layout: kitchen at the back, bed on the right, dining outside left.
  box(4.45, 0.86, 0.66, -0.1, 1.32, -3.72, materials.timber);
  box(4.5, 0.06, 0.72, -0.1, 1.78, -3.72, materials.stone);
  for (let x = -2; x < 2; x += 0.48)
    box(0.014, 0.74, 0.02, x, 1.32, -3.36, materials.metal);
  box(
    4.45,
    0.04,
    0.025,
    -0.1,
    2.15,
    -3.32,
    new THREE.MeshStandardMaterial({
      color: "#f5d4a1",
      emissive: "#ffc36b",
      emissiveIntensity: 1.4,
    }),
  );
  box(4.4, 0.12, 0.3, -0.1, 2.28, -3.75, materials.timber);
  box(0.58, 0.02, 0.44, -0.7, 1.82, -3.64, materials.metal);
  const faucet = add(
    new THREE.TorusGeometry(0.13, 0.012, 8, 24, Math.PI),
    materials.metal,
    -0.7,
    2,
    -3.83,
  );
  faucet.rotation.z = 0;
  box(0.6, 0.02, 0.5, 0.65, 1.82, -3.68, materials.metal);
  for (const x of [0.48, 0.83])
    add(
      new THREE.CylinderGeometry(0.11, 0.11, 0.008, 24),
      materials.metal,
      x,
      1.84,
      -3.64,
    );
  rounded(1.75, 0.35, 2.5, 0.1, 1.32, 1.12, -0.55, materials.timber);
  rounded(1.72, 0.3, 2.45, 0.1, 1.32, 1.4, -0.55, materials.fabric);
  rounded(1.85, 1.3, 0.12, 0.07, 1.32, 1.55, -1.83, materials.timber);
  for (const x of [0.9, 1.72])
    rounded(0.7, 0.18, 0.45, 0.07, x, 1.64, -1.4, materials.fabric);
  const blanket = new THREE.MeshStandardMaterial({
    color: "#998d7c",
    roughness: 1,
    map: texture("fabric"),
  });
  rounded(1.75, 0.055, 1.4, 0.025, 1.32, 1.58, -0.15, blanket);
  rounded(0.6, 0.46, 1.4, 0.09, 1.3, 1.08, 1.2, materials.leather);
  // Interior living wall with timber reveals and integrated media.
  box(0.23, 1.7, 3.9, -1.98, 1.75, -0.7, materials.timber);
  for (let z = -2.5; z < 1.2; z += 0.17)
    box(0.015, 1.65, 0.015, -1.85, 1.75, z, materials.metal);
  box(0.06, 0.7, 1.1, -1.81, 1.98, -0.55, materials.metal);
  rounded(0.8, 0.5, 1.45, 0.09, -1.45, 1.16, 1.35, materials.fabric);
  rounded(0.12, 0.65, 1.5, 0.04, -1.8, 1.45, 1.35, materials.fabric);
  // Terrace dining table and four timber chairs.
  box(1.25, 0.07, 1.2, -1.65, 1.65, 4.45, materials.timber);
  for (const x of [-2.18, -1.12])
    for (const z of [3.98, 4.91])
      box(0.06, 0.76, 0.06, x, 1.24, z, materials.timber);
  for (const x of [-2.45, -0.85])
    for (const z of [4.05, 4.85]) {
      rounded(0.43, 0.08, 0.42, 0.03, x, 1.29, z, materials.leather);
      box(0.05, 0.7, 0.05, x - 0.16, 1.08, z - 0.13, materials.timber);
      box(0.05, 0.7, 0.05, x + 0.16, 1.08, z + 0.13, materials.timber);
      rounded(0.43, 0.5, 0.05, 0.025, x, 1.57, z - 0.19, materials.timber);
    }
  for (const x of [-1.9, -1.35])
    add(
      new THREE.CylinderGeometry(0.14, 0.14, 0.025, 28),
      materials.fabric,
      x,
      1.7,
      4.4,
    );
  const lampShade = new THREE.MeshStandardMaterial({
    color: "#d0ba94",
    roughness: 0.8,
    transparent: true,
    opacity: 0.86,
  });
  add(
    new THREE.CylinderGeometry(0.18, 0.32, 0.4, 32, 1, true),
    lampShade,
    0.3,
    3.05,
    -0.4,
  );
  box(0.014, 0.8, 0.014, 0.3, 3.65, -0.4, materials.metal);
  const lamp = new THREE.PointLight("#ffd6a0", 8, 6, 2);
  lamp.position.set(0.3, 2.8, -0.4);
  scene.add(lamp);
  const ground = new THREE.MeshStandardMaterial({
    color: "#d2c4a5",
    roughness: 1,
    bumpMap: texture("mineral"),
    bumpScale: 0.04,
  });
  box(100, 0.1, 100, 0, -0.14, 0, ground);
  // Distant sea and low planting frame the architecture without obscuring it.
  box(
    100,
    0.02,
    40,
    0,
    -0.075,
    29,
    new THREE.MeshStandardMaterial({
      color: "#88b4b7",
      roughness: 0.3,
      metalness: 0.25,
    }),
  );
  const foliage = new THREE.MeshStandardMaterial({
    color: "#6a7b4c",
    roughness: 1,
  });
  for (let i = 0; i < 18; i++) {
    const x = -7 + (i % 6) * 2.8,
      z = -8 - Math.floor(i / 6) * 2;
    const bush = add(new THREE.SphereGeometry(0.65, 12, 8), foliage, x, 0.4, z);
    bush.scale.set(1, 0.6, 1);
  }
  const palmMaterial = new THREE.MeshStandardMaterial({
    color: "#64764d",
    roughness: 1,
    side: THREE.DoubleSide,
  });
  for (const [px, pz, height] of [
    [-6, -4, 5],
    [6, -5, 5.5],
    [-7, 5, 5.3],
    [7, 2, 4.8],
  ]) {
    add(
      new THREE.CylinderGeometry(0.07, 0.16, height, 10),
      materials.timber,
      px,
      height / 2,
      pz,
    );
    for (let f = 0; f < 8; f++) {
      const verts = [],
        idx = [];
      const az = (f * Math.PI) / 4;
      for (let j = 0; j <= 18; j++) {
        const t = j / 18,
          r = t * 2.8,
          width = Math.sin(t * Math.PI) * 0.28 * (j % 2 ? 0.8 : 1);
        const y = height + Math.sin(t * Math.PI) * 0.5 - t * 0.95;
        for (const side of [-1, 1])
          verts.push(
            px + Math.cos(az) * r + Math.sin(az) * width * side,
            y,
            pz + Math.sin(az) * r - Math.cos(az) * width * side,
          );
        if (j < 18) {
          const a = j * 2;
          idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      add(geo, palmMaterial);
    }
  }
  const resize = () => {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();
  const setFinish = (id) => {
    const finish = finishes.find((f) => f.id === id) || finishes[0];
    materials.shell.color.set(finish.color);
    materials.shell.roughness = finish.roughness;
    materials.shell.bumpScale = finish.id === "graphite" ? 0.004 : 0.012;
  };
  const setPalette = (id) => {
    materials.timber.color.set(id === "wo" ? "#866446" : "#a38a69");
    materials.lining.color.set(id === "wo" ? "#d4c5ab" : "#e6ddca");
    blanket.color.set(id === "wo" ? "#85755d" : "#998d7c");
  };
  return { scene, camera, renderer, resize, setFinish, setPalette };
}
