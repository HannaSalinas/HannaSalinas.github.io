// Escena 3D de la portada: el cuarto, Hanna y los destellos.
import * as THREE from 'three';
import { crearHanna } from './personaje.js';

const cont = document.getElementById('escena');
const render = new THREE.WebGLRenderer({ antialias:true, alpha:true, preserveDrawingBuffer:true });
render.setPixelRatio(Math.min(devicePixelRatio, 2));
render.shadowMap.enabled = true;
render.shadowMap.type = THREE.PCFSoftShadowMap;
cont.appendChild(render.domElement);

const ROJO = 0xff2d55;
const escena = new THREE.Scene();
const camara = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
const mat = (c, extra = {}) => new THREE.MeshStandardMaterial({ color:c, roughness:.85, ...extra });
const caja = (w, h, d, c, x, y, z, extra) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, extra));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; escena.add(m); return m;
};

escena.add(new THREE.HemisphereLight(0xe6c6d6, 0x2a1418, 0.95));
const luz = new THREE.DirectionalLight(0xfff0e6, 1.4);
luz.position.set(4, 7, 5); luz.castShadow = true; luz.shadow.mapSize.set(2048, 2048);
Object.assign(luz.shadow.camera, { left:-4, right:4, top:4, bottom:-4 });
escena.add(luz);

// cuarto
caja(4.4, 0.2, 4.4, 0x8a5a3a, 0, -0.1, 0);
caja(4.4, 3.2, 0.2, 0x3a2633, 0, 1.6, -2.3);
caja(0.2, 3.2, 4.4, 0x311f2b, -2.3, 1.6, 0);
const tapete = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.02, 48), mat(0xb3203a));
tapete.position.set(0.3, 0.01, 0.6); tapete.receiveShadow = true; escena.add(tapete);
const tapete2 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.02, 6, 48), mat(0xffd9c7));
tapete2.rotation.x = Math.PI / 2; tapete2.position.set(0.3, 0.025, 0.6); escena.add(tapete2);

// ventana de noche
caja(1.5, 1.1, 0.06, 0x1e1a40, 0.9, 2.1, -2.18, { emissive:0x1e1a40, emissiveIntensity:.6 });
const luna = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 16), new THREE.MeshBasicMaterial({ color:0xfff3e0 }));
luna.position.set(1.3, 2.35, -2.12); escena.add(luna);
for (const [x, y] of [[0.4, 2.4], [0.7, 1.8], [1.5, 1.9], [0.3, 1.9], [1.1, 2.5]]) {
  const e = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 4), new THREE.MeshBasicMaterial({ color:0xffffff }));
  e.position.set(x, y, -2.13); escena.add(e);
}
caja(1.62, 0.07, 0.1, 0xf1e2da, 0.9, 1.53, -2.15);
caja(1.62, 0.07, 0.1, 0xf1e2da, 0.9, 2.67, -2.15);
caja(0.05, 1.1, 0.08, 0xf1e2da, 0.9, 2.1, -2.14);

// letrero de neón rojo  </>  sobre el escritorio
function textoNeon(txt, w, h, tam) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.font = `600 ${tam}px "JetBrains Mono", monospace`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.shadowColor = '#ff2d55'; x.shadowBlur = 24; x.fillStyle = '#ff6b85';
  for (let k = 0; k < 3; k++) x.fillText(txt, w / 2, h / 2);
  x.shadowBlur = 0; x.fillStyle = '#ffe3ea'; x.fillText(txt, w / 2, h / 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const neon = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.5), new THREE.MeshBasicMaterial({ map:textoNeon('</>', 256, 128, 84), transparent:true, depthWrite:false }));
neon.position.set(-1.0, 2.45, -2.18); escena.add(neon);
const luzNeon = new THREE.PointLight(ROJO, 2.2, 3.2); luzNeon.position.set(-1.0, 2.4, -1.8); escena.add(luzNeon);

