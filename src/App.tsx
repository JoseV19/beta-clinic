import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import LoadingScreen from './components/ui/LoadingScreen'
import MainLayout from './layouts/MainLayout'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import SignInPage from './pages/auth/SignInPage'
import SignUpPage from './pages/auth/SignUpPage'
import Dashboard from './pages/Dashboard'
import Agenda from './pages/Agenda'
import Pacientes from './pages/Pacientes'
import Consultas from './pages/Consultas'
import Finanzas from './pages/Finanzas'
import Telemedicina from './pages/Telemedicina'
import ReportesRips from './pages/ReportesRips'
import PatientDetail from './components/PatientDetail'
import Directorio from './pages/Directorio'
import Recetas from './pages/Recetas'
import Laboratorios from './pages/Laboratorios'
import Settings from './pages/Settings'
import Inventory from './pages/Inventory'
import Tasks from './pages/Tasks'
import PatientLayout from './layouts/PatientLayout'
import PortalHome from './pages/portal/PortalHome'
import PortalAgendar from './pages/portal/PortalAgendar'
import PortalRecetas from './pages/portal/PortalRecetas'
import PortalPerfil from './pages/portal/PortalPerfil'

function App() {
  const { isLoaded } = useAuth()

  if (!isLoaded) return <LoadingScreen />

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Rutas protegidas — requieren autenticación */}
        <Route
          element={
            <>
              <SignedIn>
                <MainLayout />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/pacientes/:id" element={<PatientDetail />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/finanzas" element={<Finanzas />} />
          <Route path="/telemedicina" element={<Telemedicina />} />
          <Route path="/reportes-rips" element={<ReportesRips />} />
          <Route path="/recetas" element={<Recetas />} />
          <Route path="/directorio" element={<Directorio />} />
          <Route path="/laboratorios" element={<Laboratorios />} />
          <Route path="/inventario" element={<Inventory />} />
          <Route path="/tareas" element={<Tasks />} />
          <Route path="/configuracion" element={<Settings />} />
        </Route>

        {/* Portal del Paciente — Beta Life */}
        <Route
          element={
            <>
              <SignedIn>
                <PatientLayout />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        >
          <Route path="/portal" element={<PortalHome />} />
          <Route path="/portal/agendar" element={<PortalAgendar />} />
          <Route path="/portal/recetas" element={<PortalRecetas />} />
          <Route path="/portal/perfil" element={<PortalPerfil />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
