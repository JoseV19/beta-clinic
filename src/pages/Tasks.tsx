import { useState } from 'react'
import { toast } from 'sonner'
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useDraggable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
} from '@dnd-kit/core'
import confetti from 'canvas-confetti'
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react'
import { usePersistentState } from '../hooks/usePersistentState'

/* ── Types ─────────────────────────────────────────────── */

type ColumnId = 'pendiente' | 'en-proceso' | 'completado'
type Priority = 'alta' | 'media' | 'baja'

interface Task {
  id: number
  titulo: string
  asignado: string
  prioridad: Priority
  columna: ColumnId
}

/* ── Column config ─────────────────────────────────────── */

const columnDefs: { id: ColumnId; label: string; accent: string }[] = [
  { id: 'pendiente', label: 'Pendiente', accent: 'border-t-gray-400' },
  { id: 'en-proceso', label: 'En Proceso', accent: 'border-t-amber-400' },
  { id: 'completado', label: 'Completado', accent: 'border-t-beta-mint' },
]

const priorityBadge: Record<Priority, string> = {
  alta: 'bg-alert-red/15 text-alert-red',
  media: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  baja: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
}

/* ── Default data ─────────────────────────────────────── */

const defaultTasks: Task[] = [
  { id: 1, titulo: 'Revisar historial de María García', asignado: 'Dr. Rodríguez', prioridad: 'alta', columna: 'pendiente' },
  { id: 2, titulo: 'Solicitar laboratorios de control', asignado: 'Dra. Martínez', prioridad: 'media', columna: 'pendiente' },
  { id: 3, titulo: 'Llamar proveedor de insumos', asignado: 'Admin', prioridad: 'baja', columna: 'pendiente' },
  { id: 4, titulo: 'Actualizar inventario de medicamentos', asignado: 'Admin', prioridad: 'alta', columna: 'en-proceso' },
  { id: 5, titulo: 'Generar reporte RIPS mensual', asignado: 'Dra. Martínez', prioridad: 'media', columna: 'en-proceso' },
  { id: 6, titulo: 'Confirmar citas de mañana', asignado: 'Recepción', prioridad: 'media', columna: 'completado' },
  { id: 7, titulo: 'Enviar recetas pendientes', asignado: 'Dr. Rodríguez', prioridad: 'baja', columna: 'completado' },
]

/* ── Droppable Column ──────────────────────────────────── */

