// Contenido de las landings de servicios. Cada línea responde a una búsqueda principal (keyword) y a varias secundarias.
// Estructura de cada página: definición → problemas → qué incluye → cómo trabajamos → ejemplo real → preguntas → servicios relacionados.

export type Linea = {
  slug: string;
  nav: string;                 // nombre corto (menú, migas)
  eyebrow: string;
  title: string;               // <title>, ~60 caracteres
  description: string;         // meta descripción, ~155 caracteres
  keyword: string;             // búsqueda principal
  h1: string; h1em: string;
  definicion: string;          // 1-2 frases que pueden citar Google y los buscadores con IA
  lead: string;
  mock: 'dash' | 'flow' | 'wa' | 'web';
  servicio: string;            // valor del select del formulario de diagnóstico
  problemas: { antes: string; despues: string }[];
  incluye: { t: string; d: string }[];
  ejemplo: { badge: string; t: string; d: string; puntos: string[]; link?: string };
  beneficios: { n: string; t: string; d: string }[];
  faq: { q: string; a: string }[];
};

export const LINEAS: Linea[] = [
  {
    slug: 'digital',
    nav: 'Sistemas, ERP y web',
    eyebrow: 'Línea Digital · Software a medida',
    title: 'Software a medida, ERP y CRM para pymes en Chile | IntegriAI',
    description: 'Desarrollamos ERP, CRM, sistemas de gestión, portales y tiendas online a medida para pymes de Chile. Toda tu operación en un solo sistema, hecho como trabajas.',
    keyword: 'desarrollo de software a medida para empresas',
    h1: 'Software a medida, ERP y CRM', h1em: 'para tu empresa.',
    definicion: 'Un sistema a medida es un software construido según cómo trabaja tu empresa, en vez de obligarte a trabajar como dice un programa genérico. En IntegriAI desarrollamos ERP, CRM, portales y tiendas online para pymes que quieren dejar las planillas y tener su operación en un solo lugar.',
    lead: 'Cotizaciones, compras, inventario, personal, clientes y ventas en un sistema que crece contigo, módulo por módulo.',
    mock: 'dash',
    servicio: 'sistemas',
    problemas: [
      { antes: 'La información está repartida en planillas que nadie actualiza igual', despues: 'Un solo sistema con los datos al día para todo el equipo' },
      { antes: 'No sabes con certeza cuánto stock tienes ni qué cotizaciones siguen abiertas', despues: 'Paneles con tus números en tiempo real' },
      { antes: 'Probaste un software genérico y terminaste adaptándote a él', despues: 'Un sistema que sigue tu forma de trabajar' },
      { antes: 'Tu web no trae clientes o no se conecta con nada', despues: 'Una web que aparece en Google y lleva cada contacto a tu sistema' },
    ],
    incluye: [
      { t: 'ERP a medida', d: 'Cotizaciones, órdenes de compra, proveedores, inventario, personal y finanzas conectados.' },
      { t: 'CRM a medida', d: 'Clientes, oportunidades y seguimiento comercial con el proceso de venta de tu empresa.' },
      { t: 'Sistemas de gestión', d: 'Paneles administrativos para controlar trabajos, obras, pedidos o servicios.' },
      { t: 'Portales de clientes y proveedores', d: 'Acceso propio para que consulten estados, documentos y pedidos sin llamarte.' },
      { t: 'Aplicaciones web', d: 'Herramientas internas o productos digitales que funcionan desde el computador y el celular.' },
      { t: 'Web y tiendas online', d: 'Sitios rápidos, pensados para Google, con pagos y formularios conectados a tu sistema.' },
    ],
    ejemplo: {
      badge: 'Desarrollo propio · en uso',
      t: 'ERP de MAMKAM',
      d: 'MAMKAM vende e instala pavimentos de caucho, pasto sintético y toldos. Su operación vivía en planillas y chats. Construimos un ERP propio que hoy usa todo el equipo.',
      puntos: ['CRM con leads de Meta y agente de IA en WhatsApp', 'Cotizaciones, productos y órdenes de compra', 'Proyectos con análisis de costos', 'Recursos humanos, asistencia y finanzas'],
      link: '/casos/erp-mamkam/',
    },
    beneficios: [
      { n: '01', t: 'Menos horas en tareas administrativas', d: 'El dato se ingresa una vez y queda disponible para todos.' },
      { n: '02', t: 'Decisiones con números reales', d: 'Ventas, stock y márgenes a la vista, sin esperar el cierre del mes.' },
      { n: '03', t: 'Un sistema que es tuyo', d: 'Crece con nuevos módulos cuando lo necesitas, sin licencias por usuario que se disparan.' },
    ],
    faq: [
      { q: '¿Qué es un ERP a medida?', a: 'Es un sistema que reúne en un solo lugar la operación de tu empresa (cotizaciones, compras, inventario, personal y finanzas) y que se construye según tus procesos reales, en vez de adaptar tu empresa a un software genérico.' },
      { q: '¿Cuándo conviene un sistema a medida y no uno genérico?', a: 'Cuando tu forma de trabajar es parte de tu ventaja, cuando los programas genéricos te obligan a usar planillas por fuera o cuando necesitas conectar varias áreas que hoy funcionan por separado.' },
      { q: '¿Cuánto demora desarrollar un sistema de gestión?', a: 'Trabajamos por módulos. El primer módulo funcionando suele estar en semanas, no meses, y después se agregan los siguientes según prioridad.' },
      { q: '¿Qué diferencia hay entre un ERP y un CRM?', a: 'El ERP ordena la operación interna (compras, inventario, personal, finanzas). El CRM ordena la relación con clientes y el proceso de venta. Muchas pymes parten por uno y después los conectan.' },
      { q: '¿El sistema funciona en el celular?', a: 'Sí. Son aplicaciones web en la nube: funcionan desde el computador, la tablet o el celular, desde cualquier sucursal.' },
    ],
  },
  {
    slug: 'automatizacion',
    nav: 'Automatización',
    eyebrow: 'Línea Automatización · Procesos',
    title: 'Automatización de procesos para pymes en Chile | IntegriAI',
    description: 'Automatizamos procesos comerciales, administrativos y de WhatsApp para pymes: seguimiento de cotizaciones, documentos, reportes e integración entre sistemas.',
    keyword: 'automatización de procesos para pymes',
    h1: 'Automatización de procesos', h1em: 'para pymes.',
    definicion: 'Automatizar un proceso es hacer que las tareas repetidas se ejecuten solas: el dato se ingresa una vez y llega a donde se necesita, sin copiarlo a mano. En IntegriAI automatizamos ventas, administración, WhatsApp, documentos e integraciones entre los sistemas que ya usas.',
    lead: 'Menos tareas repetidas, menos errores y un equipo que dedica su tiempo a lo que de verdad importa.',
    mock: 'flow',
    servicio: 'automatizacion',
    problemas: [
      { antes: 'Pasas datos a mano de WhatsApp o del correo a una planilla', despues: 'Cada solicitud queda registrada sola, con su origen' },
      { antes: 'Las cotizaciones se envían y nadie hace seguimiento', despues: 'Avisos automáticos de seguimiento en el momento justo' },
      { antes: 'Armar el reporte semanal toma una mañana completa', despues: 'Reportes y documentos que se generan solos' },
      { antes: 'Tus programas no se hablan entre sí', despues: 'Sistemas conectados que comparten la información' },
    ],
    incluye: [
      { t: 'Automatización de ventas', d: 'Captura de contactos, asignación a vendedores, cotizaciones y seguimiento automático.' },
      { t: 'WhatsApp para empresas', d: 'WhatsApp conectado a tu CRM o sistema: mensajes, avisos y respuestas que quedan registradas.' },
      { t: 'Automatización administrativa', d: 'Facturas, cobranzas, aprobaciones y tareas internas que avanzan sin perseguir a nadie.' },
      { t: 'Documentos y reportes', d: 'Cotizaciones, contratos, informes y paneles que se arman con tus datos reales.' },
      { t: 'Integración de sistemas y APIs', d: 'Conectamos tu ERP, CRM, tienda online, planillas y herramientas que ya usas.' },
      { t: 'Flujos automáticos', d: 'Reglas del tipo "cuando pase esto, haz esto otro" diseñadas para tu operación.' },
    ],
    ejemplo: {
      badge: 'SaaS propio',
      t: 'FlowPedido',
      d: 'Plataforma de pedidos online para restaurantes. El pedido entra por la web, llega solo a cocina, se cobra en línea y queda en la administración, sin que nadie lo transcriba.',
      puntos: ['Pedidos online directo a cocina', 'Pagos integrados', 'Administración y reportes', 'Sin comisiones de apps de terceros'],
    },
    beneficios: [
      { n: '01', t: 'Horas libres cada semana', d: 'El equipo deja de copiar datos y se enfoca en vender y atender.' },
      { n: '02', t: 'Menos errores', d: 'Lo que se ingresa una vez no se vuelve a escribir, así que no se equivoca.' },
      { n: '03', t: 'Ningún cliente olvidado', d: 'Cada solicitud tiene seguimiento, aunque el equipo esté ocupado.' },
    ],
    faq: [
      { q: '¿Qué procesos de una pyme se pueden automatizar?', a: 'Los más comunes son el registro de solicitudes de clientes, el seguimiento de cotizaciones, los avisos por WhatsApp o correo, la generación de documentos y reportes, la cobranza y el traspaso de datos entre sistemas.' },
      { q: '¿Necesito cambiar los programas que ya uso?', a: 'No necesariamente. Muchas veces conectamos lo que ya tienes (planillas, correo, WhatsApp, tu tienda o tu sistema contable) y solo construimos lo que falta.' },
      { q: '¿Se puede automatizar WhatsApp?', a: 'Sí, con la API oficial de WhatsApp Business: mensajes de aviso, respuestas automáticas y conversaciones que quedan registradas en tu sistema, con una persona disponible cuando hace falta.' },
      { q: '¿Cuánto cuesta automatizar un proceso?', a: 'Depende del proceso y de los sistemas involucrados. Partimos con un diagnóstico sin costo y te enviamos una propuesta por escrito con etapas, plazos y precio.' },
    ],
  },
  {
    slug: 'inteligencia-artificial',
    nav: 'Agentes de IA',
    eyebrow: 'Línea Inteligencia artificial · Agentes',
    title: 'Agentes de IA para empresas: WhatsApp y ventas | IntegriAI',
    description: 'Implementamos agentes de inteligencia artificial para empresas: atención y ventas por WhatsApp, conectados a tus datos y con supervisión de cada conversación.',
    keyword: 'agentes de IA para empresas',
    h1: 'Agentes de inteligencia artificial', h1em: 'para empresas.',
    definicion: 'Un agente de IA es un asistente que entiende lo que le escriben, consulta la información real de tu empresa y ejecuta tareas, como responder una consulta, cotizar o derivar a una persona. En IntegriAI implementamos agentes para atención, ventas y administración, conectados a tus sistemas y siempre supervisados.',
    lead: 'La inteligencia artificial como herramienta para atender mejor y vender más, no como un experimento aislado.',
    mock: 'wa',
    servicio: 'agentes-ia',
    problemas: [
      { antes: 'Respondes las mismas preguntas todo el día por WhatsApp', despues: 'Un agente responde al instante, a cualquier hora' },
      { antes: 'Los mensajes de la noche y el fin de semana se pierden', despues: 'Cada consulta queda atendida y registrada' },
      { antes: 'Un chatbot de respuestas fijas que frustra a tus clientes', despues: 'Un agente que entiende y usa tus precios, stock y horarios reales' },
      { antes: 'Miedo a que la IA responda cualquier cosa', despues: 'Reglas claras, derivación a una persona y supervisión de cada conversación' },
    ],
    incluye: [
      { t: 'Agentes de atención al cliente', d: 'Responden consultas frecuentes con tu información real y derivan los casos complejos.' },
      { t: 'Agentes de ventas', d: 'Califican interesados, cotizan y agendan, y pasan el cliente al vendedor con todo el contexto.' },
      { t: 'Asistentes virtuales por WhatsApp', d: 'IA conectada a WhatsApp Business, el canal donde ya están tus clientes.' },
      { t: 'Agentes administrativos', d: 'Ordenan documentos, extraen datos y preparan informes para tu equipo.' },
      { t: 'IA para marketing', d: 'Apoyo para crear contenido, campañas e ideas con el tono de tu marca.' },
      { t: 'IA integrada a tus sistemas', d: 'Agentes que leen y escriben en tu ERP, CRM o base de datos, con permisos controlados.' },
    ],
    ejemplo: {
      badge: 'Arquitectura propia',
      t: 'Colegas AI',
      d: 'Arquitectura propia de agentes de IA conectados a WhatsApp, con base de datos, herramientas y un panel para supervisar cada conversación y corregir al agente.',
      puntos: ['Agentes conectados a WhatsApp', 'Herramientas y datos reales', 'Supervisión y observabilidad', 'Derivación a personas'],
    },
    beneficios: [
      { n: '01', t: 'Respuesta inmediata', d: 'Tus clientes no esperan horas por una respuesta simple.' },
      { n: '02', t: 'Tu equipo atiende lo importante', d: 'El agente resuelve lo repetido y deriva lo que necesita a una persona.' },
      { n: '03', t: 'Control total', d: 'Ves cada conversación, ajustas las reglas y decides qué puede hacer el agente.' },
    ],
    faq: [
      { q: '¿Qué hace un agente de IA en una empresa?', a: 'Atiende consultas, califica clientes, cotiza, agenda, ordena información o prepara documentos, usando los datos reales de la empresa y derivando a una persona cuando hace falta.' },
      { q: '¿En qué se diferencia de un chatbot tradicional?', a: 'Un chatbot tradicional sigue un árbol de respuestas fijas. Un agente de IA entiende lo que el cliente escribe con sus propias palabras, consulta tus sistemas y decide qué acción tomar dentro de las reglas que definimos.' },
      { q: '¿La IA puede equivocarse con mis clientes?', a: 'Por eso diseñamos reglas, límites y derivación a personas, y dejamos un panel para revisar cada conversación. El agente solo responde con tu información y escala lo que no sabe.' },
      { q: '¿Funciona con WhatsApp?', a: 'Sí. Usamos la API oficial de WhatsApp Business, así que el agente atiende en el mismo número donde ya te escriben tus clientes.' },
      { q: '¿Cómo implemento inteligencia artificial en mi empresa?', a: 'Partiendo por un proceso concreto con mucho volumen, como la atención por WhatsApp o la calificación de clientes. Hacemos un diagnóstico, definimos qué puede hacer el agente y lo lanzamos supervisado antes de ampliarlo.' },
    ],
  },
];

export const PROCESO = [
  { t: 'Diagnóstico', d: 'Entendemos cómo trabaja hoy tu empresa y qué la frena. Sin costo.' },
  { t: 'Diseño', d: 'Te mostramos pantallas y flujos antes de programar.' },
  { t: 'Desarrollo', d: 'Construimos por módulos y pruebas avances funcionando.' },
  { t: 'Integración', d: 'Conectamos con lo que ya usas y migramos tus datos.' },
  { t: 'Acompañamiento', d: 'Capacitamos al equipo y seguimos mejorando contigo.' },
];
