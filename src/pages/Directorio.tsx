import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus,
  X,
  Phone,
  Mail,
  MapPin,
  Award,
  Search,
  Trash2,
  Clock,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { usePersistentState } from '../hooks/usePersistentState'
import ConfirmDialog from '../components/ui/ConfirmDialog'

/* ── Types ─────────────────────────────────────────────── */

interface Professional {
  id: number
  nombre: string
  especialidad: string
  estado: 'disponible' | 'ocupado'
  telefono: string
  email: string
  whatsapp: string
  consultorio: string
  registro: string
  horario: string
  activo: boolean
}

/* ── Default data ──────────────────────────────────────── */

const DEFAULT_PROFESSIONALS: Professional[] = [
  { id: 1, nombre: 'Dr. Alejandro Rodríguez', especialidad: 'Cardiología', estado: 'disponible', telefono: '5024 5678 9012', email: 'a.rodriguez@betaclinic.gt', whatsapp: '50245678912', consultorio: 'Consultorio 201', registro: 'RM-12345', horario: 'Lun–Vie 7:00–15:00', activo: true },
  { id: 2, nombre: 'Dra. Carolina Martínez', especialidad: 'Pediatría', estado: 'ocupado', telefono: '5023 1234 5678', email: 'c.martinez@betaclinic.gt', whatsapp: '50231234567', consultorio: 'Consultorio 105', registro: 'RM-23456', horario: 'Lun–Sáb 8:00–14:00', activo: true },
  { id: 3, nombre: 'Dr. Felipe Herrera', especialidad: 'Medicina Interna', estado: 'disponible', telefono: '5025 6543 2100', email: 'f.herrera@betaclinic.gt', whatsapp: '50256543210', consultorio: 'Consultorio 302', registro: 'RM-34567', horario: 'Mar–Sáb 9:00–17:00', activo: true },
  { id: 4, nombre: 'Dra. Isabel Vargas', especialidad: 'Dermatología', estado: 'disponible', telefono: '5029 8765 4321', email: 'i.vargas@betaclinic.gt', whatsapp: '50298765432', consultorio: 'Consultorio 108', registro: 'RM-45678', horario: 'Lun–Vie 8:00–16:00', activo: true },
  { id: 5, nombre: 'Dr. Sebastián Rojas', especialidad: 'Traumatología', estado: 'ocupado', telefono: '5023 4567 8901', email: 's.rojas@betaclinic.gt', whatsapp: '50234567890', consultorio: 'Consultorio 410', registro: 'RM-56789', horario: 'Lun–Vie 7:00–13:00', activo: true },
  { id: 6, nombre: 'Dra. Natalia Ríos', especialidad: 'Ginecología', estado: 'disponible', telefono: '5022 3456 7890', email: 'n.rios@betaclinic.gt', whatsapp: '50223456789', consultorio: 'Consultorio 205', registro: 'RM-67890', horario: 'Lun–Jue 9:00–17:00', activo: true },
]

/* ── Helpers ────────────────────────────────────────────── */

function getInitials(name: string) {
  return name
    .replace(/^(Dr\.|Dra\.)\s*/, '')
    .split(' ')
    .map((w) => w[0])
    .join('')
}

const COLORS = [
  'from-omega-violet to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-indigo-500',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-sky-500',
  'from-fuchsia-500 to-purple-500',
  'from-lime-500 to-green-500',
]

const EMPTY_PRO: Omit<Professional, 'id'> = {
  nombre: '', especialidad: '', estado: 'disponible', telefono: '',
  email: '', whatsapp: '', consultorio: '', registro: '', horario: '', activo: true,
}

/* ── Add/Edit Modal ───────────────────────────────────── */

