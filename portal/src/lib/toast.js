// Avisos breves ("Guardado", errores). Es un módulo simple para poder usarlo también fuera de componentes React.
const oyentes = new Set()
let contador = 0

function emitir(tipo, mensaje) {
  const aviso = { id: ++contador, tipo, mensaje: String(mensaje || '') }
  oyentes.forEach((fn) => fn(aviso))
}

export const toast = {
  ok: (mensaje) => emitir('ok', mensaje),
  error: (mensaje) => emitir('error', mensaje),
}

export function suscribirAvisos(fn) {
  oyentes.add(fn)
  return () => oyentes.delete(fn)
}
