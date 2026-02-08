import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Building2,
  Palette,
  AlertTriangle,
  Save,
  Trash2,
  Check,
  Stethoscope,
  SmilePlus,
  Baby,
  Apple,
  Layers,
  ChevronRight,
  Printer,
} from 'lucide-react'
import {
  useSettings,
  accentColorMap,
  type AccentColor,
} from '../context/SettingsContext'
import { useClinic, type ClinicType } from '../context/ClinicContext'

/* ── Shared styles ────────────────────────────────────── */

const inputClass =
  'w-full rounded-lg border border-omega-violet/20 bg-clinical-white px-3 py-2 text-sm text-omega-dark outline-none focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10'

const sectionClass =
  'rounded-xl border border-omega-violet/20 bg-white p-6 dark:border-clinical-white/10 dark:bg-omega-surface'

const sectionTitle = 'flex items-center gap-2 text-lg font-bold text-omega-dark dark:text-clinical-white'

/* ── Accent color options ─────────────────────────────── */

const accentOptions: { key: AccentColor; label: string }[] = [
  { key: 'mint', label: 'Menta' },
  { key: 'blue', label: 'Azul' },
  { key: 'pink', label: 'Rosa' },
  { key: 'orange', label: 'Naranja' },
]

/* ── Specialty options ───────────────────────────────── */

const SPECIALTIES: {
  type: ClinicType
  label: string
  description: string
  icon: React.FC<{ size?: number }>
}[] = [
  { type: 'general', label: 'Medicina General', description: 'Consultas, recetas y laboratorios', icon: Stethoscope },
  { type: 'dental', label: 'Odontología', description: 'Odontograma y presupuestos dentales', icon: SmilePlus },
  { type: 'pediatrics', label: 'Pediatría', description: 'Crecimiento y vacunación infantil', icon: Baby },
  { type: 'nutrition', label: 'Nutrición', description: 'Planes alimentarios y evaluaciones', icon: Apple },
]

/* ── Component ────────────────────────────────────────── */

