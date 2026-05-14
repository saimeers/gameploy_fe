import { RouterProvider } from 'react-router-dom'
import { Toaster }        from 'sonner'
import { router }         from '@/router'
import { ThemeProvider }  from '@/components/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="gameploy-theme">
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  )
}