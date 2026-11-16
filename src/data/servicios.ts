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
  incluye: { t: string; d: string; href?: string }[];
  ejemplo: { badge: string; t: string; d: string; puntos: string[]; link?: string };
  beneficios: { n: string; t: string; d: string }[];
  faq: { q: string; a: string }[];
  padre?: string;              // slug de la línea a la que pertenece (solo en servicios específicos)
  rel?: { href: string; small: string; strong: string }[];   // enlaces extra en "También te puede servir"
};

export const LINEAS: Linea[] = [
  {
    slug: 'digital',
    nav: 'Software a medida',
    eyebrow: 'Línea Digital · Software a medida',
    title: 'Desarrollo de software a medida en Chile | IntegriAI',
    description: 'Desarrollo de software a medida para empresas en Chile: ERP, CRM, sistemas de gestión empresarial, portales y aplicaciones web, hechos como trabaja tu empresa.',
    keyword: 'desarrollo de software a medida',
    h1: 'Desarrollo de software a medida', h1em: 'para empresas.',
    definicion: 'El software a medida es un sistema construido según cómo trabaja tu empresa, en vez de obligarte a trabajar como dice un programa genérico. En IntegriAI desarrollamos ERP, CRM, sistemas de gestión empresarial, portales y aplicaciones web para pymes de Chile que quieren dejar las planillas y tener su operación en un solo lugar.',
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
      { t: 'ERP a medida', d: 'Cotizaciones, órdenes de compra, proveedores, inventario, personal y finanzas conectados.', href: '/servicios/erp-a-medida/' },
      { t: 'CRM a medida', d: 'Clientes, oportunidades y seguimiento comercial con el proceso de venta de tu empresa.', href: '/servicios/crm-a-medida/' },
      { t: 'Sistemas de gestión empresarial', d: 'Paneles administrativos para controlar trabajos, obras, pedidos o servicios.' },
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
      { q: '¿Qué es el desarrollo de software a medida?', a: 'Es construir un sistema pensado para los procesos de tu empresa: lo que vendes, cómo cotizas, cómo compras y cómo se coordina tu equipo. El resultado es un programa que sigue tu forma de trabajar y crece por módulos, en vez de uno genérico al que tienes que adaptarte.' },
      { q: '¿Cuándo conviene un sistema a medida y no uno genérico?', a: 'Cuando tu forma de trabajar es parte de tu ventaja, cuando los programas genéricos te obligan a usar planillas por fuera o cuando necesitas conectar varias áreas que hoy funcionan por separado.' },
      { q: '¿Cuánto demora desarrollar un sistema de gestión?', a: 'Trabajamos por módulos. El primer módulo funcionando suele estar en semanas, no meses, y después se agregan los siguientes según prioridad.' },
      { q: '¿Qué diferencia hay entre un ERP y un CRM?', a: 'El ERP ordena la operación interna (compras, inventario, personal, finanzas). El CRM ordena la relación con clientes y el proceso de venta. Muchas pymes parten por uno y después los conectan.' },
      { q: '¿El sistema funciona en el celular?', a: 'Sí. Son aplicaciones web en la nube: funcionan desde el computador, la tablet o el celular, desde cualquier sucursal.' },
    ],
    rel: [
      { href: '/servicios/erp-a-medida/', small: 'ERP a medida', strong: 'Toda la gestión de tu pyme en un solo sistema.' },
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

// Servicios específicos: una página por búsqueda con intención de compra (ver docs/seo-mapa-landings-2026-11.md).
// Usan la misma plantilla que las líneas, pero no aparecen como línea en /servicios/.
export const ESPECIFICOS: Linea[] = [
  {
    slug: 'erp-a-medida',
    padre: 'digital',
    nav: 'ERP a medida',
    eyebrow: 'Software a medida · ERP',
    title: 'ERP a medida para pymes en Chile | IntegriAI',
    description: 'Desarrollamos ERP a medida para pymes en Chile: cotizaciones, compras, inventario, proyectos, personal y finanzas en un solo sistema, construido por módulos.',
    keyword: 'erp a medida',
    h1: 'ERP a medida', h1em: 'para pymes en Chile.',
    definicion: 'Un ERP a medida es un sistema de gestión que reúne en un solo lugar las cotizaciones, compras, inventario, proyectos, personal y finanzas de tu empresa, construido según cómo trabajas. A diferencia de un ERP de caja, no te obliga a cambiar tus procesos ni cobra licencias por cada usuario.',
    lead: 'Lo construimos por módulos: el primero funcionando en semanas y el resto según prioridad. Así hicimos el ERP de MAMKAM, que hoy opera el 100% de su gestión en él.',
    mock: 'dash',
    servicio: 'sistemas',
    problemas: [
      { antes: 'Cada área trabaja en su propia planilla y los números no cuadran', despues: 'Ventas, bodega, compras y finanzas sobre la misma información' },
      { antes: 'Probaste un ERP de caja y terminaste usando Excel por fuera', despues: 'Un sistema que sigue tus procesos, no al revés' },
      { antes: 'Sabes cuánto ganaste en un proyecto o venta recién a fin de mes', despues: 'Costos y márgenes de cada proyecto a la vista' },
      { antes: 'El equipo en terreno informa por WhatsApp, papel o llamadas', despues: 'Apps en el celular conectadas al mismo sistema' },
    ],
    incluye: [
      { t: 'Ventas y cotizaciones', d: 'Cotizaciones con ítems, condiciones de pago y estados, en PDF y enviadas por WhatsApp o correo desde el sistema.', href: '/servicios/software-de-cotizaciones/' },
      { t: 'CRM', d: 'Clientes, oportunidades y seguimiento comercial. Los contactos de tu web o de tus anuncios pueden llegar solos.', href: '/servicios/crm-a-medida/' },
      { t: 'Compras y proveedores', d: 'Órdenes de compra, proveedores, comprobantes de pago y facturas en un solo lugar.' },
      { t: 'Inventario y bodega', d: 'Productos, stock por bodega, entradas y salidas, conectados a ventas y compras.', href: '/servicios/sistema-de-inventario/' },
      { t: 'Proyectos y costos', d: 'Cada trabajo con responsable, tareas, avance y los gastos asociados, para saber cuánto costó realmente.', href: '/servicios/software-para-constructoras/' },
      { t: 'Personal y asistencia', d: 'Trabajadores, permisos, asistencia, vacaciones y cálculo de remuneraciones a partir de las marcaciones.' },
      { t: 'Finanzas', d: 'Cuentas bancarias, libro diario, gastos clasificados y calendario de pagos recurrentes.' },
      { t: 'Apps para terreno', d: 'Asistencia con GPS, rendición de gastos con foto de la boleta o informes de visita desde el celular.' },
      { t: 'Integraciones', d: 'Conexión con WhatsApp, anuncios de Meta, tu web o tienda online y otros sistemas que ya usas.' },
    ],
    ejemplo: {
      badge: 'Desarrollo propio · en uso',
      t: 'ERP de MAMKAM',
      d: 'MAMKAM vende e instala pavimentos de caucho, pasto sintético y toldos. Pasó de planillas y chats a un ERP propio con CRM conectado a Meta, agente de IA en WhatsApp, proyectos con costos, personal, finanzas y dos apps para su equipo en terreno.',
      puntos: ['Del anuncio en Meta al CRM, la cotización y el proyecto', 'Compras asociadas a cada proyecto', 'Remuneraciones calculadas desde la asistencia', 'Libro diario con cartolas importadas'],
      link: '/casos/erp-mamkam/',
    },
    beneficios: [
      { n: '01', t: 'Un solo lugar para toda la operación', d: 'El dato se ingresa una vez y lo ve quien lo necesita, sin reenviar planillas.' },
      { n: '02', t: 'Inversión por etapas', d: 'Partes por el módulo que más te urge y sumas los demás cuando el primero ya está funcionando.' },
      { n: '03', t: 'Crece con tu empresa', d: 'Si aparece una necesidad nueva, se agrega un módulo en vez de cambiar de programa.' },
    ],
    faq: [
      { q: '¿Qué es un ERP a medida?', a: 'Es un sistema de gestión que reúne la operación de tu empresa (ventas, compras, inventario, proyectos, personal y finanzas) y que se construye según tus procesos reales, en vez de adaptar tu empresa a un software genérico.' },
      { q: '¿Conviene un ERP a medida o uno de caja?', a: 'Un ERP de caja funciona bien si tus procesos son estándar. Un ERP a medida conviene cuando trabajas por proyectos o con productos configurables, cuando el programa genérico te obliga a usar planillas por fuera o cuando necesitas conectar áreas que hoy funcionan por separado.' },
      { q: '¿Cuánto cuesta un ERP a medida?', a: 'Depende de los módulos que necesites y de con qué sistemas se tenga que conectar. Partimos con un diagnóstico sin costo y te enviamos una propuesta por escrito con etapas, plazos y precio. Como se construye por módulos, puedes empezar por uno y repartir la inversión.' },
      { q: '¿Cuánto demora desarrollar un ERP?', a: 'El primer módulo funcionando suele estar en semanas, no meses. Los siguientes se suman según prioridad, y cada etapa termina con algo que tu equipo ya puede usar.' },
      { q: '¿Puedo pasar al sistema la información que tengo en Excel?', a: 'Sí. Revisamos tus planillas en el diagnóstico y migramos los datos que sirven (clientes, productos, proveedores o trabajadores) al nuevo sistema.' },
      { q: '¿Hay que pagar licencias por usuario?', a: 'No cobramos licencias por usuario. Los costos mensuales son los del servidor y la base de datos, más el soporte si lo contratas, y te los detallamos en la propuesta.' },
      { q: '¿Funciona en el celular?', a: 'Sí. Es una aplicación web en la nube que funciona en computador, tablet y celular. Para el equipo en terreno también se pueden hacer apps móviles.' },
    ],
    rel: [
      { href: '/casos/erp-mamkam/', small: 'Caso de estudio', strong: 'Cómo MAMKAM pasó de planillas a un ERP propio.' },
      { href: '/guias/erp-vs-crm/', small: 'Guía', strong: 'ERP vs CRM: cuál necesita tu pyme.' },
    ],
  },
  {
    slug: 'sistema-de-inventario',
    padre: 'digital',
    nav: 'Sistema de inventario',
    eyebrow: 'Software a medida · Inventario y bodega',
    title: 'Sistema de inventario a medida para pymes | IntegriAI',
    description: 'Sistema de inventario y bodega a medida para pymes en Chile: stock al día, entradas y salidas, compras y ventas conectadas, sin planillas que no cuadran.',
    keyword: 'sistema de inventario a medida',
    h1: 'Sistema de inventario', h1em: 'a medida para tu bodega.',
    definicion: 'Un sistema de inventario a medida registra lo que entra y sale de tu bodega y lo conecta con tus compras y ventas, para que el stock esté al día sin contarlo a mano. Se construye según cómo manejas tus productos: por bodega, por proyecto, por lote o con variantes.',
    lead: 'Conectado a tus cotizaciones y órdenes de compra, para que el stock se mueva solo cuando vendes o compras.',
    mock: 'dash',
    servicio: 'sistemas',
    problemas: [
      { antes: 'El stock de la planilla nunca coincide con lo que hay en la bodega', despues: 'Entradas y salidas registradas en el momento, con quién y cuándo' },
      { antes: 'Vendes algo que no tienes o compras lo que ya tenías', despues: 'Stock disponible a la vista al cotizar y al comprar' },
      { antes: 'Para saber qué reponer hay que revisar todo a mano', despues: 'Avisos de stock mínimo y listado de lo que hay que comprar' },
      { antes: 'Los programas de inventario de caja no calzan con tu forma de trabajar', despues: 'Un sistema hecho para tus productos, bodegas y procesos' },
    ],
    incluye: [
      { t: 'Catálogo de productos', d: 'Productos con variantes, unidades, costos y precios, ordenados por categoría.' },
      { t: 'Entradas y salidas', d: 'Recepción de compras, despachos, devoluciones y ajustes, cada uno con su responsable.' },
      { t: 'Varias bodegas', d: 'Stock por bodega, sucursal o vehículo, con traspasos entre ellas.' },
      { t: 'Compras y proveedores', d: 'Órdenes de compra conectadas al stock: lo que llega se suma solo.' },
      { t: 'Conectado a ventas', d: 'Cotizaciones, pedidos o tu tienda online descuentan stock sin digitar dos veces.' },
      { t: 'Reportes', d: 'Stock valorizado, productos sin movimiento y lo que hay que reponer.' },
    ],
    ejemplo: {
      badge: 'Desarrollo propio · en uso',
      t: 'ERP de MAMKAM',
      d: 'En el ERP de MAMKAM construimos el catálogo de productos, los proveedores y las órdenes de compra, conectados a las cotizaciones: una cotización aprobada se convierte en orden de compra sin volver a escribirla.',
      puntos: ['Catálogo de productos y proveedores', 'Órdenes de compra desde una cotización aprobada', 'Comprobantes de pago y facturas del proveedor', 'Compras asociadas a cada proyecto'],
      link: '/casos/erp-mamkam/',
    },
    beneficios: [
      { n: '01', t: 'Stock en el que puedes confiar', d: 'Cada movimiento queda registrado, así que el número del sistema es el de la bodega.' },
      { n: '02', t: 'Menos quiebres y sobrestock', d: 'Sabes qué reponer antes de quedarte sin producto y qué no conviene volver a comprar.' },
      { n: '03', t: 'Parte del resto de tu operación', d: 'El inventario se conecta con ventas, compras y finanzas, y puede crecer hasta ser un ERP completo.' },
    ],
    faq: [
      { q: '¿Qué es un sistema de inventario a medida?', a: 'Es un software que controla el stock de tu empresa construido según cómo manejas tus productos y bodegas, en vez de un programa genérico que te obliga a adaptarte o a llevar planillas por fuera.' },
      { q: '¿Conviene uno a medida o un software de inventario de suscripción?', a: 'Si vendes productos estándar desde una sola bodega, un software de suscripción puede bastar. Uno a medida conviene cuando trabajas con proyectos, productos configurables, varias bodegas o vehículos, o cuando el inventario tiene que conectarse con cotizaciones y compras propias.' },
      { q: '¿Se puede usar desde el celular en la bodega?', a: 'Sí. Es una aplicación web que funciona en el celular o la tablet, así que se puede registrar una entrada o una salida en el momento, desde la bodega.' },
      { q: '¿Puedo cargar mi inventario actual desde Excel?', a: 'Sí. En el diagnóstico revisamos tus planillas y migramos productos, proveedores y stock inicial al nuevo sistema.' },
      { q: '¿Cuánto cuesta un sistema de inventario?', a: 'Depende de cuántas bodegas manejes y con qué se tenga que conectar. Partimos con un diagnóstico sin costo y te enviamos una propuesta por escrito con etapas, plazos y precio.' },
    ],
    rel: [
      { href: '/servicios/erp-a-medida/', small: 'ERP a medida', strong: 'Inventario, ventas, compras y finanzas en un solo sistema.' },
      { href: '/servicios/software-de-cotizaciones/', small: 'Cotizaciones', strong: 'Cotiza con el stock y los precios al día.' },
    ],
  },
  {
    slug: 'software-de-cotizaciones',
    padre: 'digital',
    nav: 'Software de cotizaciones',
    eyebrow: 'Software a medida · Cotizaciones',
    title: 'Software de cotizaciones a medida para empresas | IntegriAI',
    description: 'Software de cotizaciones a medida: cotiza en minutos con tus productos y precios, envía el PDF por WhatsApp o correo y sigue cada cotización hasta cerrarla.',
    keyword: 'software de cotizaciones',
    h1: 'Software de cotizaciones', h1em: 'hecho para tu forma de vender.',
    definicion: 'Un software de cotizaciones permite armar una cotización con tus productos, precios y condiciones en minutos, enviarla en PDF por WhatsApp o correo y saber en qué etapa está cada una. Hecho a medida, sigue tus reglas de precios, descuentos y formas de pago, y se conecta con tu CRM, inventario o ERP.',
    lead: 'Del pedido del cliente a la cotización enviada en minutos, y con seguimiento hasta que se aprueba o se pierde.',
    mock: 'dash',
    servicio: 'sistemas',
    problemas: [
      { antes: 'Armar una cotización en Word o Excel toma media hora y tiene errores', despues: 'Cotizaciones en minutos con tus productos y precios cargados' },
      { antes: 'Cada vendedor cotiza con su propio formato y sus propios precios', despues: 'Un solo formato, con precios y descuentos controlados' },
      { antes: 'Nadie sabe cuántas cotizaciones siguen abiertas ni cuáles se cerraron', despues: 'Cada cotización con su estado y su próximo paso' },
      { antes: 'Cuando el cliente aprueba, hay que volver a escribirlo todo para comprar o ejecutar', despues: 'La cotización aprobada se convierte en orden de compra o en proyecto' },
    ],
    incluye: [
      { t: 'Cotizador con tus reglas', d: 'Productos, servicios, precios por cliente o volumen, descuentos y condiciones de pago, incluso en cuotas.' },
      { t: 'PDF con tu marca', d: 'Cotizaciones con tu logo y formato, listas para enviar por WhatsApp o correo desde el sistema.' },
      { t: 'Estados y seguimiento', d: 'Borrador, enviada, en negociación, aprobada o perdida, con recordatorios para no olvidar ninguna.' },
      { t: 'Conectado a tu CRM', d: 'Cada cotización queda asociada al cliente y a su historial de conversaciones.' },
      { t: 'De cotización a ejecución', d: 'Una cotización aprobada genera la orden de compra, el pedido o el proyecto sin volver a escribirla.' },
      { t: 'Reportes de ventas', d: 'Cuánto cotizaste, cuánto cerraste y por qué se pierden las cotizaciones.' },
    ],
    ejemplo: {
      badge: 'Desarrollo propio · en uso',
      t: 'Cotizaciones de MAMKAM',
      d: 'MAMKAM cotiza desde su ERP con ítems, condiciones de pago por cuotas y un estado para cada etapa. La cotización se descarga en PDF, se envía por WhatsApp o correo, y al aprobarse se convierte en orden de compra y en proyecto. En su web, el cliente arma un proyecto en un carrito y pide su cotización.',
      puntos: ['Estados: borrador, enviada, visita, aprobada, en ejecución y cerrada', 'Envío por WhatsApp o correo desde el sistema', 'Cotización aprobada que pasa a compra y proyecto', 'Carrito en la web para pedir cotización'],
      link: '/casos/erp-mamkam/',
    },
    beneficios: [
      { n: '01', t: 'Respondes antes que la competencia', d: 'Una cotización en minutos llega mientras el cliente todavía está decidiendo.' },
      { n: '02', t: 'Ninguna cotización olvidada', d: 'El sistema te muestra cuáles hay que seguir y cuándo.' },
      { n: '03', t: 'Precios bajo control', d: 'Todos cotizan con los mismos precios y los descuentos quedan registrados.' },
    ],
    faq: [
      { q: '¿Qué hace un software de cotizaciones?', a: 'Permite armar cotizaciones con tus productos y precios cargados, generar el PDF con tu marca, enviarlo al cliente y seguir el estado de cada cotización hasta que se aprueba o se pierde.' },
      { q: '¿Por qué uno a medida y no una app de cotizaciones?', a: 'Las apps genéricas sirven para cotizaciones simples. Uno a medida conviene cuando tus precios dependen de medidas, materiales o volumen, cuando cotizas proyectos con visitas o cuotas, o cuando la cotización aprobada tiene que convertirse en compra, pedido o proyecto en tu sistema.' },
      { q: '¿Se puede enviar la cotización por WhatsApp?', a: 'Sí. La cotización se genera en PDF y se envía por WhatsApp o correo desde el mismo sistema, sin descargarla y adjuntarla a mano.' },
      { q: '¿Se conecta con mi inventario o mi CRM?', a: 'Sí. Puede tomar el stock y los precios de tu inventario, y dejar cada cotización en el historial del cliente en tu CRM.' },
      { q: '¿Cuánto cuesta?', a: 'Depende de tus reglas de precios y de con qué se tenga que conectar. Partimos con un diagnóstico sin costo y te enviamos una propuesta por escrito con etapas, plazos y precio.' },
    ],
    rel: [
      { href: '/servicios/crm-a-medida/', small: 'CRM a medida', strong: 'Clientes, oportunidades y seguimiento en un solo lugar.' },
      { href: '/servicios/erp-a-medida/', small: 'ERP a medida', strong: 'De la cotización a la compra, el proyecto y el pago.' },
    ],
  },
  {
    slug: 'crm-a-medida',
    padre: 'digital',
    nav: 'CRM a medida',
    eyebrow: 'Software a medida · CRM',
    title: 'CRM a medida para pymes, conectado a WhatsApp | IntegriAI',
    description: 'CRM a medida para pymes en Chile: los contactos de tu web, anuncios y WhatsApp llegan solos, cada oportunidad tiene su etapa y ningún cliente queda sin respuesta.',
    keyword: 'crm a medida',
    h1: 'CRM a medida', h1em: 'para que ningún cliente se pierda.',
    definicion: 'Un CRM a medida es un sistema de gestión de clientes construido según tu proceso de venta: recibe los contactos de tu web, tus anuncios y WhatsApp, muestra en qué etapa va cada oportunidad y avisa cuál es el próximo paso. A diferencia de un CRM genérico, sigue tus etapas reales y se conecta con tus cotizaciones y tu operación.',
    lead: 'Los contactos llegan solos, cada uno con su historial, y tu equipo sabe a quién llamar hoy.',
    mock: 'wa',
    servicio: 'sistemas',
    problemas: [
      { antes: 'Los contactos llegan por WhatsApp, formularios, redes y anuncios, y quedan repartidos', despues: 'Todos los contactos en un solo lugar, con su origen' },
      { antes: 'El seguimiento depende de que un vendedor se acuerde', despues: 'Etapas, tareas y avisos para cada oportunidad' },
      { antes: 'Pagas un CRM por usuario y usas una parte mínima', despues: 'Un CRM con tus etapas y nada que sobre' },
      { antes: 'Si un vendedor se va, se lleva la historia de sus clientes', despues: 'El historial de cada cliente queda en la empresa' },
    ],
    incluye: [
      { t: 'Contactos que llegan solos', d: 'Formularios de tu web y de los anuncios de Meta entran directo al CRM, con su origen.' },
      { t: 'Embudo con tus etapas', d: 'Las etapas reales de tu venta, del primer contacto al cierre, con el valor de cada oportunidad.' },
      { t: 'WhatsApp conectado', d: 'Conversaciones y mensajes asociados a cada cliente, con la API oficial de WhatsApp Business.' },
      { t: 'Agente de IA opcional', d: 'Un agente que conversa con los interesados y actualiza su etapa, con supervisión de tu equipo.' },
      { t: 'Cotizaciones', d: 'Cotiza desde la ficha del cliente y sigue cada cotización hasta cerrarla.' },
      { t: 'Reportes comerciales', d: 'Contactos por canal, tasa de cierre y ventas por vendedor.' },
    ],
    ejemplo: {
      badge: 'Desarrollo propio · en uso',
      t: 'CRM de MAMKAM',
      d: 'En MAMKAM, los formularios de los anuncios de Meta llegan directo al CRM. Cada lead tiene su etapa, su historial y su próximo paso, y un agente de IA conversa con los clientes por WhatsApp y actualiza su avance a medida que la conversación progresa.',
      puntos: ['Leads de Facebook e Instagram directo al CRM', 'Agente de IA en WhatsApp que actualiza cada lead', 'Del lead a la cotización sin copiar datos', 'Historial completo de cada cliente'],
      link: '/casos/erp-mamkam/',
    },
    beneficios: [
      { n: '01', t: 'Más ventas con los mismos contactos', d: 'Responder rápido y hacer seguimiento convierte más que conseguir más contactos.' },
      { n: '02', t: 'Sabes qué funciona', d: 'Ves qué canal trae clientes que compran, no solo contactos.' },
      { n: '03', t: 'Conectado a tu operación', d: 'La venta cerrada pasa a cotización, proyecto o pedido sin volver a escribirla.' },
    ],
    faq: [
      { q: '¿Qué es un CRM a medida?', a: 'Es un sistema de gestión de clientes construido según tu proceso de venta: tus canales, tus etapas y tus reglas de seguimiento, conectado a las herramientas que ya usas.' },
      { q: '¿CRM a medida o uno como HubSpot o Zoho?', a: 'Un CRM de suscripción sirve si tu proceso de venta es estándar. Uno a medida conviene cuando necesitas conectarlo con WhatsApp, cotizaciones, inventario o proyectos propios, o cuando pagas muchas licencias por usuario para usar una parte mínima.' },
      { q: '¿Se conecta con WhatsApp y con los anuncios de Meta?', a: 'Sí. Los formularios de los anuncios de Facebook e Instagram pueden entrar directo al CRM, y las conversaciones de WhatsApp quedan asociadas al cliente usando la API oficial de WhatsApp Business.' },
      { q: '¿Qué diferencia hay entre un CRM y un ERP?', a: 'El CRM ordena la relación con clientes y el proceso de venta; el ERP ordena la operación interna (compras, inventario, personal y finanzas). Lo ideal es que compartan la información.' },
      { q: '¿Cuánto cuesta un CRM a medida?', a: 'Depende de tus canales y de con qué se tenga que conectar. Partimos con un diagnóstico sin costo y te enviamos una propuesta por escrito con etapas, plazos y precio.' },
    ],
    rel: [
      { href: '/guias/erp-vs-crm/', small: 'Guía', strong: 'ERP vs CRM: cuál necesita tu pyme.' },
      { href: '/servicios/inteligencia-artificial/', small: 'Agentes de IA', strong: 'Un agente que atiende tu WhatsApp con tu información real.' },
    ],
  },
  {
    slug: 'software-para-constructoras',
    padre: 'digital',
    nav: 'Software para constructoras',
    eyebrow: 'Software a medida · Construcción e instalaciones',
    title: 'Software para constructoras a medida | IntegriAI',
    description: 'Software a medida para constructoras y empresas de instalación: cotizaciones, proyectos con costos por obra, compras, cuadrillas en terreno y asistencia con GPS.',
    keyword: 'software para constructoras',
    h1: 'Software para constructoras', h1em: 'y empresas de instalación.',
    definicion: 'Un software para constructoras ordena lo que pasa en cada obra: la cotización, las compras de materiales, las cuadrillas, los gastos y el avance, para saber cuánto costó realmente cada proyecto. Hecho a medida, sigue la forma en que tu empresa cotiza, ejecuta y cobra, y conecta la oficina con el equipo en terreno.',
    lead: 'Cada obra con su presupuesto, sus compras, sus gastos y su avance, y el equipo en terreno informando desde el celular.',
    mock: 'dash',
    servicio: 'sistemas',
    problemas: [
      { antes: 'Sabes si una obra dejó plata recién cuando ya terminó', despues: 'Costos reales de cada obra a la vista mientras avanza' },
      { antes: 'Las compras de materiales no quedan asociadas a ninguna obra', despues: 'Cada compra y cada gasto asignados a su proyecto' },
      { antes: 'Asistencia, gastos y avances del terreno llegan por WhatsApp y papel', despues: 'El equipo marca asistencia y rinde gastos desde el celular' },
      { antes: 'Los programas para constructoras son grandes, caros y difíciles de adoptar', despues: 'Un sistema con lo que tu empresa usa, por módulos' },
    ],
    incluye: [
      { t: 'Cotizaciones y presupuestos', d: 'Cotizaciones con ítems, cuotas y estados, que al aprobarse se convierten en proyecto.' },
      { t: 'Proyectos y obras', d: 'Cliente, responsable, tareas, fechas y avance de cada obra o instalación.' },
      { t: 'Costos por obra', d: 'Compras, gastos y horas asociados a cada proyecto para comparar lo presupuestado con lo real.' },
      { t: 'Compras de materiales', d: 'Órdenes de compra a proveedores con comprobante, factura y estado de entrega.' },
      { t: 'Equipo en terreno', d: 'Asistencia con GPS, rendición de gastos con foto de la boleta y planificación de cuadrillas.' },
      { t: 'Visitas técnicas', d: 'Listas de revisión, notas de voz y un informe de la visita listo para enviar al cliente.' },
    ],
    ejemplo: {
      badge: 'Desarrollo propio · en uso',
      t: 'ERP de MAMKAM',
      d: 'MAMKAM vende e instala pavimentos de caucho, pasto sintético y toldos: trabaja por proyectos, con compras de materiales y cuadrillas en terreno. Su ERP asocia compras y gastos a cada proyecto, y dos apps conectan al equipo en terreno con la oficina.',
      puntos: ['Proyectos con análisis de costos', 'App de asistencia con GPS y gastos con lectura de boletas por IA', 'App de visitas técnicas con resumen por IA', 'Cotización aprobada que pasa a compra y proyecto'],
      link: '/casos/erp-mamkam/',
    },
    beneficios: [
      { n: '01', t: 'Margen real de cada obra', d: 'Ves en qué obras ganas y en cuáles se va la plata, a tiempo para corregir.' },
      { n: '02', t: 'La oficina ve el terreno', d: 'Asistencia, gastos y visitas llegan al sistema sin llamar ni esperar el papel.' },
      { n: '03', t: 'Se adopta de verdad', d: 'Al tener solo lo que tu equipo usa, se aprende rápido y se usa todos los días.' },
    ],
    faq: [
      { q: '¿Qué debe tener un software para constructoras?', a: 'Lo esencial es cotizar, convertir la cotización en proyecto, asociar compras y gastos a cada obra, seguir el avance y conectar al equipo en terreno. Con eso ya sabes cuánto costó realmente cada trabajo.' },
      { q: '¿Sirve para empresas de instalación o servicios en terreno?', a: 'Sí. Está pensado para empresas que trabajan por proyectos con cuadrillas: construcción, instalaciones, montajes, mantención o remodelaciones.' },
      { q: '¿El equipo en terreno necesita una app?', a: 'Puede usar el sistema web desde el celular, o una app móvil si necesita marcar asistencia con GPS o trabajar sin señal. En MAMKAM, la app guarda las marcaciones sin señal y las envía cuando vuelve la conexión.' },
      { q: '¿Se puede partir solo con una parte?', a: 'Sí. Se construye por módulos: muchas empresas parten por cotizaciones y costos por obra, y después suman compras, personal o apps de terreno.' },
      { q: '¿Cuánto cuesta?', a: 'Depende de los módulos que necesites. Partimos con un diagnóstico sin costo y te enviamos una propuesta por escrito con etapas, plazos y precio.' },
    ],
    rel: [
      { href: '/casos/erp-mamkam/', small: 'Caso de estudio', strong: 'Cómo una empresa de instalaciones ordenó sus proyectos.' },
      { href: '/servicios/erp-a-medida/', small: 'ERP a medida', strong: 'Toda la gestión de tu empresa en un solo sistema.' },
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
