import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Search,
  Pill,
  Trash2,
  Printer,
  Send,
  Zap,
  X,
  Clipboard,
  Save,
  Pencil,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

/* ── Types ─────────────────────────────────────────────── */

interface Drug {
  name: string
  defaultDose: string
}

interface PrescriptionItem {
  id: number
  drug: string
  dose: string
  frequency: string
  duration: string
}

interface Kit {
  id: string
  label: string
  emoji: string
  custom: boolean
  items: Omit<PrescriptionItem, 'id'>[]
}

/* ── Mock drugs ────────────────────────────────────────── */

const MOCK_DRUGS: Drug[] = [
  { name: 'Paracetamol 500mg', defaultDose: '1 tableta' },
  { name: 'Paracetamol Jarabe 120mg/5ml', defaultDose: '5ml' },
  { name: 'Amoxicilina 500mg', defaultDose: '1 cápsula' },
  { name: 'Amoxicilina/Ác. Clavulánico 875mg', defaultDose: '1 tableta' },
  { name: 'Ibuprofeno 400mg', defaultDose: '1 tableta' },
  { name: 'Omeprazol 20mg', defaultDose: '1 cápsula' },
  { name: 'Loratadina 10mg', defaultDose: '1 tableta' },
  { name: 'Azitromicina 500mg', defaultDose: '1 tableta' },
  { name: 'Diclofenaco 50mg', defaultDose: '1 tableta' },
  { name: 'Metformina 850mg', defaultDose: '1 tableta' },
  { name: 'Losartán 50mg', defaultDose: '1 tableta' },
  { name: 'Cetirizina 10mg', defaultDose: '1 tableta' },
  { name: 'Dexametasona 4mg', defaultDose: '1 tableta' },
  { name: 'Ciprofloxacino 500mg', defaultDose: '1 tableta' },
  { name: 'Sulfato Ferroso 300mg', defaultDose: '1 tableta' },
  { name: 'Ácido Fólico 5mg', defaultDose: '1 tableta' },
  { name: 'Albendazol 400mg', defaultDose: '1 tableta' },
  { name: 'Metronidazol 500mg', defaultDose: '1 tableta' },
  { name: 'Tobramicina Oftálmica 0.3%', defaultDose: '1 gota' },
  { name: 'Hidrocortisona Crema 1%', defaultDose: 'Aplicar capa fina' },
  { name: 'Clonazepam 0.5mg', defaultDose: '1 tableta' },
  { name: 'Sumatriptán 50mg', defaultDose: '1 tableta' },
  { name: 'Ranitidina 150mg', defaultDose: '1 tableta' },
  { name: 'Loperamida 2mg', defaultDose: '1 cápsula' },
  { name: 'Sales de Rehidratación Oral', defaultDose: '1 sobre en 1L agua' },
  { name: 'Vitamina C 500mg', defaultDose: '1 tableta' },
  { name: 'Zinc 20mg', defaultDose: '1 tableta' },
  { name: 'Betametasona Crema 0.05%', defaultDose: 'Aplicar capa fina' },
]

const FREQUENCIES = ['Cada 6h', 'Cada 8h', 'Cada 12h', 'Cada 24h', 'Una vez']
const DURATIONS = ['3 días', '5 días', '7 días', '10 días', '14 días', '30 días']

/* ── 15 Default kits ───────────────────────────────────── */

