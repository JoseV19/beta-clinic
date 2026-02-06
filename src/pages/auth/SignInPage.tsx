import { SignIn } from '@clerk/clerk-react'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
      <SignIn
        routing="path"
        path="/sign-in"
        forceRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  )
}
