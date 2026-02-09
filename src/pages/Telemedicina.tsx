import { useCallback, useMemo, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { JitsiMeeting } from '@jitsi/react-sdk'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Phone,
  PhoneOff,
  Clock,
  Save,
  Video,
} from 'lucide-react'
import { toast } from 'sonner'
import { useData } from '../context/DataContext'

/* ── Types ─────────────────────────────────────────────── */

interface WaitingPatient {
  id: number
  nombre: string
  motivo: string
  patientId: number
}

type CallState = 'idle' | 'active'

/* ── Component ─────────────────────────────────────────── */

export default function Telemedicina() {
  const { user } = useUser()
  const { appointments, patients, addConsultation } = useData()

  const [callState, setCallState] = useState<CallState>('idle')
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<WaitingPatient | null>(null)

  /* Build waiting room from today's appointments */
  const today = new Date().toISOString().split('T')[0]
  const waitingRoom: WaitingPatient[] = useMemo(() =>
    appointments
      .filter(a => a.fecha === today && ['confirmada', 'pendiente'].includes(a.estado))
      .map(a => ({
        id: a.id,
        nombre: a.patientName,
        motivo: a.notas || 'Consulta general',
        patientId: a.patientId,
      })),
    [appointments, today],
  )

  /* Lookup patient info */
  const patientInfo = useMemo(() => {
    if (!selectedPatient) return null
    const p = patients.find(pat => pat.id === selectedPatient.patientId)
    if (!p) return null
    return {
      nombre: p.nombre,
      edad: p.edad,
      documento: p.documento,
      alergias: p.antecedentes || 'Sin antecedentes registrados',
      ultimaVisita: p.ultimaVisita,
    }
  }, [selectedPatient, patients])

  const roomName = useMemo(
    () => `BetaClinic-Consultation-${Date.now()}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedPatient],
  )

  const doctorName = user?.fullName ?? user?.firstName ?? 'Doctor'

  function handleStartCall(patient: WaitingPatient) {
    setSelectedPatient(patient)
    setCallState('active')
    setNotes('')
    setNotesSaved(false)
  }

  function handleEndCall() {
    setCallState('idle')
    setSelectedPatient(null)
  }

  function handleSaveNotes() {
    if (!selectedPatient || !notes.trim()) return
    addConsultation({
      patientId: selectedPatient.patientId,
      patientName: selectedPatient.nombre,
      doctor: doctorName,
      fecha: today,
      hora: new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }),
      motivo: selectedPatient.motivo,
      soap: {
        subjetivo: notes,
        objetivo: '',
        analisis: '',
        plan: '',
      },
      diagnosticoCIE10: [],
      tipo: 'telemedicina',
      estado: 'completada',
    })
    setNotesSaved(true)
    toast.success('Consulta guardada')
  }

  const handleIFrameRef = useCallback((node: HTMLDivElement) => {
    if (node) {
      node.style.width = '100%'
      node.style.height = '100%'
    }
  }, [])

  /* ── Idle state: waiting room ────────────────────────── */

  if (callState === 'idle') {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-clinical-white">Telemedicina</h1>
          <p className="mt-0.5 text-sm text-clinical-white/40">
            Consultas virtuales en tiempo real
          </p>
        </div>

        {/* Waiting room */}
        <div className="rounded-xl border border-clinical-white/10 bg-omega-surface">
          <div className="flex items-center gap-2 border-b border-clinical-white/5 px-6 py-4">
            <Clock size={18} className="text-beta-mint" />
            <h2 className="text-lg font-semibold text-clinical-white">
              Sala de Espera Virtual
            </h2>
            <span className="ml-2 rounded-full bg-beta-mint/15 px-2.5 py-0.5 text-xs font-bold text-beta-mint">
              {waitingRoom.length}
            </span>
          </div>

          {waitingRoom.length > 0 ? (
            <div className="divide-y divide-clinical-white/5">
              {waitingRoom.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center gap-4 px-6 py-4 transition-colors hover:bg-clinical-white/5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-omega-violet/25 text-sm font-bold text-beta-mint">
                    {p.nombre.split(' ').map((n) => n[0]).join('')}
                  </span>

                  <div className="flex-1">
                    <p className="font-medium text-clinical-white">{p.nombre}</p>
                    <p className="text-xs text-clinical-white/40">{p.motivo}</p>
                  </div>

                  <button
                    onClick={() => handleStartCall(p)}
                    className="flex items-center gap-2 rounded-lg bg-beta-mint px-5 py-2.5 text-sm font-bold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 active:scale-[0.97]"
                  >
                    <Phone size={16} />
                    Iniciar Llamada
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <Video size={40} className="mx-auto text-clinical-white/15" />
              <p className="mt-3 text-sm font-medium text-clinical-white/40">
                No hay pacientes en espera
              </p>
              <p className="mt-1 text-xs text-clinical-white/25">
                Las citas confirmadas o pendientes para hoy aparecerán aquí
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── Active call: split screen ───────────────────────── */

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="active-call"
        className="flex h-full flex-col gap-4 lg:flex-row"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {/* Left — Video area (70%) */}
        <div className="flex min-h-[400px] flex-col lg:w-[70%]">
          <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl bg-omega-dark">
            <div className="flex-1">
              <JitsiMeeting
                domain="meet.jit.si"
                roomName={roomName}
                getIFrameRef={handleIFrameRef}
                userInfo={{ displayName: doctorName, email: user?.primaryEmailAddress?.emailAddress ?? '' }}
                configOverwrite={{
                  startAudioOnly: true,
                  prejoinPageEnabled: false,
                  disableModeratorIndicator: true,
                  startWithAudioMuted: false,
                  startWithVideoMuted: false,
                }}
                interfaceConfigOverwrite={{
                  SHOW_JITSI_WATERMARK: false,
                  SHOW_WATERMARK_FOR_GUESTS: false,
                  SHOW_BRAND_WATERMARK: false,
                  TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'desktop', 'chat',
                    'raisehand', 'tileview', 'fullscreen',
                  ],
                }}
                onReadyToClose={handleEndCall}
              />
            </div>

            <div className="absolute bottom-4 right-4 z-10">
              <button
                onClick={handleEndCall}
                className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                <PhoneOff size={16} />
                Terminar
              </button>
            </div>
          </div>
        </div>

        {/* Right — Notes & patient info (30%) */}
        <div className="flex flex-col gap-4 lg:w-[30%]">
          {/* Patient info card */}
          {patientInfo && (
            <div className="rounded-xl border border-clinical-white/10 bg-omega-surface p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-omega-violet/25 text-xs font-bold text-beta-mint">
                  {patientInfo.nombre.split(' ').map((n) => n[0]).join('')}
                </span>
                <div>
                  <p className="text-sm font-semibold text-clinical-white">{patientInfo.nombre}</p>
                  <p className="text-[11px] text-clinical-white/40">
                    {patientInfo.documento} · {patientInfo.edad} años
                  </p>
                </div>
              </div>

              <dl className="space-y-2 text-xs">
                {[
                  ['Última visita', patientInfo.ultimaVisita],
                  ['Antecedentes', patientInfo.alergias],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-medium text-clinical-white/30">{label}</dt>
                    <dd className="mt-0.5 text-clinical-white">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Quick notes */}
          <div className="flex flex-1 flex-col rounded-xl border border-clinical-white/10 bg-omega-surface p-4">
            <h3 className="mb-2 text-sm font-semibold text-clinical-white">
              Notas de la consulta
            </h3>

            <textarea
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setNotesSaved(false) }}
              placeholder="Escriba notas rápidas durante la llamada..."
              className="flex-1 resize-none rounded-lg border border-clinical-white/10 bg-omega-abyss p-3 text-sm text-clinical-white outline-none placeholder:text-clinical-white/25 focus:border-beta-mint/30 focus:ring-2 focus:ring-beta-mint/10"
            />

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleSaveNotes}
                className="flex items-center gap-2 rounded-lg bg-beta-mint px-4 py-2 text-sm font-semibold text-omega-dark transition-colors hover:bg-beta-mint/80"
              >
                <Save size={14} />
                Guardar Consulta
              </button>
              {notesSaved && (
                <span className="text-xs font-medium text-beta-mint">Guardado</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
