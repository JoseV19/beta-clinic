import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  monochrome: boolean
  toggleMonochrome: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
  monochrome: false,
  toggleMonochrome: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('bc-theme')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const [monochrome, setMonochrome] = useState<boolean>(() => {
    return localStorage.getItem('bc-monochrome') === 'true'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('bc-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle('monochrome', monochrome)
    localStorage.setItem('bc-monochrome', String(monochrome))
  }, [monochrome])

  // Trigger a smooth color transition when toggling monochrome
  const transitionTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const toggleMonochrome = useCallback(() => {
    const root = document.documentElement
    root.classList.add('theme-transitioning')
    clearTimeout(transitionTimer.current)
    transitionTimer.current = setTimeout(() => root.classList.remove('theme-transitioning'), 500)
    setMonochrome((m) => !m)
  }, [])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
        monochrome,
        toggleMonochrome,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext)