// escritorio con monitor que escribe código
caja(1.9, 0.07, 0.75, 0xc79a6b, -1.0, 0.95, -1.8);
for (const [x, z] of [[-1.9, -2.1], [-0.1, -2.1], [-1.9, -1.5], [-0.1, -1.5]]) caja(0.06, 0.95, 0.06, 0x2a2026, x, 0.47, z);
caja(0.08, 0.4, 0.08, 0x222222, -1.0, 1.18, -2.05);
const lienzo = document.createElement('canvas'); lienzo.width = 512; lienzo.height = 300;
const ctx = lienzo.getContext('2d');
const lineas = [
  ['#ff6b85', '@Controller'], ['#f6efee', "('departamentos')"], ['', ''],
  ['#ffd9c7', 'export class '], ['#ff9fb2', 'DepartamentosController {'],
  ['#ab9ea9', '  constructor(private srv) {}'], ['', ''],
  ['#ff6b85', '  @Get'], ['#f6efee', "(':codigo')"],
  ['#ff9fb2', '  buscar(@Param() p) {'], ['#f6efee', '    return this.srv.uno(p);'], ['#ff9fb2', '  }'], ['#ff9fb2', '}'],
];
const textura = new THREE.CanvasTexture(lienzo);
textura.colorSpace = THREE.SRGBColorSpace;
let ultimoN = -1;
function pintarCodigo(n) {
  const cursorOn = Math.floor(performance.now() / 500) % 2;
  const clave = n * 2 + cursorOn;
  if (clave === ultimoN) return;
  ultimoN = clave;
  ctx.fillStyle = '#150f15'; ctx.fillRect(0, 0, 512, 300);
  ctx.fillStyle = '#2a1e28'; ctx.fillRect(0, 0, 512, 24);
  ['#ff2d55', '#ffd9c7', '#ab9ea9'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(16 + i * 18, 12, 5, 0, 7); ctx.fill(); });
  ctx.font = '17px monospace';
  let y = 50, x = 16;
  for (let i = 0; i < Math.min(n, lineas.length); i++) {
    const [c, t] = lineas[i];
    if (!t) { y += 6; continue; }
    ctx.fillStyle = c; ctx.fillText(t, x, y);
    if (t.startsWith('@') || t.startsWith('export')) x += ctx.measureText(t).width; else { y += 21; x = 16; }
  }
  if (cursorOn) { ctx.fillStyle = '#ff2d55'; ctx.fillRect(x + 2, y - 15, 9, 18); }
  textura.needsUpdate = true;
}
caja(1.12, 0.7, 0.05, 0x111111, -1.0, 1.55, -2.07);
const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(1.04, 0.62), new THREE.MeshBasicMaterial({ map:textura }));
pantalla.position.set(-1.0, 1.55, -2.04); escena.add(pantalla);

// lámpara, taza y matera
caja(0.16, 0.04, 0.16, 0x222222, -1.75, 1.0, -1.9);
caja(0.03, 0.45, 0.03, 0x222222, -1.75, 1.22, -1.9);
const pantallaLampara = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.18, 20, 1, true), mat(0xffd9c7, { emissive:0xffc6a8, emissiveIntensity:.9, side:THREE.DoubleSide }));
pantallaLampara.position.set(-1.68, 1.46, -1.85); escena.add(pantallaLampara);
const calida = new THREE.PointLight(0xffc6a8, 1.8, 3.5); calida.position.set(-1.68, 1.35, -1.8); escena.add(calida);
const taza = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.12, 16), mat(ROJO)); taza.position.set(-0.3, 1.05, -1.65); escena.add(taza);

// estante con libros y un cuadro en blanco y negro (guiño a la foto de la escalera)
caja(0.35, 0.05, 1.3, 0xc79a6b, -2.0, 2.0, -0.3);
const colLibros = [0xff2d55, 0xffd9c7, 0x6b2d3c, 0xc8102e, 0xf6efee, 0x3d2a35];
for (let i = 0; i < 9; i++) caja(0.22, 0.28 + (i % 3) * 0.05, 0.08, colLibros[i % 6], -2.0, 2.17 + (i % 3) * 0.025, -0.85 + i * 0.13);
caja(0.04, 0.78, 0.6, 0xf6efee, -2.17, 1.25, 0.9);
const espiral = new THREE.Group();
for (let k = 0; k < 40; k++) {
  const a = k * 0.42, r = 0.03 + k * 0.0055;
  const p = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), new THREE.MeshBasicMaterial({ color:0x222222 }));
  p.position.set(0, Math.sin(a) * r, Math.cos(a) * r); espiral.add(p);
}
espiral.position.set(-2.14, 1.25, 0.9); escena.add(espiral);

