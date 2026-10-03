import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import JSZip from 'jszip'
import ProjectVersionsTab from './ProjectVersionsTab'
import { studentService } from '../../services/student.service'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn() } }))
vi.mock('jszip', () => ({ default: { loadAsync: vi.fn() } }))
vi.mock('../../services/student.service', () => ({
  studentService: {
    getVersions: vi.fn(),
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
    activateVersion: vi.fn(),
    downloadFile: vi.fn(),
  },
}))

const MB = 1024 * 1024
const VERSION = { id: 'v1', numero_version: '1.0.0', es_activa: true, archivos: [] }

/** Archivo que dice pesar `size` bytes sin ocupar esa memoria en la prueba. */
const fakeFile = (name, type, size) => {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

const openFiles = async (user) => {
  render(<ProjectVersionsTab projectId="p1" projectName="Memoria" />)
  await user.click(await screen.findByRole('button', { name: /Gestionar archivos/ }))
}
const zipInput = () => document.querySelector('input[type=file][accept=".zip"]')
const imageInput = () => document.querySelector('input[type=file][accept="image/*"]')

beforeEach(() => {
  vi.clearAllMocks()
  studentService.getVersions.mockResolvedValue({ data: { data: [VERSION] } })
})

describe('límite de tamaño de las subidas', () => {
  it('muestra el máximo de 95 MB en cada tipo de archivo', async () => {
    const user = userEvent.setup()
    await openFiles(user)

    // .zip, portada y capturas
    expect(screen.getAllByText(/de hasta 95 MB/, { selector: 'p' })).toHaveLength(3)
  })

  it('no abre ni sube un .zip de más de 95 MB, y explica por qué', async () => {
    const user = userEvent.setup()
    await openFiles(user)

    await user.upload(zipInput(), fakeFile('Juego.zip', 'application/zip', 96 * MB))

    expect(toast.error).toHaveBeenCalledWith(
      'Juego.zip pesa 96.0 MB y el máximo es 95 MB',
      expect.objectContaining({ description: expect.stringMatching(/limitación actual del sistema.*100 MB.*guía/) }),
    )
    expect(JSZip.loadAsync).not.toHaveBeenCalled()
    expect(studentService.uploadFile).not.toHaveBeenCalled()
  })

  it('tampoco sube una imagen de más de 95 MB', async () => {
    const user = userEvent.setup()
    await openFiles(user)

    await user.upload(imageInput(), fakeFile('portada.png', 'image/png', 120 * MB))

    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/portada\.png pesa 120\.0 MB/), expect.anything())
    expect(studentService.uploadFile).not.toHaveBeenCalled()
  })

  it('un archivo dentro del límite se sube como siempre', async () => {
    const user = userEvent.setup()
    studentService.uploadFile.mockResolvedValue({ data: { data: { id: 'a1', tipo: 'portada', nombre_archivo: 'portada.png' } } })
    await openFiles(user)

    await user.upload(imageInput(), fakeFile('portada.png', 'image/png', 10 * MB))

    await waitFor(() => expect(studentService.uploadFile).toHaveBeenCalled())
    expect(toast.success).toHaveBeenCalledWith('Portada subida')
  })

  it('si la API responde 413, da la misma explicación en vez de "Error al subir"', async () => {
    const user = userEvent.setup()
    studentService.uploadFile.mockRejectedValue({ response: { status: 413, data: { message: 'File too large: the maximum is 95 MB' } } })
    await openFiles(user)

    await user.upload(imageInput(), fakeFile('portada.png', 'image/png', 10 * MB))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/máximo es 95 MB/),
      expect.objectContaining({ description: expect.stringMatching(/limitación actual del sistema/) }),
    ))
    expect(toast.error).not.toHaveBeenCalledWith('Error al subir')
  })
})