const DEFAULT_KITS: Kit[] = [
  {
    id: 'gripe', label: 'Gripe Común', emoji: '🤧', custom: false,
    items: [
      { drug: 'Paracetamol 500mg', dose: '1 tableta', frequency: 'Cada 8h', duration: '5 días' },
      { drug: 'Loratadina 10mg', dose: '1 tableta', frequency: 'Cada 24h', duration: '5 días' },
      { drug: 'Vitamina C 500mg', dose: '1 tableta', frequency: 'Cada 12h', duration: '7 días' },
    ],
  },
  {
    id: 'garganta', label: 'Infección Garganta', emoji: '🫁', custom: false,
    items: [
      { drug: 'Amoxicilina 500mg', dose: '1 cápsula', frequency: 'Cada 8h', duration: '7 días' },
      { drug: 'Ibuprofeno 400mg', dose: '1 tableta', frequency: 'Cada 8h', duration: '5 días' },
    ],
  },
  {
    id: 'gastro', label: 'Gastroenteritis', emoji: '🤢', custom: false,
    items: [
      { drug: 'Metronidazol 500mg', dose: '1 tableta', frequency: 'Cada 8h', duration: '7 días' },
      { drug: 'Loperamida 2mg', dose: '1 cápsula', frequency: 'Cada 8h', duration: '3 días' },
      { drug: 'Sales de Rehidratación Oral', dose: '1 sobre en 1L agua', frequency: 'Cada 8h', duration: '3 días' },
      { drug: 'Omeprazol 20mg', dose: '1 cápsula', frequency: 'Cada 24h', duration: '5 días' },
    ],
  },
  {
    id: 'migrana', label: 'Migraña', emoji: '🧠', custom: false,
    items: [
      { drug: 'Sumatriptán 50mg', dose: '1 tableta', frequency: 'Una vez', duration: 'Dosis única' },
      { drug: 'Paracetamol 500mg', dose: '1 tableta', frequency: 'Cada 8h', duration: '3 días' },
    ],
  },
  {
    id: 'lumbalgia', label: 'Lumbalgia / Dolor', emoji: '💪', custom: false,
    items: [
      { drug: 'Diclofenaco 50mg', dose: '1 tableta', frequency: 'Cada 12h', duration: '5 días' },
      { drug: 'Omeprazol 20mg', dose: '1 cápsula', frequency: 'Cada 24h', duration: '5 días' },
    ],
  },
  {
    id: 'itu', label: 'Infección Urinaria', emoji: '🚽', custom: false,
    items: [
      { drug: 'Ciprofloxacino 500mg', dose: '1 tableta', frequency: 'Cada 12h', duration: '7 días' },
      { drug: 'Paracetamol 500mg', dose: '1 tableta', frequency: 'Cada 8h', duration: '3 días' },
    ],
  },
  {
    id: 'gastritis', label: 'Gastritis / Reflujo', emoji: '🔥', custom: false,
    items: [
      { drug: 'Omeprazol 20mg', dose: '1 cápsula', frequency: 'Cada 12h', duration: '14 días' },
      { drug: 'Ranitidina 150mg', dose: '1 tableta', frequency: 'Cada 12h', duration: '14 días' },
    ],
  },
  {
    id: 'hta', label: 'Hipertensión (Inicio)', emoji: '❤️', custom: false,
    items: [
      { drug: 'Losartán 50mg', dose: '1 tableta', frequency: 'Cada 24h', duration: '30 días' },
    ],
  },
  {
    id: 'diabetes', label: 'Diabetes (Control)', emoji: '🩸', custom: false,
    items: [
      { drug: 'Metformina 850mg', dose: '1 tableta', frequency: 'Cada 12h', duration: '30 días' },
    ],
  },
  {
    id: 'alergia', label: 'Alergia Estacional', emoji: '🌿', custom: false,
    items: [
      { drug: 'Cetirizina 10mg', dose: '1 tableta', frequency: 'Cada 24h', duration: '7 días' },
      { drug: 'Dexametasona 4mg', dose: '1 tableta', frequency: 'Cada 24h', duration: '3 días' },
    ],
  },
  {
    id: 'dermatitis', label: 'Dermatitis', emoji: '🧴', custom: false,
    items: [
      { drug: 'Hidrocortisona Crema 1%', dose: 'Aplicar capa fina', frequency: 'Cada 12h', duration: '7 días' },
      { drug: 'Loratadina 10mg', dose: '1 tableta', frequency: 'Cada 24h', duration: '7 días' },
    ],
  },
  {
    id: 'ansiedad', label: 'Ansiedad Leve', emoji: '😮‍💨', custom: false,
    items: [
      { drug: 'Clonazepam 0.5mg', dose: '1 tableta', frequency: 'Cada 24h', duration: '14 días' },
    ],
  },
  {
    id: 'anemia', label: 'Anemia', emoji: '🩸', custom: false,
    items: [
      { drug: 'Sulfato Ferroso 300mg', dose: '1 tableta', frequency: 'Cada 24h', duration: '30 días' },
      { drug: 'Ácido Fólico 5mg', dose: '1 tableta', frequency: 'Cada 24h', duration: '30 días' },
      { drug: 'Vitamina C 500mg', dose: '1 tableta', frequency: 'Cada 24h', duration: '30 días' },
    ],
  },
  {
    id: 'conjuntivitis', label: 'Conjuntivitis', emoji: '👁️', custom: false,
    items: [
      { drug: 'Tobramicina Oftálmica 0.3%', dose: '1 gota', frequency: 'Cada 6h', duration: '7 días' },
    ],
  },
  {
    id: 'parasitosis', label: 'Parasitosis', emoji: '🦠', custom: false,
    items: [
      { drug: 'Albendazol 400mg', dose: '1 tableta', frequency: 'Una vez', duration: 'Dosis única' },
      { drug: 'Metronidazol 500mg', dose: '1 tableta', frequency: 'Cada 8h', duration: '5 días' },
    ],
  },
]

