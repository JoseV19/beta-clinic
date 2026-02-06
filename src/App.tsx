import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login — sin sidebar */}
        <Route path="/" element={<Login />} />

        {/* Rutas con layout principal */}
        <Route element={<MainLayout />}>
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
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
