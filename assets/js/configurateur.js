// ===== Configurateur 3D de piscine =====
// Rendu indicatif : forme, taille, membrane, terrasse et style de maison.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';

const MEMBRANES = {
  'golden-riviera': { nom: 'Golden Riviera', detail: 'CGT Alkor · Aquasense · relief', tex: 'golden-riviera', tile: 0.6, eau: 0x2f9e8f },
  'imperial-blue': { nom: 'Imperial Blue', detail: 'CGT Alkor · imitation pierre', tex: 'imperial-blue', tile: 1.6, eau: 0x2b6f86 },
  'granit-sand': { nom: 'Granit Sand', detail: 'CGT Alkor · granit', tex: 'granit-sand', tile: 0.8, eau: 0x3a9c96 },
  'fidji-green': { nom: 'Fidji Green', detail: 'Imitation petit carreau', tex: 'fidji-green', tile: 1.2, eau: 0x217f7c },
  'carrelage-gris': { nom: 'Carrelage gris', detail: 'Imitation carrelage', tex: 'carrelage-gris', tile: 1.8, eau: 0x2a6577 },
  'blanc': { nom: 'Blanc', detail: 'Uni', tex: 'blanc', tile: 2, eau: 0x55c3d4 },
  'gris-clair': { nom: 'Gris clair', detail: 'Uni', tex: 'gris-clair', tile: 2, eau: 0x3a9fb6 },
  'sable': { nom: 'Sable', detail: 'Uni', tex: 'sable', tile: 2, eau: 0x3aa596 },
  'gris-anthracite': { nom: 'Gris anthracite', detail: 'Uni', tex: 'gris-anthracite', tile: 2, eau: 0x1e5a72 },
  'noir': { nom: 'Noir', detail: 'Uni · effet miroir', tex: 'noir', tile: 2, eau: 0x173a48 },
};

const TAILLES = { petite: [6, 3], moyenne: [8, 4], grande: [10, 5] };
const PROF = 1.5;

const state = { forme: 'escalier', taille: 'moyenne', membrane: 'golden-riviera', terrasse: 'bois', maison: 'mas', eau: true };

// ---------- Scène ----------
const wrap = document.getElementById('config-canvas');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
wrap.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfdde6);
scene.fog = new THREE.Fog(0xcfdde6, 40, 90);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
camera.position.set(12, 9.5, 15);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, -2.5);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minDistance = 6;
controls.maxDistance = 38;
controls.enablePan = false;

scene.add(new THREE.HemisphereLight(0xeaf2f7, 0x6b5a40, 0.9));
const sun = new THREE.DirectionalLight(0xfff1dc, 2.2);
sun.position.set(-10, 16, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 60 });
sun.shadow.bias = -0.0005;
scene.add(sun);