function KanbanColumn({
  id,
  label,
  accent,
  count,
  isOver,
  nodeRef,
  children,
}: {
  id: string
  label: string
  accent: string
  count: number
  isOver: boolean
  nodeRef: (el: HTMLElement | null) => void
  children: React.ReactNode
}) {
  void id
  return (
    <div
      ref={nodeRef}
      className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-omega-violet/10 border-t-2 transition-colors dark:border-clinical-white/10 ${accent} ${
        isOver
          ? 'bg-omega-violet/10 dark:bg-clinical-white/[0.08]'
          : 'bg-omega-violet/[0.03] dark:bg-clinical-white/[0.02]'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-bold text-omega-dark dark:text-clinical-white">{label}</h3>
        <span className="rounded-full bg-omega-violet/10 px-2 py-0.5 text-xs font-bold text-omega-violet dark:bg-omega-violet/25 dark:text-beta-mint">
          {count}
        </span>
      </div>
      <div className="flex-1 space-y-2.5 overflow-y-auto px-3 pb-3">
        {children}
      </div>
    </div>
  )
}

function DroppableColumn(props: Omit<Parameters<typeof KanbanColumn>[0], 'isOver' | 'nodeRef'>) {
  const { setNodeRef, isOver } = useDroppable({ id: props.id })
  return <KanbanColumn {...props} isOver={isOver} nodeRef={setNodeRef} />
}

/* ── Task Card ─────────────────────────────────────────── */

function TaskCard({
  task,
  onMove,
  overlay,
}: {
  task: Task
  onMove: (id: number, to: ColumnId) => void
  overlay?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: overlay ? `overlay-${task.id}` : task.id,
    disabled: overlay,
  })

  const colIdx = columnDefs.findIndex((c) => c.id === task.columna)

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={
        !overlay && transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={`rounded-lg border border-omega-violet/15 bg-white p-3 dark:border-clinical-white/10 dark:bg-omega-surface ${
        isDragging && !overlay ? 'z-10 opacity-30' : ''
      } ${overlay ? 'rotate-2 shadow-xl' : 'shadow-sm transition-shadow hover:shadow-md'}`}
    >
      {/* Drag handle + Title */}
      <div className="flex items-start gap-2">
        <button
          {...(overlay ? {} : { ...listeners, ...attributes })}
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-omega-dark/20 transition-colors hover:text-omega-dark/50 active:cursor-grabbing dark:text-clinical-white/15 dark:hover:text-clinical-white/40"
          tabIndex={overlay ? -1 : 0}
        >
          <GripVertical size={14} />
        </button>
        <p className="flex-1 text-sm font-medium leading-snug text-omega-dark dark:text-clinical-white">
          {task.titulo}
        </p>
      </div>

      {/* Meta */}
      <div className="mt-2 flex items-center gap-2">
        <span className="truncate text-xs text-omega-dark/45 dark:text-clinical-white/35">
          @{task.asignado}
        </span>
        <span
          className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${priorityBadge[task.prioridad]}`}
        >
          {task.prioridad}
        </span>
      </div>

      {/* Move arrows */}
      {!overlay && (
        <div className="mt-2 flex justify-end gap-1 border-t border-omega-violet/10 pt-2 dark:border-clinical-white/5">
          {colIdx > 0 && (
            <button
              onClick={() => onMove(task.id, columnDefs[colIdx - 1].id)}
              title={`Mover a ${columnDefs[colIdx - 1].label}`}
              className="rounded p-1 text-omega-dark/25 transition-colors hover:bg-omega-violet/10 hover:text-omega-dark dark:text-clinical-white/20 dark:hover:bg-clinical-white/10 dark:hover:text-clinical-white"
            >
              <ChevronLeft size={14} />
            </button>
          )}
          {colIdx < columnDefs.length - 1 && (
            <button
              onClick={() => onMove(task.id, columnDefs[colIdx + 1].id)}
              title={`Mover a ${columnDefs[colIdx + 1].label}`}
              className="rounded p-1 text-omega-dark/25 transition-colors hover:bg-omega-violet/10 hover:text-omega-dark dark:text-clinical-white/20 dark:hover:bg-clinical-white/10 dark:hover:text-clinical-white"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Add Task Modal ───────────────────────────────────── */

function NewTaskModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (t: Omit<Task, 'id' | 'columna'>) => void
}) {
  const [titulo, setTitulo] = useState('')
  const [asignado, setAsignado] = useState('')
  const [prioridad, setPrioridad] = useState<Priority>('media')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    onSave({
      titulo: titulo.trim(),
      asignado: asignado.trim() || 'Sin asignar',
      prioridad,
    })
  }

  const inputClass =
    'w-full rounded-lg border border-omega-violet/20 bg-clinical-white px-3 py-2 text-sm text-omega-dark outline-none focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl border border-omega-violet/20 bg-white p-6 shadow-xl dark:border-clinical-white/10 dark:bg-omega-surface"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-omega-dark dark:text-clinical-white">
            Nueva Tarea
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-omega-dark/40 transition-colors hover:bg-omega-violet/5 dark:text-clinical-white/40 dark:hover:bg-clinical-white/5"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Título *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Revisar laboratorios de control"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Asignado a
            </label>
            <input
              type="text"
              value={asignado}
              onChange={(e) => setAsignado(e.target.value)}
              placeholder="Ej. Dr. Rodríguez"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Prioridad
            </label>
            <div className="flex gap-2">
              {(['alta', 'media', 'baja'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrioridad(p)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-colors ${
                    prioridad === p
                      ? p === 'alta'
                        ? 'bg-alert-red text-white'
                        : p === 'media'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-500 text-white'
                      : 'border border-omega-violet/20 text-omega-dark/60 hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/50 dark:hover:bg-clinical-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-omega-violet/20 px-4 py-2 text-sm font-medium text-omega-dark/60 transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/50 dark:hover:bg-clinical-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-beta-mint px-5 py-2 text-sm font-bold text-omega-dark transition-colors hover:bg-beta-mint/80"
          >
            <Plus size={16} />
            Crear Tarea
          </button>
        </div>
      </form>
    </div>
  )
}

/* ── Main component ────────────────────────────────────── */

export default function Tasks() {
  const [tasks, setTasks] = usePersistentState<Task[]>('beta_tasks', defaultTasks)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const activeTask = activeId != null ? tasks.find((t) => t.id === activeId) ?? null : null

  function moveTask(id: number, to: ColumnId) {
    const task = tasks.find((t) => t.id === id)
    if (!task || task.columna === to) return

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, columna: to } : t)))

    if (to === 'completado') {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } })
      toast.success('Tarea completada')
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as number
    const targetCol = over.id as ColumnId

    if (!columnDefs.some((c) => c.id === targetCol)) return
    moveTask(taskId, targetCol)
  }

  function handleAdd(t: Omit<Task, 'id' | 'columna'>) {
    setTasks((prev) => [{ ...t, id: Date.now(), columna: 'pendiente' }, ...prev])
    setModalOpen(false)
    toast.success('Tarea creada')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Tareas</h1>
          <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
            Tablero Kanban — gestión de actividades
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-beta-mint px-4 py-2 text-sm font-semibold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 hover:shadow-lg hover:shadow-beta-mint/25 active:scale-[0.97]"
        >
          <Plus size={18} />
          Nueva Tarea
        </button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveId(e.active.id as number)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-3">
          {columnDefs.map((col) => {
            const colTasks = tasks.filter((t) => t.columna === col.id)
            return (
              <DroppableColumn key={col.id} id={col.id} label={col.label} accent={col.accent} count={colTasks.length}>
                {colTasks.map((t) => (
                  <TaskCard key={t.id} task={t} onMove={moveTask} />
                ))}
                {colTasks.length === 0 && (
                  <p className="py-10 text-center text-xs text-omega-dark/25 dark:text-clinical-white/15">
                    Sin tareas
                  </p>
                )}
              </DroppableColumn>
            )
          })}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onMove={moveTask} overlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Modal */}
      {modalOpen && <NewTaskModal onClose={() => setModalOpen(false)} onSave={handleAdd} />}
    </div>
  )
}
