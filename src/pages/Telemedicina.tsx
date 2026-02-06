import { useState } from 'react'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Phone,
  Camera,
  Clock,
  User,
  Save,
} from 'lucide-react'

/* ── Types ─────────────────────────────────────────────── */

interface WaitingPatient {
  id: number
  nombre: string
  motivo: string
  espera: string
}

type CallState = 'idle' | 'active'

/* ── Mock data ─────────────────────────────────────────── */

const waitingRoom: WaitingPatient[] = [
  { id: 1, nombre: 'María García', motivo: 'Control hipertensión', espera: '5 min' },
  { id: 2, nombre: 'Carlos López', motivo: 'Dolor lumbar persistente', espera: '12 min' },
  { id: 3, nombre: 'Sofía Mendoza', motivo: 'Revisión de exámenes', espera: '2 min' },
]

const patientInfo = {
  nombre: 'María García',
  edad: 34,
  documento: '1.023.456.789',
  diagnostico: 'Hipertensión esencial (I10)',
  ultimaVisita: '2026-02-03',
  alergias: 'Penicilina',
}

/* ── Component ─────────────────────────────────────────── */

export default function Telemedicina() {
  const [callState, setCallState] = useState<CallState>('idle')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<WaitingPatient | null>(null)

  function handleStartCall(patient: WaitingPatient) {
    setSelectedPatient(patient)
    setCallState('active')
    setNotes('')
    setNotesSaved(false)
  }

  function handleEndCall() {
    setCallState('idle')
    setSelectedPatient(null)
    setMicOn(true)
    setCamOn(true)
  }

  function handleSaveNotes() {
    setNotesSaved(true)
  }

  /* ── Idle state: waiting room ────────────────────────── */

  if (callState === 'idle') {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Telemedicina</h1>
          <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
            Consultas virtuales en tiempo real
          </p>
        </div>

        {/* Waiting room */}
        <div className="rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface">
          <div className="flex items-center gap-2 border-b border-omega-violet/10 px-6 py-4 dark:border-clinical-white/5">
            <Clock size={18} className="text-omega-violet dark:text-beta-mint" />
            <h2 className="text-lg font-semibold text-omega-dark dark:text-clinical-white">
              Sala de Espera Virtual
            </h2>
            <span className="ml-2 rounded-full bg-beta-mint/15 px-2.5 py-0.5 text-xs font-bold text-beta-mint">
              {waitingRoom.length}
            </span>
          </div>

          <div className="divide-y divide-omega-violet/5 dark:divide-clinical-white/5">
            {waitingRoom.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-4 px-6 py-4 transition-colors hover:bg-omega-violet/[0.02] dark:hover:bg-clinical-white/5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-omega-violet/10 text-sm font-bold text-omega-violet dark:bg-omega-violet/25 dark:text-beta-mint">
                  {p.nombre.split(' ').map((n) => n[0]).join('')}
                </span>

                <div className="flex-1">
                  <p className="font-medium text-omega-dark dark:text-clinical-white">{p.nombre}</p>
                  <p className="text-xs text-omega-dark/50 dark:text-clinical-white/40">{p.motivo}</p>
                </div>

                <span className="flex items-center gap-1 text-xs text-omega-dark/40 dark:text-clinical-white/30">
                  <Clock size={12} />
                  Esperando {p.espera}
                </span>

                <button
                  onClick={() => handleStartCall(p)}
                  className="flex items-center gap-2 rounded-lg bg-beta-mint px-5 py-2.5 text-sm font-bold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 hover:shadow-lg hover:shadow-beta-mint/25 active:scale-[0.97]"
                >
                  <Phone size={16} />
                  Iniciar Llamada
                </button>
              </div>
            ))}

            {waitingRoom.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-omega-dark/40 dark:text-clinical-white/30">
                No hay pacientes en la sala de espera
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ── Active call: split screen ───────────────────────── */

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      {/* Left — Video area (70%) */}
      <div className="flex flex-col lg:w-[70%]">
        <div className="relative flex flex-1 items-center justify-center rounded-xl bg-omega-dark">
          {/* Simulated video */}
          <div className="flex flex-col items-center gap-3 text-clinical-white/30">
            <Camera size={64} strokeWidth={1} />
            <span className="text-sm font-medium">
              {camOn ? `Videollamada con ${selectedPatient?.nombre}` : 'Cámara desactivada'}
            </span>
          </div>

          {/* Call timer badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-clinical-white backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-alert-red" />
            En llamada
          </div>

          {/* Patient mini-cam placeholder */}
          <div className="absolute bottom-4 right-4 flex h-24 w-32 items-center justify-center rounded-lg bg-black/50 text-clinical-white/40 backdrop-blur-sm">
            <User size={28} />
          </div>

          {/* Call controls */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3">
            <button
              onClick={() => setMicOn((v) => !v)}
              className={`rounded-full p-3 transition-colors ${
                micOn
                  ? 'bg-clinical-white/15 text-clinical-white hover:bg-clinical-white/25'
                  : 'bg-clinical-white/30 text-alert-red'
              }`}
            >
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button
              onClick={() => setCamOn((v) => !v)}
              className={`rounded-full p-3 transition-colors ${
                camOn
                  ? 'bg-clinical-white/15 text-clinical-white hover:bg-clinical-white/25'
                  : 'bg-clinical-white/30 text-alert-red'
              }`}
            >
              {camOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button
              onClick={handleEndCall}
              className="rounded-full bg-alert-red px-6 py-3 font-semibold text-white transition-colors hover:bg-alert-red/80"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Right — Notes & patient info (30%) */}
      <div className="flex flex-col gap-4 lg:w-[30%]">
        {/* Patient info card */}
        <div className="rounded-xl border border-omega-violet/20 bg-white p-4 dark:border-clinical-white/10 dark:bg-omega-surface">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-omega-violet/10 text-xs font-bold text-omega-violet dark:bg-omega-violet/25 dark:text-beta-mint">
              {patientInfo.nombre.split(' ').map((n) => n[0]).join('')}
            </span>
            <div>
              <p className="text-sm font-semibold text-omega-dark dark:text-clinical-white">{patientInfo.nombre}</p>
              <p className="text-[11px] text-omega-dark/50 dark:text-clinical-white/40">
                {patientInfo.documento} · {patientInfo.edad} años
              </p>
            </div>
          </div>

          <dl className="space-y-2 text-xs">
            {[
              ['Diagnóstico', patientInfo.diagnostico],
              ['Última visita', patientInfo.ultimaVisita],
              ['Alergias', patientInfo.alergias],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-medium text-omega-dark/40 dark:text-clinical-white/30">{label}</dt>
                <dd className="mt-0.5 text-omega-dark dark:text-clinical-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Quick notes */}
        <div className="flex flex-1 flex-col rounded-xl border border-omega-violet/20 bg-white p-4 dark:border-clinical-white/10 dark:bg-omega-surface">
          <h3 className="mb-2 text-sm font-semibold text-omega-dark dark:text-clinical-white">
            Notas de la consulta
          </h3>

          <textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setNotesSaved(false) }}
            placeholder="Escriba notas rápidas durante la llamada…"
            className="flex-1 resize-none rounded-lg border border-omega-violet/20 bg-clinical-white p-3 text-sm text-omega-dark outline-none placeholder:text-omega-dark/30 focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:placeholder:text-clinical-white/25 dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10"
          />

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleSaveNotes}
              className="flex items-center gap-2 rounded-lg bg-beta-mint px-4 py-2 text-sm font-semibold text-omega-dark transition-colors hover:bg-beta-mint/80"
            >
              <Save size={14} />
              Guardar
            </button>
            {notesSaved && (
              <span className="text-xs font-medium text-emerald-600 dark:text-beta-mint">Guardado</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
