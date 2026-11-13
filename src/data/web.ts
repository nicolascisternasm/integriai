// Planes de páginas web. Precios "desde", netos (+ IVA en Chile). USD para clientes fuera de Chile (sin IVA).
// Referencia de mercado en Chile (nov 2026): landing $130.000–$400.000, corporativa $350.000–$1.000.000, tienda $400.000–$1.200.000+ (todo + IVA).
// Cambiar un precio aquí lo cambia en todas las páginas y en los datos para Google.
// Además hay que cambiarlo a mano en public/llms.txt y avisar al agente cotizador (docs/agente-cotizador.md).

export type Plan = {
  slug: string;
  nivel: string;            // Básico, Medio, Alto
  nombre: string;           // nombre comercial
  keyword: string;
  title: string;
  description: string;
  h1: string; h1em: string;
  definicion: string;
  para: string;
  clp: number; usd: number;
  plazo: string;
  cambios: string;
  paginas: string;
  destacado?: boolean;
  resumen: string[];        // 4-5 puntos para la tarjeta
  incluye: { t: string; d: string }[];
  noIncluye: string[];
  ideal: string[];
  faq: { q: string; a: string }[];
};

export const MENSUAL = {
  nombre: 'Plan Web Activa',
  clp: 14990, usd: 19,
  incluye: [
    'Hosting con panel cPanel y certificado de seguridad (SSL)',
    'Hasta 5 correos con tu dominio (ej.: ventas@tuempresa.cl)',
    'Respaldos y actualizaciones de seguridad',
    'Pequeños cambios de textos o imágenes (hasta 30 min al mes)',
    'Soporte por WhatsApp',
  ],
  nota: 'El dominio (.cl o .com) se compra a nombre de tu empresa: cuesta cerca de $12.000 al año en NIC Chile.',
};