// ---------- Textures ----------
const loader = new THREE.TextureLoader();
const texCache = {};
function tex(name) {
  if (!texCache[name]) {
    const t = loader.load(`assets/configurateur/${name}.webp`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texCache[name] = t;
  }
  return texCache[name];
}

// Texture dessinée (bois, dalles, gazon, pierre…) : pas de fichier à charger
function canvasTex(draw, size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const rand = (a, b) => a + Math.random() * (b - a);
const TEX = {
  bois: canvasTex((g, s) => {
    const n = 8, h = s / n;
    for (let i = 0; i < n; i++) {
      const l = rand(48, 58);
      g.fillStyle = `hsl(28, 42%, ${l}%)`;
      g.fillRect(0, i * h, s, h);
      for (let k = 0; k < 40; k++) {
        g.strokeStyle = `hsla(25, 40%, ${l - rand(6, 14)}%, 0.35)`;
        g.beginPath();
        const y = i * h + rand(2, h - 2);
        g.moveTo(0, y); g.bezierCurveTo(s * 0.3, y + rand(-2, 2), s * 0.6, y + rand(-2, 2), s, y);
        g.stroke();
      }
      g.fillStyle = 'rgba(40,25,15,0.55)';
      g.fillRect(0, i * h, s, 3);
    }
  }),
  dalles: canvasTex((g, s) => {
    const n = 4, c = s / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      g.fillStyle = `hsl(38, 30%, ${rand(78, 86)}%)`;
      g.fillRect(j * c, i * c, c, c);
      for (let k = 0; k < 60; k++) {
        g.fillStyle = `hsla(35, 25%, ${rand(60, 75)}%, 0.25)`;
        g.beginPath(); g.arc(j * c + rand(0, c), i * c + rand(0, c), rand(1, 4), 0, 7); g.fill();
      }
      g.strokeStyle = 'rgba(120,105,80,0.6)'; g.lineWidth = 3;
      g.strokeRect(j * c, i * c, c, c);
    }
  }),
  gazon: canvasTex((g, s) => {
    g.fillStyle = '#6d8a45'; g.fillRect(0, 0, s, s);
    for (let k = 0; k < 9000; k++) {
      g.fillStyle = `hsla(${rand(75, 95)}, ${rand(30, 45)}%, ${rand(28, 45)}%, 0.6)`;
      g.fillRect(rand(0, s), rand(0, s), 2, rand(2, 6));
    }
  }),
  gravier: canvasTex((g, s) => {
    g.fillStyle = '#c9bca3'; g.fillRect(0, 0, s, s);
    for (let k = 0; k < 7000; k++) {
      g.fillStyle = `hsl(${rand(30, 45)}, ${rand(10, 25)}%, ${rand(55, 85)}%)`;
      g.beginPath(); g.arc(rand(0, s), rand(0, s), rand(1, 3), 0, 7); g.fill();
    }
  }),
  pierre: canvasTex((g, s) => {
    g.fillStyle = '#8c7f6c'; g.fillRect(0, 0, s, s);
    let y = 0;
    while (y < s) {
      const h = rand(30, 55); let x = -rand(0, 40);
      while (x < s) {
        const w = rand(50, 110);
        g.fillStyle = `hsl(${rand(30, 40)}, ${rand(15, 28)}%, ${rand(58, 76)}%)`;
        g.beginPath(); g.roundRect(x + 3, y + 3, w - 6, h - 6, 8); g.fill();
        x += w;
      }
      y += h;
    }
  }),
  enduit: canvasTex((g, s) => {
    g.fillStyle = '#e4cfa6'; g.fillRect(0, 0, s, s);
    for (let k = 0; k < 4000; k++) {
      g.fillStyle = `hsla(36, 45%, ${rand(70, 88)}%, 0.25)`;
      g.fillRect(rand(0, s), rand(0, s), rand(2, 6), rand(2, 6));
    }
  }),
};

// ---------- Outils de géométrie ----------
// Coordonnées de texture en mètres réels, pour que le motif garde la même taille partout
function worldUV(geo, tile) {
  const pos = geo.attributes.position, nor = geo.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
    let u, v;
    if (ny >= nx && ny >= nz) { u = x; v = z; } else if (nx >= nz) { u = z; v = y; } else { u = x; v = y; }
    uv[i * 2] = u / tile; uv[i * 2 + 1] = v / tile;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}
function box(w, h, d, x, y, z, mat, tile = 1) {
  const geo = new THREE.BoxGeometry(w, h, d);
  geo.translate(x, y, z);
  worldUV(geo, tile);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}
// Surface plane percée d'un trou rectangulaire (terrasse autour du bassin)
function frame(outerW, outerD, holeW, holeD, y, mat, tile) {
  const s = new THREE.Shape();
  s.moveTo(-outerW / 2, -outerD / 2); s.lineTo(outerW / 2, -outerD / 2);
  s.lineTo(outerW / 2, outerD / 2); s.lineTo(-outerW / 2, outerD / 2); s.closePath();
  const h = new THREE.Path();
  h.moveTo(-holeW / 2, -holeD / 2); h.lineTo(-holeW / 2, holeD / 2);
  h.lineTo(holeW / 2, holeD / 2); h.lineTo(holeW / 2, -holeD / 2); h.closePath();
  s.holes.push(h);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y, 0);
  worldUV(geo, tile);
  const m = new THREE.Mesh(geo, mat);
  m.receiveShadow = true; m.castShadow = true;
  return m;
}

// ---------- Construction ----------
let poolGroup = new THREE.Group(), decorGroup = new THREE.Group(), houseGroup = new THREE.Group();
scene.add(poolGroup, decorGroup, houseGroup);
let water, waterNormal;

const membraneMat = new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0 });
const margelleMat = new THREE.MeshStandardMaterial({ color: 0xeee5d4, roughness: 0.9 });

function clear(g) {
  while (g.children.length) {
    const c = g.children.pop();
    c.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  }
}

