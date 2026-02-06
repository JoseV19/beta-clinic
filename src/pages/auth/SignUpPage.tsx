import { SignUp } from '@clerk/clerk-react'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
      <SignUp
        routing="path"
        path="/sign-up"
        forceRedirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </div>
  )
}
