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
