// Al cargar o recargar, empezar siempre desde el inicio (sin saltar a #reservar, etc.)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);

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
const ahora = new Date();
const dia = new Date();
if (ahora.getHours() >= 19) dia.setDate(dia.getDate() + 1); // Ya no hay turnos hoy
for (let n = 0; n < 6; dia.setDate(dia.getDate() + 1)) {
  if (dia.getDay() === 0) continue; // Los domingos descansamos
  const nombre = fechaISO(dia) === fechaISO(ahora)
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
  if (fecha === fechaISO(new Date()) && franja === 'a la mañana' && new Date().getHours() >= 14)
    return avisar('Hoy a la mañana ya no llegamos. Elegí la tarde u otro día.', primero('franja'));

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

// Aparición suave de los bloques al bajar por la página
const aRevelar = document.querySelectorAll('.eyebrow, .seccion h2, .historia article, .relato, .storyboard li, .tarjetas article, .reserva-info, .tarjeta-form, .datos div');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observador = new IntersectionObserver(entradas => entradas.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observador.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  const carrusel = matchMedia('(max-width: 760px)').matches; // en celular el storyboard se desliza en horizontal
  aRevelar.forEach(el => {
    if (carrusel && el.matches('.storyboard li')) return;
    el.classList.add('revelar');
    // Pequeño escalonado dentro de cada grupo
    const hermanos = [...el.parentElement.children];
    el.style.transitionDelay = `${Math.min(hermanos.indexOf(el), 4) * 80}ms`;
    observador.observe(el);
  });
}
