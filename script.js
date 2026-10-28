// Legado Barber Club — interacción de la web (ver DESIGN.md)

const HORARIO = { abre: 10, cierra: 20, diasAbiertos: [1, 2, 3, 4, 5, 6] }; // lunes a sábado
const SERVICIOS = [
  { nombre: 'Corte con asesoramiento', minutos: 60 },
  { nombre: 'Corte clásico', minutos: 45 },
  { nombre: 'Barba y perfilado', minutos: 30 },
  { nombre: 'Corte y barba', minutos: 60 },
  { nombre: 'Afeitado tradicional', minutos: 30 },
];
const DIAS_NOMBRE = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
const dos = n => String(n).padStart(2, '0');
const fechaISO = d => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
const hora = (h, m = 0) => `${dos(h)}:${dos(m)}`;
const fechaLarga = iso => new Date(iso + 'T12:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');

// Al abrir o recargar, empezar siempre arriba
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);

/* ---------- Pantalla de ingreso (una vez por sesión) ---------- */
const ingreso = $('#ingreso');
let yaEntro = false;
try { yaEntro = sessionStorage.getItem('legado-ingreso') === '1'; } catch (e) { /* sin almacenamiento: se muestra igual */ }

function cerrarIngreso(destino) {
  try { sessionStorage.setItem('legado-ingreso', '1'); } catch (e) {}
  const terminar = () => {
    ingreso.hidden = true;
    document.body.classList.remove('bloqueado');
    if (destino) $(destino).scrollIntoView();
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return terminar();
  ingreso.classList.add('saliendo');
  ingreso.addEventListener('transitionend', terminar, { once: true });
  setTimeout(() => { if (!ingreso.hidden) terminar(); }, 900); // respaldo
}
if (ingreso && !yaEntro) {
  ingreso.hidden = false;
  document.body.classList.add('bloqueado');
  $('#entrar').addEventListener('click', () => cerrarIngreso());
  $('#entrar-reservar').addEventListener('click', () => { try { sessionStorage.setItem('legado-ingreso', '1'); } catch (e) {} });
  document.addEventListener('keydown', e => { if ((e.key === 'Escape' || e.key === 'Enter') && !ingreso.hidden && !e.target.closest('#ingreso')) cerrarIngreso(); });
}

/* ---------- Abierto / cerrado según la hora real ---------- */
function estadoLocal(ahora = new Date()) {
  const d = ahora.getDay(), h = ahora.getHours() + ahora.getMinutes() / 60;
  if (HORARIO.diasAbiertos.includes(d) && h >= HORARIO.abre && h < HORARIO.cierra) {
    return { abierto: true, corto: 'Abierto ahora', largo: `Abierto ahora · cierra a las ${hora(HORARIO.cierra)}` };
  }
  // Próxima apertura
  for (let i = 0; i < 8; i++) {
    const dia = new Date(ahora); dia.setDate(ahora.getDate() + i);
    if (!HORARIO.diasAbiertos.includes(dia.getDay())) continue;
    if (i === 0 && h >= HORARIO.abre) continue;
    const cuando = i === 0 ? 'hoy' : i === 1 ? 'mañana' : `el ${DIAS_NOMBRE[dia.getDay()]}`;
    return { abierto: false, corto: 'Cerrado', largo: `Cerrado · abre ${cuando} a las ${hora(HORARIO.abre)}` };
  }
}
function pintarEstado() {
  const e = estadoLocal();
  $$('[data-estado]').forEach(el => { el.textContent = e.corto; el.classList.toggle('abierto', e.abierto); });
  $$('[data-estado-largo]').forEach(el => { el.textContent = e.largo; });
  $$('.horario tr').forEach(tr => tr.classList.toggle('hoy', Number(tr.dataset.dia) === new Date().getDay()));
}
pintarEstado();
setInterval(pintarEstado, 60000);

/* ---------- Barra inferior: marca la sección visible ---------- */
const pestanaDe = { inicio: 'inicio', historia: 'inicio', cambio: 'inicio', servicios: 'servicios', trabajos: 'servicios', preguntas: 'ubicacion', ubicacion: 'ubicacion' };
if ('IntersectionObserver' in window && $('.tabbar')) {
  const obs = new IntersectionObserver(entradas => entradas.forEach(en => {
    if (!en.isIntersecting) return;
    const tab = pestanaDe[en.target.id];
    $$('.tabbar a').forEach(a => {
      const activo = a.dataset.tab === tab;
      a.classList.toggle('activo', activo);
      if (activo) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }), { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(pestanaDe).forEach(id => { const el = $('#' + id); if (el) obs.observe(el); });
}