export default function Settings() {
  const { clinic, setClinic, appearance, setAppearance, clearAllData } = useSettings()
  const { clinicType, setClinicType } = useClinic()

  // Local form state for clinic profile
  const [form, setForm] = useState(clinic)
  const [confirmClear, setConfirmClear] = useState(false)

  function handleSpecialtyChange(type: ClinicType) {
    if (type === clinicType) return
    setClinicType(type)
    const label = SPECIALTIES.find(s => s.type === type)?.label ?? type
    toast.success(`Cambiando a protocolo ${label}...`)
    setTimeout(() => window.location.reload(), 1000)
  }

  function handleProfileChange(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setClinic(form)
    toast.success('Perfil de la clínica guardado')
  }

  function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    clearAllData()
  }

  const profileFields: { key: keyof typeof form; label: string; placeholder: string }[] = [
    { key: 'nombre', label: 'Nombre de la Clínica', placeholder: 'Ej. Beta Clinic' },
    { key: 'nit', label: 'NIT', placeholder: 'Ej. 900.123.456-7' },
    { key: 'direccion', label: 'Dirección', placeholder: 'Ej. Calle 100 #15-20, Bogotá D.C.' },
    { key: 'telefono', label: 'Teléfono', placeholder: 'Ej. (601) 555-0100' },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Configuración</h1>
        <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
          Personaliza tu experiencia en Beta Clinic
        </p>
      </div>

      {/* ── Section 0: Active Specialty ─────────────────── */}
      <div className={sectionClass}>
        <h2 className={sectionTitle}>
          <Layers size={20} className="text-omega-violet dark:text-beta-mint" />
          Módulo Clínico Activo
        </h2>
        <p className="mt-1 mb-5 text-xs text-omega-dark/50 dark:text-clinical-white/40">
          Selecciona la especialidad para adaptar las herramientas del sistema
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SPECIALTIES.map(({ type, label, description, icon: Icon }) => {
            const isActive = type === clinicType
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleSpecialtyChange(type)}
                className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                  isActive
                    ? 'border-beta-mint bg-beta-mint/10 shadow-md shadow-beta-mint/10 dark:bg-beta-mint/5'
                    : 'border-omega-violet/15 hover:border-beta-mint/40 hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:hover:border-beta-mint/30 dark:hover:bg-clinical-white/5'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? 'bg-beta-mint/20 text-beta-mint'
                      : 'bg-omega-dark/5 text-omega-dark/40 group-hover:bg-beta-mint/10 group-hover:text-beta-mint dark:bg-clinical-white/5 dark:text-clinical-white/30'
                  }`}
                >
                  <Icon size={22} />
                </div>
                <span
                  className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-beta-mint'
                      : 'text-omega-dark dark:text-clinical-white'
                  }`}
                >
                  {label}
                </span>
                <span className="text-[11px] leading-tight text-omega-dark/40 dark:text-clinical-white/30">
                  {description}
                </span>
                {isActive && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-beta-mint">
                    <Check size={12} className="text-omega-dark" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Section 1: Clinic Profile ──────────────────── */}
      <form onSubmit={handleProfileSave} className={sectionClass}>
        <h2 className={sectionTitle}>
          <Building2 size={20} className="text-omega-violet dark:text-beta-mint" />
          Perfil de la Clínica
        </h2>
        <p className="mt-1 mb-5 text-xs text-omega-dark/50 dark:text-clinical-white/40">
          Estos datos se usan en el encabezado de las recetas PDF
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {profileFields.map(({ key, label, placeholder }) => (
            <div key={key} className={key === 'direccion' ? 'sm:col-span-2' : ''}>
              <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
                {label}
              </label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => handleProfileChange(key, e.target.value)}
                placeholder={placeholder}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        {/* Link to full clinic settings */}
        <Link
          to="/configuracion/clinica"
          className="mt-4 flex items-center justify-between rounded-xl border border-omega-violet/10 px-4 py-3 transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:hover:bg-clinical-white/5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-omega-violet/10 dark:bg-omega-violet/20">
              <Printer size={16} className="text-omega-violet dark:text-beta-mint" />
            </div>
            <div>
              <p className="text-sm font-medium text-omega-dark dark:text-clinical-white">Configuración Avanzada</p>
              <p className="text-xs text-omega-dark/50 dark:text-clinical-white/40">
                Logo, perfil del doctor, vista previa de impresión y más
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-omega-dark/30 dark:text-clinical-white/30" />
        </Link>

        <button
          type="submit"
          className="mt-5 flex items-center gap-2 rounded-lg bg-beta-mint px-5 py-2.5 text-sm font-semibold text-omega-dark transition-colors hover:bg-beta-mint/80"
        >
          <Save size={16} />
          Guardar Perfil
        </button>
      </form>

      {/* ── Section 2: Appearance ──────────────────────── */}
      <div className={sectionClass}>
        <h2 className={sectionTitle}>
          <Palette size={20} className="text-omega-violet dark:text-beta-mint" />
          Apariencia
        </h2>
        <p className="mt-1 mb-5 text-xs text-omega-dark/50 dark:text-clinical-white/40">
          Ajusta el aspecto visual de la aplicación
        </p>

        {/* Reduced animations toggle */}
        <div className="flex items-center justify-between rounded-lg border border-omega-violet/10 px-4 py-3 dark:border-clinical-white/10">
          <div>
            <p className="text-sm font-medium text-omega-dark dark:text-clinical-white">Animaciones Reducidas</p>
            <p className="text-xs text-omega-dark/50 dark:text-clinical-white/40">
              Desactiva transiciones y animaciones para accesibilidad
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAppearance((a) => ({ ...a, reducedAnimations: !a.reducedAnimations }))}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              appearance.reducedAnimations
                ? 'bg-beta-mint'
                : 'bg-omega-dark/20 dark:bg-clinical-white/20'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                appearance.reducedAnimations ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Accent color selector */}
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-omega-dark dark:text-clinical-white">Color de Acento</p>
          <div className="flex flex-wrap gap-3">
            {accentOptions.map(({ key, label }) => {
              const hex = accentColorMap[key]
              const isActive = appearance.accentColor === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAppearance((a) => ({ ...a, accentColor: key }))}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-omega-violet/30 bg-omega-violet/10 text-omega-dark dark:border-clinical-white/20 dark:bg-clinical-white/10 dark:text-clinical-white'
                      : 'border-omega-violet/10 text-omega-dark/60 hover:border-omega-violet/20 hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/50 dark:hover:bg-clinical-white/5'
                  }`}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ backgroundColor: hex }}
                  >
                    {isActive && <Check size={12} className="text-omega-dark" />}
                  </span>
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Section 3: Danger Zone ─────────────────────── */}
      <div className="rounded-xl border border-alert-red/30 bg-white p-6 dark:border-alert-red/20 dark:bg-omega-surface">
        <h2 className="flex items-center gap-2 text-lg font-bold text-alert-red">
          <AlertTriangle size={20} />
          Zona de Peligro
        </h2>
        <p className="mt-1 mb-5 text-xs text-omega-dark/50 dark:text-clinical-white/40">
          Acciones irreversibles que afectan todos los datos de la aplicación
        </p>

        <div className="flex items-center justify-between rounded-lg border border-alert-red/20 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-omega-dark dark:text-clinical-white">Borrar todos los datos</p>
            <p className="text-xs text-omega-dark/50 dark:text-clinical-white/40">
              Elimina pacientes, citas, finanzas y configuración
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearAll}
            onBlur={() => setConfirmClear(false)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              confirmClear
                ? 'bg-alert-red text-white'
                : 'border border-alert-red/30 text-alert-red hover:bg-alert-red/10'
            }`}
          >
            <Trash2 size={16} />
            {confirmClear ? 'Confirmar Borrado' : 'Borrar Todo'}
          </button>
        </div>
      </div>
    </div>
  )
}
