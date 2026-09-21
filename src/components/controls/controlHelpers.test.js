import { describe, it, expect, vi } from 'vitest'
import { indexByKey, zoneState } from './controlHelpers'

const CONTROLS = [
  { id: 'c1', tecla_boton: 'W', descripcion_accion: 'Avanzar' },
  { id: 'c2', tecla_boton: 'Espacio', descripcion_accion: 'Saltar' },
]

describe('indexByKey', () => {
  it('indexa los controles por su tecla', () => {
    expect(indexByKey(CONTROLS).W.descripcion_accion).toBe('Avanzar')
  })

  it('devuelve un objeto vacío sin controles', () => {
    expect(indexByKey()).toEqual({})
  })

  it('se queda con el último cuando una tecla se repite', () => {
    const repetida = [...CONTROLS, { id: 'c3', tecla_boton: 'W', descripcion_accion: 'Otra' }]
    expect(indexByKey(repetida).W.id).toBe('c3')
  })
})

describe('zoneState', () => {
  const onSelect = vi.fn()
  const state = zoneState({
    assignments: indexByKey(CONTROLS),
    selectedKey: 'Espacio',
    onSelect,
    readOnly: false,
  })

  it('marca como asignada una tecla con control', () => {
    expect(state('W').assigned.descripcion_accion).toBe('Avanzar')
  })

  it('deja en null las teclas libres', () => {
    expect(state('Q').assigned).toBeNull()
  })

  it('marca como seleccionada solo la tecla activa', () => {
    expect(state('Espacio').selected).toBe(true)
    expect(state('W').selected).toBe(false)
  })
})