export const PLANES: Plan[] = [
  {
    slug: 'landing-page',
    nivel: 'Básico',
    nombre: 'Landing page',
    keyword: 'landing page Chile',
    title: 'Landing page profesional en Chile desde $290.000 | IntegriAI',
    description: 'Landing page a medida para tu negocio: diseño propio, adaptada a celular, WhatsApp, formulario y SEO básico. Desde $290.000 + IVA, lista en 7 a 10 días hábiles.',
    h1: 'Landing page profesional', h1em: 'para empezar a vender.',
    definicion: 'Una landing page es una página web de una sola sección larga, pensada para un objetivo: que el visitante te escriba, cotice o compre. Es la forma más rápida y económica de tener presencia profesional en internet y recibir contactos.',
    para: 'Emprendedores, profesionales independientes, campañas de publicidad y empresas que lanzan un servicio puntual.',
    clp: 290000, usd: 390,
    plazo: '7 a 10 días hábiles',
    cambios: '1 ronda de cambios',
    paginas: '1 página, hasta 6 secciones',
    resumen: ['1 página con hasta 6 secciones', 'Diseño propio con tu logo y colores', 'WhatsApp y formulario de contacto', 'SEO básico y Google Analytics', 'Lista en 7 a 10 días hábiles'],
    incluye: [
      { t: 'Diseño a medida', d: 'Con tu logo, colores y estilo. No es una plantilla genérica con tu nombre encima.' },
      { t: 'Adaptada a celular', d: 'Se ve y funciona bien en teléfonos, tablets y computadores.' },
      { t: 'Contacto directo', d: 'Botón de WhatsApp y formulario que llega a tu correo.' },
      { t: 'SEO básico', d: 'Título, descripción, sitemap y alta en Google Search Console para que Google la encuentre.' },
      { t: 'Medición', d: 'Google Analytics instalado para saber cuántas visitas y contactos recibes.' },
      { t: 'Seguridad y velocidad', d: 'Certificado SSL (candado) y carga rápida, incluso con internet móvil.' },
    ],
    noIncluye: ['Redacción de textos (se cotiza aparte)', 'Fotografía profesional', 'Hosting y correos (Plan Web Activa, opcional)'],
    ideal: ['Lanzar un servicio o producto', 'Campañas en Google o Meta', 'Tener presencia profesional rápido'],
    faq: [
      { q: '¿Qué diferencia hay entre una landing page y una página web?', a: 'Una landing page es una sola página enfocada en un objetivo (que te contacten o compren). Una página web corporativa tiene varias páginas: inicio, nosotros, servicios, contacto, y sirve para posicionar más búsquedas en Google.' },
      { q: '¿Cuánto cuesta una landing page en Chile?', a: 'En Chile una landing page suele costar entre $130.000 y $400.000 + IVA según quién la haga y qué incluya. En IntegriAI parte desde $290.000 + IVA con diseño propio, WhatsApp, formulario, SEO básico y Analytics.' },
      { q: '¿Sirve para hacer publicidad en Google o Instagram?', a: 'Sí, es su uso principal. Una landing enfocada convierte mejor que enviar el anuncio a la página de inicio de un sitio grande.' },
      { q: '¿Puedo ampliarla después a una web corporativa?', a: 'Sí. Si después necesitas más páginas, se descuenta lo pagado y se amplía al plan Web corporativa.' },
    ],
  },
  {
    slug: 'web-corporativa',
    nivel: 'Medio',
    nombre: 'Web corporativa',
    keyword: 'página web corporativa',
    title: 'Página web corporativa para empresas desde $590.000 | IntegriAI',
    description: 'Página web corporativa a medida para pymes: hasta 6 páginas, textos para SEO, formulario conectado, Google Business Profile y Analytics. Desde $590.000 + IVA.',
    h1: 'Página web corporativa', h1em: 'que te trae clientes.',
    definicion: 'Una página web corporativa es el sitio de una empresa con varias páginas (inicio, nosotros, servicios y contacto) que explica qué hace, genera confianza y aparece en Google cuando alguien busca lo que vendes.',
    para: 'Pymes y empresas de servicios que necesitan explicar bien lo que hacen y recibir contactos desde Google.',
    clp: 590000, usd: 790,
    plazo: '2 a 3 semanas',
    cambios: '2 rondas de cambios',
    paginas: 'Hasta 6 páginas',
    destacado: true,
    resumen: ['Hasta 6 páginas (inicio, servicios, nosotros…)', 'Textos ordenados para Google', 'Formulario conectado a correo o CRM', 'Google Business Profile, Analytics y Search Console', 'Lista en 2 a 3 semanas'],
    incluye: [
      { t: 'Hasta 6 páginas', d: 'Inicio, nosotros, servicios, contacto y las que tu negocio necesite, cada una con su objetivo.' },
      { t: 'Textos para Google', d: 'Ordenamos y ajustamos tus textos para que cada página responda a una búsqueda real.' },
      { t: 'SEO completo en cada página', d: 'Títulos, descripciones, datos estructurados, sitemap y velocidad optimizada.' },
      { t: 'Contactos que no se pierden', d: 'Formulario conectado a tu correo y a una planilla o CRM, más WhatsApp.' },
      { t: 'Google Business Profile', d: 'Creamos o mejoramos tu ficha en Google Maps para aparecer en búsquedas locales.' },
      { t: 'Diseño con movimiento', d: 'Diseño a medida con animaciones suaves que hacen la diferencia frente a la competencia.' },
    ],
    noIncluye: ['Fotografía profesional', 'Más de 6 páginas (se cotiza por página)', 'Hosting y correos (Plan Web Activa, opcional)'],
    ideal: ['Pymes que quieren aparecer en Google', 'Empresas de servicios', 'Renovar una web antigua'],
    faq: [
      { q: '¿Cuánto cuesta una página web corporativa en Chile?', a: 'En Chile un sitio corporativo suele costar entre $350.000 y $1.000.000 + IVA. En IntegriAI parte desde $590.000 + IVA con hasta 6 páginas, textos para SEO, formulario conectado y Google Business Profile.' },
      { q: '¿Me ayudan con los textos?', a: 'Sí. Ordenamos y ajustamos tus textos para que se entiendan y para que cada página apunte a una búsqueda en Google. Si no tienes textos, los redactamos contigo a partir de una entrevista.' },
      { q: '¿Cuándo aparece mi web en Google?', a: 'La dejamos lista para Google y la enviamos a Search Console el día de la entrega. Aparecer en buenas posiciones depende de la competencia de tu rubro y suele tomar semanas o meses; la ficha de Google Business ayuda a aparecer antes en búsquedas locales.' },
      { q: '¿Puedo editar la web yo mismo?', a: 'Sí. Te entregamos un panel simple para cambiar textos, imágenes y publicar novedades, con una capacitación.' },
    ],
  },
  {
    slug: 'tienda-online',
    nivel: 'Alto',
    nombre: 'Tienda online o web avanzada',
    keyword: 'tienda online Chile',
    title: 'Tienda online y web a medida en Chile desde $1.190.000 | IntegriAI',
    description: 'Tienda online con Webpay o Mercado Pago, o web avanzada con reservas, cotizador o portal de clientes. Integrada a tus sistemas. Desde $1.190.000 + IVA.',
    h1: 'Tienda online y web avanzada', h1em: 'conectada a tu negocio.',
    definicion: 'Una tienda online es un sitio donde tus clientes eligen productos, pagan con Webpay, Mercado Pago o transferencia y reciben su pedido. Una web avanzada suma funciones a medida, como reservas, cotizador o portal de clientes, conectadas a tus sistemas.',
    para: 'Empresas que venden productos online o que necesitan que su web haga más que mostrar información.',
    clp: 1190000, usd: 1590,
    plazo: '4 a 6 semanas',
    cambios: '3 rondas de cambios',
    paginas: 'Tienda completa o funciones a medida',
    resumen: ['Todo lo del plan Medio', 'Pagos con Webpay, Mercado Pago o transferencia', 'Carga de hasta 50 productos', 'O funciones a medida: reservas, cotizador, portal', 'Conectada a tu CRM, WhatsApp o sistema'],
    incluye: [
      { t: 'Pagos en línea', d: 'Una pasarela de pago a elección (Webpay, Mercado Pago o Flow) más transferencia, con correos de confirmación.' },
      { t: 'Catálogo y stock', d: 'Carga de hasta 50 productos con variantes, categorías, despacho y retiro configurados.' },
      { t: 'Panel de administración', d: 'Administra productos, pedidos, clientes y stock desde un panel simple.' },
      { t: 'Funciones a medida', d: 'Reservas, cotizador automático, portal de clientes o lo que tu negocio necesite.' },
      { t: 'Integraciones', d: 'Pedidos y contactos que llegan solos a tu CRM, WhatsApp, planilla o sistema de gestión.' },
      { t: 'Experiencia que se recuerda', d: 'Efectos interactivos y animaciones como las de esta misma web, sin sacrificar velocidad.' },
    ],
    noIncluye: ['Comisiones de la pasarela de pago', 'Más de 1 pasarela de pago (se cotiza aparte)', 'Fotografía de productos', 'Más de 50 productos (se cotiza la carga)'],
    ideal: ['Vender productos online', 'Reservas o agendamiento', 'Cotizaciones automáticas'],
    faq: [
      { q: '¿Cuánto cuesta una tienda online en Chile?', a: 'En Chile una tienda online suele costar desde $400.000 hasta más de $1.200.000 + IVA, según la cantidad de productos, la pasarela de pago y las integraciones. En IntegriAI parte desde $1.190.000 + IVA con pagos, carga de hasta 50 productos, panel de administración e integraciones.' },
      { q: '¿Qué medios de pago puedo usar?', a: 'El plan incluye una pasarela a elección (Webpay de Transbank, Mercado Pago o Flow) más transferencia bancaria. Otra pasarela adicional se cotiza aparte. Las comisiones de cada pasarela las cobra directamente el proveedor de pagos.' },
      { q: '¿Se conecta con mi sistema de inventario o facturación?', a: 'Sí, es una de nuestras especialidades: conectamos la tienda con tu ERP, CRM, planillas o sistema de facturación para que el stock y los pedidos se actualicen solos.' },
      { q: '¿Usan Shopify, WooCommerce o desarrollo propio?', a: 'Depende de tu caso. Recomendamos la plataforma según tus productos, presupuesto y crecimiento, y te explicamos los costos mensuales de cada opción antes de empezar.' },
    ],
  },
];

