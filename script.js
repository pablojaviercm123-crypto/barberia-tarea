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

// Hoy como fecha mínima
form.fecha.min = new Date().toISOString().split('T')[0];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const { nombre, telefono, servicio, fecha } = form;

  // UX writing: mensajes claros que dicen qué falta y cómo arreglarlo
  if (!nombre.value.trim()) return avisar('Decinos tu nombre para reservarte el turno.', true);
  if (telefono.value.replace(/\D/g, '').length < 9) return avisar('Revisá tu número: necesitamos 9 dígitos para confirmarte.', true);
  if (!servicio.value) return avisar('Elegí un servicio. Si tenés dudas, seleccioná «Corte con asesoramiento».', true);
  if (!fecha.value) return avisar('Elegí el día que te queda bien.', true);

  const asesoramiento = servicio.value === 'Corte con asesoramiento'
    ? ' Vamos a decidir juntos tu corte cuando vengás.'
    : '';
  avisar(`¡Listo, ${nombre.value.trim()}! Reservamos tu turno para el ${fecha.value}.${asesoramiento} Te escribimos para confirmar la hora.`);
  form.reset();
});

function avisar(texto, error = false) {
  mensaje.textContent = texto;
  mensaje.className = error ? 'error' : 'ok';
}
