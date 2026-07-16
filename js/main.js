// ---------- AÑO DINÁMICO EN EL FOOTER ----------
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- REVEAL ON SCROLL ----------
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// ---------- CARRUSEL DE FOTOS DEL PRODUCTO ----------
(function () {
  const slider = document.getElementById('productSlider');
  if (!slider) return;

  const track = slider.querySelector('.product-slider-track');
  const slides = Array.from(track.children);
  const realCount = slides.length - 2; // se restan los dos clones (loop infinito)
  const dots = Array.from(slider.querySelectorAll('.product-slider-dots .dot'));

  let currentIndex = 1; // arranca en la primera imagen real (índice 0 es el clon)
  let isDragging = false;
  let startX = 0;
  let deltaX = 0;

  function setActiveDot(realIndex) {
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === realIndex));
  }

  function goTo(index, instant) {
    track.classList.toggle('no-transition', !!instant);
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    currentIndex = index;
    setActiveDot(((index - 1) + realCount) % realCount);
  }

  track.addEventListener('transitionend', () => {
    if (currentIndex === 0) {
      goTo(realCount, true);
    } else if (currentIndex === realCount + 1) {
      goTo(1, true);
    }
  });

  // Si el transitionend no llegó a disparar (p. ej. con la pestaña en segundo
  // plano las transiciones no corren), se salta al índice real antes de avanzar
  // para que el loop no se vaya de rango.
  function next() {
    if (currentIndex >= realCount + 1) {
      goTo(1, true);
      void track.offsetWidth; // fuerza el reflow para que el salto sea instantáneo
    }
    goTo(currentIndex + 1);
  }
  function prev() {
    if (currentIndex <= 0) {
      goTo(realCount, true);
      void track.offsetWidth;
    }
    goTo(currentIndex - 1);
  }

  // ---- Autoplay: las fotos pasan solas ----
  const AUTOPLAY_MS = 4000;
  let autoplayTimer = setInterval(next, AUTOPLAY_MS);
  function restartAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, AUTOPLAY_MS);
  }

  // Con la pestaña oculta se pausa el autoplay (las transiciones no corren ahí).
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(autoplayTimer);
    else restartAutoplay();
  });

  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    goTo(i + 1);
    restartAutoplay();
  }));

  // ---- Swipe táctil ----
  track.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    deltaX = 0;
    track.classList.add('no-transition');
    clearInterval(autoplayTimer); // se pausa mientras el dedo está apoyado
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    deltaX = e.touches[0].clientX - startX;
    const percent = (deltaX / slider.offsetWidth) * 100;
    track.style.transform = 'translateX(calc(-' + (currentIndex * 100) + '% + ' + percent + '%))';
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('no-transition');
    const threshold = slider.offsetWidth * 0.18;
    if (deltaX < -threshold) next();
    else if (deltaX > threshold) prev();
    else goTo(currentIndex);
    restartAutoplay();
  });

  goTo(1, true);
})();

// ---------- TRACKING CLICS WHATSAPP ----------
function trackWhatsappClick() {
  if (typeof fbq === 'function') {
    fbq('track', 'Contact');
  }
}
// Se trackean todos los accesos a WhatsApp (botón de la sección + flotante).
document.querySelectorAll('.js-wa-track').forEach(el => {
  el.addEventListener('click', trackWhatsappClick);
});

// ---------- VALIDACIÓN Y ENVÍO DEL FORMULARIO ----------
// La reserva se coordina únicamente por WhatsApp: al enviar, se abre el chat
// con los datos ya cargados. No hay backend ni registro externo.

const form = document.getElementById('reserva-form');
const formSuccess = document.getElementById('form-success');
const formError = document.getElementById('form-error');

function showError(fieldId, message) {
  const errEl = document.getElementById('err-' + fieldId);
  if (errEl) errEl.textContent = message;
}

function clearErrors() {
  form.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
}

function validateForm(data) {
  let valid = true;
  clearErrors();

  if (!data.nombre.trim()) {
    showError('nombre', 'Ingresá tu nombre y apellido.');
    valid = false;
  }

  const telefonoLimpio = data.telefono.replace(/\s|-/g, '');
  if (!telefonoLimpio || telefonoLimpio.length < 8) {
    showError('telefono', 'Ingresá un teléfono válido.');
    valid = false;
  }

  const emailLimpio = data.email.trim();
  if (!emailLimpio) {
    showError('email', 'Ingresá tu email.');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
    showError('email', 'Ingresá un email válido.');
    valid = false;
  }

  return valid;
}

function handleSubmitSuccess() {
  if (typeof fbq === 'function') {
    fbq('track', 'Lead');
  }
  if (formError) formError.style.display = 'none';
  form.reset();
  form.style.display = 'none';
  if (formSuccess) formSuccess.style.display = 'flex';
}

// ---------- ARMADO DEL MENSAJE DE WHATSAPP ----------
// Número de destino en formato internacional, sin "+" ni espacios.
const WHATSAPP_NUMERO = '5491160991023';

// Arma el texto que se pre-carga en WhatsApp, redactado en primera persona
// (lo "escribe" la persona que reserva). Toma los valores reales de cada
// campo por su id existente.
function buildWhatsappMessage() {
  const nombre = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const email = document.getElementById('email').value.trim();
  return [
    '¡Hola Armonic! Quiero reservar mi lugar para conocer el STUDIO MK-1000 en vivo.',
    '',
    'Mis datos:',
    '',
    '• Nombre: ' + nombre,
    '• Teléfono: ' + telefono,
    '• Mail: ' + email
  ].join('\n');
}

// Abre WhatsApp con el mensaje pre-cargado. wa.me resuelve solo el destino:
// en mobile abre la app, en desktop abre WhatsApp Web.
function openWhatsapp() {
  const url = 'https://wa.me/' + WHATSAPP_NUMERO +
    '?text=' + encodeURIComponent(buildWhatsappMessage());
  window.open(url, '_blank');
}

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = {
      nombre: document.getElementById('nombre').value,
      telefono: document.getElementById('telefono').value,
      email: document.getElementById('email').value
    };

    if (!validateForm(data)) return;

    if (formError) formError.style.display = 'none';

    // La reserva se coordina únicamente por WhatsApp: se abre el chat con
    // los datos ya cargados. openWhatsapp() se llama sincrónicamente dentro
    // del click (y antes del reset) para que el navegador no bloquee la
    // ventana y el mensaje se arme con los valores reales.
    openWhatsapp();
    handleSubmitSuccess();
  });
}