export const WEB_FAQ = [
  { q: '¿Cuánto cuesta una página web en Chile?', a: 'Depende del tipo. En Chile, una landing page suele costar entre $130.000 y $400.000 + IVA, una página web corporativa entre $350.000 y $1.000.000, y una tienda online desde $400.000 hasta más de $1.200.000. En IntegriAI los planes parten en $290.000, $590.000 y $1.190.000 + IVA.' },
  { q: '¿Los precios incluyen IVA?', a: 'No. Los precios en pesos son netos y se suma el IVA. Para empresas fuera de Chile cobramos en dólares (USD).' },
  { q: '¿Qué pasa con el dominio y el hosting?', a: 'El dominio se compra a nombre de tu empresa (cerca de $12.000 al año para un .cl). El hosting, los correos con tu dominio, los respaldos y el soporte están en el Plan Web Activa, desde $14.990 + IVA al mes. Si ya tienes hosting, podemos usar el tuyo.' },
  { q: '¿Puedo tener correos con mi dominio?', a: 'Sí. Con el Plan Web Activa tienes casillas como ventas@tuempresa.cl o contacto@tuempresa.cl. Si prefieres Google Workspace o Microsoft 365, lo configuramos.' },
  { q: '¿Cómo se paga?', a: '50% al iniciar y 50% al entregar, con factura. Cada proyecto parte con una propuesta por escrito con lo que incluye, plazos y precio.' },
  { q: '¿La web es mía?', a: 'Sí. El dominio queda a tu nombre y la web es tuya. Si algún día quieres llevarla a otro proveedor, te entregamos todo.' },
];

export const fmtCLP = (n: number) => '$' + n.toLocaleString('es-CL');
export const fmtUSD = (n: number) => 'US$' + n.toLocaleString('en-US');
