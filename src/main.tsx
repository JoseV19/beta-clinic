import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { DataProvider } from './context/DataContext.tsx'
import { SettingsProvider } from './context/SettingsContext.tsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env.local')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#7FFFD4',
          colorBackground: '#1a1a2e',
          colorText: '#ffffff',
        },
      }}
    >
      <ThemeProvider>
        <SettingsProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ClerkProvider>
  </StrictMode>,
)
