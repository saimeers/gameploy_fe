import { createContext, useContext } from 'react'

/**
 * Contexto del tema, separado de `ThemeProvider` porque Fast Refresh solo
 * funciona cuando un archivo exporta componentes y nada más.
 */
export const ThemeProviderContext = createContext({ theme: 'dark', setTheme: () => null })

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
