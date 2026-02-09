import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { useData } from '../context/DataContext'
import PatientPortal from '../components/PatientPortal'

export default function DoctorPortalView() {
  const { patients } = useData()
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(patients[0]?.id ?? 0)

  const patient = patients.find((p) => p.id === selectedId)

  if (patients.length === 0) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-omega-abyss px-6">
        <div className="max-w-xs text-center">
          <Users size={40} className="mx-auto text-white/15" />
          <p className="mt-3 text-sm font-medium text-white/50">
            No hay pacientes registrados
          </p>
          <p className="mt-1 text-xs text-white/30">
            Registra pacientes primero para ver su portal.
          </p>
          <button
            onClick={() => navigate('/pacientes')}
            className="mt-4 rounded-lg bg-omega-violet px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-omega-violet/80"
          >
            Ir a Pacientes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh bg-omega-abyss">
      {/* Patient selector bar */}
      <div className="fixed left-1/2 top-0 z-50 w-full max-w-md -translate-x-1/2">
        <div className="border-b border-white/[0.06] bg-omega-abyss/95 px-4 py-2 backdrop-blur-xl">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-all focus:border-beta-mint/30 focus:ring-2 focus:ring-beta-mint/10 [color-scheme:dark]"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Portal content — offset for selector bar */}
      <div className="pt-12">
        <PatientPortal
          doctorPreview
          previewPatient={
            patient
              ? {
                  id: patient.id,
                  nombre: patient.nombre,
                  email: patient.email,
                  telefono: patient.telefono,
                }
              : undefined
          }
          onBack={() => navigate('/dashboard')}
        />
      </div>
    </div>
  )
}
