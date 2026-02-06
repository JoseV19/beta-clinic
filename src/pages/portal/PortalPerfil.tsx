import { useUser, useClerk } from '@clerk/clerk-react'
import QRCode from 'react-qr-code'
import {
  LogOut,
  Heart,
  Droplets,
  AlertCircle,
  Shield,
  ChevronRight,
  Fingerprint,
  ScanLine,
} from 'lucide-react'

/* ── Mock health info ─────────────────────────────────── */

const healthData = {
  tipoSangre: 'O+',
  alergias: ['Penicilina', 'Sulfas'],
  eps: 'Sura',
  frecuenciaCardiaca: '72 bpm',
}

const healthCards = [
  { icon: Droplets, label: 'Tipo de Sangre', value: healthData.tipoSangre, color: 'text-red-400 bg-red-400/15' },
  { icon: Heart, label: 'Frecuencia Cardíaca', value: healthData.frecuenciaCardiaca, color: 'text-pink-400 bg-pink-400/15' },
  { icon: AlertCircle, label: 'Alergias', value: healthData.alergias.join(', '), color: 'text-amber-400 bg-amber-400/15' },
  { icon: Shield, label: 'EPS', value: healthData.eps, color: 'text-blue-400 bg-blue-400/15' },
]

/* ── Component ────────────────────────────────────────── */

export default function PortalPerfil() {
  const { user } = useUser()
  const { signOut } = useClerk()

  const patientId = user?.id ?? 'UNKNOWN'
  const initials = user
    ? (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')
    : '?'

  const qrPayload = JSON.stringify({
    type: 'beta-clinic-checkin',
    patientId,
    name: user?.fullName ?? 'Paciente',
    ts: new Date().toISOString().split('T')[0],
  })

  return (
    <div className="space-y-5">
      {/* ── Digital Credential Card ──────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-gradient-to-br from-zinc-800 via-zinc-800/90 to-zinc-900">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full border-[6px] border-beta-mint" />
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full border-[6px] border-beta-mint" />
        </div>

        {/* Card header */}
        <div className="relative flex items-center gap-2 border-b border-zinc-700/50 px-4 py-2.5">
          <Fingerprint size={14} className="text-beta-mint" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-beta-mint">
            Carnet Digital — Beta Life
          </span>
        </div>

        <div className="relative flex gap-4 p-4">
          {/* Left: Photo + Info */}
          <div className="flex-1 space-y-3">
            {/* Avatar */}
            <div className="flex items-center gap-3">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName ?? ''}
                  className="h-16 w-16 rounded-2xl border-2 border-beta-mint/30 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-beta-mint/15 text-xl font-bold text-beta-mint">
                  {initials}
                </div>
              )}
              <div>
                <h1 className="text-base font-bold text-zinc-100">
                  {user?.fullName || 'Paciente'}
                </h1>
                <p className="text-[11px] text-zinc-500">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            {/* Key health info inline */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">Sangre</p>
                <p className="text-sm font-bold text-red-400">{healthData.tipoSangre}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">Alergias</p>
                <p className="text-sm font-bold text-amber-400">{healthData.alergias.join(', ')}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">EPS</p>
                <p className="text-sm font-bold text-blue-400">{healthData.eps}</p>
              </div>
            </div>
          </div>

          {/* Right: QR Code */}
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <div className="rounded-xl bg-white p-2">
              <QRCode value={qrPayload} size={80} level="M" />
            </div>
            <div className="flex items-center gap-1 text-[9px] font-medium text-zinc-600">
              <ScanLine size={10} />
              Check-in
            </div>
          </div>
        </div>

        {/* Card footer with ID */}
        <div className="relative border-t border-zinc-700/50 px-4 py-2">
          <p className="text-[9px] font-mono text-zinc-600">
            ID: {patientId.slice(0, 20)}
          </p>
        </div>
      </div>

      {/* ── Health Info Grid ─────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Información de Salud
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {healthCards.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-3.5"
            >
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
              <p className="mt-0.5 text-sm font-bold text-zinc-200">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── QR Explanation ────────────────────────────────── */}
      <div className="rounded-2xl border border-dashed border-zinc-700 p-4 text-center">
        <ScanLine size={24} className="mx-auto text-zinc-600" />
        <p className="mt-2 text-xs text-zinc-500">
          Presenta tu código QR en recepción para hacer Check-in rápido
        </p>
      </div>

      {/* ── Account ──────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Cuenta
        </h3>
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800/50">
          <button
            onClick={() => signOut({ redirectUrl: '/' })}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-zinc-800"
          >
            <LogOut size={18} className="text-red-400" />
            <span className="flex-1 text-sm font-medium text-red-400">Cerrar Sesión</span>
            <ChevronRight size={16} className="text-zinc-600" />
          </button>
        </div>
      </div>
    </div>
  )
}
