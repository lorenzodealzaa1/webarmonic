# ARMONIC — Landing STUDIO MK-1000

Landing page estática (HTML/CSS/JS puro, sin build) para la experiencia privada de escucha del STUDIO MK-1000.

## Estructura

```
.
├── index.html          # Contenido de la página
├── css/style.css       # Estilos
├── js/main.js          # Reveal on scroll, menú móvil, tracking WhatsApp, validación del form
├── assets/img/         # Poné acá las imágenes reales del producto
└── vercel.json         # Config de deploy en Vercel
```

## Pendientes antes de publicar

Buscá estos placeholders y reemplazalos con los datos reales:

- **Teléfono de WhatsApp**: `https://wa.me/549XXXXXXXXXX` aparece 3 veces en `index.html` (botón del hero, sección de contacto y footer).
- **Instagram**: `https://instagram.com/TU_USUARIO` en el footer.
- **Meta Pixel**: el bloque de código está comentado en el `<head>` de `index.html`. Cuando tengas el Pixel ID, descomentalo y reemplazá `TU_PIXEL_ID` (aparece 2 veces).
- **Datos del evento** (sección "Detalles de la experiencia"): dirección, fecha, horarios y cupos — están marcados con `[AGREGAR ...]`.
- **Imágenes del producto**: reemplazá los bloques `placeholder-text` en `.hero-visual` y `.product-visual` por `<img>` reales apuntando a `assets/img/`.
- **Envío del formulario de reserva**: hoy el form valida y muestra el mensaje de éxito, pero no envía los datos a ningún lado. En `js/main.js`, dentro del listener de `submit`, elegí una opción:
  - **Formspree**: agregá `action="https://formspree.io/f/TU_ID" method="POST"` al `<form>` en `index.html`.
  - **Google Sheets / Zapier (webhook)**: descomentá el bloque `fetch(...)` marcado como `// ENVÍO A BACKEND` y poné tu endpoint.

## Cómo probarlo en local

No necesita instalación ni build. Alcanza con abrir `index.html` en el navegador, o levantar un servidor estático simple:

```bash
npx serve .
```

## Deploy en Vercel

1. Instalá la CLI de Vercel (una sola vez): `npm i -g vercel`
2. Desde esta carpeta, corré: `vercel`
3. Seguí las instrucciones (login con tu cuenta, confirmar el nombre del proyecto).
4. Para producción: `vercel --prod`

También podés importar el repo de GitHub directamente desde [vercel.com/new](https://vercel.com/new) una vez que lo subas.

## Subir a GitHub

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```
