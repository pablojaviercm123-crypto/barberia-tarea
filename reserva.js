// Legado Barber Club — página de reserva (usa las constantes y funciones de script.js)

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
  const ahora = new Date(), esHoy = estado.fecha === fechaISO(ahora);
  const html = [];
  for (let h = HORARIO.abre; h < HORARIO.cierra; h++) {
    const pasada = esHoy && h <= ahora.getHours();
    const ocup = !pasada && ocupada(estado.fecha, h);
    const libre = !pasada && !ocup;
    html.push(`<label class="opcion"><input type="radio" name="hora" value="${hora(h)}" ${libre ? '' : 'disabled'}>
      <span>${franja(hora(h))}${libre ? '' : `<small>${pasada ? 'Pasada' : 'Ocupado'}</small>`}</span></label>`);
  }
  cont.innerHTML = html.join('');
  const elegida = estado.hora && cont.querySelector(`input[value="${estado.hora}"]:not(:disabled)`);
  if (elegida) elegida.checked = true; else estado.hora = null;
}
pintarHoras();

// Resumen en vivo
// Cada turno ocupa una franja de una hora: 14:00 – 15:00, 15:00 – 16:00…
function finTurno(h) { return hora(Number(h.split(':')[0]) + 1); }
const franja = h => `${h} – ${finTurno(h)}`;
function pintarResumen() {
  const poner = (id, valor) => { const el = $(id); el.textContent = valor || 'Sin elegir'; el.classList.toggle('vacio', !valor); };
  poner('#r-servicio', estado.servicio && estado.servicio.nombre);
  poner('#r-duracion', estado.servicio && `${estado.servicio.minutos} min`);
  poner('#r-dia', estado.fecha && fechaLarga(estado.fecha));
  poner('#r-hora', estado.hora && franja(estado.hora));
}
pintarResumen();

form.addEventListener('change', e => {
  const { name, value } = e.target;
  if (name === 'servicio') { estado.servicio = SERVICIOS.find(s => s.nombre === value); pintarHoras(); pintarAviso(); }
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

// UX writing: el aviso ofrece elegir el asesoramiento y confirma cuando está elegido
function pintarAviso() {
  const elegido = estado.servicio && estado.servicio.nombre === 'Corte con asesoramiento';
  $('#ayuda-servicio').hidden = elegido;
  $('#ayuda-lista').hidden = !elegido;
}
$('#elegir-asesoramiento').addEventListener('click', () => {
  const radio = $('[name=servicio][value="Corte con asesoramiento"]');
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));
  radio.focus();
});

// Si llega desde «Reservar» de un servicio (reservar.html?servicio=…), ya viene elegido
const servicioPedido = new URLSearchParams(location.search).get('servicio');
const radioPedido = servicioPedido && [...form.elements.servicio].find(r => r.value === servicioPedido);
if (radioPedido) {
  radioPedido.checked = true;
  radioPedido.dispatchEvent(new Event('change', { bubbles: true }));
}

// Confirmación
let turno = null;
function confirmar() {
  turno = { ...estado, servicio: estado.servicio, nombre: form.nombre.value.trim(), telefono: form.telefono.value.trim(), nota: form.nota.value.trim() };
  $('#confirmacion-texto').textContent =
    `${turno.nombre}, te esperamos el ${fechaLarga(turno.fecha)} de ${turno.hora} a ${finTurno(turno.hora)} para ${turno.servicio.nombre.toLowerCase()}. ` +
    `Te escribimos al ${turno.telefono} para confirmarlo.`;
  // Ticket
  const d = new Date(turno.fecha + 'T12:00');
  $('#t-semana').textContent = d.toLocaleDateString('es', { weekday: 'long' });
  $('#t-num').textContent = d.getDate();
  $('#t-mes').textContent = d.toLocaleDateString('es', { month: 'long' });
  $('#t-hora').textContent = franja(turno.hora);
  $('#t-servicio').textContent = turno.servicio.nombre;
  $('#t-nombre').textContent = turno.nombre;

  form.hidden = true;
  $('.reserva').classList.add('confirmada');
  const conf = $('#confirmacion');
  conf.hidden = false;
  conf.scrollIntoView({ block: 'start' });
  conf.focus({ preventScroll: true });
  festejar(conf);
}

// Festejo al confirmar: animación del sello, confeti en blanco y negro y una vibración corta
function festejar(conf) {
  conf.classList.remove('festejo'); void conf.offsetWidth; conf.classList.add('festejo');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
  const capa = document.createElement('div');
  capa.className = 'confeti'; capa.setAttribute('aria-hidden', 'true');
  const colores = ['#0b0b0b', '#3a3a39', '#6b6b69', '#a3a3a1', '#d4d4d2'];
  const alto = conf.offsetHeight;
  for (let i = 0; i < 80; i++) {
    const p = document.createElement('i');
    const ancho = 5 + Math.random() * 6;
    p.style.cssText = `left:${Math.random() * 100}%;width:${ancho}px;height:${Math.random() < .3 ? ancho : ancho * 2}px;` +
      `background:${colores[i % colores.length]};${Math.random() < .3 ? 'border-radius:50%;' : ''}` +
      `--x:${(Math.random() - .5) * 160}px;--y:${alto * (.7 + Math.random() * .4)}px;--r:${(Math.random() < .5 ? -1 : 1) * (360 + Math.random() * 720)}deg;` +
      `--t:${1.6 + Math.random() * 1.2}s;--d:${Math.random() * .5}s`;
    capa.append(p);
  }
  conf.append(capa);
  setTimeout(() => capa.remove(), 3600);
}
$('#otra').addEventListener('click', () => {
  form.reset(); Object.assign(estado, { servicio: null, fecha: null, hora: null });
  pintarHoras(); pintarResumen(); pintarAviso(); $$('.error', form).forEach(e => { e.hidden = true; });
  $('#confirmacion').hidden = true; $('.reserva').classList.remove('confirmada'); form.hidden = false; irAPaso(1);
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
