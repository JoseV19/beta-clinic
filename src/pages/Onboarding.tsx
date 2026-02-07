import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Stethoscope,
  Baby,
  Apple,
  Loader2,
} from 'lucide-react'
import { useClinic, type ClinicType } from '../context/ClinicContext'

/* ── Custom tooth icon ───────────────────────────────── */

function ToothIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C9.5 2 7 4 7 7c0 2-1 4-1.5 6S5 17 6 19s2.5 3 4 3c1 0 1.5-1 2-1s1 1 2 1c1.5 0 3-1 4-3s.5-4 0-6S17 9 17 7c0-3-2.5-5-5-5z" />
    </svg>
  )
}

/* ── Options config ──────────────────────────────────── */

const options: {
  type: ClinicType
  label: string
  description: string
  icon: React.FC<{ size?: number }>
  gradient: string
}[] = [
  {
    type: 'general',
    label: 'Medicina General',
    description: 'Consultas generales, control de pacientes, prescripciones y laboratorios',
    icon: Stethoscope,
    gradient: 'from-beta-mint/20 to-beta-mint/5',
  },
  {
    type: 'dental',
    label: 'Odontología',
    description: 'Odontograma, tratamientos dentales, ortodoncia y cirugía oral',
    icon: ToothIcon,
    gradient: 'from-blue-400/20 to-blue-400/5',
  },
  {
    type: 'pediatrics',
    label: 'Pediatría',
    description: 'Control de crecimiento, vacunación y desarrollo infantil',
    icon: Baby,
    gradient: 'from-pink-400/20 to-pink-400/5',
  },
  {
    type: 'nutrition',
    label: 'Nutrición',
    description: 'Evaluaciones nutricionales, planes alimentarios y seguimiento dietético',
    icon: Apple,
    gradient: 'from-green-400/20 to-green-400/5',
  },
]

/* ── Component ───────────────────────────────────────── */

export default function Onboarding() {
  const navigate = useNavigate()
  const { setClinicType } = useClinic()
  const [selected, setSelected] = useState<ClinicType | null>(null)
  const [configuring, setConfiguring] = useState(false)

  function handleSelect(type: ClinicType) {
    if (configuring) return
    setSelected(type)
  }

  function handleConfirm() {
    if (!selected || configuring) return
    setConfiguring(true)
    setClinicType(selected)
  }

  // Redirect after "configuring" animation
  useEffect(() => {
    if (!configuring) return
    const id = setTimeout(() => navigate('/dashboard', { replace: true }), 2400)
    return () => clearTimeout(id)
  }, [configuring, navigate])

  /* ── Configuring overlay ─────────────────────────────── */

  if (configuring) {
    const chosen = options.find((o) => o.type === selected)
    const Icon = chosen?.icon ?? Stethoscope
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-omega-dark">
        <div className="animate-[pop-in_0.5s_ease-out_both] text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-beta-mint/15 text-beta-mint">
            <Icon size={48} />
          </div>
          <h2 className="text-xl font-bold text-clinical-white">
            Configurando Sistema...
          </h2>
          <p className="mt-2 text-sm text-clinical-white/50">
            Preparando módulos de <span className="font-semibold text-beta-mint">{chosen?.label}</span>
          </p>
          <div className="mx-auto mt-6 flex items-center justify-center gap-2 text-beta-mint">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-xs font-medium">Inicializando protocolo…</span>
          </div>
          <div className="mx-auto mt-4 h-1 w-48 overflow-hidden rounded-full bg-clinical-white/10">
            <div className="h-full animate-[fill-bar_2s_linear_both] bg-beta-mint" />
          </div>
        </div>
      </div>
    )
  }

  /* ── Main screen ─────────────────────────────────────── */

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-omega-dark px-4">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-beta-mint/[0.03] blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-omega-violet/[0.06] blur-3xl" />
        <div className="absolute left-1/2 top-1/4 h-px w-64 -translate-x-1/2 bg-gradient-to-r from-transparent via-beta-mint/20 to-transparent" />
      </div>

      <div className="relative w-full max-w-3xl space-y-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-beta-mint/20 bg-beta-mint/10">
            <img src="/beta-logo.png" alt="Beta Clinic" className="h-8 w-8 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-clinical-white">
            Protocolo de Iniciación
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-clinical-white/40">
            Seleccione su <span className="font-semibold text-beta-mint">Especialidad</span>
          </p>
        </div>

        {/* Grid of 3 cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {options.map(({ type, label, description, icon: Icon, gradient }) => {
            const isSelected = selected === type
            return (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-beta-mint bg-gradient-to-br ' + gradient + ' scale-[1.03] shadow-lg shadow-beta-mint/10'
                    : 'border-clinical-white/10 bg-omega-surface hover:border-beta-mint/40 hover:shadow-md hover:shadow-beta-mint/5'
                }`}
              >
                {/* Hover glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 ${
                  isSelected ? 'opacity-100' : 'group-hover:opacity-60'
                }`} />

                <div className="relative flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
                    isSelected
                      ? 'bg-beta-mint/20 text-beta-mint'
                      : 'bg-clinical-white/5 text-clinical-white/50 group-hover:bg-beta-mint/15 group-hover:text-beta-mint'
                  }`}>
                    <Icon size={32} />
                  </div>

                  {/* Text */}
                  <h3 className={`text-lg font-bold transition-colors duration-300 ${
                    isSelected ? 'text-beta-mint' : 'text-clinical-white group-hover:text-beta-mint'
                  }`}>
                    {label}
                  </h3>
                  <p className={`mt-2 text-xs leading-relaxed transition-colors duration-300 ${
                    isSelected ? 'text-clinical-white/60' : 'text-clinical-white/35 group-hover:text-clinical-white/50'
                  }`}>
                    {description}
                  </p>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-beta-mint">
                      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#4A148C" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Confirm button */}
        <div className="text-center">
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="inline-flex items-center gap-2.5 rounded-xl bg-beta-mint px-10 py-4 text-sm font-bold text-omega-dark shadow-lg shadow-beta-mint/20 transition-all hover:shadow-xl hover:shadow-beta-mint/30 active:scale-[0.97] disabled:opacity-20 disabled:shadow-none disabled:active:scale-100"
          >
            Iniciar Protocolo
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <p className="mt-4 text-[11px] text-clinical-white/25">
            Podrás cambiar esto más adelante en Configuración
          </p>
        </div>
      </div>
    </div>
  )
}