function ProfessionalModal({
  pro,
  onSave,
  onClose,
}: {
  pro: Professional | null
  onSave: (data: Omit<Professional, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Omit<Professional, 'id'>>(pro ? { ...pro } : { ...EMPTY_PRO })
  const set = (field: keyof typeof form, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }))

  const inputCls = 'w-full rounded-lg border border-clinical-white/10 bg-omega-abyss px-3 py-2 text-sm text-clinical-white outline-none placeholder:text-clinical-white/30 focus:border-beta-mint/30 focus:ring-2 focus:ring-beta-mint/10'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.especialidad.trim()) {
      toast.error('Nombre y especialidad son obligatorios')
      return
    }
    onSave(form)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-lg rounded-2xl border border-clinical-white/10 bg-omega-surface p-6 shadow-2xl"
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ type: 'spring', duration: 0.25, bounce: 0.1 }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-clinical-white">
            {pro ? 'Editar Profesional' : 'Nuevo Profesional'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-clinical-white/40 hover:bg-clinical-white/5" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-white/50">Nombre *</label>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Dr. Juan Pérez" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-white/50">Especialidad *</label>
              <input value={form.especialidad} onChange={e => set('especialidad', e.target.value)} placeholder="Cardiología" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-white/50">Teléfono</label>
              <input value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+502 1234 5678" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-white/50">WhatsApp</label>
              <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="50212345678" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-white/50">Email</label>
              <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@clinic.gt" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-white/50">Consultorio</label>
              <input value={form.consultorio} onChange={e => set('consultorio', e.target.value)} placeholder="Consultorio 201" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-white/50">Registro Médico</label>
              <input value={form.registro} onChange={e => set('registro', e.target.value)} placeholder="RM-12345" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-white/50">Horario</label>
              <input value={form.horario} onChange={e => set('horario', e.target.value)} placeholder="Lun–Vie 8:00–16:00" className={inputCls} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="mb-1 block text-xs font-medium text-clinical-white/50">Estado</label>
            <div className="flex gap-2">
              {(['disponible', 'ocupado'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('estado', s)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    form.estado === s
                      ? s === 'disponible' ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30' : 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-400/30'
                      : 'text-clinical-white/40 hover:text-clinical-white/60'
                  }`}
                >
                  {s === 'disponible' ? 'Disponible' : 'Ocupado'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-clinical-white/10 px-4 py-2 text-xs font-medium text-clinical-white/60 hover:bg-clinical-white/5">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-omega-violet px-5 py-2 text-xs font-semibold text-white hover:bg-omega-violet/80">
              {pro ? 'Guardar Cambios' : 'Crear Profesional'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

/* ── Main component ────────────────────────────────────── */

export default function Directorio() {
  const [staff, setStaff] = usePersistentState<Professional[]>('beta_directorio', DEFAULT_PROFESSIONALS)
  const [selected, setSelected] = useState<Professional | null>(null)
  const [editing, setEditing] = useState<Professional | null | 'new'>(null)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Professional | null>(null)

  const filtered = staff.filter(p =>
    p.activo && (
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.especialidad.toLowerCase().includes(search.toLowerCase())
    ),
  )

  function handleSave(data: Omit<Professional, 'id'>) {
    if (editing === 'new') {
      const id = staff.length > 0 ? Math.max(...staff.map(s => s.id)) + 1 : 1
      setStaff(prev => [...prev, { id, ...data }])
      toast.success('Profesional agregado')
    } else if (editing) {
      setStaff(prev => prev.map(p => p.id === editing.id ? { ...p, ...data } : p))
      toast.success('Profesional actualizado')
    }
    setEditing(null)
  }

  function handleDelete() {
    if (!deleteTarget) return
    setStaff(prev => prev.map(p => p.id === deleteTarget.id ? { ...p, activo: false } : p))
    setDeleteTarget(null)
    setSelected(null)
    toast.success('Profesional eliminado')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-clinical-white">Directorio Profesional</h1>
          <p className="mt-0.5 text-sm text-clinical-white/40">
            {filtered.length} profesionales registrados
          </p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 rounded-lg bg-beta-mint px-4 py-2 text-sm font-semibold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 hover:shadow-lg hover:shadow-beta-mint/25 active:scale-[0.97]"
        >
          <Plus size={18} />
          Agregar Profesional
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-clinical-white/25" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o especialidad..."
          className="w-full rounded-xl border border-clinical-white/10 bg-omega-surface py-2.5 pl-10 pr-4 text-sm text-clinical-white outline-none placeholder:text-clinical-white/30 focus:border-beta-mint/30 focus:ring-2 focus:ring-beta-mint/10"
        />
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((pro, i) => {
            const gradient = COLORS[i % COLORS.length]
            return (
              <button
                key={pro.id}
                onClick={() => setSelected(pro)}
                className="group relative overflow-hidden rounded-xl border border-clinical-white/10 bg-omega-surface text-left transition-shadow hover:shadow-lg hover:shadow-beta-mint/5"
              >
                <div className={`h-20 bg-gradient-to-br ${gradient}`} />
                <div className="flex justify-center -mt-8">
                  <span className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-lg font-bold text-white ring-4 ring-omega-surface`}>
                    {getInitials(pro.nombre)}
                  </span>
                </div>
                <div className="px-4 pb-5 pt-3 text-center">
                  <h3 className="font-semibold text-clinical-white">{pro.nombre}</h3>
                  <p className="mt-0.5 text-xs text-beta-mint/70">{pro.especialidad}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-omega-abyss px-2.5 py-1 text-xs font-medium">
                    <span className={`h-2 w-2 rounded-full ${pro.estado === 'disponible' ? 'bg-beta-mint' : 'bg-amber-400'}`} />
                    <span className="text-clinical-white/60">
                      {pro.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
                    </span>
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-clinical-white/10 py-16 text-center">
          <Users size={40} className="mx-auto text-clinical-white/15" />
          <p className="mt-3 text-sm font-medium text-clinical-white/40">
            {search ? 'No se encontraron profesionales' : 'No hay profesionales registrados'}
          </p>
          {!search && (
            <button
              onClick={() => setEditing('new')}
              className="mt-3 text-xs font-semibold text-beta-mint hover:text-beta-mint/80"
            >
              + Agregar el primero
            </button>
          )}
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-clinical-white/10 bg-omega-surface shadow-xl"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', duration: 0.25, bounce: 0.1 }}
            >
              {(() => {
                const idx = staff.findIndex(p => p.id === selected.id)
                const gradient = COLORS[idx % COLORS.length]
                return (
                  <>
                    <div className={`flex flex-col items-center bg-gradient-to-br ${gradient} px-6 pb-10 pt-6`}>
                      <button
                        onClick={() => setSelected(null)}
                        className="absolute right-3 top-3 rounded-lg p-1 text-white/60 transition-colors hover:text-white"
                        aria-label="Cerrar"
                      >
                        <X size={20} />
                      </button>
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white backdrop-blur-sm">
                        {getInitials(selected.nombre)}
                      </span>
                      <h2 className="mt-3 text-lg font-bold text-white">{selected.nombre}</h2>
                      <p className="text-sm text-white/80">{selected.especialidad}</p>
                      <span className="mt-2 flex items-center gap-1.5 text-xs text-white/70">
                        <span className={`h-2 w-2 rounded-full ${selected.estado === 'disponible' ? 'bg-beta-mint' : 'bg-amber-400'}`} />
                        {selected.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
                      </span>
                    </div>

                    <div className="-mt-4 rounded-t-2xl bg-omega-surface px-6 pb-6 pt-5">
                      <dl className="space-y-3">
                        {[
                          { icon: Phone, label: 'Teléfono', value: selected.telefono },
                          { icon: Mail, label: 'Email', value: selected.email },
                          { icon: MapPin, label: 'Consultorio', value: selected.consultorio },
                          { icon: Award, label: 'Registro Médico', value: selected.registro },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex items-start gap-3">
                            <Icon size={16} className="mt-0.5 shrink-0 text-beta-mint" />
                            <div>
                              <dt className="text-[11px] font-medium uppercase tracking-wider text-clinical-white/30">{label}</dt>
                              <dd className="text-sm text-clinical-white">{value || '—'}</dd>
                            </div>
                          </div>
                        ))}
                      </dl>

                      <p className="mt-4 flex items-center gap-2 rounded-lg bg-omega-abyss px-3 py-2 text-xs text-clinical-white/40">
                        <Clock size={12} />
                        {selected.horario}
                      </p>

                      <div className="mt-4 flex gap-2">
                        {selected.whatsapp && (
                          <a
                            href={`https://wa.me/${selected.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 rounded-lg bg-[#25D366]/15 py-2 text-center text-xs font-semibold text-[#25D366] hover:bg-[#25D366]/25"
                          >
                            WhatsApp
                          </a>
                        )}
                        <button
                          onClick={() => { setSelected(null); setEditing(selected) }}
                          className="flex-1 rounded-lg bg-omega-violet/15 py-2 text-xs font-semibold text-omega-violet hover:bg-omega-violet/25"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteTarget(selected)}
                          className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                          aria-label="Eliminar profesional"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {editing !== null && (
          <ProfessionalModal
            pro={editing === 'new' ? null : editing}
            onSave={handleSave}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Profesional"
        message={`¿Estás seguro de eliminar a ${deleteTarget?.nombre}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
