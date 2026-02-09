import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { DataProvider } from './context/DataContext.tsx'
import { SettingsProvider } from './context/SettingsContext.tsx'
import { ClinicProvider } from './context/ClinicContext.tsx'
import { SupabaseProvider } from './context/SupabaseContext.tsx'

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
          colorBackground: '#0B0613',
          colorText: '#F8F9FA',
          colorInputBackground: 'rgba(255,255,255,0.03)',
          colorInputText: '#F8F9FA',
          borderRadius: '0.75rem',
        },
        elements: {
          cardBox: 'bg-transparent shadow-none',
          formButtonPrimary: 'bg-[#7FFFD4] text-[#0B0613] hover:bg-[#7FFFD4]/90 font-semibold rounded-xl shadow-lg',
          formFieldInput: 'bg-white/[0.05] border-white/[0.08] rounded-xl',
          socialButtonsBlockButton: 'bg-white/[0.05] border-white/[0.08] hover:bg-white/10 rounded-xl',
          footerActionLink: 'text-[#7FFFD4] hover:text-[#7FFFD4]/80',
          dividerLine: 'bg-white/10',
          dividerText: 'text-white/30',
        },
      }}
    >
      <ThemeProvider>
        <SupabaseProvider>
          <ClinicProvider>
            <SettingsProvider>
              <DataProvider>
                <App />
              </DataProvider>
            </SettingsProvider>
          </ClinicProvider>
        </SupabaseProvider>
      </ThemeProvider>
    </ClerkProvider>
  </StrictMode>,
)