function buildPool() {
  clear(poolGroup);
  const [L, W] = TAILLES[state.taille];
  const m = MEMBRANES[state.membrane];
  const t = tex(m.tex);
  membraneMat.map = t;
  membraneMat.needsUpdate = true;
  const tile = m.tile;
  const add = (o) => poolGroup.add(o);

  // Fond et parois (épaisseur fine, vers l'extérieur)
  add(box(L, 0.1, W, 0, -PROF - 0.05, 0, membraneMat, tile));
  add(box(L, PROF, 0.1, 0, -PROF / 2, -W / 2 - 0.05, membraneMat, tile));
  add(box(L, PROF, 0.1, 0, -PROF / 2, W / 2 + 0.05, membraneMat, tile));
  add(box(0.1, PROF, W, -L / 2 - 0.05, -PROF / 2, 0, membraneMat, tile));
  add(box(0.1, PROF, W, L / 2 + 0.05, -PROF / 2, 0, membraneMat, tile));

  // Escalier d'angle (3 marches + palier) ou banquette
  if (state.forme === 'escalier' || state.forme === 'banquette') {
    const sw = Math.min(1.8, W * 0.45), step = 0.35, rise = PROF / 4;
    for (let i = 0; i < 3; i++) {
      const d = step * (i + 1);
      add(box(d, rise, sw, L / 2 - d / 2, -rise / 2 - rise * i, W / 2 - sw / 2, membraneMat, tile));
    }
  }
  if (state.forme === 'banquette') {
    const bd = 0.45, bh = PROF * 0.62;
    add(box(L - 1.2, bh, bd, -0.6, -PROF + bh / 2, -W / 2 + bd / 2, membraneMat, tile));
  }

  // Margelle
  add(frame(L + 0.7, W + 0.7, L, W, 0.02, margelleMat, 1));

  // Eau
  const wm = new THREE.MeshPhysicalMaterial({
    color: m.eau, transparent: true, opacity: 0.5, roughness: 0.08, metalness: 0.0,
    normalMap: waterNormal, normalScale: new THREE.Vector2(0.3, 0.3), envMapIntensity: 0.45,
  });
  water = new THREE.Mesh(new THREE.PlaneGeometry(L, W), wm);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.12;
  water.visible = state.eau;
  add(water);

  buildTerrace(L, W);
}

function buildTerrace(L, W) {
  clear(decorGroup);
  const add = (o) => decorGroup.add(o);
  const TW = L + 6, TD = W + 6;
  const groundMat = new THREE.MeshStandardMaterial({ map: TEX.gazon, roughness: 1 });
  const ground = frame(80, 80, L + 0.7, W + 0.7, -0.08, groundMat, 3);
  add(ground);
  if (state.terrasse !== 'gazon') {
    const mat = new THREE.MeshStandardMaterial({ map: state.terrasse === 'bois' ? TEX.bois : TEX.dalles, roughness: 0.85 });
    add(frame(TW, TD, L + 0.7, W + 0.7, -0.02, mat, state.terrasse === 'bois' ? 1.6 : 2.4));
  }
  // Végétation provençale : oliviers et cyprès
  const tronc = new THREE.MeshStandardMaterial({ color: 0x6b5a48, roughness: 1 });
  const olive = new THREE.MeshStandardMaterial({ color: 0x8a9a6a, roughness: 1, flatShading: true });
  const cypres = new THREE.MeshStandardMaterial({ color: 0x3f5534, roughness: 1, flatShading: true });
  const olivier = (x, z, s = 1) => {
    const g = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.22 * s, 1.6 * s, 7), tronc);
    t.position.y = 0.8 * s; t.rotation.z = 0.12; g.add(t);
    for (let i = 0; i < 6; i++) {
      const f = new THREE.Mesh(new THREE.IcosahedronGeometry(rand(0.6, 0.9) * s, 0), olive);
      f.position.set(rand(-0.8, 0.8) * s, (1.9 + rand(-0.2, 0.5)) * s, rand(-0.8, 0.8) * s);
      g.add(f);
    }
    g.position.set(x, 0, z);
    g.traverse((o) => { o.castShadow = true; });
    add(g);
  };
  const cyp = (x, z, h = 5) => {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.6, h, 8), cypres);
    c.position.set(x, h / 2, z); c.castShadow = true; add(c);
  };
  olivier(-L / 2 - 4.5, 1.5); olivier(L / 2 + 4.8, W / 2 + 2.5, 0.9); olivier(L / 2 + 6, -3, 1.1);
  cyp(-L / 2 - 6, -W / 2 - 4); cyp(-L / 2 - 7.2, -W / 2 - 2.5, 4.2); cyp(L / 2 + 7, -W / 2 - 5, 5.5);
  // Bains de soleil
  const lit = new THREE.MeshStandardMaterial({ color: 0xe6dccb, roughness: 0.9 });
  for (let i = 0; i < 2; i++) {
    const l = box(0.7, 0.3, 1.9, -1 + i * 1.3, 0.15, W / 2 + 1.9, lit);
    add(l);
  }
}

