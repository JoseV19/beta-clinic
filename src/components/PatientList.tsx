import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, ChevronRight, Pencil } from 'lucide-react'
import { useData } from '../context/DataContext'
import type { Patient } from '../data/patients'
import EditPatientModal from './EditPatientModal'

export default function PatientList() {
  const { patients, addPatient, updatePatient, deletePatient } = useData()
  const [query, setQuery] = useState('')
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  const filtered = patients.filter(
    (p) =>
      p.nombre.toLowerCase().includes(query.toLowerCase()) ||
      p.documento.includes(query),
  )

  function handleAddPatient() {
    const newPatient = {
      id: Date.now(),
      nombre: `Paciente Demo ${patients.length + 1}`,
      documento: `1.0${Math.floor(Math.random() * 90000000 + 10000000)}`,
      edad: 20 + Math.floor(Math.random() * 50),
      genero: Math.random() > 0.5 ? 'F' as const : 'M' as const,
      telefono: `3${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
      ultimaVisita: new Date().toISOString().split('T')[0],
      estado: 'activo' as const,
    }
    addPatient(newPatient)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Pacientes</h1>
          <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
            {patients.length} registrados
          </p>
        </div>
        <button
          onClick={handleAddPatient}
          className="flex items-center gap-2 rounded-lg bg-beta-mint px-4 py-2 text-sm font-semibold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 hover:shadow-lg hover:shadow-beta-mint/25 active:scale-[0.97]"
        >
          <Plus size={18} />
          Nuevo Paciente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-omega-dark/40 dark:text-clinical-white/30"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o documento…"
          className="w-full rounded-xl border border-omega-violet/20 bg-white py-2.5 pl-10 pr-4 text-sm text-omega-dark outline-none transition-shadow placeholder:text-omega-dark/30 focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-surface dark:text-clinical-white dark:placeholder:text-clinical-white/25 dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-omega-violet/10 bg-omega-violet/5 dark:border-clinical-white/5 dark:bg-omega-violet/15">
                <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Nombre</th>
                <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Documento</th>
                <th className="hidden px-5 py-3 font-medium text-omega-dark/70 sm:table-cell dark:text-clinical-white/50">Edad</th>
                <th className="hidden px-5 py-3 font-medium text-omega-dark/70 md:table-cell dark:text-clinical-white/50">Teléfono</th>
                <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-omega-violet/5 transition-colors last:border-0 hover:bg-omega-violet/[0.03] dark:border-clinical-white/5 dark:hover:bg-clinical-white/5"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-omega-violet/10 text-xs font-bold text-omega-violet dark:bg-omega-violet/25 dark:text-beta-mint">
                        {p.nombre.split(' ').map((n) => n[0]).join('')}
                      </span>
                      <span className="font-medium text-omega-dark dark:text-clinical-white">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-omega-dark/70 dark:text-clinical-white/60">{p.documento}</td>
                  <td className="hidden px-5 py-3 text-omega-dark/70 sm:table-cell dark:text-clinical-white/60">{p.edad} años</td>
                  <td className="hidden px-5 py-3 text-omega-dark/70 md:table-cell dark:text-clinical-white/60">{p.telefono}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.estado === 'activo'
                          ? 'bg-beta-mint/15 text-emerald-700 dark:text-beta-mint'
                          : 'bg-gray-100 text-gray-500 dark:bg-clinical-white/10 dark:text-clinical-white/40'
                      }`}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPatient(p)}
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-omega-violet/10 hover:text-omega-violet dark:hover:bg-omega-violet/20 dark:hover:text-beta-mint"
                        title="Editar paciente"
                      >
                        <Pencil size={14} />
                      </button>
                      <Link
                        to={`/pacientes/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-omega-violet transition-colors hover:text-beta-mint dark:text-beta-mint/70 dark:hover:text-beta-mint"
                      >
                        Ver <ChevronRight size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-omega-dark/40 dark:text-clinical-white/30">
                    No se encontraron pacientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Patient Modal */}
      {editingPatient && (
        <EditPatientModal
          patient={editingPatient}
          open={!!editingPatient}
          onClose={() => setEditingPatient(null)}
          onPatientUpdated={(updated) => {
            updatePatient(updated)
            setEditingPatient(null)
          }}
          onPatientDeleted={(id) => {
            deletePatient(id)
            setEditingPatient(null)
          }}
        />
      )}
    </div>
  )
}
