import { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  User,
  Building2,
  Printer,
  Save,
  Upload,
  Camera,
  Phone,
  Mail,
  MapPin,
  FileText,
  Award,
  Stethoscope,
  RotateCcw,
  Loader2,
  ImagePlus,
  Trash2,
} from 'lucide-react'
import {
  useSettings,
  defaultDoctor,
  defaultPrint,
  type DoctorProfile,
  type ClinicProfile,
  type PrintSettings,
} from '../context/SettingsContext'

/* ── Tab definition ────────────────────────────────────── */

type Tab = 'perfil' | 'clinica' | 'impresion'

const TABS: { key: Tab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { key: 'perfil', label: 'Perfil', icon: User },
  { key: 'clinica', label: 'Clínica', icon: Building2 },
  { key: 'impresion', label: 'Impresión', icon: Printer },
]

/* ── Accent presets for print ──────────────────────────── */

const PRINT_COLORS = [
  { hex: '#7C3AED', label: 'Violeta' },
  { hex: '#2563EB', label: 'Azul' },
  { hex: '#059669', label: 'Esmeralda' },
  { hex: '#D97706', label: 'Dorado' },
  { hex: '#DC2626', label: 'Rojo' },
  { hex: '#0D9488', label: 'Teal' },
]

/* ── Specialty options ─────────────────────────────────── */

const SPECIALTIES = [
  'Medicina General',
  'Ortodoncista',
  'Odontología General',
  'Pediatra',
  'Nutricionista',
  'Dermatología',
  'Cardiología',
  'Cirugía General',
  'Ginecología',
  'Oftalmología',
]

/* ── Shared styles ─────────────────────────────────────── */

const inputBase =
  'w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-clinical-white outline-none transition-all placeholder:text-gray-500 focus:border-beta-mint/50 focus:ring-2 focus:ring-beta-mint/15'
const inputIcon = `${inputBase} pl-10`
const labelCls = 'mb-1.5 block text-xs font-medium text-gray-400'

/* ── Component ─────────────────────────────────────────── */

