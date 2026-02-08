import { useState, useRef, useCallback } from 'react'
import { jsPDF } from 'jspdf'
import {
  Copy,
  Trash2,
  Printer,
  GripVertical,
  Plus,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettings } from '../../context/SettingsContext'
import { useClinic } from '../../context/ClinicContext'
import { THEME_CONFIG } from '../../data/themeConfig'
import { generateDietPlan } from '../../services/aiService'

/* ── Constants ─────────────────────────────────────────── */

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const
const MEALS = ['Desayuno', 'Colación 1', 'Comida', 'Colación 2', 'Cena'] as const

type Grid = string[][]

function emptyGrid(): Grid {
  return MEALS.map(() => DAYS.map(() => ''))
}

const FOOD_BANK = [
  { group: 'Proteínas', items: ['Pollo a la plancha', 'Huevo cocido', 'Atún en agua', 'Pechuga de pavo', 'Lomo de res'] },
  { group: 'Carbohidratos', items: ['Arroz integral', 'Avena', 'Pan integral', 'Pasta integral', 'Quinoa'] },
  { group: 'Frutas', items: ['Manzana', 'Plátano', 'Fresas', 'Naranja', 'Arándanos'] },
  { group: 'Verduras', items: ['Brócoli', 'Espinaca', 'Zanahoria', 'Pepino', 'Tomate'] },
  { group: 'Grasas saludables', items: ['Aguacate', 'Almendras', 'Aceite de oliva', 'Nueces', 'Semillas de chía'] },
  { group: 'Lácteos', items: ['Yogur griego', 'Queso cottage', 'Leche descremada'] },
]

/* ── Props ─────────────────────────────────────────────── */

interface Props {
  patientName?: string
  patientWeight?: number
  patientBmi?: number
}

/* ── Component ─────────────────────────────────────────── */

