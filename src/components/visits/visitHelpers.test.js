import { describe, it, expect } from 'vitest'
import { countryName, flagEmoji, foldTail, share } from './visitHelpers'

describe('visitHelpers', () => {
  it('nombra los países en español y marca las visitas sin ubicación', () => {
    expect(countryName('CO')).toBe('Colombia')
    expect(countryName('US')).toBe('Estados Unidos')
    expect(countryName(null)).toBe('Sin ubicación')
  })

  it('arma la bandera a partir del código ISO', () => {
    expect(flagEmoji('CO')).toBe('🇨🇴')
    expect(flagEmoji(null)).toBe('🌐')
  })

  it('suma la cola en una fila "Otros"', () => {
    const rows = [5, 4, 3, 2, 1].map(visitas => ({ visitas }))

    expect(foldTail(rows, 3)).toEqual([{ visitas: 5 }, { visitas: 4 }, { other: true, visitas: 6 }])
    expect(foldTail(rows, 5)).toBe(rows)
  })

  it('calcula porcentajes sin dividir por cero', () => {
    expect(share(1, 3)).toBe(33)
    expect(share(0, 0)).toBe(0)
  })
})
