import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  Loader2,
  CheckCircle2,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import {
  PLANS,
  getPlanById,
  currencySymbol,
  type Currency,
  type PricingPlan,
} from '../data/plans'
import { toast } from 'sonner'

/* ── Constants ────────────────────────────────────────────── */

/* no IVA */

/* ── Helpers ──────────────────────────────────────────────── */

function formatPrice(amount: number, cur: Currency): string {
  return `${currencySymbol[cur]}${amount.toFixed(2)}`
}

function formatCard(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

/* ── Component ────────────────────────────────────────────── */

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const planId = searchParams.get('plan') || 'profesional'
  const initialCurrency = (searchParams.get('currency') as Currency) || 'USD'

  const [currency, setCurrency] = useState<Currency>(
    initialCurrency === 'GTQ' ? 'GTQ' : 'USD',
  )
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(
    () => getPlanById(planId) || PLANS[1],
  )

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: '',
  })

  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const price = selectedPlan.prices[currency]
  const total = price

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (
      !form.fullName ||
      !form.email ||
      !form.cardNumber ||
      !form.expiry ||
      !form.cvv
    ) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setProcessing(true)

    setTimeout(() => {
      setProcessing(false)
      setSuccess(true)
      toast.success('Pago procesado exitosamente')

      setTimeout(() => {
        navigate('/sign-up')
      }, 3000)
    }, 2000)
  }

  /* ── Success overlay ─────────────────────────────────────── */

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-omega-abyss">
        {/* Gradient orbs */}
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#7C3AED] opacity-[0.15] blur-[120px]"
          style={{ animation: 'float-orb 20s ease-in-out infinite' }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#7FFFD4] opacity-[0.12] blur-[120px]"
          style={{ animation: 'float-orb 25s ease-in-out infinite reverse' }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-beta-mint/15"
          >
            <CheckCircle2 size={48} className="text-beta-mint" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Pago Exitoso</h2>
          <p className="mt-2 text-sm text-white/50">
            Plan{' '}
            <span className="font-semibold text-beta-mint">
              {selectedPlan.name}
            </span>{' '}
            activado
          </p>
          <p className="mt-1 text-xs text-white/30">
            Redirigiendo a crear tu cuenta...
          </p>
          <div className="mx-auto mt-6 h-1 w-48 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className="h-full bg-beta-mint"
            />
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── Main layout ─────────────────────────────────────────── */

  return (
    <div className="relative min-h-screen bg-omega-abyss">
      {/* Gradient orbs */}
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#7C3AED] opacity-[0.12] blur-[120px]"
        style={{ animation: 'float-orb 20s ease-in-out infinite' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-0 h-[400px] w-[400px] rounded-full bg-[#7FFFD4] opacity-[0.08] blur-[120px]"
        style={{ animation: 'float-orb 25s ease-in-out infinite reverse' }}
      />
      <div
        className="pointer-events-none absolute right-[20%] top-[30%] h-[300px] w-[300px] rounded-full bg-[#EC4899] opacity-[0.06] blur-[100px]"
        style={{ animation: 'float-orb 18s ease-in-out infinite 5s' }}
      />

      {/* ── Mini navbar ──────────────────────────────────────── */}
      <nav className="relative z-10 border-b border-white/[0.06] px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/beta-logo.png"
              alt="Beta Clinic"
              className="h-8 w-auto object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-white">
              Beta <span className="text-beta-mint">Clinic</span>
            </span>
          </div>
          <Link
            to="/#precios"
            className="flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Volver a precios
          </Link>
        </div>
      </nav>

      {/* ── Content ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-6xl px-6 py-10"
      >
        {/* Page header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Finaliza tu suscripción
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Completa los datos para activar tu plan
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* ── Left: Order Summary (2/5) ──────────────────── */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
              {/* Plan header */}
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  Resumen del plan
                </h2>
                {selectedPlan.highlighted && (
                  <span className="flex items-center gap-1 rounded-full bg-beta-mint/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-beta-mint">
                    <Sparkles size={10} />
                    Popular
                  </span>
                )}
              </div>

              {/* Plan name + price */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-white/70">
                  Plan {selectedPlan.name}
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`${selectedPlan.id}-${currency}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 text-3xl font-black text-beta-mint"
                  >
                    {formatPrice(price, currency)}
                    <span className="text-sm font-normal text-white/30">
                      /mes
                    </span>
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Features */}
              <ul className="mb-6 space-y-2.5">
                {selectedPlan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-white/50"
                  >
                    <Check
                      size={14}
                      className="mt-0.5 shrink-0 text-beta-mint/60"
                      strokeWidth={2.5}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Plan switcher pills */}
              <div className="mb-6">
                <p className="mb-2 text-xs font-medium text-white/30">
                  Cambiar plan
                </p>
                <div className="flex gap-2">
                  {PLANS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlan(p)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        selectedPlan.id === p.id
                          ? 'bg-beta-mint/15 text-beta-mint'
                          : 'bg-white/[0.05] text-white/40 hover:text-white/60'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="mb-4 h-px bg-white/[0.06]" />

              {/* Total */}
              <div className="flex justify-between text-sm font-bold text-white">
                <span>Total mensual</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`total-${selectedPlan.id}-${currency}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-beta-mint"
                  >
                    {formatPrice(total, currency)}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Trust */}
              <div className="mt-5 flex flex-wrap gap-3 text-[10px] text-white/25">
                <span>14 días gratis</span>
                <span>·</span>
                <span>Cancela cuando quieras</span>
              </div>
            </div>
          </div>

          {/* ── Right: Payment Form (3/5) ──────────────────── */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8"
            >
              {/* Currency toggle */}
              <div className="mb-8 flex justify-center">
                <div className="relative inline-flex rounded-full border border-white/[0.08] bg-white/[0.05] p-1">
                  {(['USD', 'GTQ'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className="relative z-10 rounded-full px-5 py-1.5 text-sm font-bold transition-colors"
                      style={{
                        color:
                          currency === c
                            ? '#0B0613'
                            : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {c}
                      {currency === c && (
                        <motion.div
                          layoutId="checkout-currency-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-beta-mint"
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact section */}
              <div className="mb-6">
                <h3 className="mb-4 text-sm font-semibold text-white/60">
                  Información de contacto
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/40">
                      Nombre completo *
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                      />
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) =>
                          updateField('fullName', e.target.value)
                        }
                        placeholder="Dr. Juan Pérez"
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-beta-mint/50 focus:bg-white/[0.08]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/40">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                        />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            updateField('email', e.target.value)
                          }
                          placeholder="doctor@clinica.com"
                          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-beta-mint/50 focus:bg-white/[0.08]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/40">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                        />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) =>
                            updateField(
                              'phone',
                              e.target.value.replace(/[^\d\s\-+]/g, ''),
                            )
                          }
                          placeholder="+502 5555 1234"
                          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-beta-mint/50 focus:bg-white/[0.08]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="mb-6 h-px bg-white/[0.06]" />

              {/* Payment section */}
              <div className="mb-8">
                <h3 className="mb-4 text-sm font-semibold text-white/60">
                  Método de pago
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/40">
                      Número de tarjeta *
                    </label>
                    <div className="relative">
                      <CreditCard
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                      />
                      <input
                        type="text"
                        value={form.cardNumber}
                        onChange={(e) =>
                          updateField(
                            'cardNumber',
                            formatCard(e.target.value),
                          )
                        }
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-beta-mint/50 focus:bg-white/[0.08]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/40">
                        Fecha de expiración *
                      </label>
                      <input
                        type="text"
                        value={form.expiry}
                        onChange={(e) =>
                          updateField(
                            'expiry',
                            formatExpiry(e.target.value),
                          )
                        }
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-beta-mint/50 focus:bg-white/[0.08]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/40">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={form.cvv}
                        onChange={(e) =>
                          updateField(
                            'cvv',
                            e.target.value.replace(/\D/g, '').slice(0, 4),
                          )
                        }
                        placeholder="123"
                        maxLength={4}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-beta-mint/50 focus:bg-white/[0.08]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/40">
                      Nombre en la tarjeta
                    </label>
                    <input
                      type="text"
                      value={form.cardName}
                      onChange={(e) =>
                        updateField('cardName', e.target.value)
                      }
                      placeholder="JUAN PEREZ"
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-3 text-sm uppercase text-white placeholder-white/30 outline-none transition-colors focus:border-beta-mint/50 focus:bg-white/[0.08]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-beta-mint py-3.5 text-sm font-bold text-omega-abyss shadow-lg shadow-beta-mint/20 transition-all hover:shadow-beta-mint/30 disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Confirmar Pago — {formatPrice(total, currency)}
                  </>
                )}
              </button>

              {/* Trust signals */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-white/25">
                <span className="flex items-center gap-1.5">
                  <Lock size={10} />
                  Cifrado E2E
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={10} />
                  Sin cargos ocultos
                </span>
                <span className="flex items-center gap-1.5">
                  <CreditCard size={10} />
                  Cancela cuando quieras
                </span>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
