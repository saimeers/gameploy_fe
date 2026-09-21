import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import ChangePasswordDialog from './ChangePasswordDialog'
import { authService } from '@/services/auth.service'

vi.mock('@/services/auth.service', () => ({
  authService: {
    hasPasswordProvider: vi.fn(() => true),
    changePassword: vi.fn(() => Promise.resolve()),
    sendPasswordReset: vi.fn(() => Promise.resolve()),
  },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const CORREO = 'saimer@ufps.edu.co'

const renderDialog = () =>
  render(<ChangePasswordDialog open onOpenChange={vi.fn()} correo={CORREO} />)

const fill = async (user, { actual, nueva, repetir }) => {
  await user.type(screen.getByLabelText('Contraseña actual'), actual)
  await user.type(screen.getByLabelText('Nueva contraseña'), nueva)
  await user.type(screen.getByLabelText('Repite la nueva contraseña'), repetir)
  await user.click(screen.getByRole('button', { name: /Cambiar contraseña/ }))
}

beforeEach(() => {
  authService.hasPasswordProvider.mockReturnValue(true)
})

describe('ChangePasswordDialog', () => {
  it('cambia la contraseña cuando los datos son válidos', async () => {
    const user = userEvent.setup()
    renderDialog()

    await fill(user, { actual: 'vieja123', nueva: 'nueva1234', repetir: 'nueva1234' })

    expect(authService.changePassword).toHaveBeenCalledWith('vieja123', 'nueva1234')
  })

  it('rechaza una contraseña más corta que el mínimo', async () => {
    const user = userEvent.setup()
    renderDialog()

    await fill(user, { actual: 'vieja123', nueva: 'abc', repetir: 'abc' })

    expect(authService.changePassword).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('al menos 6'))
  })

  it('rechaza cuando la confirmación no coincide', async () => {
    const user = userEvent.setup()
    renderDialog()

    await fill(user, { actual: 'vieja123', nueva: 'nueva1234', repetir: 'otra12345' })

    expect(authService.changePassword).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('Las contraseñas nuevas no coinciden')
  })

  it('rechaza repetir la contraseña actual', async () => {
    const user = userEvent.setup()
    renderDialog()

    await fill(user, { actual: 'misma1234', nueva: 'misma1234', repetir: 'misma1234' })

    expect(authService.changePassword).not.toHaveBeenCalled()
  })

  it('traduce el error de Firebase cuando la actual no es correcta', async () => {
    authService.changePassword.mockRejectedValueOnce({ code: 'auth/invalid-credential' })
    const user = userEvent.setup()
    renderDialog()

    await fill(user, { actual: 'incorrecta', nueva: 'nueva1234', repetir: 'nueva1234' })

    expect(toast.error).toHaveBeenCalledWith('La contraseña actual no es correcta.')
  })

  it('ofrece el enlace por correo a quien no recuerde la actual', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: /No recuerdas tu contraseña/ }))

    expect(authService.sendPasswordReset).toHaveBeenCalledWith(CORREO)
  })

  it('a una cuenta de Google solo le ofrece el enlace, sin pedir la actual', async () => {
    authService.hasPasswordProvider.mockReturnValue(false)
    renderDialog()

    expect(screen.queryByLabelText('Contraseña actual')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enviarme el enlace/ })).toBeInTheDocument()
  })
})
