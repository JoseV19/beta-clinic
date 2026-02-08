import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  X,
  Save,
  Trash2,
  User,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import type { Patient } from '../data/patients'

/* ── Types ────────────────────────────────────────────── */

interface FormValues {
  nombre: string
  documento: string
  fechaNacimiento: string
  genero: 'M' | 'F'
  telefono: string
  email: string
  antecedentes: string
  estado: 'activo' | 'inactivo'
}

interface Props {
  patient: Patient
  open: boolean
  onClose: () => void
  onPatientUpdated: (updated: Patient) => void
  onPatientDeleted?: (id: number) => void
}

/* ── Component ────────────────────────────────────────── */

export default function EditPatientModal({
  patient,
  open,
  onClose,
  onPatientUpdated,
  onPatientDeleted,
}: Props) {
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: patientToForm(patient),
  })

  // Reset form when patient changes
  useEffect(() => {
    reset(patientToForm(patient))
    setShowDeleteConfirm(false)
  }, [patient, reset])

  /* ── Helpers ─────────────────────────────────────────── */

  function patientToForm(p: Patient): FormValues {
    return {
      nombre: p.nombre,
      documento: p.documento,
      fechaNacimiento: p.fechaNacimiento ?? '',
      genero: p.genero,
      telefono: p.telefono,
      email: p.email ?? '',
      antecedentes: p.antecedentes ?? '',
      estado: p.estado,
    }
  }

  /* ── Submit ──────────────────────────────────────────── */

  async function onSubmit(data: FormValues) {
    setIsSaving(true)

    const edad = data.fechaNacimiento
      ? Math.floor(
          (Date.now() - new Date(data.fechaNacimiento).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000),
        )
      : patient.edad

    const updated: Patient = {
      ...patient,
      nombre: data.nombre,
      documento: data.documento,
      fechaNacimiento: data.fechaNacimiento || undefined,
      genero: data.genero,
      telefono: data.telefono,
      email: data.email || undefined,
      antecedentes: data.antecedentes || undefined,
      estado: data.estado,
      edad,
    }

    onPatientUpdated(updated)
    setIsSaving(false)
    toast.success('Datos del paciente actualizados correctamente')
    onClose()
  }

  /* ── Delete ──────────────────────────────────────────── */

  async function handleDelete() {
    setIsDeleting(true)
    onPatientDeleted?.(patient.id)
    setIsDeleting(false)
    toast.success('Paciente archivado correctamente')
    onClose()
  }

  /* ── Shared input classes ────────────────────────────── */

  const inputBase =
    'w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-clinical-white outline-none transition-all placeholder:text-gray-500 focus:border-beta-mint/50 focus:ring-2 focus:ring-beta-mint/15'
  const inputWithIcon = `${inputBase} pl-10`
  const labelCls = 'mb-1.5 block text-xs font-medium text-gray-400'
  const errorCls = 'mt-1 text-xs text-red-400'

  /* ── Render ──────────────────────────────────────────── */

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl shadow-black/40"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-700/60 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-omega-violet/20">
                  <User size={18} className="text-omega-violet" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-clinical-white">
                    Editar Paciente
                  </h2>
                  <p className="text-xs text-gray-500">
                    ID #{patient.id} — {patient.documento}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-clinical-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5">
                {/* Row 1: Nombre + Documento */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Nombre Completo *</label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      <input
                        {...register('nombre', {
                          required: 'El nombre es obligatorio',
                        })}
                        className={inputWithIcon}
                        placeholder="Nombre del paciente"
                      />
                    </div>
                    {errors.nombre && (
                      <p className={errorCls}>{errors.nombre.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Documento *</label>
                    <div className="relative">
                      <FileText
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      <input
                        {...register('documento', {
                          required: 'El documento es obligatorio',
                        })}
                        className={inputWithIcon}
                        placeholder="1.023.456.789"
                      />
                    </div>
                    {errors.documento && (
                      <p className={errorCls}>{errors.documento.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Fecha Nacimiento + Género */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Fecha de Nacimiento</label>
                    <input
                      type="date"
                      {...register('fechaNacimiento')}
                      className={`${inputBase} [color-scheme:dark]`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Género *</label>
                    <select
                      {...register('genero', {
                        required: 'Selecciona un género',
                      })}
                      className={inputBase}
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                    {errors.genero && (
                      <p className={errorCls}>{errors.genero.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 3: Teléfono + Email */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Teléfono *</label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      <input
                        {...register('telefono', {
                          required: 'El teléfono es obligatorio',
                        })}
                        className={inputWithIcon}
                        placeholder="310 456 7890"
                      />
                    </div>
                    {errors.telefono && (
                      <p className={errorCls}>{errors.telefono.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      <input
                        type="email"
                        {...register('email')}
                        className={inputWithIcon}
                        placeholder="paciente@correo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 4: Estado */}
                <div>
                  <label className={labelCls}>Estado</label>
                  <select {...register('estado')} className={inputBase}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>

                {/* Row 5: Antecedentes */}
                <div>
                  <label className={labelCls}>
                    Antecedentes / Alergias
                  </label>
                  <textarea
                    {...register('antecedentes')}
                    rows={3}
                    className={`${inputBase} resize-none`}
                    placeholder="Alergias, condiciones previas, medicamentos crónicos…"
                  />
                </div>

                {/* ── Danger Zone ────────────────────────── */}
                {onPatientDeleted && (
                  <div className="mt-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-red-400">
                      <AlertTriangle size={16} />
                      Zona de Peligro
                    </div>

                    {!showDeleteConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                        Archivar Expediente
                      </button>
                    ) : (
                      <div className="mt-3 space-y-3">
                        <p className="text-xs text-red-300/70">
                          Esta acción archivará al paciente y no podrá
                          acceder a su expediente. ¿Estás seguro?
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            Sí, archivar
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="rounded-lg px-3 py-2 text-xs text-gray-400 transition-colors hover:bg-gray-800"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-700/60 px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-clinical-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  className="flex items-center gap-2 rounded-lg bg-beta-mint px-5 py-2.5 text-sm font-semibold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 hover:shadow-lg hover:shadow-beta-mint/25 active:scale-[0.97] disabled:opacity-50 disabled:shadow-none"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving ? 'Guardando…' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
