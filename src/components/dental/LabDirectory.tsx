import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Phone,
  User,
  FlaskConical,
  Wrench,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { useDentalLabs, LAB_SERVICES, type DentalLab } from '../../hooks/useDentalLabs'

/* ── WhatsApp icon ────────────────────────────────────── */

function WaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ── Types ─────────────────────────────────────────────── */

interface FormValues {
  nombre: string
  contacto: string
  whatsapp: string
}

/* ── Service chip selector ────────────────────────────── */

function ServiceChips({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (services: string[]) => void
}) {
  function toggle(s: string) {
    onChange(
      selected.includes(s)
        ? selected.filter((x) => x !== s)
        : [...selected, s],
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {LAB_SERVICES.map((s) => {
        const isActive = selected.includes(s)
        return (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              isActive
                ? 'border-cyan-500/30 bg-cyan-500/15 text-cyan-300'
                : 'border-clinical-white/[0.06] bg-clinical-white/[0.02] text-clinical-white/30 hover:border-clinical-white/10 hover:text-clinical-white/50'
            }`}
          >
            {isActive && <Check size={10} className="mr-1 inline" />}
            {s}
          </button>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   LAB FORM (Add / Edit)
   ══════════════════════════════════════════════════════════ */

function LabForm({
  lab,
  onSave,
  onCancel,
}: {
  lab?: DentalLab
  onSave: (data: Omit<DentalLab, 'id'>) => void
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nombre: lab?.nombre ?? '',
      contacto: lab?.contacto ?? '',
      whatsapp: lab?.whatsapp ?? '',
    },
  })

  const [servicios, setServicios] = useState<string[]>(lab?.servicios ?? [])

  function onSubmit(data: FormValues) {
    if (servicios.length === 0) {
      toast.error('Selecciona al menos un servicio')
      return
    }

    const cleanPhone = data.whatsapp.replace(/\D/g, '')
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      toast.error('Número de WhatsApp inválido')
      return
    }

    const phone = cleanPhone.startsWith('502') ? cleanPhone : `502${cleanPhone}`

    onSave({
      nombre: data.nombre.trim(),
      contacto: data.contacto.trim(),
      whatsapp: phone,
      servicios,
    })
  }

  const inputClass =
    'w-full rounded-lg border border-cyan-500/20 bg-omega-abyss px-3 py-2.5 text-sm text-clinical-white outline-none transition-colors focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 placeholder:text-clinical-white/25'

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border border-cyan-500/15 bg-omega-abyss/60 p-5"
    >
      <h3 className="flex items-center gap-2 text-sm font-bold text-clinical-white">
        <FlaskConical size={15} className="text-cyan-400" />
        {lab ? 'Editar Laboratorio' : 'Nuevo Laboratorio'}
      </h3>

      {/* Nombre */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-clinical-white/40">
          Nombre Comercial
        </label>
        <input
          {...register('nombre', { required: 'El nombre es obligatorio' })}
          placeholder="Ej: Lab Dental Pro"
          className={inputClass}
        />
        {errors.nombre && (
          <p className="mt-1 text-[11px] text-red-400">{errors.nombre.message}</p>
        )}
      </div>

      {/* Contacto */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-clinical-white/40">
          Mecánico / Contacto
        </label>
        <input
          {...register('contacto', { required: 'El contacto es obligatorio' })}
          placeholder="Ej: Juan el Técnico"
          className={inputClass}
        />
        {errors.contacto && (
          <p className="mt-1 text-[11px] text-red-400">{errors.contacto.message}</p>
        )}
      </div>

      {/* WhatsApp */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-clinical-white/40">
          Número de WhatsApp
        </label>
        <div className="relative">
          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-clinical-white/25" />
          <input
            {...register('whatsapp', {
              required: 'El WhatsApp es obligatorio',
              pattern: {
                value: /^[+\d\s()-]{8,18}$/,
                message: 'Formato inválido (solo números, +, espacios)',
              },
            })}
            placeholder="502 1234 5678"
            className={`${inputClass} pl-9`}
          />
        </div>
        {errors.whatsapp && (
          <p className="mt-1 text-[11px] text-red-400">{errors.whatsapp.message}</p>
        )}
        <p className="mt-1 text-[10px] text-clinical-white/20">
          Formato internacional con código de país (502 para Guatemala)
        </p>
      </div>

      {/* Servicios */}
      <div>
        <label className="mb-2 block text-[11px] font-medium text-clinical-white/40">
          Servicios que ofrece
        </label>
        <ServiceChips selected={servicios} onChange={setServicios} />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-clinical-white/10 px-4 py-2 text-sm font-medium text-clinical-white/40 transition-colors hover:bg-clinical-white/5"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2 text-sm font-bold text-omega-abyss transition-colors hover:bg-cyan-400 active:scale-[0.97]"
        >
          {lab ? <Check size={16} /> : <Plus size={16} />}
          {lab ? 'Guardar Cambios' : 'Agregar Lab'}
        </button>
      </div>
    </motion.form>
  )
}

/* ══════════════════════════════════════════════════════════
   LAB CARD
   ══════════════════════════════════════════════════════════ */

function LabCard({
  lab,
  onEdit,
  onDelete,
}: {
  lab: DentalLab
  onEdit: () => void
  onDelete: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleTestWhatsApp() {
    const msg = 'Hola, probando conexión con Beta Clinic. Este es un mensaje de prueba.'
    window.open(`https://wa.me/${lab.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank')
    toast.success(`WhatsApp abierto para ${lab.nombre}`)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="rounded-xl border border-clinical-white/[0.06] bg-omega-abyss/60 p-4 transition-colors hover:border-cyan-500/15"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-sm font-bold text-cyan-300">
          {lab.nombre.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-clinical-white">{lab.nombre}</p>
          <div className="mt-0.5 flex items-center gap-3 text-[11px] text-clinical-white/40">
            <span className="flex items-center gap-1">
              <User size={10} />
              {lab.contacto}
            </span>
            <span className="flex items-center gap-1">
              <Phone size={10} />
              +{lab.whatsapp}
            </span>
          </div>
        </div>
      </div>

      {/* Service tags */}
      <div className="mt-3 flex flex-wrap gap-1">
        {lab.servicios.map((s) => (
          <span
            key={s}
            className="rounded-full border border-cyan-500/15 bg-cyan-500/[0.07] px-2 py-0.5 text-[10px] font-medium text-cyan-300/70"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-1.5 border-t border-clinical-white/[0.04] pt-3">
        {/* Test WhatsApp */}
        <button
          onClick={handleTestWhatsApp}
          className="flex h-7 items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 text-[10px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
          title="Probar conexión WhatsApp"
        >
          <WaIcon size={12} />
          Probar
        </button>

        <div className="flex-1" />

        {/* Edit */}
        <button
          onClick={onEdit}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-clinical-white/[0.06] text-clinical-white/30 transition-colors hover:border-cyan-500/20 hover:bg-cyan-500/10 hover:text-cyan-400"
          title="Editar"
        >
          <Pencil size={13} />
        </button>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onDelete()
                setConfirmDelete(false)
              }}
              className="flex h-7 items-center gap-1 rounded-lg bg-red-500/15 px-2.5 text-[10px] font-semibold text-red-400 transition-colors hover:bg-red-500/25"
            >
              <AlertTriangle size={11} />
              Confirmar
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-clinical-white/[0.06] text-clinical-white/30 transition-colors hover:bg-clinical-white/5"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-clinical-white/[0.06] text-clinical-white/30 transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT — Slide-over Panel
   ══════════════════════════════════════════════════════════ */

export default function LabDirectory({ onClose }: { onClose: () => void }) {
  const { labs, addLab, updateLab, deleteLab } = useDentalLabs()

  const [formMode, setFormMode] = useState<'closed' | 'add' | 'edit'>('closed')
  const [editingLab, setEditingLab] = useState<DentalLab | undefined>()

  async function handleAdd(data: Omit<DentalLab, 'id'>) {
    await addLab(data)
    setFormMode('closed')
  }

  async function handleUpdate(data: Omit<DentalLab, 'id'>) {
    if (!editingLab) return
    await updateLab(editingLab.id, data)
    setFormMode('closed')
    setEditingLab(undefined)
  }

  async function handleDelete(id: number) {
    await deleteLab(id)
  }

  function startEdit(lab: DentalLab) {
    setEditingLab(lab)
    setFormMode('edit')
  }

  function cancelForm() {
    setFormMode('closed')
    setEditingLab(undefined)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
        className="relative z-10 flex w-full max-w-md flex-col border-l border-cyan-500/15 bg-gray-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15">
              <Wrench size={18} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-clinical-white">Directorio de Labs</h2>
              <p className="text-[11px] text-clinical-white/35">
                {labs.length} laboratorio{labs.length !== 1 ? 's' : ''} registrado{labs.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-clinical-white/30 transition-colors hover:bg-clinical-white/5 hover:text-clinical-white/60"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            {/* Add button (when form is closed) */}
            {formMode === 'closed' && (
              <button
                onClick={() => setFormMode('add')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-500/25 bg-cyan-500/[0.03] py-3.5 text-sm font-semibold text-cyan-400 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/[0.06]"
              >
                <Plus size={18} />
                Agregar Laboratorio
              </button>
            )}

            {/* Form (add or edit) */}
            <AnimatePresence mode="wait">
              {formMode === 'add' && (
                <LabForm
                  key="add-form"
                  onSave={handleAdd}
                  onCancel={cancelForm}
                />
              )}
              {formMode === 'edit' && editingLab && (
                <LabForm
                  key={`edit-${editingLab.id}`}
                  lab={editingLab}
                  onSave={handleUpdate}
                  onCancel={cancelForm}
                />
              )}
            </AnimatePresence>

            {/* Lab list */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-clinical-white/30">
                Laboratorios activos
              </h3>
              <AnimatePresence mode="popLayout">
                {labs.map((lab) => (
                  <LabCard
                    key={lab.id}
                    lab={lab}
                    onEdit={() => startEdit(lab)}
                    onDelete={() => handleDelete(lab.id)}
                  />
                ))}
              </AnimatePresence>

              {labs.length === 0 && (
                <div className="rounded-xl border border-dashed border-clinical-white/[0.06] py-12 text-center">
                  <FlaskConical size={32} className="mx-auto text-clinical-white/10" />
                  <p className="mt-2 text-xs text-clinical-white/25">
                    No hay laboratorios registrados
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-cyan-500/10 px-6 py-3">
          <p className="text-[10px] leading-relaxed text-clinical-white/20">
            Los laboratorios aquí listados aparecen disponibles al crear una nueva orden en el Lab Tracker.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
