export default function AuthLayout({ titulo, subtitulo, children, pie }) {
  const base = import.meta.env.BASE_URL
  return (
    <div className="grid min-h-dvh bg-paper lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-night p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-acc/30 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-[360px] rounded-full bg-warm/10 blur-3xl" aria-hidden />
        <a href="/" className="relative flex items-center gap-3">
          <img src={`${base}robot.svg`} alt="" className="h-11 w-auto" />
          <b className="font-display text-2xl font-extrabold tracking-tight">
            Integri<span className="text-[#9a90ff]">AI</span>
          </b>
        </a>
        <div className="relative">
          <h2 className="max-w-md font-display text-4xl font-extrabold leading-[1.05] tracking-tight">
            Clientes, oportunidades y proyectos, en un solo lugar.
          </h2>
          <ul className="mt-6 space-y-3 text-on-night">
            {['Cada solicitud del sitio llega directo a tu embudo.', 'Todo el historial de cada cliente, sin buscar en chats.', 'Proyectos con tareas, avance y cobros al día.'].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-warm" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-on-night/70">© {new Date().getFullYear()} IntegriAI · Chile</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <a href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src={`${base}robot.svg`} alt="" className="h-9 w-auto" />
            <b className="font-display text-xl font-extrabold tracking-tight">
              Integri<span className="text-acc">AI</span>
            </b>
          </a>
          <h1 className="font-display text-3xl font-bold">{titulo}</h1>
          {subtitulo && <p className="mt-2 text-sm text-mute">{subtitulo}</p>}
          <div className="mt-6">{children}</div>
          {pie && <div className="mt-6 text-center text-sm text-mute">{pie}</div>}
        </div>
      </main>
    </div>
  )
}
