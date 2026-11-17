const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

export const clp = (n) => CLP.format(Number(n) || 0)

/** $1,5 M / $850 mil / $12.000 */
export function clpCorto(n) {
  const v = Number(n) || 0
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1).replace('.', ',').replace(',0', '')} M`
  if (Math.abs(v) >= 100_000) return `$${Math.round(v / 1000)} mil`
  return CLP.format(v)
}

/** Fecha de hoy en la zona horaria del navegador, como YYYY-MM-DD (sin desfase por UTC). */
export function hoyISO() {
  return new Date().toLocaleDateString('en-CA')
}

function parteFecha(valor) {
  const [y, m, d] = String(valor).slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function fecha(valor) {
  if (!valor) return '—'
  return parteFecha(valor).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fechaCorta(valor) {
  if (!valor) return '—'
  return parteFecha(valor).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

export function fechaHora(valor) {
  if (!valor) return '—'
  return new Date(valor).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const RTF = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
export function haceCuanto(valor) {
  if (!valor) return ''
  const seg = (new Date(valor).getTime() - Date.now()) / 1000
  const tramos = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]
  for (const [unidad, s] of tramos) {
    if (Math.abs(seg) >= s) return RTF.format(Math.round(seg / s), unidad)
  }
  return 'justo ahora'
}

/** Días desde hoy hasta la fecha (negativo = ya pasó). */
export function diasHasta(valor) {
  if (!valor) return null
  const hoy = parteFecha(hoyISO())
  return Math.round((parteFecha(valor) - hoy) / 86_400_000)
}

export function iniciales(nombre = '') {
  return (
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || '?'
  )
}

/** Enlace de WhatsApp a partir de un teléfono chileno o internacional. */
export function enlaceWhatsApp(telefono) {
  let digitos = String(telefono || '').replace(/\D/g, '')
  if (!digitos) return null
  if (digitos.length === 9 && digitos.startsWith('9')) digitos = `56${digitos}`
  return `https://wa.me/${digitos}`
}

export function plural(n, uno, varios) {
  return `${n} ${n === 1 ? uno : varios}`
}

/** Minúsculas y sin tildes, para buscar sin importar acentos. */
export function normalizar(texto = '') {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}
