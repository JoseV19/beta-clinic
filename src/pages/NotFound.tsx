import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-omega-abyss p-8">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-omega-violet/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-beta-mint/5 blur-[100px]" />
      </div>

      <div className="relative z-10 text-center">
        {/* 404 number */}
        <h1 className="bg-gradient-to-r from-omega-violet to-beta-mint bg-clip-text text-[10rem] font-black leading-none text-transparent">
          404
        </h1>

        {/* Message */}
        <p className="mt-2 text-2xl font-bold text-clinical-white">
          Página no encontrada
        </p>
        <p className="mt-2 text-sm text-clinical-white/50">
          La página que buscas no existe o fue movida.
        </p>

        {/* CTA */}
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-omega-violet px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-omega-violet/80 hover:shadow-lg hover:shadow-omega-violet/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
