// Guías: artículos que responden preguntas reales de búsqueda. Cada una enlaza a la página de servicio que corresponde.
// Regla: respuesta directa en las primeras líneas, datos concretos y nada inventado (sin cifras de mercado sin fuente).
// Al agregar una guía: crear su página en src/pages/guias/<slug>.astro, sumarla aquí y en public/llms.txt.

export type GuiaMeta = {
  slug: string;
  t: string;          // título visible
  d: string;          // resumen para el índice
  tema: string;       // etiqueta corta
  fecha: string;      // AAAA-MM-DD de publicación
};

export const GUIAS: GuiaMeta[] = [
  {
    slug: 'cuanto-cuesta-una-pagina-web-en-chile',
    t: '¿Cuánto cuesta una página web en Chile?',
    d: 'Rangos de precio de una landing page, una web corporativa y una tienda online, qué encarece una web y qué costos vienen después.',
    tema: 'Páginas web',
    fecha: '2026-11-16',
  },
  {
    slug: 'erp-vs-crm',
    t: 'ERP vs CRM: diferencias y cuál necesita tu pyme',
    d: 'Qué ordena cada sistema, señales de que necesitas uno u otro y cómo se conectan cuando tienes los dos.',
    tema: 'Sistemas',
    fecha: '2026-11-16',
  },
];
