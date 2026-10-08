// Idioma, destellos del cursor, terminal de la portada y animaciones al bajar.
// ---------- Idiomas ----------
const EN = {
  nav_sobre:'About', nav_proy:'Projects', nav_contacto:'Contact',
  hola:'Hi! 👋',
  titulo:'I build web apps, from the <span class="serif">frontend</span> to the <span class="serif">data</span>',
  sub:'Software developer based in Colombia. Freelancing since 2024 and studying Software and Data Engineering.',
  ver_proy:'See projects', contactame:'Get in touch',
  pista:'Click <b>Hanna</b> to say hi · click the <b>monitor</b> to see projects',
  etq_sobre:'// about', tit_sobre:'About <span class="serif">me</span>',
  alt_foto:'Hanna Salinas standing in front of a spiral staircase',
  intro:'Since 2024 I\'ve been freelancing on Fiverr, building web apps and dashboards and teaching Python, SQL and JavaScript. I work across the frontend with React and the backend and data side with NestJS, SQL and Databricks, and my goal is to become a <span class="serif">full-stack</span> developer.',
  dato_fiverr:'Freelancing on Fiverr',
  json:'{\n  <span class="k">"role"</span>: <span class="s">"Software developer"</span>,\n  <span class="k">"goal"</span>: <span class="s">"full-stack"</span>,\n  <span class="k">"studies"</span>: <span class="s">"Software &amp; Data Eng. · IU Digital"</span>,\n  <span class="k">"languages"</span>: [<span class="s">"Spanish"</span>, <span class="s">"English B1–B2"</span>]\n}',
  herramientas:'Tools',
  etq_proy:'// projects', tit_proy:'Projects',
  alt_terrall:'3D map of Colombia in Terrall', p_terrall:'Interactive 3D map of Colombia with real tourism data and my own REST API.',
  alt_wander:'Wanderbricks lakehouse diagram', p_wander:'Medallion-architecture lakehouse on Databricks, built in a team of three.',
  alt_talent:'TalentCorp star schema', p_talent:'HR data warehouse with ETL, Type 2 SCD, 15 KPIs and row-level security.',
  alt_multi:'Multivariate analysis chart', h_multi:'Multivariate analysis', p_multi:'PCA on 961 gym members and 16 variables.',
  etq_contacto:'// contact', tit_contacto:'Let\'s talk about<br><span class="serif">your project</span>',
  p_contacto:'Reach me by email or on LinkedIn.',
  pie:'Made with <b>♥</b> by Hanna Salinas · 2026',
  tit_otros:'More projects', p_mongo:'Validation, transactions and aggregation reports',
  p_localrent:'Rental management in Java with 25 JUnit tests', h_api:'Terrall API', p_api:'REST API documentation (NestJS)',
  cv:'Download CV', saltar:'Skip to content',
  terminal:'Hanna Salinas · software developer',
};
const ES = { terminal:'Hanna Salinas · desarrolladora de software' };
document.querySelectorAll('[data-t]').forEach((el) => { ES[el.dataset.t] = el.innerHTML; });
document.querySelectorAll('[data-t-alt]').forEach((el) => { ES[el.dataset.tAlt] = el.alt; });

let idioma = 'es';
try { idioma = localStorage.getItem('idioma') || (navigator.language.startsWith('es') ? 'es' : 'en'); } catch { idioma = navigator.language.startsWith('es') ? 'es' : 'en'; }
function ponerIdioma(id) {
  idioma = id;
  const d = id === 'en' ? EN : ES;
  document.documentElement.lang = id;
  document.querySelectorAll('[data-t]').forEach((el) => { el.innerHTML = d[el.dataset.t]; });
  document.querySelectorAll('[data-t-alt]').forEach((el) => { el.alt = d[el.dataset.tAlt]; });
  document.getElementById('idioma').textContent = id === 'en' ? 'ES' : 'EN';
  document.title = id === 'en' ? 'Hanna Salinas · Software developer' : 'Hanna Salinas · Desarrolladora de software';
  const sal = document.getElementById('salida');
  if (sal.innerHTML) sal.innerHTML = `<span class="ok">→</span> ${d.terminal}`;
  try { localStorage.setItem('idioma', id); } catch {}
}
ponerIdioma(idioma);
document.getElementById('idioma').addEventListener('click', () => ponerIdioma(idioma === 'es' ? 'en' : 'es'));

// destellos rojos que siguen al cursor
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(pointer: fine)').matches) {
  let ultimo = 0;
  addEventListener('pointermove', (e) => {
    const t = performance.now();
    if (t - ultimo < 45) return;
    ultimo = t;
    const d = document.createElement('span');
    d.className = 'destello';
    const s = 0.4 + Math.random() * 0.7;
    d.style.cssText = `left:${e.clientX + (Math.random() - .5) * 14}px;top:${e.clientY + (Math.random() - .5) * 14}px;width:${14 * s}px;height:${14 * s}px`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 800);
  });
}
// terminal que se escribe sola
const comando = 'whoami';
const esc = document.getElementById('escribe'), sal = document.getElementById('salida');
let i = 0;
(function teclear() {
  esc.innerHTML = comando.slice(0, i) + '<span class="cursor"></span>';
  if (i++ < comando.length) return setTimeout(teclear, 110);
  setTimeout(() => { esc.textContent = comando; sal.innerHTML = `<span class="ok">→</span> ${(idioma === 'en' ? EN : ES).terminal}`; }, 350);
})();
const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('visible')), { threshold:.12 });
document.querySelectorAll('.aparece').forEach((el) => obs.observe(el));
// si el 3D no arranca en 4 segundos, se muestra la imagen del cuarto
setTimeout(() => { if (!document.querySelector('#escena canvas')) document.querySelector('.respaldo').hidden = false; }, 4000);
