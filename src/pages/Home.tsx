import { Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="relative min-h-screen bg-clinical-white flex items-center justify-center dark:bg-omega-abyss">
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 rounded-lg border border-omega-violet/20 p-2 text-omega-dark/60 transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/60 dark:hover:bg-clinical-white/5"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Activity className="w-16 h-16 text-omega-violet dark:text-beta-mint" />
        </div>
        <h1 className="text-4xl font-bold text-omega-dark dark:text-clinical-white">
          Beta Clinic
        </h1>
        <p className="text-lg text-omega-violet/70 dark:text-beta-mint/60">
          Protocolo Omega — Sistema Clínico
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-beta-mint text-omega-dark font-bold rounded-lg shadow-lg shadow-beta-mint/25 transition-all hover:bg-beta-mint/80 hover:shadow-xl hover:shadow-beta-mint/30 active:scale-[0.97]"
        >
          Comenzar
        </button>
      </div>
    </div>
  )
}
