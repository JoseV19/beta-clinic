import PublicBookingWizard from '../components/PublicBookingWizard'

export default function PublicBooking() {
  return (
    <div className="min-h-screen bg-omega-abyss">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <img src="/beta-logo.png" alt="Beta Clinic" className="h-8 w-8" />
            <span className="text-sm font-bold text-clinical-white">Beta Clinic</span>
          </div>
          <span className="rounded-full bg-beta-mint/10 px-3 py-1 text-[11px] font-semibold text-beta-mint">
            Reserva Online
          </span>
        </div>
      </nav>

      {/* Wizard */}
      <main className="mx-auto max-w-4xl px-5 py-10">
        <PublicBookingWizard />
      </main>
    </div>
  )
}