export default function MealPlanner({ patientName, patientWeight, patientBmi }: Props) {
  const [grid, setGrid] = useState<Grid>(emptyGrid)
  const [focusedCell, setFocusedCell] = useState<[number, number] | null>(null)
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[][]>(
    MEALS.map(() => DAYS.map(() => null)),
  )
  const [isLoading, setIsLoading] = useState(false)
  const { clinic } = useSettings()
  const { clinicType } = useClinic()

  /* ── AI generation ─────────────────────────────────── */

  async function handleGenerateAI() {
    setIsLoading(true)
    try {
      const plan = await generateDietPlan({
        edad: 30,
        peso: patientWeight ?? 70,
        altura: 170,
        objetivo: 'alimentación saludable',
        alergias: 'ninguna',
      })

      setGrid(prev => {
        const next = prev.map(r => [...r])
        next[0][0] = plan.breakfast  // Desayuno
        next[1][0] = plan.snack      // Colación 1
        next[2][0] = plan.lunch      // Comida
        next[4][0] = plan.dinner     // Cena
        return next
      })

      toast.success('¡Dieta generada por Gemini Flash!')
    } catch {
      toast.error('Error al conectar con el servidor de IA')
    } finally {
      setIsLoading(false)
    }
  }

  /* ── Grid helpers ──────────────────────────────────── */

  const updateCell = useCallback((row: number, col: number, value: string) => {
    setGrid(prev => {
      const next = prev.map(r => [...r])
      next[row][col] = value
      return next
    })
  }, [])

  function copyMondayToAll() {
    setGrid(prev => {
      const next = prev.map(r => [...r])
      for (let row = 0; row < MEALS.length; row++) {
        for (let col = 1; col < DAYS.length; col++) {
          next[row][col] = next[row][0]
        }
      }
      return next
    })
    toast.success('Lunes copiado a toda la semana')
  }

  function clearAll() {
    setGrid(emptyGrid())
    toast.success('Plan alimentario limpiado')
  }

  function insertFood(text: string) {
    if (!focusedCell) {
      toast.error('Selecciona una celda primero')
      return
    }
    const [row, col] = focusedCell
    setGrid(prev => {
      const next = prev.map(r => [...r])
      const existing = next[row][col]
      next[row][col] = existing ? `${existing}\n${text}` : text
      return next
    })
    // Re-focus the textarea
    textareaRefs.current[row]?.[col]?.focus()
  }

  /* ── PDF generation ────────────────────────────────── */

  function generatePDF() {
    const palette = THEME_CONFIG[clinicType ?? 'nutrition']
    const doc = new jsPDF({ orientation: 'landscape' })
    const w = doc.internal.pageSize.getWidth()
    let y = 20

    // ── Header bar
    doc.setFillColor(palette.primary)
    doc.rect(0, 0, w, 32, 'F')

    doc.setTextColor('#FFFFFF')
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(clinic.nombre || 'Beta Clinic', 15, y)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Plan Alimentario Semanal', 15, y + 6)

    doc.setTextColor('#FFFFFFCC')
    doc.setFontSize(7)
    doc.text(`NIT: ${clinic.nit} | Tel: ${clinic.telefono}`, w - 15, y - 4, { align: 'right' })
    doc.text(clinic.direccion, w - 15, y + 2, { align: 'right' })

    y = 40

    // ── Patient info row
    doc.setTextColor('#333333')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Paciente:', 15, y)
    doc.setFont('helvetica', 'normal')
    doc.text(patientName || '___________________________', 38, y)

    if (patientWeight) {
      doc.setFont('helvetica', 'bold')
      doc.text('Peso:', 130, y)
      doc.setFont('helvetica', 'normal')
      doc.text(`${patientWeight} kg`, 145, y)
    }

    if (patientBmi) {
      doc.setFont('helvetica', 'bold')
      doc.text('IMC:', 170, y)
      doc.setFont('helvetica', 'normal')
      doc.text(patientBmi.toFixed(1), 183, y)
    }

    doc.setFont('helvetica', 'bold')
    doc.text('Fecha:', w - 55, y)
    doc.setFont('helvetica', 'normal')
    doc.text(new Date().toLocaleDateString('es-CO'), w - 38, y)

    y += 10

    // ── Table
    const marginL = 15
    const marginR = 15
    const labelW = 28
    const tableW = w - marginL - marginR
    const cellW = (tableW - labelW) / DAYS.length
    const cellH = 22

    // Column headers
    doc.setFillColor(palette.primary)
    doc.rect(marginL, y, tableW, 8, 'F')
    doc.setTextColor('#FFFFFF')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')

    // Empty top-left corner
    doc.text('', marginL + 2, y + 5.5)

    DAYS.forEach((day, i) => {
      const x = marginL + labelW + i * cellW
      doc.text(day, x + cellW / 2, y + 5.5, { align: 'center' })
    })

    y += 8

    // Data rows
    MEALS.forEach((meal, row) => {
      // Alternating row bg
      const isEven = row % 2 === 0
      doc.setFillColor(isEven ? '#F0FDF4' : '#FFFFFF')
      doc.rect(marginL, y, tableW, cellH, 'F')

      // Row borders
      doc.setDrawColor('#D1D5DB')
      doc.setLineWidth(0.2)
      doc.rect(marginL, y, tableW, cellH, 'S')

      // Meal label
      doc.setFillColor(palette.primary + '18')
      doc.rect(marginL, y, labelW, cellH, 'F')
      doc.setTextColor(palette.primary)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text(meal, marginL + labelW / 2, y + cellH / 2 + 1, { align: 'center' })

      // Cell data
      doc.setTextColor('#374151')
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'normal')

      DAYS.forEach((_, col) => {
        const x = marginL + labelW + col * cellW
        const text = grid[row][col]

        // Vertical separator
        doc.setDrawColor('#E5E7EB')
        doc.line(x, y, x, y + cellH)

        if (text) {
          const lines = doc.splitTextToSize(text, cellW - 4)
          doc.text(lines.slice(0, 4), x + 2, y + 4)
        }
      })

      y += cellH
    })

    // ── Footer
    y += 8
    doc.setDrawColor(palette.primary)
    doc.setLineWidth(0.3)
    doc.line(marginL, y, w - marginR, y)
    y += 6

    doc.setTextColor('#9CA3AF')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.text(
      'Este plan alimentario es una guía general. Consulte con su nutricionista para ajustes personalizados.',
      w / 2,
      y,
      { align: 'center' },
    )

    y += 5
    doc.setFont('helvetica', 'normal')
    doc.text(
      `${clinic.nombre} — Protocolo Omega`,
      w / 2,
      y,
      { align: 'center' },
    )

    const date = new Date().toISOString().slice(0, 10)
    doc.save(`plan_alimentario_${date}.pdf`)
    toast.success('PDF generado correctamente')
  }

  /* ── Render ────────────────────────────────────────── */

  const hasContent = grid.some(row => row.some(c => c.trim() !== ''))

  return (
    <div className="space-y-4">
      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copyMondayToAll}
          disabled={!grid[0][0] && !grid[1][0] && !grid[2][0] && !grid[3][0] && !grid[4][0]}
          className="flex items-center gap-1.5 rounded-lg border border-omega-violet/20 px-3 py-2 text-xs font-semibold text-omega-dark transition-colors hover:bg-beta-mint/10 hover:text-beta-mint disabled:opacity-30 dark:border-clinical-white/10 dark:text-clinical-white"
        >
          <Copy size={14} />
          Copiar Lunes a toda la semana
        </button>
        <button
          type="button"
          onClick={clearAll}
          disabled={!hasContent}
          className="flex items-center gap-1.5 rounded-lg border border-omega-violet/20 px-3 py-2 text-xs font-semibold text-omega-dark transition-colors hover:bg-alert-red/10 hover:text-alert-red disabled:opacity-30 dark:border-clinical-white/10 dark:text-clinical-white"
        >
          <Trash2 size={14} />
          Limpiar Todo
        </button>
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg border border-omega-violet/20 px-3 py-2 text-xs font-semibold text-omega-dark transition-colors hover:bg-omega-violet/10 hover:text-omega-violet disabled:opacity-50 dark:border-clinical-white/10 dark:text-clinical-white"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {isLoading ? 'Generando...' : 'Generar con IA'}
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={generatePDF}
          disabled={!hasContent}
          className="flex items-center gap-2 rounded-lg bg-beta-mint px-5 py-2.5 text-sm font-bold text-omega-dark shadow-sm transition-colors hover:bg-beta-mint/80 disabled:opacity-30"
        >
          <Printer size={16} />
          Imprimir Dieta
        </button>
      </div>

      {/* ── Main grid + food bank ───────────────────── */}
      <div className="flex gap-4">
        {/* ── Meal grid ──────────────────────────────── */}
        <div className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-24 border-b border-r border-omega-violet/10 bg-omega-violet/5 px-2 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-omega-violet dark:border-clinical-white/10 dark:bg-beta-mint/5 dark:text-beta-mint">
                  Comida
                </th>
                {DAYS.map(day => (
                  <th
                    key={day}
                    className="border-b border-omega-violet/10 px-1.5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-omega-dark/60 dark:border-clinical-white/10 dark:text-clinical-white/40"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEALS.map((meal, row) => (
                <tr key={meal}>
                  <td className="sticky left-0 z-10 border-r border-omega-violet/10 bg-omega-violet/5 px-2 py-1 text-xs font-semibold text-omega-violet dark:border-clinical-white/10 dark:bg-beta-mint/5 dark:text-beta-mint">
                    <div className="flex items-center gap-1">
                      <GripVertical size={12} className="opacity-30" />
                      {meal}
                    </div>
                  </td>
                  {DAYS.map((_, col) => {
                    const isFocused = focusedCell?.[0] === row && focusedCell?.[1] === col
                    return (
                      <td
                        key={col}
                        className={`border border-omega-violet/5 p-0.5 dark:border-clinical-white/5 ${
                          isFocused ? 'bg-beta-mint/5' : ''
                        }`}
                      >
                        <textarea
                          ref={el => {
                            if (!textareaRefs.current[row]) textareaRefs.current[row] = []
                            textareaRefs.current[row][col] = el
                          }}
                          value={grid[row][col]}
                          onChange={e => updateCell(row, col, e.target.value)}
                          onFocus={() => setFocusedCell([row, col])}
                          placeholder="..."
                          rows={3}
                          className="w-full resize-none rounded bg-transparent px-1.5 py-1 text-xs text-omega-dark outline-none placeholder:text-omega-dark/20 focus:bg-beta-mint/5 dark:text-clinical-white dark:placeholder:text-clinical-white/15"
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Food bank sidebar ──────────────────────── */}
        <div className="hidden w-56 shrink-0 overflow-y-auto rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface lg:block">
          <div className="sticky top-0 z-10 border-b border-omega-violet/10 bg-omega-violet/5 px-3 py-2.5 dark:border-clinical-white/10 dark:bg-beta-mint/5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-omega-violet dark:text-beta-mint">
              Alimentos Recomendados
            </h4>
            {!focusedCell && (
              <p className="mt-0.5 text-[10px] text-omega-dark/40 dark:text-clinical-white/30">
                Selecciona una celda primero
              </p>
            )}
            {focusedCell && (
              <p className="mt-0.5 text-[10px] text-beta-mint">
                Insertando en: {MEALS[focusedCell[0]]} — {DAYS[focusedCell[1]]}
              </p>
            )}
          </div>
          <div className="p-2">
            {FOOD_BANK.map(group => (
              <div key={group.group} className="mb-3 last:mb-0">
                <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30">
                  {group.group}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => insertFood(item)}
                      className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-omega-dark transition-colors hover:bg-beta-mint/10 hover:text-beta-mint dark:text-clinical-white/70 dark:hover:text-beta-mint"
                    >
                      <Plus size={12} className="shrink-0 opacity-40" />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
