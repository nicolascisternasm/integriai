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

- `portal/`: **Portal IntegriAI**, el sistema de gestión (CRM, clientes y proyectos) que vive en `integriai.cl/app/`. Es una app React + Vite con su propio `package.json`; el build del sitio la compila dentro de `dist/app`. Los cambios de base de datos están en `portal/supabase/migrations/`.

## Trabajar en local
```bash
npm install
npm run dev          # sitio
npm run portal:dev   # portal, en http://localhost:5174/app/ (entra con un usuario real de Supabase)
```

## Publicación
Railway publica solo cada vez que se sube un cambio a `main`:
- Build: `npm run build` (compila el sitio con Astro y después el portal)
- Start: `npm start` (sirve `dist/` en el puerto `$PORT`)

## Formulario de diagnóstico
Guarda cada solicitud en la tabla `leads` de Supabase (proyecto `uhgqtrsxszydcvhanmew`). El sitio solo puede insertar; para leerlas, entra al panel de Supabase → Table Editor → `leads`. La columna `estado` sirve para el seguimiento comercial: nuevo, contactado, diagnostico, propuesta, ganado y perdido.
