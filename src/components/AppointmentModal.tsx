import { useState, useEffect } from 'react'
import { X, Save, Trash2, Loader2, CalendarDays } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useData } from '../context/DataContext'
import { useSettings } from '../context/SettingsContext'
import ConfirmDialog from './ui/ConfirmDialog'
import type { AgendaAppointment, AppointmentType, AppointmentStatus } from '../types/phase2'

interface Props {
  appointment?: AgendaAppointment
  defaultDate?: string
  defaultHora?: string
  open: boolean
  onClose: () => void
}

const TIPOS: { key: AppointmentType; label: string }[] = [
  { key: 'consulta', label: 'Consulta' },
  { key: 'control', label: 'Control' },
  { key: 'especialista', label: 'Especialista' },
  { key: 'urgencia', label: 'Urgencia' },
  { key: 'laboratorio', label: 'Laboratorio' },
]

const DURACIONES = [15, 30, 45, 60]

const ESTADOS: { key: AppointmentStatus; label: string }[] = [
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'confirmada', label: 'Confirmada' },
  { key: 'completada', label: 'Completada' },
  { key: 'cancelada', label: 'Cancelada' },
  { key: 'no_show', label: 'No Show' },
]

const inputCls =
  'w-full rounded-lg border border-clinical-white/10 bg-omega-abyss px-3 py-2.5 text-sm text-clinical-white outline-none transition-all placeholder:text-clinical-white/25 focus:border-beta-mint/40 focus:ring-2 focus:ring-beta-mint/10'
const labelCls = 'mb-1.5 block text-xs font-medium text-clinical-white/40'

export default function AppointmentModal({ appointment, defaultDate, defaultHora, open, onClose }: Props) {
  const { patients, addAppointment, updateAppointment, deleteAppointment } = useData()
  const { doctor } = useSettings()

  const isEdit = !!appointment
  const today = new Date().toISOString().split('T')[0]

  const [patientId, setPatientId] = useState(appointment?.patientId ?? (patients[0]?.id ?? 0))
  const [fecha, setFecha] = useState(appointment?.fecha ?? defaultDate ?? today)
  const [hora, setHora] = useState(appointment?.hora ?? defaultHora ?? '')
  const [duracion, setDuracion] = useState(appointment?.duracion ?? 30)
  const [tipo, setTipo] = useState<AppointmentType>(appointment?.tipo ?? 'consulta')
  const [doctorName, setDoctorName] = useState(appointment?.doctor ?? doctor.nombre)
  const [estado, setEstado] = useState<AppointmentStatus>(appointment?.estado ?? 'pendiente')
  const [notas, setNotas] = useState(appointment?.notas ?? '')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (appointment) {
      setPatientId(appointment.patientId)
      setFecha(appointment.fecha)
      setHora(appointment.hora)
      setDuracion(appointment.duracion)
      setTipo(appointment.tipo)
      setDoctorName(appointment.doctor)
      setEstado(appointment.estado)
      setNotas(appointment.notas ?? '')
    }
  }, [appointment])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hora) return

    setSaving(true)
    const patientName = patients.find(p => p.id === patientId)?.nombre ?? 'Desconocido'

    if (isEdit && appointment) {
      updateAppointment({
        ...appointment,
        patientId,
        patientName,
        fecha,
        hora,
        duracion,
        tipo,
        doctor: doctorName,
        estado,
        notas: notas || undefined,
      })
      toast.success('Cita actualizada')
    } else {
      addAppointment({
        patientId,
        patientName,
        fecha,
        hora,
        duracion,
        tipo,
        doctor: doctorName,
        estado,
        notas: notas || undefined,
      })
      toast.success('Cita agendada')
    }
    setSaving(false)
    onClose()
  }

  function handleDelete() {
    if (!appointment) return
    deleteAppointment(appointment.id)
    toast.success('Cita eliminada')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-clinical-white/10 bg-omega-surface shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-clinical-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-omega-violet/20">
              <CalendarDays size={18} className="text-omega-violet" />
            </div>
            <h2 className="text-base font-semibold text-clinical-white">
              {isEdit ? 'Editar Cita' : 'Nueva Cita'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-clinical-white/40 transition-colors hover:bg-clinical-white/5 hover:text-clinical-white">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5">
            {/* Paciente */}
            <div>
              <label className={labelCls}>Paciente *</label>
              <select value={patientId} onChange={e => setPatientId(Number(e.target.value))} className={inputCls}>
                {patients.length === 0 && <option value={0}>Sin pacientes registrados</option>}
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            {/* Fecha + Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Fecha *</label>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className={`${inputCls} [color-scheme:dark]`} required />
              </div>
              <div>
                <label className={labelCls}>Hora *</label>
                <input type="time" value={hora} onChange={e => setHora(e.target.value)} className={`${inputCls} [color-scheme:dark]`} required />
              </div>
            </div>

            {/* Duracion + Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Duración</label>
                <select value={duracion} onChange={e => setDuracion(Number(e.target.value))} className={inputCls}>
                  {DURACIONES.map(d => (
                    <option key={d} value={d}>{d} min</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Tipo</label>
                <select value={tipo} onChange={e => setTipo(e.target.value as AppointmentType)} className={inputCls}>
                  {TIPOS.map(t => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Doctor + Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Doctor</label>
                <input value={doctorName} onChange={e => setDoctorName(e.target.value)} className={inputCls} placeholder="Dr. ..." />
              </div>
              <div>
                <label className={labelCls}>Estado</label>
                <select value={estado} onChange={e => setEstado(e.target.value as AppointmentStatus)} className={inputCls}>
                  {ESTADOS.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className={labelCls}>Notas</label>
              <textarea
                rows={2}
                value={notas}
                onChange={e => setNotas(e.target.value)}
                className={`${inputCls} resize-none`}
                placeholder="Observaciones..."
              />
            </div>

            {/* Delete zone */}
            {isEdit && (
              <button type="button" onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10">
                <Trash2 size={14} />
                Eliminar Cita
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-clinical-white/10 px-6 py-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-medium text-clinical-white/40 transition-colors hover:bg-clinical-white/5 hover:text-clinical-white">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !hora}
              className="flex items-center gap-2 rounded-lg bg-beta-mint px-5 py-2.5 text-sm font-semibold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isEdit ? 'Guardar Cambios' : 'Agendar Cita'}
            </button>
          </div>
        </form>

        <ConfirmDialog
          open={showDeleteConfirm}
          title="Eliminar cita"
          message="¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  )
}
