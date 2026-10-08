// Muñeco 3D de Hanna, hecho solo con figuras básicas de Three.js.
// Basado en la foto real: piel morena, cabello rizado oscuro hasta los hombros,
// polo negro de manga corta, pantalón ancho negro, reloj plateado en la muñeca izquierda.
import * as THREE from 'three';

const COLORES = {
  piel: 0x8d5a3b,
  pielSombra: 0x6e4229,
  cabello: 0x17110d,
  ropa: 0x1b1b1d,
  ropaClara: 0x2a2a2e,
  zapatos: 0x0e0e0f,
  plata: 0xd9dde2,
  ojos: 0x120c09,
  labios: 0x6b3424,
};

// Generador pseudoaleatorio con semilla, para que los rizos salgan siempre igual.
function azar(semilla) {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function gris(hex) {
  const c = new THREE.Color(hex);
  const l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11;
  return new THREE.Color(l, l, l);
}

export function crearHanna({ pose = 'parada', mono = false } = {}) {
  const color = (k) => (mono ? gris(COLORES[k]) : new THREE.Color(COLORES[k]));
  const mat = {};
  for (const k of Object.keys(COLORES)) {
    mat[k] = new THREE.MeshStandardMaterial({
      color: color(k),
      roughness: k === 'plata' ? 0.25 : k === 'cabello' ? 0.55 : 0.75,
      metalness: k === 'plata' ? 0.9 : 0,
    });
  }

  const raiz = new THREE.Group();
  const cuerpo = new THREE.Group(); // todo lo que va de la cadera para arriba
  raiz.add(cuerpo);

  const malla = (geo, m, x = 0, y = 0, z = 0) => {
    const o = new THREE.Mesh(geo, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    return o;
  };

  // ---------- Cadera y piernas (pantalón ancho) ----------
  const cadera = malla(new THREE.CylinderGeometry(0.29, 0.31, 0.28, 24), mat.ropa, 0, 1.0, 0);
  cadera.scale.z = 0.78;
  cuerpo.add(cadera);

  const piernas = [];
  for (const lado of [-1, 1]) {
    const muslo = new THREE.Group();
    muslo.position.set(0.14 * lado, 0.95, 0);
    const m1 = malla(new THREE.CylinderGeometry(0.15, 0.17, 0.5, 18), mat.ropa, 0, -0.25, 0);
    muslo.add(m1);
    const rodilla = new THREE.Group();
    rodilla.position.y = -0.48;
    // bota ancha del pantalón
    rodilla.add(malla(new THREE.CylinderGeometry(0.17, 0.215, 0.44, 18), mat.ropa, 0, -0.22, 0));
    const zapato = malla(new THREE.SphereGeometry(0.11, 16, 10), mat.zapatos, 0, -0.46, 0.06);
    zapato.scale.set(0.95, 0.5, 1.6);
    rodilla.add(zapato);
    muslo.add(rodilla);
    raiz.add(muslo);
    piernas.push({ muslo, rodilla });
  }

  // ---------- Torso (polo negro) ----------
  const torso = malla(new THREE.CapsuleGeometry(0.3, 0.42, 8, 24), mat.ropa, 0, 1.38, 0);
  torso.scale.set(1.05, 1, 0.72);
  cuerpo.add(torso);
  // tapeta con botones
  cuerpo.add(malla(new THREE.BoxGeometry(0.07, 0.2, 0.02), mat.ropaClara, 0, 1.66, 0.215));
  for (const y of [1.7, 1.62]) {
    cuerpo.add(malla(new THREE.SphereGeometry(0.014, 8, 6), mat.ropaClara, 0, y, 0.228));
  }
  // cuello del polo: dos solapas
  for (const lado of [-1, 1]) {
    const solapa = malla(new THREE.BoxGeometry(0.15, 0.025, 0.11), mat.ropaClara, 0.075 * lado, 1.79, 0.13);
    solapa.rotation.set(0.5, 0, -0.45 * lado);
    cuerpo.add(solapa);
  }
  const collar = malla(new THREE.TorusGeometry(0.105, 0.03, 8, 20), mat.ropaClara, 0, 1.8, 0.0);
  collar.rotation.x = Math.PI / 2;
  cuerpo.add(collar);

  // ---------- Brazos ----------
  const brazos = [];
  for (const lado of [-1, 1]) {
    const hombro = new THREE.Group();
    hombro.position.set(0.33 * lado, 1.7, 0);
    // manga corta
    const manga = malla(new THREE.CylinderGeometry(0.11, 0.125, 0.26, 16), mat.ropa, 0, -0.1, 0);
    hombro.add(manga);
    hombro.add(malla(new THREE.CapsuleGeometry(0.07, 0.22, 6, 12), mat.piel, 0, -0.27, 0));
    const codo = new THREE.Group();
    codo.position.y = -0.42;
    codo.add(malla(new THREE.CapsuleGeometry(0.062, 0.24, 6, 12), mat.piel, 0, -0.14, 0));
    const mano = malla(new THREE.SphereGeometry(0.075, 12, 10), mat.piel, 0, -0.33, 0);
    mano.scale.set(0.85, 1.1, 0.7);
    codo.add(mano);
    if (lado === 1) {
      // reloj plateado en la muñeca izquierda (lado +x es la izquierda de ella)
      const reloj = malla(new THREE.TorusGeometry(0.07, 0.022, 8, 20), mat.plata, 0, -0.25, 0);
      reloj.rotation.x = Math.PI / 2;
      codo.add(reloj);
      const esfera = malla(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16), mat.plata, 0.065, -0.25, 0);
      esfera.rotation.z = Math.PI / 2;
      codo.add(esfera);
    }
    hombro.add(codo);
    cuerpo.add(hombro);
    brazos.push({ hombro, codo, mano, lado });
  }

  // ---------- Cuello y cabeza ----------
  cuerpo.add(malla(new THREE.CylinderGeometry(0.075, 0.085, 0.16, 14), mat.piel, 0, 1.86, 0));
  const cabeza = new THREE.Group();
  cabeza.position.set(0, 1.94, 0);
  cuerpo.add(cabeza);

  const craneo = malla(new THREE.SphereGeometry(0.34, 32, 24), mat.piel, 0, 0.3, 0);
  craneo.scale.set(0.92, 1.02, 0.95);
  cabeza.add(craneo);
  // mandíbula un poco más angosta
  const menton = malla(new THREE.SphereGeometry(0.23, 24, 16), mat.piel, 0, 0.17, 0.06);
  menton.scale.set(1, 0.9, 1);
  cabeza.add(menton);

  // ojos (con párpado para parpadear)
  const ojos = [];
  for (const lado of [-1, 1]) {
    const ojo = malla(new THREE.SphereGeometry(0.038, 14, 10), mat.ojos, 0.11 * lado, 0.32, 0.29);
    ojo.scale.set(1, 1.15, 0.5);
    cabeza.add(ojo);
    ojos.push(ojo);
    const ceja = malla(new THREE.BoxGeometry(0.1, 0.018, 0.02), mat.cabello, 0.11 * lado, 0.405, 0.285);
    ceja.rotation.z = 0.03 * lado;
    cabeza.add(ceja);
    const oreja = malla(new THREE.SphereGeometry(0.06, 12, 10), mat.pielSombra, 0.31 * lado, 0.28, 0);
    oreja.scale.set(0.5, 1, 0.8);
    cabeza.add(oreja);
    // arete pequeño
    cabeza.add(malla(new THREE.SphereGeometry(0.018, 8, 6), mat.plata, 0.32 * lado, 0.21, 0.01));
  }
  const nariz = malla(new THREE.SphereGeometry(0.045, 12, 10), mat.pielSombra, 0, 0.25, 0.33);
  nariz.scale.set(1.2, 0.8, 0.8);
  cabeza.add(nariz);
  const labios = malla(new THREE.CapsuleGeometry(0.022, 0.06, 4, 8), mat.labios, 0, 0.155, 0.285);
  labios.rotation.z = Math.PI / 2;
  cabeza.add(labios);

  // cabello rizado: muchas esferas pequeñas con una instancia por rizo
  const rnd = azar(7);
  const rizos = [];
  // volumen alrededor de la parte de arriba, los lados y atrás de la cabeza
  for (let i = 0; i < 260; i++) {
    const u = rnd() * Math.PI * 2;
    const v = Math.acos(1 - rnd() * 1.35); // más densidad arriba
    const x = Math.sin(v) * Math.cos(u);
    const y = Math.cos(v);
    const z = Math.sin(v) * Math.sin(u);
    // dejar la cara despejada: nada al frente por debajo de la frente
    if (z > 0.35 && y < 0.62) continue;
    const r = 0.36 + rnd() * 0.06;
    rizos.push([x * r * 0.98, 0.32 + y * r, z * r * 0.97, 0.07 + rnd() * 0.045]);
  }
  // rizos que caen hasta los hombros, por los lados y atrás
  for (let c = 0; c < 22; c++) {
    const ang = (0.32 + (c / 21) * 1.36) * Math.PI; // de un lado, por atrás, al otro
    const bx = Math.sin(ang) * 0.36;
    const bz = Math.cos(ang) * 0.3;
    const largo = 4 + Math.floor(rnd() * 4);
    for (let k = 0; k < largo; k++) {
      const onda = Math.sin(k * 1.9 + c) * 0.035;
      rizos.push([bx * (1 + k * 0.05) + onda, 0.28 - k * 0.075, bz - k * 0.01, 0.06 + rnd() * 0.025]);
    }
  }
  // flequillo de rizos sobre la frente
  for (let i = 0; i < 14; i++) {
    const x = -0.26 + (i / 13) * 0.52;
    rizos.push([x, 0.56 + rnd() * 0.06, 0.25 - Math.abs(x) * 0.3, 0.06 + rnd() * 0.03]);
  }
  const geoRizo = new THREE.IcosahedronGeometry(1, 1);
  const pelo = new THREE.InstancedMesh(geoRizo, mat.cabello, rizos.length);
  const m4 = new THREE.Matrix4();
  rizos.forEach(([x, y, z, s], i) => {
    m4.compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 3, rnd() * 3, rnd() * 3)),
      new THREE.Vector3(s, s * (0.9 + rnd() * 0.3), s)
    );
    pelo.setMatrixAt(i, m4);
  });
  pelo.castShadow = true;
  cabeza.add(pelo);

  // ---------- Poses ----------
  const [brazoDer, brazoIzq] = brazos; // derecho de ella = -x
  if (pose === 'sentada') {
    for (const p of piernas) {
      p.muslo.rotation.x = -Math.PI / 2;
      p.rodilla.rotation.x = Math.PI / 2;
    }
    for (const b of brazos) {
      b.hombro.rotation.x = -0.3;
      b.hombro.rotation.z = 0.1 * b.lado;
      b.codo.rotation.x = -0.9;
      b.codo.rotation.z = -0.15 * b.lado;
    }
  } else {
    // parada, manos en los bolsillos, como en la foto
    for (const b of brazos) {
      b.hombro.rotation.z = 0.1 * b.lado;
      b.hombro.rotation.x = 0.06;
      b.codo.rotation.z = -0.42 * b.lado;
      b.codo.rotation.x = -0.35;
    }
    // la mano entra al bolsillo: se encoge un poco para que no se vea
    brazoDer.mano.visible = false;
    brazoIzq.mano.visible = false;
    piernas[0].muslo.rotation.z = -0.03;
    piernas[1].muslo.rotation.z = 0.03;
  }
  // la cabeza mira hacia su derecha, como en la foto
  const giroBase = pose === 'sentada' ? 0 : -0.45;
  cabeza.rotation.y = giroBase;

  // pose base del brazo derecho, para volver a ella después de saludar
  const baseDer = {
    hx: brazoDer.hombro.rotation.x, hz: brazoDer.hombro.rotation.z,
    cx: brazoDer.codo.rotation.x, cz: brazoDer.codo.rotation.z,
  };
  let inicioSaludo = -10;
  let ahora = 0;
  function saludar() { inicioSaludo = ahora; }

  // ---------- Animación ----------
  const objetivo = new THREE.Vector2();
  let proximoParpadeo = 2;
  function actualizar(t, raton = { x: 0, y: 0 }) {
    // respiración
    const resp = Math.sin(t * 1.6) * 0.012;
    torso.scale.y = 1 + resp;
    cuerpo.position.y = resp * 0.5;
    // la cabeza sigue al ratón con suavidad, partiendo de su pose
    objetivo.set(giroBase * 0.5 + raton.x * 0.6, -raton.y * 0.25);
    cabeza.rotation.y += (objetivo.x - cabeza.rotation.y) * 0.05;
    cabeza.rotation.x += (objetivo.y - cabeza.rotation.x) * 0.05;
    pelo.rotation.z = Math.sin(t * 1.3) * 0.015;
    // parpadeo
    const enParpadeo = t > proximoParpadeo && t < proximoParpadeo + 0.12;
    for (const o of ojos) o.scale.y = enParpadeo ? 0.1 : 1.15;
    if (t > proximoParpadeo + 0.12) proximoParpadeo = t + 2 + Math.random() * 3;
    ahora = t;
    // saludo con la mano derecha: sube, se agita y vuelve
    const ts = t - inicioSaludo;
    if (ts < 2.2) {
      const subir = Math.min(1, ts / 0.3, (2.2 - ts) / 0.3);
      brazoDer.hombro.rotation.x = baseDer.hx * (1 - subir);
      brazoDer.hombro.rotation.z = baseDer.hz + (-2.5 - baseDer.hz) * subir;
      brazoDer.codo.rotation.x = baseDer.cx * (1 - subir);
      brazoDer.codo.rotation.z = baseDer.cz + (-0.5 + Math.sin(ts * 14) * 0.4 - baseDer.cz) * subir;
      brazoDer.mano.visible = true;
      labios.scale.set(1.25, 1, 1);
      cabeza.rotation.z = Math.sin(ts * 3) * 0.08;
      return;
    }
    if (pose !== 'sentada') brazoDer.mano.visible = false;
    brazoDer.hombro.rotation.set(baseDer.hx, 0, baseDer.hz);
    brazoDer.codo.rotation.z = baseDer.cz;
    labios.scale.set(1, 1, 1);
    cabeza.rotation.z = 0;
    // en el escritorio, teclea
    if (pose === 'sentada') {
      brazoDer.codo.rotation.x = -0.9 + Math.max(0, Math.sin(t * 14)) * 0.08;
      brazoIzq.codo.rotation.x = -0.9 + Math.max(0, Math.sin(t * 14 + 1.7)) * 0.08;
    }
  }

  return { grupo: raiz, actualizar, cabeza, saludar };
}
