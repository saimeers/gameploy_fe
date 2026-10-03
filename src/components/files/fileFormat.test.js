import { describe, it, expect } from 'vitest'
import { formatBytes, formatDateTime } from './fileFormat'

describe('fileFormat', () => {
  it('formatea tamaños', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes('2048')).toBe('2.0 KB')
    expect(formatBytes(15 * 1024 * 1024)).toBe('15.0 MB')
  })

  it('formatea la fecha de subida con hora', () => {
    expect(formatDateTime('2026-10-03T19:20:00Z')).toMatch(/2026/)
    expect(formatDateTime(null)).toBe('—')
  })
})
