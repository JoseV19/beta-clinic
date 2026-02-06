import { SignIn } from '@clerk/clerk-react'

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
      {/* Logo */}
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/beta-logo.png"
            alt="Beta Clinic"
            className="h-12 w-auto object-contain"
          />
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-beta-mint/50">
            Protocolo Omega
          </p>
        </div>

        <SignIn
          routing="hash"
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: 'w-full',
              cardBox: 'shadow-none border border-[#1E293B] rounded-xl bg-[#1A2332]',
              headerTitle: 'text-white',
              headerSubtitle: 'text-white/50',
              formButtonPrimary:
                'bg-beta-mint text-[#0F172A] hover:bg-beta-mint/90 font-semibold rounded-lg shadow-none',
              footerActionLink: 'text-beta-mint hover:text-beta-mint/80',
            },
          }}
        />

        <p className="text-[11px] text-white/20">
          Beta Clinic &copy; {new Date().getFullYear()} — Sistema Clínico Protocolo Omega
        </p>
      </div>
    </div>
  )
}
