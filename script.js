// Legado Barber Club — interacción de la web (ver DESIGN.md)

const HORARIO = { abre: 10, cierra: 20, diasAbiertos: [1, 2, 3, 4, 5, 6] }; // lunes a sábado
const SERVICIOS = [
  { nombre: 'Corte con asesoramiento', minutos: 60 },
  { nombre: 'Corte clásico', minutos: 45 },
  { nombre: 'Barba y perfilado', minutos: 30 },
  { nombre: 'Corte y barba', minutos: 75 },
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
if (!yaEntro) {
  ingreso.hidden = false;
  document.body.classList.add('bloqueado');
  $('#entrar').focus({ preventScroll: true });
  $('#entrar').addEventListener('click', () => cerrarIngreso());
  $('#entrar-reservar').addEventListener('click', e => { e.preventDefault(); cerrarIngreso('#reservar'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !ingreso.hidden) cerrarIngreso(); });
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
const pestanaDe = { inicio: 'inicio', historia: 'inicio', cambio: 'inicio', servicios: 'servicios', trabajos: 'servicios', reservar: 'reservar', preguntas: 'ubicacion', ubicacion: 'ubicacion' };
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver(entradas => entradas.forEach(en => {
    if (!en.isIntersecting) return;
    const tab = pestanaDe[en.target.id];
    $$('.tabbar a').forEach(a => {
      const activo = a.dataset.tab === tab;
      a.classList.toggle('activo', activo);
      if (activo) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }), { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(pestanaDe).forEach(id => obs.observe($('#' + id)));
}

/* ---------- Reserva en 3 pasos ---------- */
const form = $('#reserva');
const estado = { paso: 1, servicio: null, fecha: null, hora: null };

// Paso 1: servicios
$('#opciones-servicio').innerHTML = SERVICIOS.map(s => `
  <label class="opcion">
    <input type="radio" name="servicio" value="${s.nombre}">
    <span><strong>${s.nombre}</strong><small>${s.minutos} min</small></span>
  </label>`).join('');

// Paso 2: próximos 6 días abiertos
function pintarDias() {
  const ahora = new Date(), dia = new Date();
  if (ahora.getHours() >= HORARIO.cierra - 1) dia.setDate(dia.getDate() + 1); // hoy ya no quedan turnos
  const html = [];
  while (html.length < 6) {
    if (HORARIO.diasAbiertos.includes(dia.getDay())) {
      const iso = fechaISO(dia);
      const nombre = iso === fechaISO(ahora) ? 'Hoy' : dia.toLocaleDateString('es', { weekday: 'short' }).replace('.', '');
      html.push(`<label class="opcion"><input type="radio" name="fecha" value="${iso}">
        <span><small>${nombre}</small><strong>${dia.getDate()}</strong><small>${dia.toLocaleDateString('es', { month: 'short' }).replace('.', '')}</small></span></label>`);
    }
    dia.setDate(dia.getDate() + 1);
  }
  $('#dias').innerHTML = html.join('');
}
pintarDias();

// Horas: cada hora, que el turno termine antes del cierre; sin horas pasadas; algunas ocupadas (simulado, siempre igual para el mismo día)
function ocupada(iso, h) {
  let n = 0; for (const c of iso + h) n = (n * 31 + c.charCodeAt(0)) % 997;
  return n % 4 === 0;
}
function pintarHoras() {
  const cont = $('#horas');
  if (!estado.fecha) { cont.innerHTML = '<p class="opcional">Primero elegí un día.</p>'; return; }
  const minutos = estado.servicio ? estado.servicio.minutos : 30;
  const ahora = new Date(), esHoy = estado.fecha === fechaISO(ahora);
  const html = [];
  for (let h = HORARIO.abre; h * 60 + minutos <= HORARIO.cierra * 60; h++) {
    const pasada = esHoy && h <= ahora.getHours();
    const ocup = !pasada && ocupada(estado.fecha, h);
    const libre = !pasada && !ocup;
    html.push(`<label class="opcion"><input type="radio" name="hora" value="${hora(h)}" ${libre ? '' : 'disabled'}>
      <span>${hora(h)}${libre ? '' : `<small>${pasada ? 'Pasada' : 'Ocupado'}</small>`}</span></label>`);
  }
  cont.innerHTML = html.join('');
  const elegida = estado.hora && cont.querySelector(`input[value="${estado.hora}"]:not(:disabled)`);
  if (elegida) elegida.checked = true; else estado.hora = null;
}
pintarHoras();

// Resumen en vivo
function finTurno(h) {
  const [hh] = h.split(':').map(Number), fin = hh * 60 + estado.servicio.minutos;
  return hora(Math.floor(fin / 60), fin % 60);
}
function pintarResumen() {
  const poner = (id, valor) => { const el = $(id); el.textContent = valor || 'Sin elegir'; el.classList.toggle('vacio', !valor); };
  poner('#r-servicio', estado.servicio && estado.servicio.nombre);
  poner('#r-duracion', estado.servicio && `${estado.servicio.minutos} min`);
  poner('#r-dia', estado.fecha && fechaLarga(estado.fecha));
  poner('#r-hora', estado.hora && (estado.servicio ? `${estado.hora} a ${finTurno(estado.hora)}` : estado.hora));
}
pintarResumen();

form.addEventListener('change', e => {
  const { name, value } = e.target;
  if (name === 'servicio') { estado.servicio = SERVICIOS.find(s => s.nombre === value); pintarHoras(); }
  if (name === 'fecha') { estado.fecha = value; pintarHoras(); }
  if (name === 'hora') estado.hora = value;
  if (name === 'servicio') ocultarError('servicio');
  if (name === 'fecha' || name === 'hora') ocultarError('cuando');
  pintarResumen();
});
form.addEventListener('input', e => { if (e.target.name === 'nombre' || e.target.name === 'telefono') ocultarError(e.target.name); });

function mostrarError(clave, foco) {
  $(`[data-error="${clave}"]`).hidden = false;
  if (foco) { if (foco.matches('input[type="text"], input[type="tel"]')) foco.setAttribute('aria-invalid', 'true'); foco.focus(); }
  return false;
}
function ocultarError(clave) {
  const el = $(`[data-error="${clave}"]`); if (el) el.hidden = true;
  const campo = form.elements[clave]; if (campo && campo.removeAttribute) campo.removeAttribute('aria-invalid');
}
function validar(paso) {
  if (paso === 1 && !estado.servicio) return mostrarError('servicio', $('[name=servicio]'));
  if (paso === 2 && (!estado.fecha || !estado.hora)) return mostrarError('cuando', $(estado.fecha ? '[name=hora]:not(:disabled)' : '[name=fecha]'));
  if (paso === 3) {
    if (!form.nombre.value.trim()) return mostrarError('nombre', form.nombre);
    if (form.telefono.value.replace(/\D/g, '').length < 8) return mostrarError('telefono', form.telefono);
  }
  return true;
}
function irAPaso(n) {
  estado.paso = n;
  $$('.paso', form).forEach(f => { f.hidden = Number(f.dataset.paso) !== n; });
  $('#barra').style.width = `${(n / 3) * 100}%`;
  $('#paso-texto').textContent = `Paso ${n} de 3`;
  $('#atras').hidden = n === 1;
  $('#siguiente').textContent = n === 3 ? 'Confirmar turno' : 'Continuar';
  const top = form.getBoundingClientRect().top;
  if (top < 0) form.scrollIntoView({ block: 'start' });
}
$('#siguiente').addEventListener('click', () => {
  if (!validar(estado.paso)) return;
  if (estado.paso < 3) {
    irAPaso(estado.paso + 1);
    const legend = $(`.paso[data-paso="${estado.paso}"] legend`);
    legend.tabIndex = -1; legend.focus({ preventScroll: true });
  } else confirmar();
});
$('#atras').addEventListener('click', () => irAPaso(estado.paso - 1));

// Los enlaces "Reservar" de cada servicio lo dejan elegido
$$('[data-servicio]').forEach(a => a.addEventListener('click', () => {
  const radio = $(`[name=servicio][value="${a.dataset.servicio}"]`);
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));
  $('#confirmacion').hidden = true; form.hidden = false;
  irAPaso(2);
}));

// Confirmación
let turno = null;
function confirmar() {
  turno = { ...estado, servicio: estado.servicio, nombre: form.nombre.value.trim(), telefono: form.telefono.value.trim(), nota: form.nota.value.trim() };
  $('#confirmacion-texto').textContent =
    `${turno.nombre}, te esperamos el ${fechaLarga(turno.fecha)} a las ${turno.hora} para ${turno.servicio.nombre.toLowerCase()}. ` +
    `Te escribimos al ${turno.telefono} para confirmarlo.`;
  form.hidden = true;
  const conf = $('#confirmacion');
  conf.hidden = false; conf.focus();
}
$('#otra').addEventListener('click', () => {
  form.reset(); Object.assign(estado, { servicio: null, fecha: null, hora: null });
  pintarHoras(); pintarResumen(); $$('.error', form).forEach(e => { e.hidden = true; });
  $('#confirmacion').hidden = true; form.hidden = false; irAPaso(1);
  $('[name=servicio]').focus();
});

// Agregar al calendario (.ics)
$('#calendario').addEventListener('click', () => {
  if (!turno) return;
  const f = turno.fecha.replace(/-/g, ''), ini = turno.hora.replace(':', '') + '00';
  const fin = finTurno(turno.hora).replace(':', '') + '00';
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Legado Barber Club//Reservas//ES', 'BEGIN:VEVENT',
    `UID:${Date.now()}@legado-barber-club`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${f}T${ini}`, `DTEND:${f}T${fin}`, `SUMMARY:${turno.servicio.nombre} · Legado Barber Club`,
    'LOCATION:Calle Principal 123', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'turno-legado.ics' });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