export default function ClinicSettings() {
  const { clinic, setClinic, doctor, setDoctor, printSettings, setPrintSettings } = useSettings()
  const [tab, setTab] = useState<Tab>('perfil')
  const [isSaving, setIsSaving] = useState(false)

  /* ── Doctor form ─────────────────────────────────────── */

  const doctorForm = useForm<DoctorProfile & { avatar?: string }>({
    defaultValues: { ...doctor },
  })

  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(doctor.avatar)
  const avatarRef = useRef<HTMLInputElement>(null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar 2 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setAvatarPreview(result)
      doctorForm.setValue('avatar', result, { shouldDirty: true })
    }
    reader.readAsDataURL(file)
  }

  /* ── Clinic form ─────────────────────────────────────── */

  const clinicForm = useForm<ClinicProfile & { logo?: string }>({
    defaultValues: { ...clinic },
  })

  const [logoPreview, setLogoPreview] = useState<string | undefined>(clinic.logo)
  const logoRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleLogoDrop = useCallback(
    (file: File) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('El logo no debe superar 2 MB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setLogoPreview(result)
        clinicForm.setValue('logo', result, { shouldDirty: true })
      }
      reader.readAsDataURL(file)
    },
    [clinicForm],
  )

  function handleLogoInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleLogoDrop(file)
  }

  /* ── Print form ──────────────────────────────────────── */

  const printForm = useForm<PrintSettings>({
    defaultValues: { ...printSettings },
  })
  const watchPrint = printForm.watch()

  /* ── Save all ────────────────────────────────────────── */

  async function handleSaveAll() {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 700))

    const dVals = doctorForm.getValues()
    setDoctor({ nombre: dVals.nombre, especialidad: dVals.especialidad, licencia: dVals.licencia, avatar: dVals.avatar ?? avatarPreview })

    const cVals = clinicForm.getValues()
    setClinic({ nombre: cVals.nombre, direccion: cVals.direccion, telefono: cVals.telefono, nit: cVals.nit, logo: cVals.logo ?? logoPreview })

    setPrintSettings(printForm.getValues())

    doctorForm.reset(dVals)
    clinicForm.reset(cVals)
    printForm.reset(printForm.getValues())

    setIsSaving(false)
    toast.success('Configuración guardada correctamente')
  }

  /* ── Reset factory ───────────────────────────────────── */

  const [confirmReset, setConfirmReset] = useState(false)

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    doctorForm.reset(defaultDoctor)
    setAvatarPreview(undefined)
    clinicForm.reset({ nombre: 'Beta Clinic', direccion: 'Calle 100 #15-20, Bogotá D.C., Colombia', telefono: '(601) 555-0100', nit: '900.123.456-7' })
    setLogoPreview(undefined)
    printForm.reset(defaultPrint)
    setConfirmReset(false)
    toast('Valores restaurados. Presiona Guardar para aplicar.', { icon: '🔄' })
  }

  /* ── Live preview data ───────────────────────────────── */

  const previewDoctor = doctorForm.watch()
  const previewClinic = clinicForm.watch()

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">
            Configuración de Clínica
          </h1>
          <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
            Estos datos se usan en recetas, presupuestos y reportes PDF
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            onBlur={() => setConfirmReset(false)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              confirmReset
                ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30'
                : 'text-gray-400 hover:bg-gray-800 hover:text-clinical-white'
            }`}
          >
            <RotateCcw size={16} />
            {confirmReset ? 'Confirmar Reset' : 'Valores de Fábrica'}
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-beta-mint px-5 py-2.5 text-sm font-semibold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 hover:shadow-lg hover:shadow-beta-mint/25 active:scale-[0.97] disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Guardando…' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-700/50 bg-gray-900 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              tab === key
                ? 'bg-omega-violet/20 text-beta-mint shadow-inner'
                : 'text-gray-400 hover:bg-gray-800 hover:text-clinical-white'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Content area — two columns on lg: form + preview */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form column */}
        <div className="space-y-6 lg:col-span-3">
          {/* ═══ TAB: PERFIL ════════════════════════════ */}
          {tab === 'perfil' && (
            <div className="space-y-5 rounded-2xl border border-gray-700/50 bg-gray-900 p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-clinical-white">
                <User size={18} className="text-omega-violet" />
                Perfil del Doctor
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-600 bg-gray-800">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User size={28} className="text-gray-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-omega-violet text-white shadow-lg transition-colors hover:bg-omega-violet/80"
                  >
                    <Camera size={14} />
                  </button>
                  <input
                    ref={avatarRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-clinical-white">Foto de Perfil</p>
                  <p className="text-xs text-gray-500">JPG o PNG. Máx 2 MB.</p>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarPreview(undefined)
                        doctorForm.setValue('avatar', undefined, { shouldDirty: true })
                      }}
                      className="mt-1 text-xs text-red-400 hover:text-red-300"
                    >
                      Eliminar foto
                    </button>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className={labelCls}>Nombre Completo *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    {...doctorForm.register('nombre', { required: true })}
                    className={inputIcon}
                    placeholder="Dr. Juan Pérez"
                  />
                </div>
                {doctorForm.formState.errors.nombre && (
                  <p className="mt-1 text-xs text-red-400">El nombre es obligatorio</p>
                )}
              </div>

              {/* Specialty */}
              <div>
                <label className={labelCls}>Especialidad *</label>
                <div className="relative">
                  <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    {...doctorForm.register('especialidad', { required: true })}
                    list="specialties-list"
                    className={inputIcon}
                    placeholder="Medicina General"
                  />
                  <datalist id="specialties-list">
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                {doctorForm.formState.errors.especialidad && (
                  <p className="mt-1 text-xs text-red-400">La especialidad es obligatoria</p>
                )}
              </div>

              {/* License */}
              <div>
                <label className={labelCls}>No. Colegiado / Licencia *</label>
                <div className="relative">
                  <Award size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    {...doctorForm.register('licencia', { required: true })}
                    className={inputIcon}
                    placeholder="COL-12345"
                  />
                </div>
                {doctorForm.formState.errors.licencia && (
                  <p className="mt-1 text-xs text-red-400">La licencia es obligatoria</p>
                )}
              </div>
            </div>
          )}

          {/* ═══ TAB: CLÍNICA ══════════════════════════ */}
          {tab === 'clinica' && (
            <div className="space-y-5 rounded-2xl border border-gray-700/50 bg-gray-900 p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-clinical-white">
                <Building2 size={18} className="text-omega-violet" />
                Datos de la Clínica
              </h2>

              {/* Logo Drag & Drop */}
              <div>
                <label className={labelCls}>Logo de la Clínica</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const file = e.dataTransfer.files[0]
                    if (file && file.type.startsWith('image/')) handleLogoDrop(file)
                  }}
                  onClick={() => logoRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-all ${
                    isDragging
                      ? 'border-beta-mint bg-beta-mint/5'
                      : logoPreview
                        ? 'border-gray-600 bg-gray-800/50'
                        : 'border-gray-600 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50'
                  }`}
                >
                  {logoPreview ? (
                    <div className="flex items-center gap-4">
                      <img src={logoPreview} alt="Logo" className="h-16 max-w-[200px] object-contain" />
                      <div className="text-left">
                        <p className="text-xs text-gray-400">Logo cargado</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setLogoPreview(undefined)
                            clinicForm.setValue('logo', undefined, { shouldDirty: true })
                          }}
                          className="mt-1 flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={12} /> Eliminar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ImagePlus size={28} className="text-gray-500" />
                      <p className="text-sm text-gray-400">
                        Arrastra tu logo aquí o <span className="font-medium text-beta-mint">haz click</span>
                      </p>
                      <p className="text-xs text-gray-600">PNG, JPG o SVG — Máx 2 MB</p>
                    </>
                  )}
                </div>
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoInputChange}
                  className="hidden"
                />
              </div>

              {/* Commercial name + NIT */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Nombre Comercial *</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      {...clinicForm.register('nombre', { required: true })}
                      className={inputIcon}
                      placeholder="Clínica Dental Sonrisas"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>NIT / Registro Fiscal</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      {...clinicForm.register('nit')}
                      className={inputIcon}
                      placeholder="900.123.456-7"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className={labelCls}>Dirección</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    {...clinicForm.register('direccion')}
                    className={inputIcon}
                    placeholder="Calle 100 #15-20, Bogotá D.C."
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={labelCls}>Teléfono</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    {...clinicForm.register('telefono')}
                    className={inputIcon}
                    placeholder="(601) 555-0100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB: IMPRESIÓN ═════════════════════════ */}
          {tab === 'impresion' && (
            <div className="space-y-5 rounded-2xl border border-gray-700/50 bg-gray-900 p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-clinical-white">
                <Printer size={18} className="text-omega-violet" />
                Configuración de Impresión
              </h2>
              <p className="text-xs text-gray-500">
                Personaliza el encabezado de tus documentos impresos (recetas, presupuestos, reportes)
              </p>

              {/* Accent color */}
              <div>
                <label className={labelCls}>Color de Énfasis del Encabezado</label>
                <div className="flex flex-wrap gap-2">
                  {PRINT_COLORS.map(({ hex, label }) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => printForm.setValue('accentColor', hex, { shouldDirty: true })}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                        watchPrint.accentColor === hex
                          ? 'border-clinical-white/20 bg-clinical-white/10 text-clinical-white shadow-inner'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full shadow-inner" style={{ backgroundColor: hex }} />
                      {label}
                    </button>
                  ))}
                </div>
                {/* Custom hex input */}
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-xs text-gray-500">Color personalizado:</label>
                  <input
                    type="color"
                    value={watchPrint.accentColor}
                    onChange={(e) => printForm.setValue('accentColor', e.target.value, { shouldDirty: true })}
                    className="h-8 w-10 cursor-pointer rounded border border-gray-700 bg-transparent"
                  />
                  <span className="font-mono text-xs text-gray-400">{watchPrint.accentColor}</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-gray-700/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-clinical-white">Mostrar Logo</p>
                    <p className="text-xs text-gray-500">Incluir el logo de la clínica en el encabezado</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => printForm.setValue('showLogo', !watchPrint.showLogo, { shouldDirty: true })}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      watchPrint.showLogo ? 'bg-beta-mint' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        watchPrint.showLogo ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-700/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-clinical-white">Mostrar Datos del Doctor</p>
                    <p className="text-xs text-gray-500">Nombre, especialidad y colegiado en el encabezado</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => printForm.setValue('showDoctor', !watchPrint.showDoctor, { shouldDirty: true })}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      watchPrint.showDoctor ? 'bg-beta-mint' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        watchPrint.showDoctor ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══ LIVE A4 PREVIEW ══════════════════════════ */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <p className="mb-3 text-xs font-medium text-gray-400">Vista Previa — Encabezado A4</p>
            <div className="overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900 shadow-xl shadow-black/30">
              {/* Mini A4 paper */}
              <div className="mx-auto aspect-[210/130] w-full bg-white p-4">
                {/* Accent top bar */}
                <div className="mb-3 h-1.5 w-full rounded-full" style={{ backgroundColor: watchPrint.accentColor }} />

                {/* Header content */}
                <div className="flex items-start justify-between gap-3">
                  {/* Left: logo + clinic */}
                  <div className="flex items-center gap-2.5">
                    {watchPrint.showLogo && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-0.5" />
                        ) : (
                          <Building2 size={16} className="text-gray-300" />
                        )}
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-bold leading-tight text-gray-800">
                        {previewClinic.nombre || 'Nombre de la Clínica'}
                      </p>
                      <p className="text-[8px] leading-tight text-gray-400">
                        NIT: {previewClinic.nit || '—'}
                      </p>
                      <p className="text-[7px] leading-tight text-gray-400">
                        {previewClinic.direccion || 'Dirección'}
                      </p>
                      <p className="text-[7px] leading-tight text-gray-400">
                        Tel: {previewClinic.telefono || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Right: doctor info */}
                  {watchPrint.showDoctor && (
                    <div className="text-right">
                      <p className="text-[10px] font-semibold leading-tight text-gray-700">
                        {previewDoctor.nombre || 'Dr. Nombre'}
                      </p>
                      <p className="text-[8px] leading-tight" style={{ color: watchPrint.accentColor }}>
                        {previewDoctor.especialidad || 'Especialidad'}
                      </p>
                      <p className="text-[7px] leading-tight text-gray-400">
                        Lic. {previewDoctor.licencia || '—'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div className="my-2.5 h-px w-full" style={{ backgroundColor: watchPrint.accentColor, opacity: 0.3 }} />

                {/* Placeholder body lines */}
                <div className="space-y-1.5">
                  <div className="h-1.5 w-3/4 rounded-full bg-gray-100" />
                  <div className="h-1.5 w-full rounded-full bg-gray-100" />
                  <div className="h-1.5 w-5/6 rounded-full bg-gray-100" />
                  <div className="h-1.5 w-2/3 rounded-full bg-gray-100" />
                </div>
              </div>

              {/* Label */}
              <div className="border-t border-gray-700/50 px-4 py-2.5">
                <p className="text-center text-[10px] text-gray-500">
                  Los cambios se reflejan en tiempo real
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