function buildHouse() {
  clear(houseGroup);
  const [L, W] = TAILLES[state.taille];
  const z = -W / 2 - 10;
  const add = (o) => { o.castShadow = o.receiveShadow = true; houseGroup.add(o); };
  const vitre = new THREE.MeshStandardMaterial({ color: 0x2e3a40, roughness: 0.1, metalness: 0.6 });
  const tuile = new THREE.MeshStandardMaterial({ color: 0xb4623e, roughness: 0.9 });

  if (state.maison === 'moderne') {
    const blanc = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.9 });
    const gris = new THREE.MeshStandardMaterial({ color: 0x45484c, roughness: 0.7 });
    add(box(12, 3.2, 6, 0, 1.6, z, blanc));
    add(box(6, 3, 5, -2, 4.7, z - 0.4, blanc));
    add(box(13, 0.25, 7, 0, 3.3, z + 0.3, gris));
    add(box(6.6, 0.2, 5.6, -2, 6.3, z - 0.4, gris));
    add(box(7, 2.4, 0.05, 1.5, 1.3, z + 3.01, vitre));
    add(box(3.5, 1.8, 0.05, -2, 4.6, z + 2.11, vitre));
  } else {
    const pierre = state.maison === 'pierre';
    const mur = new THREE.MeshStandardMaterial({ map: pierre ? TEX.pierre : TEX.enduit, roughness: 1 });
    add(box(12, 5, 6, 0, 2.5, z, mur, pierre ? 2 : 3));
    // Toit à deux pentes
    const s = new THREE.Shape();
    s.moveTo(-3.4, 0); s.lineTo(3.4, 0); s.lineTo(0, 1.9); s.closePath();
    const roof = new THREE.ExtrudeGeometry(s, { depth: 12.6, bevelEnabled: false });
    roof.rotateY(Math.PI / 2); roof.translate(-6.3, 5, z);
    add(new THREE.Mesh(roof, tuile));
    // Fenêtres et volets
    const volet = new THREE.MeshStandardMaterial({ color: pierre ? 0x7c8a6a : 0x8a9a7a, roughness: 0.8 });
    for (const x of [-4, 0, 4]) {
      for (const y of [1.4, 3.7]) {
        add(box(1, 1.3, 0.05, x, y, z + 3.01, vitre));
        add(box(0.5, 1.3, 0.06, x - 0.78, y, z + 3.02, volet));
        add(box(0.5, 1.3, 0.06, x + 0.78, y, z + 3.02, volet));
      }
    }
  }
}

// Ondulations de l'eau : petite texture de relief qui défile
waterNormal = (() => {
  const s = 256, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d'), img = g.createImageData(s, s);
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const a = Math.sin(x / s * Math.PI * 8 + Math.sin(y / s * Math.PI * 6) * 1.5);
    const b = Math.cos(y / s * Math.PI * 10 + Math.sin(x / s * Math.PI * 4) * 1.2);
    const i = (y * s + x) * 4;
    img.data[i] = 128 + a * 40; img.data[i + 1] = 128 + b * 40; img.data[i + 2] = 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
})();

function rebuild() {
  buildPool();
  buildHouse();
  updateSummary();
}

// ---------- Interface ----------
const membranesEl = document.getElementById('config-membranes');
for (const [key, m] of Object.entries(MEMBRANES)) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'config-swatch';
  b.dataset.group = 'membrane';
  b.dataset.value = key;
  b.innerHTML = `<span style="background-image:url('assets/configurateur/${m.tex}.webp')"></span><b>${m.nom}</b><small>${m.detail}</small>`;
  membranesEl.appendChild(b);
}

document.querySelectorAll('[data-group]').forEach((b) => {
  b.addEventListener('click', () => {
    state[b.dataset.group] = b.dataset.value;
    syncButtons();
    rebuild();
  });
});
document.getElementById('config-eau').addEventListener('change', (e) => {
  state.eau = e.target.checked;
  water.visible = state.eau;
  updateSummary();
});

function syncButtons() {
  document.querySelectorAll('[data-group]').forEach((b) => {
    const on = state[b.dataset.group] === b.dataset.value;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

const LABELS = {
  forme: { rectangle: 'Rectangle', escalier: "Escalier d'angle", banquette: 'Banquette + escalier' },
  terrasse: { bois: 'Terrasse bois', dalles: 'Dalles pierre', gazon: 'Gazon' },
  maison: { mas: 'Mas provençal', pierre: 'Maison en pierre', moderne: 'Maison moderne' },
};
function updateSummary() {
  const [L, W] = TAILLES[state.taille];
  const m = MEMBRANES[state.membrane];
  const txt = `${LABELS.forme[state.forme]}, ${L} × ${W} m, membrane ${m.nom}, ${LABELS.terrasse[state.terrasse].toLowerCase()}`;
  document.getElementById('config-resume').textContent = txt;
  const msg = `Bonjour, je suis intéressé(e) par une piscine : ${txt}.`;
  document.getElementById('config-devis').href = '/contact?projet=' + encodeURIComponent(msg);
}

// ---------- Rendu ----------
function resize() {
  const w = wrap.clientWidth, h = wrap.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < 700 ? 55 : 42;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  waterNormal.offset.set(t * 0.02, t * 0.013);
  controls.update();
  renderer.render(scene, camera);
});

syncButtons();
rebuild();
resize();
