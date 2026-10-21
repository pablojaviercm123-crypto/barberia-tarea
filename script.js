const form = document.getElementById('form-reserva');
const mensaje = document.getElementById('mensaje');

// Hoy como fecha mínima
form.fecha.min = new Date().toISOString().split('T')[0];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const { nombre, telefono, servicio, fecha } = form;

  // UX writing: mensajes claros que dicen qué falta y cómo arreglarlo
  if (!nombre.value.trim()) return avisar('Dinos tu nombre para apartarte la silla.', true);
  if (telefono.value.replace(/\D/g, '').length < 9) return avisar('Revisa tu número: necesitamos 9 dígitos para confirmarte.', true);
  if (!servicio.value) return avisar('Elige un servicio para saber cuánto tiempo reservarte.', true);
  if (!fecha.value) return avisar('Elige el día que te viene bien.', true);

  avisar(`¡Listo, ${nombre.value.trim()}! Tu silla está apartada para el ${fecha.value}. Te escribimos pronto para confirmar la hora.`);
  form.reset();
});

function avisar(texto, error = false) {
  mensaje.textContent = texto;
  mensaje.className = error ? 'error' : 'ok';
}
