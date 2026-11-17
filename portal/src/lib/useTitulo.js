import { useEffect } from 'react'

/** Título de la pestaña del navegador: "Clientes · Portal IntegriAI". */
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Portal IntegriAI` : 'Portal IntegriAI'
  }, [titulo])
}
