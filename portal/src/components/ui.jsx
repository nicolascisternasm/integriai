import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Loader2, X } from 'lucide-react'
import { TONOS } from '../lib/dominio.js'
import { iniciales } from '../lib/format.js'
import { suscribirAvisos } from '../lib/toast.js'

export const cx = (...clases) => clases.filter(Boolean).join(' ')

/* ───────── Botones ───────── */

const VARIANTES = {
  primario: 'bg-acc text-white hover:bg-acc-strong shadow-sm',
  secundario: 'bg-white text-ink border border-line hover:bg-paper',
  fantasma: 'text-ink-2 hover:bg-black/5',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
  'peligro-suave': 'text-red-600 hover:bg-red-50',
}
const TAMANOS = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-[15px] gap-2',
}

export function Button({
  variante = 'primario',
  tamano = 'md',
  icono: Icono,
  cargando = false,
  className,
  children,
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={cx(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTES[variante],
        TAMANOS[tamano],
        className,
      )}
      {...props}
    >
      {cargando ? <Loader2 className="size-4 animate-spin" aria-hidden /> : Icono && <Icono className="size-4" aria-hidden />}
      {children}
    </button>
  )
}

export function BotonIcono({ icono: Icono, etiqueta, className, variante = 'fantasma', ...props }) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      className={cx(
        'inline-grid size-8 shrink-0 place-items-center rounded-full transition-colors',
        variante === 'peligro' ? 'text-mute hover:bg-red-50 hover:text-red-600' : 'text-mute hover:bg-black/5 hover:text-ink',
        className,
      )}
      {...props}
    >
      <Icono className="size-4" aria-hidden />
    </button>
  )
}

/* ───────── Contenedores y etiquetas ───────── */

export function Card({ className, children, ...props }) {
  return (
    <div className={cx('rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(31,28,29,.04)]', className)} {...props}>
      {children}
    </div>
  )
}

export function Badge({ tono = 'slate', className, children }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', TONOS[tono], className)}>
      {children}
    </span>
  )
}

export function Avatar({ nombre, className }) {
  return (
    <span className={cx('inline-grid size-9 shrink-0 place-items-center rounded-full bg-acc-100 text-xs font-bold text-acc-strong', className)} aria-hidden>
      {iniciales(nombre)}
    </span>
  )
}

