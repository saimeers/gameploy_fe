import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UnityWebGLGuide from './UnityWebGLGuide'

describe('UnityWebGLGuide', () => {
  it('resume la configuración que debe tener el build', () => {
    render(<UnityWebGLGuide />)

    expect(screen.getByText('Web (WebGL)')).toBeInTheDocument()
    expect(screen.getByText('1920 × 1080')).toBeInTheDocument()
    expect(screen.getByText('PWA')).toBeInTheDocument()
    expect(screen.getByText('Disabled')).toBeInTheDocument()
  })

  it('recorre la guía paso a paso hasta comprimir el .zip', async () => {
    const user = userEvent.setup()
    render(<UnityWebGLGuide />)

    await user.click(screen.getByRole('button', { name: /Guía paso a paso/ }))
    expect(screen.getByRole('heading', { name: 'Instala el módulo WebGL' })).toBeInTheDocument()

    for (let i = 0; i < 5; i++) {
      await user.click(screen.getByRole('button', { name: /Siguiente/ }))
    }

    expect(screen.getByRole('heading', { name: 'Comprímelo en un .zip' })).toBeInTheDocument()
    expect(screen.getByText('Paso 6 de 6')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Siguiente/ })).not.toBeInTheDocument()
  })

  it('salta a un paso desde la barra de progreso', async () => {
    const user = userEvent.setup()
    render(<UnityWebGLGuide />)
    await user.click(screen.getByRole('button', { name: /Guía paso a paso/ }))

    await user.click(screen.getByRole('button', { name: 'Paso 4: Desactiva la compresión' }))

    expect(screen.getByRole('heading', { name: 'Desactiva la compresión' })).toBeInTheDocument()
    expect(screen.getByText('Disabled ▾')).toBeInTheDocument()
  })

  it('vuelve al primer paso al cerrar y abrir de nuevo', async () => {
    const user = userEvent.setup()
    render(<UnityWebGLGuide />)
    await user.click(screen.getByRole('button', { name: /Guía paso a paso/ }))
    await user.click(screen.getByRole('button', { name: /Siguiente/ }))

    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: /Guía paso a paso/ }))

    expect(screen.getByText('Paso 1 de 6')).toBeInTheDocument()
  })
})
