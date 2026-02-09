import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import { useClinic } from './context/ClinicContext'
import LoadingScreen from './components/ui/LoadingScreen'
import RoleGuard from './components/guards/RoleGuard'
import MainLayout from './layouts/MainLayout'
import LandingPage from './pages/LandingPage'

import SignInPage from './pages/auth/SignInPage'
import SignUpPage from './pages/auth/SignUpPage'
import Onboarding from './pages/Onboarding'
import AccessDenied from './pages/AccessDenied'
import Dashboard from './pages/Dashboard'
import Agenda from './pages/Agenda'
import Pacientes from './pages/Pacientes'
import Consultas from './pages/Consultas'

import Telemedicina from './pages/Telemedicina'
import ReportesRips from './pages/ReportesRips'
import PatientDetail from './components/PatientDetail'
import Directorio from './pages/Directorio'
import Recetas from './pages/Recetas'
import Laboratorios from './pages/Laboratorios'
import Settings from './pages/Settings'
import ClinicSettings from './pages/ClinicSettings'
import Inventory from './pages/Inventory'
import Tasks from './pages/Tasks'
import Odontograma from './pages/specialty/Odontograma'
import Tratamientos from './pages/specialty/Tratamientos'
import Presupuestos from './pages/specialty/Presupuestos'
import LabDental from './pages/specialty/LabDental'
import Recordatorios from './pages/Recordatorios'
import PediatricDashboard from './pages/pediatrics/PediatricDashboard'
import NutritionDashboard from './pages/nutrition/NutritionDashboard'
import PatientLayout from './layouts/PatientLayout'
import WelcomeHub from './pages/WelcomeHub'
import PublicBooking from './pages/PublicBooking'
import Checkout from './pages/Checkout'
import PatientSignUp from './pages/auth/PatientSignUp'
import PatientOnboarding from './pages/auth/PatientOnboarding'
import Facturacion from './pages/Facturacion'
import Reportes from './pages/Reportes'
import DoctorPortalView from './pages/DoctorPortalView'
import NotFound from './pages/NotFound'

/* ── Onboarding guard ─────────────────────────────────── */

function RequireOnboarding() {
  const { isOnboarded } = useClinic()
  const location = useLocation()

  if (!isOnboarded) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />
  }

  return <Outlet />
}

/* ── Auth wrapper (SignedIn/SignedOut) ─────────────────── */

function RequireAuth() {
  return (
    <>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

/* ── App ──────────────────────────────────────────────── */

function App() {
  const { isLoaded } = useAuth()

  if (!isLoaded) return <LoadingScreen />

  return (
    <BrowserRouter>
      <Routes>
        {/* ═══════ Rutas públicas ═══════ */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Navigate to="/sign-in" replace />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/reservar" element={<PublicBooking />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/portal/registro/*" element={<PatientSignUp />} />
        <Route path="/portal/onboarding" element={
          <>
            <SignedIn><PatientOnboarding /></SignedIn>
            <SignedOut><RedirectToSignIn /></SignedOut>
          </>
        } />

        {/* ═══════ Acceso Denegado (requiere auth, sin rol) ═══════ */}
        <Route element={<RequireAuth />}>
          <Route path="/acceso-denegado" element={<AccessDenied />} />
        </Route>

        {/* ═══════ Onboarding — auth, sin onboarding ni rol ═══════ */}
        <Route
          path="/onboarding"
          element={
            <>
              <SignedIn>
                <Onboarding />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* ═══════ Welcome Hub — auth, sin sidebar ═══════ */}
        <Route
          path="/welcome"
          element={
            <>
              <SignedIn>
                <WelcomeHub />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* ═══════ DOCTOR / ADMIN — auth + onboarding + role ═══════ */}
        <Route element={<RoleGuard allowedRoles={['doctor', 'admin']} />}>
          {/* Fullscreen portal preview — outside MainLayout */}
          <Route element={<RequireOnboarding />}>
            <Route path="/portal-paciente" element={<DoctorPortalView />} />
          </Route>
          <Route element={<RequireOnboarding />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/pacientes" element={<Pacientes />} />
              <Route path="/pacientes/:id" element={<PatientDetail />} />
              <Route path="/consultas" element={<Consultas />} />

              <Route path="/telemedicina" element={<Telemedicina />} />
              <Route path="/recordatorios" element={<Recordatorios />} />
              <Route path="/reportes-rips" element={<ReportesRips />} />
              <Route path="/recetas" element={<Recetas />} />
              <Route path="/directorio" element={<Directorio />} />
              <Route path="/laboratorios" element={<Laboratorios />} />
              <Route path="/inventario" element={<Inventory />} />
              <Route path="/tareas" element={<Tasks />} />
              <Route path="/facturacion" element={<Facturacion />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/configuracion" element={<Settings />} />
              <Route path="/configuracion/clinica" element={<ClinicSettings />} />
              {/* Specialty: Dental */}
              <Route path="/odontograma" element={<Odontograma />} />
              <Route path="/tratamientos" element={<Tratamientos />} />
              <Route path="/presupuestos" element={<Presupuestos />} />
              <Route path="/lab-dental" element={<LabDental />} />
              {/* Specialty: Pediatrics */}
              <Route path="/crecimiento" element={<PediatricDashboard />} />
              <Route path="/vacunacion" element={<PediatricDashboard />} />
              {/* Specialty: Nutrition */}
              <Route path="/calculadora" element={<NutritionDashboard />} />
              <Route path="/planificador" element={<NutritionDashboard />} />
            </Route>
          </Route>
        </Route>

        {/* ═══════ PATIENT — auth + role ═══════ */}
        <Route element={<RoleGuard allowedRoles={['patient']} />}>
          <Route path="/mi-salud" element={<PatientLayout />} />
          <Route path="/portal" element={<PatientLayout />} />
        </Route>

        {/* ═══════ Fallback ═══════ */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