export function Barra({ valor, className }) {
  const pct = Math.max(0, Math.min(100, Math.round(valor || 0)))
  return (
    <div className={cx('h-2 w-full overflow-hidden rounded-full bg-paper', className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-acc transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Kpi({ etiqueta, valor, nota, icono: Icono, to, alerta }) {
  const contenido = (
    <Card className={cx('h-full p-4 transition-shadow', to && 'hover:shadow-md', alerta && 'border-red-200')}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold text-mute">{etiqueta}</p>
        {Icono && (
          <span className={cx('grid size-8 place-items-center rounded-full', alerta ? 'bg-red-50 text-red-600' : 'bg-acc-50 text-acc')}>
            <Icono className="size-4" aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight">{valor}</p>
      {nota && <p className={cx('mt-0.5 text-xs', alerta ? 'font-semibold text-red-600' : 'text-mute')}>{nota}</p>}
    </Card>
  )
  return to ? (
    <Link to={to} className="block rounded-2xl">
      {contenido}
    </Link>
  ) : (
    contenido
  )
}

/* ───────── Formularios ───────── */

export const inputCls =
  'rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-mute/70 focus:border-acc focus:outline-none focus:ring-2 focus:ring-acc/20 disabled:bg-paper disabled:text-mute'

// Ocupan todo el ancho salvo que se indique otro (p. ej. className="w-auto"); evita clases que se pisan entre sí.
const ancho = (className = '') => (/(^|\s)w-/.test(className) ? '' : 'w-full')

export function Campo({ label, ayuda, requerido, className, children }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1 block text-[13px] font-semibold text-ink-2">
        {label}
        {requerido && <span className="text-acc"> *</span>}
      </span>
      {children}
      {ayuda && <span className="mt-1 block text-xs text-mute">{ayuda}</span>}
    </label>
  )
}

export function Input({ className, ...props }) {
  return <input {...props} className={cx(inputCls, ancho(className), className)} />
}
export function Select({ className, children, ...props }) {
  return (
    <select {...props} className={cx(inputCls, ancho(className), 'pr-8', className)}>
      {children}
    </select>
  )
}
export function Textarea({ className, ...props }) {
  return <textarea rows={3} {...props} className={cx(inputCls, ancho(className), 'resize-y', className)} />
}

/* ───────── Ventanas ───────── */

export function Modal({ abierto, onCerrar, titulo, descripcion, ancho = 'max-w-lg', children, pie }) {
  const id = useId()
  useEffect(() => {
    if (!abierto) return undefined
    const alTeclear = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', alTeclear)
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = previo
    }
  }, [abierto, onCerrar])

  if (!abierto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby={id}>
      <div className="absolute inset-0 bg-night/50 backdrop-blur-[2px]" onClick={onCerrar} />
      <div className={cx('relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl', ancho)}>
        <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div>
            <h2 id={id} className="text-lg font-bold">
              {titulo}
            </h2>
            {descripcion && <p className="mt-0.5 text-sm text-mute">{descripcion}</p>}
          </div>
          <BotonIcono icono={X} etiqueta="Cerrar" onClick={onCerrar} />
        </header>
        <div className="overflow-y-auto px-5 pb-4">{children}</div>
        {pie && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{pie}</footer>}
      </div>
    </div>
  )
}

export function Confirmar({ abierto, titulo, texto, textoBoton = 'Eliminar', peligro = true, onConfirmar, onCerrar, cargando }) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={titulo}
      ancho="max-w-md"
      pie={
        <>
          <Button variante="secundario" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variante={peligro ? 'peligro' : 'primario'} cargando={cargando} onClick={onConfirmar}>
            {textoBoton}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        {peligro && <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />}
        <p className="text-sm text-ink-2">{texto}</p>
      </div>
    </Modal>
  )
}

/* ───────── Navegación y estados ───────── */

export function Pestanas({ pestanas, activa, onCambiar }) {
  return (
    <div className="scroll-fino -mx-1 mb-5 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line px-1" role="tablist">
      {pestanas.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={activa === p.id}
          onClick={() => onCambiar(p.id)}
          className={cx('relative shrink-0 px-4 py-2.5 text-sm font-semibold transition-colors', activa === p.id ? 'text-acc' : 'text-mute hover:text-ink')}
        >
          {p.label}
          {p.n != null && p.n > 0 && (
            <span className={cx('ml-1.5 rounded-full px-1.5 py-0.5 text-[11px]', activa === p.id ? 'bg-acc-50 text-acc' : 'bg-paper text-mute')}>{p.n}</span>
          )}
          {activa === p.id && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded bg-acc" />}
        </button>
      ))}
    </div>
  )
}

export function Encabezado({ titulo, subtitulo, atras, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {atras && (
          <Link to={atras.to} className="mb-1 inline-flex items-center gap-1 text-[13px] font-semibold text-mute hover:text-acc">
            <ArrowLeft className="size-3.5" aria-hidden />
            {atras.label}
          </Link>
        )}
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-mute">{subtitulo}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

export function Vacio({ icono: Icono, titulo, texto, children }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      {Icono && (
        <span className="mb-3 grid size-12 place-items-center rounded-full bg-acc-50 text-acc">
          <Icono className="size-6" aria-hidden />
        </span>
      )}
      <p className="font-semibold">{titulo}</p>
      {texto && <p className="mt-1 max-w-sm text-sm text-mute">{texto}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-mute" role="status">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {texto}
    </div>
  )
}

export function ErrorCarga({ error, onReintentar }) {
  return (
    <Card className="mx-auto max-w-md p-6 text-center">
      <AlertTriangle className="mx-auto mb-2 size-6 text-red-600" aria-hidden />
      <p className="font-semibold">No pudimos cargar los datos</p>
      <p className="mt-1 text-sm text-mute">{error?.message || 'Revisa tu conexión e inténtalo de nuevo.'}</p>
      {onReintentar && (
        <Button variante="secundario" className="mt-4" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </Card>
  )
}

export function PantallaCarga() {
  return (
    <div className="grid min-h-dvh place-items-center bg-night">
      <div className="flex flex-col items-center gap-4">
        <img src={`${import.meta.env.BASE_URL}robot.svg`} alt="" className="h-16 w-auto animate-pulse" />
        <Loader2 className="size-5 animate-spin text-on-night" aria-label="Cargando" />
      </div>
    </div>
  )
}

/* ───────── Avisos ───────── */

export function Toaster() {
  const [avisos, setAvisos] = useState([])
  useEffect(
    () =>
      suscribirAvisos((aviso) => {
        setAvisos((actuales) => [...actuales, aviso])
        setTimeout(() => setAvisos((actuales) => actuales.filter((a) => a.id !== aviso.id)), 4500)
      }),
    [],
  )
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {avisos.map((a) => (
        <div
          key={a.id}
          className={cx(
            'pointer-events-auto max-w-md rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-xl',
            a.tipo === 'error' ? 'bg-red-600' : 'bg-night',
          )}
          role={a.tipo === 'error' ? 'alert' : 'status'}
        >
          {a.mensaje}
        </div>
      ))}
    </div>
  )
}