const maceta = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.35, 20), mat(0xc8102e)); maceta.position.set(1.7, 0.17, -1.7); maceta.castShadow = true; escena.add(maceta);
for (let i = 0; i < 9; i++) {
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), mat(0x4e9a6a));
  const a = i * 0.7;
  h.position.set(1.7 + Math.cos(a) * 0.15, 0.55 + (i % 3) * 0.17, -1.7 + Math.sin(a) * 0.15);
  h.scale.set(0.7, 1.25, 0.7); h.castShadow = true; escena.add(h);
}

// silla con Hanna y su portátil
const silla = new THREE.Group(); escena.add(silla);
const pieza = (geo, c, x, y, z) => { const m = new THREE.Mesh(geo, mat(c)); m.position.set(x, y, z); m.castShadow = true; silla.add(m); return m; };
pieza(new THREE.BoxGeometry(0.62, 0.08, 0.6), 0x2d2028, 0, 0.42, 0);
pieza(new THREE.BoxGeometry(0.62, 0.75, 0.08), 0x2d2028, 0, 0.85, -0.3);
pieza(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 10), 0x111111, 0, 0.22, 0);
for (let i = 0; i < 5; i++) { const p = pieza(new THREE.BoxGeometry(0.04, 0.04, 0.32), 0x111111, 0, 0.05, 0); p.rotation.y = i * 1.256; p.translateZ(0.15); }
const hanna = crearHanna({ pose:'sentada' });
hanna.grupo.position.set(0, -0.48, -0.05);
silla.add(hanna.grupo);
const portatil = new THREE.Group();
portatil.add(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.025, 0.36), mat(0xc8ccd2, { metalness:.6, roughness:.35 })));
const tapa = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.36, 0.02), mat(0xc8ccd2, { metalness:.6, roughness:.35 }));
tapa.position.set(0, 0.17, 0.2); tapa.rotation.x = -0.25; portatil.add(tapa);
const sticker = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), new THREE.MeshBasicMaterial({ color:ROJO }));
sticker.position.set(0, 0.18, 0.215); sticker.rotation.x = -0.25; portatil.add(sticker);
portatil.position.set(0, 0.68, 0.38);
silla.add(portatil);
silla.position.set(0.35, 0, 0.45);
silla.rotation.y = 0.35;

// destellos rojos flotando por el cuarto
function texturaEstrella() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,90,120,.9)'); g.addColorStop(1, 'rgba(255,45,85,0)');
  x.fillStyle = g; x.beginPath();
  x.moveTo(32, 0); x.quadraticCurveTo(36, 28, 64, 32); x.quadraticCurveTo(36, 36, 32, 64); x.quadraticCurveTo(28, 36, 0, 32); x.quadraticCurveTo(28, 28, 32, 0);
  x.fill();
  return new THREE.CanvasTexture(c);
}
const estrella = texturaEstrella();
const destellos = [];
for (let k = 0; k < 34; k++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map:estrella, color:ROJO, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false }));
  s.position.set(-2 + Math.random() * 4.2, 0.3 + Math.random() * 2.8, -2 + Math.random() * 4);
  s.userData = { fase:Math.random() * 6.28, vel:0.6 + Math.random() * 1.4, tam:0.08 + Math.random() * 0.14 };
  escena.add(s); destellos.push(s);
}

// datos que suben del portátil al monitor (guiño al lakehouse)
const N = 140;
const ptsPos = new Float32Array(N * 3), ptsCol = new Float32Array(N * 3), semilla = new Float32Array(N);
for (let k = 0; k < N; k++) semilla[k] = Math.random();
const ptsGeo = new THREE.BufferGeometry();
ptsGeo.setAttribute('position', new THREE.BufferAttribute(ptsPos, 3));
ptsGeo.setAttribute('color', new THREE.BufferAttribute(ptsCol, 3));
escena.add(new THREE.Points(ptsGeo, new THREE.PointsMaterial({ size:0.035, vertexColors:true, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending })));
const desde = new THREE.Vector3(), hacia = new THREE.Vector3(-1.0, 1.55, -2.0), ctrl = new THREE.Vector3(), tmp = new THREE.Vector3();
const cRojo = new THREE.Color(ROJO), cCrema = new THREE.Color(0xffd9c7), cTmp = new THREE.Color();
function moverDatos(t) {
  portatil.getWorldPosition(desde); desde.y += 0.2;
  ctrl.set((desde.x + hacia.x) / 2, 2.4, (desde.z + hacia.z) / 2);
  for (let k = 0; k < N; k++) {
    const f = (semilla[k] + t * 0.18) % 1;
    const u = 1 - f;
    tmp.set(0, 0, 0).addScaledVector(desde, u * u).addScaledVector(ctrl, 2 * u * f).addScaledVector(hacia, f * f);
    tmp.x += Math.sin(k * 7 + t * 2) * 0.06; tmp.z += Math.cos(k * 5 + t * 2) * 0.06;
    ptsPos.set([tmp.x, tmp.y, tmp.z], k * 3);
    cTmp.copy(cRojo).lerp(cCrema, f).multiplyScalar(Math.sin(f * Math.PI));
    ptsCol.set([cTmp.r, cTmp.g, cTmp.b], k * 3);
  }
  ptsGeo.attributes.position.needsUpdate = true;
  ptsGeo.attributes.color.needsUpdate = true;
}

