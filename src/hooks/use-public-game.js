import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/services/api'

/**
 * Ficha pública de un juego (`GET /public/games/:slug`). La API decide quién la
 * ve según su visibilidad y solo entonces añade los enlaces firmados del juego
 * (`play_url`) y de las imágenes (`url`).
 *
 * Un enlace con un slug antiguo se reemplaza en la barra de direcciones por el
 * actual sin volver a pedir el proyecto.
 *
 * @param {string} slug
 * @param {(slug: string) => string} pathFor ruta de la página para un slug;
 *   debe ser estable (definida fuera del componente)
 * @returns {{ project: object | null, loading: boolean, error: 'not_found' | 'forbidden' | 'failed' | null }}
 */
export function usePublicGame(slug, pathFor) {
  const navigate = useNavigate()
  const [state, setState] = useState({ project: null, loading: true, error: null })
  // Slug del proyecto ya cargado, para no pedirlo otra vez al reemplazar en la
  // URL un enlace antiguo por el actual.
  const loadedSlug = useRef(null)

  useEffect(() => {
    if (loadedSlug.current === slug) return
    let cancelled = false
    api.get(`/public/games/${slug}`)
      .then(res => {
        if (cancelled) return
        const project = res.data.data
        loadedSlug.current = project.slug
        setState({ project, loading: false, error: null })
        if (project.slug !== slug) navigate(pathFor(project.slug), { replace: true })
      })
      .catch(err => {
        if (cancelled) return
        const status = err.response?.status
        const error = status === 404 ? 'not_found' : status === 403 ? 'forbidden' : 'failed'
        if (error === 'failed') toast.error('Error al cargar el proyecto')
        setState({ project: null, loading: false, error })
      })
    return () => { cancelled = true }
  }, [slug, navigate, pathFor])

  return state
}
