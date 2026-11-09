# IntegriAI · integriai.cl

Sitio web de IntegriAI: sistemas a medida, automatización e IA para pymes.

## Estructura
- `src/pages/`: páginas (inicio, diagnóstico, privacidad, 404). Cada archivo es una URL.
- `src/components/`: menú, pie e íconos compartidos.
- `src/layouts/Base.astro`: `<head>` común (SEO, Open Graph, datos estructurados).
- `src/site.ts`: WhatsApp, correo y datos de Supabase. **Se cambian aquí para todo el sitio.**
- `src/styles/global.css`: diseño (colores, fuentes y componentes).
- `public/js/site.js`: robot del inicio, selector, acordeón, mapa y la marca deformable del pie.
- `prototipos/`: maquetas aprobadas. Los documentos internos (`docs/`) quedan solo en el computador, fuera del repositorio.

## Trabajar en local
```bash
npm install
npm run dev
```

## Publicación
Railway publica solo cada vez que se sube un cambio a `main`:
- Build: `npm run build`
- Start: `npm start` (sirve `dist/` en el puerto `$PORT`)

## Formulario de diagnóstico
Guarda cada solicitud en la tabla `leads` de Supabase (proyecto `uhgqtrsxszydcvhanmew`). El sitio solo puede insertar; para leerlas, entra al panel de Supabase → Table Editor → `leads`. La columna `estado` sirve para el seguimiento comercial: nuevo, contactado, diagnostico, propuesta, ganado y perdido.