// interacción: clic en Hanna para saludar, clic en el monitor para ir a proyectos
const raton = { x:0, y:0 };
addEventListener('pointermove', (e) => { raton.x = e.clientX / innerWidth * 2 - 1; raton.y = e.clientY / innerHeight * 2 - 1; });
const rayo = new THREE.Raycaster();
const burbuja = document.getElementById('burbuja');
const cabezaPos = new THREE.Vector3();
let finBurbuja = 0;
function puntero(e) {
  const r = render.domElement.getBoundingClientRect();
  rayo.setFromCamera({ x:(e.clientX - r.left) / r.width * 2 - 1, y:-(e.clientY - r.top) / r.height * 2 + 1 }, camara);
}
render.domElement.addEventListener('click', (e) => {
  puntero(e);
  if (rayo.intersectObject(hanna.grupo, true).length || rayo.intersectObject(portatil, true).length) {
    hanna.saludar(); finBurbuja = performance.now() + 2200;
  } else if (rayo.intersectObject(pantalla).length) {
    document.getElementById('proyectos').scrollIntoView();
  }
});
render.domElement.addEventListener('pointermove', (e) => {
  puntero(e);
  const sobre = rayo.intersectObjects([hanna.grupo, portatil, pantalla], true).length;
  render.domElement.style.cursor = sobre ? 'pointer' : '';
});

let ancho = 1;
function medir() {
  const w = cont.clientWidth, h = cont.clientHeight; ancho = w;
  render.setSize(w, h); camara.aspect = w / h;
  if (w > 820) camara.setViewOffset(w, h, -w * 0.2, 0, w, h); else camara.clearViewOffset();
  camara.updateProjectionMatrix();
}
addEventListener('resize', medir); medir();

const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const reloj = new THREE.Clock();
setTimeout(() => { hanna.saludar(); finBurbuja = performance.now() + 2200; }, 1200); // saluda al llegar
function cuadro() {
  const t = reloj.getElapsedTime();
  pintarCodigo(Math.floor(t * 3) % (lineas.length + 8));
  // al bajar, la cámara se acerca y gira un poco (como en el editorial)
  const avance = Math.min(scrollY / innerHeight, 1);
  const d = (ancho > 820 ? 10.5 : 12) - avance * 3;
  const ang = Math.PI / 4 + avance * 0.35;
  camara.position.set(Math.sin(ang) * d + raton.x * 0.4, 5.6 - raton.y * 0.3 - avance * 1.5, Math.cos(ang) * d);
  camara.lookAt(-0.2, 1.05, -0.3);
  silla.rotation.y = 0.35 + (quieto ? 0 : Math.sin(t * 0.6) * 0.06);
  hanna.actualizar(t, raton);
  for (const s of destellos) {
    const u = s.userData, b = Math.max(0, Math.sin(t * u.vel + u.fase));
    s.scale.setScalar(u.tam * b * b + 0.001);
    s.position.y += quieto ? 0 : 0.0015;
    if (s.position.y > 3.1) s.position.y = 0.3;
  }
  moverDatos(t);
  // burbuja "¡Hola!" sobre la cabeza
  if (performance.now() < finBurbuja) {
    hanna.cabeza.getWorldPosition(cabezaPos); cabezaPos.y += 0.85; cabezaPos.project(camara);
    const r = render.domElement.getBoundingClientRect();
    burbuja.style.left = `${(cabezaPos.x + 1) / 2 * r.width + 10}px`;
    burbuja.style.top = `${(1 - cabezaPos.y) / 2 * r.height - 40}px`;
    burbuja.classList.add('ver');
  } else burbuja.classList.remove('ver');
  render.render(escena, camara);
  requestAnimationFrame(cuadro);
}
cuadro();
