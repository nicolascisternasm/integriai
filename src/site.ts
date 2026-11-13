// Datos de contacto y del negocio usados en todo el sitio. Cambiar aquí y se actualiza en todas las páginas.
export const SITE_URL = 'https://integriai.cl';
export const BRAND = 'IntegriAI';
// TELÉFONO PROVISORIO (2026-11-10): celular personal, mientras se compra el del negocio.
// Al cambiarlo: editar WA_NUMBER y WA_DISPLAY aquí, public/llms.txt y la lista en docs/telefono-contacto.md.
export const WA_NUMBER = '56963735456';
export const WA_DISPLAY = '+56 9 6373 5456';
export const WA_TEXT = 'Hola, vi la web de IntegriAI y quiero conversar sobre mi empresa.';
export const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`;
export const EMAIL = 'contacto@integriai.cl';
export const DESCRIPTION =
  'Sistemas de gestión a medida, ERP, automatización de procesos y agentes de inteligencia artificial para pymes de Chile y Latinoamérica.';

// Google Analytics 4: pegar aquí el ID de medición (G-XXXXXXX). Vacío = sin medición.
export const GA_ID = 'G-QRJ49KSZM3';
// Google Search Console por etiqueta HTML (solo si no se verifica por DNS). Vacío = no se agrega.
export const GSC_TOKEN = '';

// Supabase: la clave publicable es pública por diseño; la tabla solo permite insertar (RLS).
export const SUPABASE_URL = 'https://uhgqtrsxszydcvhanmew.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_nDJgbK64ZT8j0tD_cSNDvA_4ll-VvIW';
