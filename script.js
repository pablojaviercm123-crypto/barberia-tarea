// Menú móvil
const header = document.querySelector('header');
const toggle = document.querySelector('.menu-toggle');
toggle.addEventListener('click', () => {
  const abierto = header.classList.toggle('abierto');
  toggle.setAttribute('aria-expanded', abierto);
  toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
});
header.querySelectorAll('nav ul a').forEach(a => a.addEventListener('click', () => {
  header.classList.remove('abierto');
  toggle.setAttribute('aria-expanded', false);
}));

const form = document.getElementById('form-reserva');
const mensaje = document.getElementById('mensaje');

// Hoy (hora local) como fecha mínima
const hoy = new Date();
form.fecha.min = [hoy.getFullYear(), String(hoy.getMonth() + 1).padStart(2, '0'), String(hoy.getDate()).padStart(2, '0')].join('-');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const { nombre, telefono, servicio, fecha } = form;

  // UX writing: mensajes claros que dicen qué falta y cómo arreglarlo
  if (!nombre.value.trim()) return avisar('Decinos tu nombre para reservarte el turno.', nombre);
  if (telefono.value.replace(/\D/g, '').length < 8) return avisar('Revisá tu número: parece que le faltan dígitos.', telefono);
  if (!servicio.value) return avisar('Elegí un servicio. Si tenés dudas, seleccioná «Corte con asesoramiento».', servicio);
  if (!fecha.value) return avisar('Elegí el día que te queda bien.', fecha);
  if (fecha.value < fecha.min) return avisar('Esa fecha ya pasó. Elegí un día a partir de hoy.', fecha);

  const dia = new Date(fecha.value + 'T12:00');
  if (dia.getDay() === 0) return avisar('Los domingos descansamos. Elegí un día de lunes a sábado.', fecha);
  const diaTexto = dia.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');

  const asesoramiento = servicio.value === 'Corte con asesoramiento'
    ? ' Vamos a decidir juntos tu corte cuando vengás.'
    : '';
  avisar(`¡Listo, ${nombre.value.trim()}! Reservamos tu turno para el ${diaTexto}.${asesoramiento} Te escribimos para confirmar la hora.`);
  form.reset();
});

// Si se pasa un campo, es un error: se marca y se lleva el foco ahí
function avisar(texto, campo) {
  mensaje.textContent = texto;
  mensaje.className = campo ? 'error' : 'ok';
  form.querySelectorAll('[aria-invalid]').forEach(c => c.removeAttribute('aria-invalid'));
  if (campo) { campo.setAttribute('aria-invalid', 'true'); campo.focus(); }
}