/* ── Component ─────────────────────────────────────────── */

let nextId = 1
let nextKitId = 1

export default function SmartPrescription() {
  const [items, setItems] = useState<PrescriptionItem[]>([])
  const [patientName, setPatientName] = useState('')
  const [kits, setKits] = useState<Kit[]>(DEFAULT_KITS)
  const [kitSearch, setKitSearch] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  /* Save-kit modal state */
  const [showSaveKit, setShowSaveKit] = useState(false)
  const [newKitName, setNewKitName] = useState('')

  /* Drug search state */
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
  const [dose, setDose] = useState('')
  const [frequency, setFrequency] = useState('')
  const [duration, setDuration] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* ── Derived ─────────────────────────────────────────── */

  const filteredDrugs = useMemo(
    () =>
      query.length > 0
        ? MOCK_DRUGS.filter(d => d.name.toLowerCase().includes(query.toLowerCase()))
        : [],
    [query],
  )

  const filteredKits = useMemo(
    () =>
      kitSearch.length > 0
        ? kits.filter(k => k.label.toLowerCase().includes(kitSearch.toLowerCase()))
        : kits,
    [kits, kitSearch],
  )

  /* Close suggestions on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  /* ── Drug actions ────────────────────────────────────── */

  function selectDrug(drug: Drug) {
    setSelectedDrug(drug)
    setDose(drug.defaultDose)
    setQuery(drug.name)
    setShowSuggestions(false)
    setFrequency('')
    setDuration('')
  }

  function addItem() {
    if (!selectedDrug || !frequency || !duration) {
      toast.error('Selecciona medicamento, frecuencia y duración')
      return
    }
    setItems(prev => [
      ...prev,
      { id: nextId++, drug: selectedDrug.name, dose, frequency, duration },
    ])
    toast.success(`${selectedDrug.name} agregado`)
    resetDrugForm()
  }

  function resetDrugForm() {
    setSelectedDrug(null)
    setQuery('')
    setDose('')
    setFrequency('')
    setDuration('')
    inputRef.current?.focus()
  }

  function removeItem(id: number) {
    setItems(prev => prev.filter(i => i.id !== id))
    if (editingId === id) setEditingId(null)
  }

  function updateItem(id: number, field: keyof PrescriptionItem, value: string) {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, [field]: value } : i)))
  }

  /* ── Kit actions ─────────────────────────────────────── */

  function applyKit(kit: Kit) {
    const newItems = kit.items.map(i => ({ ...i, id: nextId++ }))
    setItems(prev => [...prev, ...newItems])
    toast.success(`${kit.label} — ${kit.items.length} medicamentos cargados`)
  }

  function saveCurrentAsKit() {
    const name = newKitName.trim()
    if (!name) {
      toast.error('Escribe un nombre para el kit')
      return
    }
    if (items.length === 0) {
      toast.error('Agrega medicamentos primero')
      return
    }
    const newKit: Kit = {
      id: `custom-${nextKitId++}`,
      label: name,
      emoji: '⭐',
      custom: true,
      items: items.map(({ drug, dose, frequency, duration }) => ({
        drug,
        dose,
        frequency,
        duration,
      })),
    }
    setKits(prev => [...prev, newKit])
    setShowSaveKit(false)
    setNewKitName('')
    toast.success(`Kit "${name}" guardado con ${items.length} medicamentos`)
  }

  function deleteKit(id: string) {
    setKits(prev => prev.filter(k => k.id !== id))
    toast.success('Kit eliminado')
  }

  /* ── Output ──────────────────────────────────────────── */

  function handlePrint() {
    window.print()
  }

  function handleWhatsApp() {
    if (!items.length) return
    const lines = items.map(
      (i, idx) =>
        `${idx + 1}. *${i.drug}*\n   ${i.dose} — ${i.frequency} por ${i.duration}`,
    )
    const msg = [
      `📋 *Receta Médica — Beta Clinic*`,
      patientName ? `Paciente: ${patientName}` : '',
      `Fecha: ${new Date().toLocaleDateString('es-ES')}`,
      '',
      ...lines,
      '',
      '_Protocolo Omega — Sistema Clínico_',
    ]
      .filter(Boolean)
      .join('\n')
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      {/* ════════ LEFT: Builder ════════ */}
      <div className="min-w-0 flex-1 space-y-5">
        {/* ── Patient ──────────────────────────────────── */}
        <input
          value={patientName}
          onChange={e => setPatientName(e.target.value)}
          placeholder="Nombre del paciente..."
          className="w-full rounded-lg border border-omega-violet/20 bg-white px-4 py-2.5 text-sm text-omega-dark outline-none placeholder:text-omega-dark/30 focus:border-omega-violet/40 dark:border-clinical-white/10 dark:bg-omega-surface dark:text-clinical-white dark:placeholder:text-clinical-white/25 dark:focus:border-omega-violet/40"
        />

        {/* ── Kit search + grid ────────────────────────── */}
        <div className="rounded-xl border border-omega-violet/15 bg-white p-4 dark:border-clinical-white/[0.06] dark:bg-omega-surface">
          <div className="mb-3 flex items-center gap-2">
            <Zap size={14} className="text-omega-violet dark:text-beta-mint" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30">
              Protocolos Rápidos ({filteredKits.length})
            </p>
            <div className="ml-auto flex-1 sm:max-w-48">
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-omega-dark/25 dark:text-clinical-white/20"
                />
                <input
                  value={kitSearch}
                  onChange={e => setKitSearch(e.target.value)}
                  placeholder="Buscar protocolo..."
                  className="w-full rounded-lg border border-omega-violet/15 bg-clinical-white py-1.5 pl-7 pr-2 text-[11px] text-omega-dark outline-none placeholder:text-omega-dark/25 focus:border-omega-violet/30 dark:border-clinical-white/[0.06] dark:bg-omega-abyss dark:text-clinical-white dark:placeholder:text-clinical-white/20"
                />
              </div>
            </div>
          </div>

          <div className="grid max-h-52 grid-cols-3 gap-1.5 overflow-y-auto sm:grid-cols-4 lg:grid-cols-5">
            {filteredKits.map(kit => (
              <button
                key={kit.id}
                onClick={() => applyKit(kit)}
                className="group relative flex flex-col items-center gap-1 rounded-lg border border-omega-violet/10 px-2 py-2.5 transition-all hover:border-omega-violet/30 hover:shadow-md dark:border-clinical-white/[0.04] dark:hover:border-clinical-white/15"
              >
                {kit.custom && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      deleteKit(kit.id)
                    }}
                    className="absolute right-1 top-1 rounded p-0.5 text-omega-dark/15 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100 dark:text-clinical-white/10 dark:hover:text-red-400"
                  >
                    <X size={10} />
                  </button>
                )}
                <span className="text-base">{kit.emoji}</span>
                <span className="text-center text-[10px] font-semibold leading-tight text-omega-dark/60 group-hover:text-omega-dark dark:text-clinical-white/40 dark:group-hover:text-clinical-white/80">
                  {kit.label}
                </span>
                <span className="text-[8px] text-omega-dark/25 dark:text-clinical-white/15">
                  {kit.items.length} meds
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Drug search ──────────────────────────────── */}
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-omega-dark/30 dark:text-clinical-white/25"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                setShowSuggestions(true)
                if (selectedDrug && e.target.value !== selectedDrug.name) {
                  setSelectedDrug(null)
                }
              }}
              onFocus={() => query.length > 0 && setShowSuggestions(true)}
              placeholder="Agregar medicamento individual... (ej: Para, Amoxi)"
              className="w-full rounded-xl border border-omega-violet/20 bg-white py-3 pl-10 pr-4 text-sm text-omega-dark outline-none placeholder:text-omega-dark/30 focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-surface dark:text-clinical-white dark:placeholder:text-clinical-white/25 dark:focus:border-omega-violet/40 dark:focus:ring-omega-violet/10"
            />
            {query && (
              <button
                onClick={resetDrugForm}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-omega-dark/30 hover:text-omega-dark/60 dark:text-clinical-white/25 dark:hover:text-clinical-white/50"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {showSuggestions && filteredDrugs.length > 0 && (
            <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-52 overflow-y-auto rounded-xl border border-omega-violet/20 bg-white shadow-xl dark:border-clinical-white/10 dark:bg-omega-surface">
              {filteredDrugs.map(drug => (
                <button
                  key={drug.name}
                  onClick={() => selectDrug(drug)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-omega-violet/5 dark:hover:bg-clinical-white/5"
                >
                  <Pill size={14} className="shrink-0 text-omega-violet dark:text-beta-mint" />
                  <span className="text-omega-dark dark:text-clinical-white">{drug.name}</span>
                  <span className="ml-auto text-[10px] text-omega-dark/30 dark:text-clinical-white/20">
                    {drug.defaultDose}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick chips (after selecting a drug) ─────── */}
        {selectedDrug && (
          <div className="space-y-3 rounded-xl border border-omega-violet/15 bg-omega-violet/[0.03] p-4 dark:border-clinical-white/[0.06] dark:bg-omega-violet/[0.04]">
            <div className="flex items-center gap-2">
              <Pill size={14} className="text-omega-violet dark:text-beta-mint" />
              <span className="text-sm font-bold text-omega-dark dark:text-clinical-white">
                {selectedDrug.name}
              </span>
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30">
                Dosis
              </p>
              <input
                value={dose}
                onChange={e => setDose(e.target.value)}
                className="w-full rounded-lg border border-omega-violet/15 bg-white px-3 py-2 text-sm text-omega-dark outline-none focus:border-omega-violet/30 dark:border-clinical-white/[0.06] dark:bg-omega-surface dark:text-clinical-white"
              />
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30">
                Frecuencia
              </p>
              <div className="flex flex-wrap gap-1.5">
                {FREQUENCIES.map(f => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      frequency === f
                        ? 'bg-omega-violet text-white shadow-sm'
                        : 'border border-omega-violet/15 text-omega-dark/60 hover:border-omega-violet/30 dark:border-clinical-white/10 dark:text-clinical-white/40 dark:hover:border-clinical-white/20'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30">
                Duración
              </p>
              <div className="flex flex-wrap gap-1.5">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      duration === d
                        ? 'bg-omega-violet text-white shadow-sm'
                        : 'border border-omega-violet/15 text-omega-dark/60 hover:border-omega-violet/30 dark:border-clinical-white/10 dark:text-clinical-white/40 dark:hover:border-clinical-white/20'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={addItem}
              disabled={!frequency || !duration}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-omega-violet py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
            >
              Agregar a la Receta
            </button>
          </div>
        )}
      </div>

      {/* ════════ RIGHT: Paper preview ════════ */}
      <div className="w-full shrink-0 lg:w-80">
        <div className="print-prescription sticky top-6 rounded-2xl border border-omega-violet/20 bg-white p-6 shadow-sm dark:border-clinical-white/[0.08] dark:bg-omega-surface">
          {/* Header */}
          <div className="mb-4 border-b border-dashed border-omega-violet/10 pb-4 dark:border-clinical-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-omega-violet dark:text-beta-mint">
                  Receta Médica
                </p>
                <p className="mt-0.5 text-[10px] text-omega-dark/30 dark:text-clinical-white/20">
                  Protocolo Omega
                </p>
              </div>
              <Clipboard size={18} className="text-omega-violet/30 dark:text-clinical-white/15" />
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-sm font-semibold text-omega-dark dark:text-clinical-white">
                {patientName || 'Paciente'}
              </p>
              <p className="text-[10px] text-omega-dark/40 dark:text-clinical-white/25">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Items */}
          {items.length === 0 ? (
            <div className="py-10 text-center">
              <Pill size={32} className="mx-auto text-omega-dark/10 dark:text-clinical-white/[0.06]" />
              <p className="mt-2 text-xs text-omega-dark/25 dark:text-clinical-white/15">
                Los medicamentos aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {items.map((item, idx) => {
                const isEditing = editingId === item.id
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-lg bg-omega-violet/[0.03] px-3 py-2.5 dark:bg-clinical-white/[0.03]"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-omega-violet/10 text-[10px] font-bold text-omega-violet dark:bg-omega-violet/20 dark:text-beta-mint">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              value={item.dose}
                              onChange={e => updateItem(item.id, 'dose', e.target.value)}
                              className="w-full rounded border border-omega-violet/20 bg-white px-2 py-1 text-[11px] text-omega-dark outline-none dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white"
                            />
                            <div className="flex gap-1.5">
                              <select
                                value={item.frequency}
                                onChange={e => updateItem(item.id, 'frequency', e.target.value)}
                                className="flex-1 rounded border border-omega-violet/20 bg-white px-1.5 py-1 text-[10px] text-omega-dark outline-none dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white"
                              >
                                {FREQUENCIES.map(f => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                              </select>
                              <select
                                value={item.duration}
                                onChange={e => updateItem(item.id, 'duration', e.target.value)}
                                className="flex-1 rounded border border-omega-violet/20 bg-white px-1.5 py-1 text-[10px] text-omega-dark outline-none dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white"
                              >
                                {DURATIONS.map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                                <option value="Dosis única">Dosis única</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-bold text-omega-dark dark:text-clinical-white/90">
                              {item.drug}
                            </p>
                            <p className="mt-0.5 text-[11px] text-omega-dark/50 dark:text-clinical-white/35">
                              {item.dose} — {item.frequency} por {item.duration}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-0.5">
                        <button
                          onClick={() => setEditingId(isEditing ? null : item.id)}
                          className={`rounded p-1 transition-all ${
                            isEditing
                              ? 'text-emerald-500 hover:bg-emerald-500/10'
                              : 'text-omega-dark/20 opacity-0 hover:bg-omega-violet/10 hover:text-omega-violet group-hover:opacity-100 dark:text-clinical-white/15 dark:hover:text-beta-mint'
                          }`}
                        >
                          {isEditing ? <Check size={12} /> : <Pencil size={12} />}
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded p-1 text-omega-dark/20 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100 dark:text-clinical-white/15 dark:hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Actions */}
          {items.length > 0 && (
            <div className="mt-4 space-y-2.5 border-t border-dashed border-omega-violet/10 pt-4 dark:border-clinical-white/[0.06]">
              <p className="text-center text-[10px] font-semibold text-omega-dark/30 dark:text-clinical-white/20">
                {items.length} {items.length === 1 ? 'medicamento' : 'medicamentos'}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-omega-violet/20 py-2 text-xs font-semibold text-omega-dark transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white dark:hover:bg-clinical-white/5"
                >
                  <Printer size={13} />
                  Imprimir
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-[#25D366]/30 py-2 text-xs font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/10"
                >
                  <Send size={13} />
                  WhatsApp
                </button>
              </div>

              {/* Save as kit */}
              {showSaveKit ? (
                <div className="flex gap-1.5">
                  <input
                    autoFocus
                    value={newKitName}
                    onChange={e => setNewKitName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveCurrentAsKit()}
                    placeholder="Nombre del kit..."
                    className="min-w-0 flex-1 rounded-lg border border-omega-violet/20 bg-clinical-white px-3 py-2 text-xs text-omega-dark outline-none placeholder:text-omega-dark/30 focus:border-omega-violet/40 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:placeholder:text-clinical-white/25"
                  />
                  <button
                    onClick={saveCurrentAsKit}
                    className="rounded-lg bg-omega-violet px-3 py-2 text-xs font-bold text-white transition-transform hover:scale-105"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveKit(false)
                      setNewKitName('')
                    }}
                    className="rounded-lg border border-omega-violet/20 px-2 py-2 text-xs text-omega-dark/40 transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/30"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveKit(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-omega-violet/20 py-2 text-xs font-semibold text-omega-dark/50 transition-colors hover:border-omega-violet/40 hover:text-omega-violet dark:border-clinical-white/10 dark:text-clinical-white/30 dark:hover:border-clinical-white/20 dark:hover:text-beta-mint"
                >
                  <Save size={13} />
                  Guardar como Kit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
