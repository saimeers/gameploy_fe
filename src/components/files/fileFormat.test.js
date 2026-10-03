import { describe, it, expect } from 'vitest'
import { gameUrl } from './fileFormat'

describe('gameUrl', () => {
  it('usa el enlace firmado que entrega la API', () => {
    const version = {
      id: 'v1',
      archivos: [
        { tipo: 'portada', url: 'https://cdn/t/1.x/media/m1/p.png' },
        { tipo: 'juego_webgl', play_url: 'https://cdn/t/1.x/builds/b1/index.html' },
      ],
    }

    expect(gameUrl('p1', version)).toBe('https://cdn/t/1.x/builds/b1/index.html')
  })

  it('para builds anteriores al CDN, usa /play de la versión', () => {
    const version = { id: 'v1', archivos: [{ tipo: 'juego_webgl' }] }

    expect(gameUrl('p1', version)).toMatch(/\/play\/p1\/v1\/index\.html$/)
  })

  it('devuelve null si la versión no tiene build', () => {
    expect(gameUrl('p1', { id: 'v1', archivos: [{ tipo: 'portada' }] })).toBeNull()
    expect(gameUrl('p1', undefined)).toBeNull()
  })
})
