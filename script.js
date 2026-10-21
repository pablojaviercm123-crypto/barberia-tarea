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

// Próximos 6 días abiertos (lunes a sábado) como opciones seleccionables
const fechaISO = d => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
const dias = document.getElementById('dias');
const dia = new Date();
for (let n = 0; n < 6; dia.setDate(dia.getDate() + 1)) {
  if (dia.getDay() === 0) continue; // Los domingos descansamos
  const nombre = n === 0 && fechaISO(dia) === fechaISO(new Date())
    ? 'Hoy'
    : dia.toLocaleDateString('es', { weekday: 'short' }).replace('.', '');
  const mes = dia.toLocaleDateString('es', { month: 'short' }).replace('.', '');
  dias.insertAdjacentHTML('beforeend', `
    <label class="opcion">
      <input type="radio" name="fecha" value="${fechaISO(dia)}">
      <span><small>${nombre}</small><strong>${dia.getDate()}</strong><small>${mes}</small></span>
    </label>`);
  n++;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const { nombre, telefono } = form;
  const servicio = form.servicio.value, fecha = form.fecha.value, franja = form.franja.value;
  const primero = name => form.querySelector(`[name=${name}]`);

  // UX writing: mensajes claros que dicen qué falta y cómo arreglarlo
  if (!nombre.value.trim()) return avisar('Decinos tu nombre para reservarte el turno.', nombre);
  if (telefono.value.replace(/\D/g, '').length < 8) return avisar('Revisá tu número: parece que le faltan dígitos.', telefono);
  if (!servicio) return avisar('Elegí un servicio. Si tenés dudas, seleccioná «Corte con asesoramiento».', primero('servicio'));
  if (!fecha) return avisar('Elegí el día que te queda bien.', primero('fecha'));
  if (!franja) return avisar('¿Preferís venir a la mañana o a la tarde?', primero('franja'));

  const diaTexto = new Date(fecha + 'T12:00')
    .toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');
  const asesoramiento = servicio === 'Corte con asesoramiento'
    ? ' Vamos a decidir juntos tu corte cuando vengás.'
    : '';
  avisar(`¡Listo, ${nombre.value.trim()}! Reservamos tu turno para el ${diaTexto}, ${franja}.${asesoramiento} Te escribimos para confirmar la hora.`);
  form.reset();
  mensaje.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Si se pasa un campo, es un error: se marca (el campo o su grupo de opciones) y se lleva el foco ahí
function avisar(texto, campo) {
  mensaje.textContent = texto;
  mensaje.className = campo ? 'error' : 'ok';
  form.querySelectorAll('[aria-invalid]').forEach(c => c.removeAttribute('aria-invalid'));
  if (campo) {
    (campo.closest('.opciones') || campo).setAttribute('aria-invalid', 'true');
    campo.focus();
  }
}
