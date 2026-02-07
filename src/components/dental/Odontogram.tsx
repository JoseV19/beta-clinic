import { useState } from 'react'
import { RotateCcw, MousePointer2 } from 'lucide-react'

/* ── Types (exported for DentalDashboard) ──────────────── */

export type Surface = 'vestibular' | 'lingual' | 'mesial' | 'distal' | 'oclusal'
export type Tool = 'caries' | 'resina' | 'corona' | 'extraer' | 'ausente'

export interface ToothData {
  surfaces: Partial<Record<Surface, Tool>>
  status?: 'extraer' | 'ausente'
}

export type OdontogramData = Record<number, ToothData>

/* ── Constants (exported for shared use) ───────────────── */

// eslint-disable-next-line react-refresh/only-export-components
export const TOOL_COLORS: Record<Tool, string> = {
  caries: '#E53935',
  resina: '#2196F3',
  corona: '#FFD700',
  extraer: '#E53935',
  ausente: '#1a1a1a',
}

// eslint-disable-next-line react-refresh/only-export-components
export const TOOL_LABELS: Record<Tool, string> = {
  caries: 'Caries',
  resina: 'Resina/Empaste',
  corona: 'Corona',
  extraer: 'A Extraer',
  ausente: 'Ausente',
}

const TOOLS: Tool[] = ['caries', 'resina', 'corona', 'extraer', 'ausente']
const SURFACES: Surface[] = ['vestibular', 'mesial', 'oclusal', 'distal', 'lingual']

const SURFACE_SHAPES: Record<Surface, { tag: 'polygon' | 'rect'; attrs: Record<string, string> }> = {
  vestibular: { tag: 'polygon', attrs: { points: '0,0 50,0 38,12 12,12' } },
  lingual:    { tag: 'polygon', attrs: { points: '12,38 38,38 50,50 0,50' } },
  mesial:     { tag: 'polygon', attrs: { points: '0,0 12,12 12,38 0,50' } },
  distal:     { tag: 'polygon', attrs: { points: '38,12 50,0 50,50 38,38' } },
  oclusal:    { tag: 'rect',    attrs: { x: '12', y: '12', width: '26', height: '26' } },
}

const STROKE = '#6A1B9A'

/* ── Arch tooth positions (elliptical model) ──────────── */

interface ArchPos { num: number; x: number; y: number; rot: number }

// Upper arch: cx=260, cy=30, rx=210, ry=170
const UPPER_ARCH: ArchPos[] = [
  { num: 18, x: 60,  y: 83,  rot: -72 },
  { num: 17, x: 76,  y: 112, rot: -61 },
  { num: 16, x: 99,  y: 139, rot: -50 },
  { num: 15, x: 125, y: 160, rot: -40 },
  { num: 14, x: 155, y: 177, rot: -30 },
  { num: 13, x: 185, y: 189, rot: -21 },
  { num: 12, x: 213, y: 196, rot: -13 },
  { num: 11, x: 242, y: 199, rot: -5 },
  { num: 21, x: 278, y: 199, rot: 5 },
  { num: 22, x: 307, y: 196, rot: 13 },
  { num: 23, x: 339, y: 189, rot: 22 },
  { num: 24, x: 371, y: 174, rot: 32 },
  { num: 25, x: 401, y: 156, rot: 42 },
  { num: 26, x: 428, y: 132, rot: 53 },
  { num: 27, x: 449, y: 104, rot: 64 },
  { num: 28, x: 463, y: 74,  rot: 75 },
]

// Lower arch: cx=260, cy=200, rx=210, ry=170 (flipped)
const LOWER_ARCH: ArchPos[] = [
  { num: 48, x: 60,  y: 147, rot: 72 },
  { num: 47, x: 76,  y: 118, rot: 61 },
  { num: 46, x: 99,  y: 91,  rot: 50 },
  { num: 45, x: 125, y: 70,  rot: 40 },
  { num: 44, x: 155, y: 53,  rot: 30 },
  { num: 43, x: 185, y: 41,  rot: 21 },
  { num: 42, x: 213, y: 34,  rot: 13 },
  { num: 41, x: 242, y: 31,  rot: 5 },
  { num: 31, x: 278, y: 31,  rot: -5 },
  { num: 32, x: 307, y: 34,  rot: -13 },
  { num: 33, x: 339, y: 42,  rot: -22 },
  { num: 34, x: 371, y: 56,  rot: -32 },
  { num: 35, x: 401, y: 74,  rot: -42 },
  { num: 36, x: 428, y: 98,  rot: -53 },
  { num: 37, x: 449, y: 126, rot: -64 },
  { num: 38, x: 463, y: 156, rot: -75 },
]

/* ── ToothSVG ──────────────────────────────────────────── */

interface ToothSVGProps {
  toothNum: number
  data: ToothData
  activeTool: Tool | null
  onSurfaceClick: (num: number, s: Surface) => void
  onToothClick: (num: number) => void
  size?: string
}

function ToothSVG({ toothNum, data, activeTool, onSurfaceClick, onToothClick, size }: ToothSVGProps) {
  const isExtraer = data.status === 'extraer'
  const isAusente = data.status === 'ausente'

  function handleClick(surface: Surface) {
    if (!activeTool) return
    if (activeTool === 'extraer' || activeTool === 'ausente') {
      onToothClick(toothNum)
    } else {
      onSurfaceClick(toothNum, surface)
    }
  }

  return (
    <svg viewBox="0 0 50 50" className={size ?? 'h-10 w-10 sm:h-12 sm:w-12'}>
      {SURFACES.map((surface) => {
        const shape = SURFACE_SHAPES[surface]
        const toolApplied = data.surfaces[surface]
        const fill = toolApplied ? TOOL_COLORS[toolApplied] : undefined

        const props: React.SVGProps<SVGElement> = {
          key: surface,
          fill: fill || 'var(--tooth-fill)',
          stroke: STROKE,
          strokeWidth: '1',
          style: { cursor: activeTool ? 'pointer' : 'default' },
          className: 'transition-colors hover:opacity-80',
          onClick: () => handleClick(surface),
        }

        if (shape.tag === 'rect') {
          return <rect {...(props as React.SVGProps<SVGRectElement>)} {...shape.attrs} />
        }
        return <polygon {...(props as React.SVGProps<SVGPolygonElement>)} {...shape.attrs} />
      })}

      {isExtraer && (
        <g pointerEvents="none">
          <line x1="3" y1="3" x2="47" y2="47" stroke="#E53935" strokeWidth="4" strokeLinecap="round" />
          <line x1="47" y1="3" x2="3" y2="47" stroke="#E53935" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {isAusente && (
        <circle cx="25" cy="25" r="20" fill="#1a1a1a" opacity="0.85" pointerEvents="none" />
      )}
    </svg>
  )
}

/* ── ToolbarButton ─────────────────────────────────────── */

function ToolbarButton({ tool, isActive, onClick }: { tool: Tool; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:text-sm ${
        isActive
          ? 'scale-105 text-white shadow-md ring-2 ring-offset-1 ring-offset-omega-surface'
          : 'border border-omega-violet/20 text-omega-dark/70 hover:border-omega-violet/40 dark:border-clinical-white/10 dark:text-clinical-white/60 dark:hover:border-clinical-white/20'
      }`}
      style={
        isActive
          ? { backgroundColor: TOOL_COLORS[tool], color: tool === 'corona' ? '#1a1a1a' : '#fff', '--tw-ring-color': TOOL_COLORS[tool] } as React.CSSProperties
          : undefined
      }
    >
      <span
        className="inline-block h-3 w-3 rounded-sm border border-black/20"
        style={{ backgroundColor: TOOL_COLORS[tool] }}
      />
      {TOOL_LABELS[tool]}
    </button>
  )
}

/* ── Realistic Closed Mouth SVG ───────────────────────── */

interface VisibleTooth { cx: number; hw: number; gy: number; ty: number; c?: boolean }

// Upper teeth: cx, halfWidth, gumLineY, incisalTipY, canine?
const U_TEETH: VisibleTooth[] = [
  { cx: 138, hw: 12, gy: 192, ty: 216 },          // 15 premolar
  { cx: 164, hw: 14, gy: 188, ty: 220 },          // 14 premolar
  { cx: 194, hw: 17, gy: 172, ty: 230, c: true },  // 13 canine
  { cx: 222, hw: 15, gy: 182, ty: 226 },          // 12 lateral
  { cx: 253, hw: 19, gy: 176, ty: 230 },          // 11 central
  { cx: 287, hw: 19, gy: 176, ty: 230 },          // 21 central
  { cx: 318, hw: 15, gy: 182, ty: 226 },          // 22 lateral
  { cx: 346, hw: 17, gy: 172, ty: 230, c: true },  // 23 canine
  { cx: 376, hw: 14, gy: 188, ty: 220 },          // 24 premolar
  { cx: 402, hw: 12, gy: 192, ty: 216 },          // 25 premolar
]

// Lower teeth: cx, halfWidth, gumLineY, incisalTipY, canine?
const L_TEETH: VisibleTooth[] = [
  { cx: 177, hw: 10, gy: 266, ty: 222 },          // 45
  { cx: 199, hw: 11, gy: 270, ty: 218 },          // 44
  { cx: 222, hw: 13, gy: 276, ty: 210, c: true },  // 43 canine
  { cx: 244, hw: 11, gy: 272, ty: 216 },          // 42
  { cx: 263, hw: 9,  gy: 270, ty: 218 },          // 41
  { cx: 277, hw: 9,  gy: 270, ty: 218 },          // 31
  { cx: 296, hw: 11, gy: 272, ty: 216 },          // 32
  { cx: 318, hw: 13, gy: 276, ty: 210, c: true },  // 33 canine
  { cx: 341, hw: 11, gy: 270, ty: 218 },          // 34
  { cx: 363, hw: 10, gy: 266, ty: 222 },          // 35
]

// Tooth SVG path builders with anatomical bulge + natural contour
function uPath(t: VisibleTooth): string {
  const { cx, hw, gy, ty, c } = t
  const g = Math.round(hw * 0.78)
  const h = ty - gy
  if (c) {
    return [
      `M${cx - g},${gy}`,
      `C${cx - hw - 1},${gy + h * 0.18} ${cx - hw - 1},${gy + h * 0.58} ${cx - hw},${ty - h * 0.18}`,
      `C${cx - hw + 2},${ty - h * 0.04} ${cx - 5},${ty + 3} ${cx},${ty + 2}`,
      `C${cx + 5},${ty + 3} ${cx + hw - 2},${ty - h * 0.04} ${cx + hw},${ty - h * 0.18}`,
      `C${cx + hw + 1},${gy + h * 0.58} ${cx + hw + 1},${gy + h * 0.18} ${cx + g},${gy}`,
      'Z',
    ].join(' ')
  }
  return [
    `M${cx - g},${gy}`,
    `C${cx - hw},${gy + h * 0.16} ${cx - hw - 1},${gy + h * 0.62} ${cx - hw + 1},${ty - h * 0.06}`,
    `C${cx - hw + 2},${ty + 1} ${cx - hw * 0.35},${ty + 3} ${cx},${ty + 2}`,
    `C${cx + hw * 0.35},${ty + 3} ${cx + hw - 2},${ty + 1} ${cx + hw - 1},${ty - h * 0.06}`,
    `C${cx + hw + 1},${gy + h * 0.62} ${cx + hw},${gy + h * 0.16} ${cx + g},${gy}`,
    'Z',
  ].join(' ')
}

function lPath(t: VisibleTooth): string {
  const { cx, hw, gy, ty, c } = t
  const g = Math.round(hw * 0.78)
  const h = gy - ty
  if (c) {
    return [
      `M${cx - hw},${ty + h * 0.18}`,
      `C${cx - hw + 2},${ty - h * 0.04} ${cx - 5},${ty - 3} ${cx},${ty - 2}`,
      `C${cx + 5},${ty - 3} ${cx + hw - 2},${ty - h * 0.04} ${cx + hw},${ty + h * 0.18}`,
      `C${cx + hw + 1},${ty + h * 0.58} ${cx + g},${gy - h * 0.18} ${cx + g},${gy}`,
      `L${cx - g},${gy}`,
      `C${cx - g},${gy - h * 0.18} ${cx - hw - 1},${ty + h * 0.58} ${cx - hw},${ty + h * 0.18}`,
      'Z',
    ].join(' ')
  }
  return [
    `M${cx - hw + 1},${ty + h * 0.06}`,
    `C${cx - hw + 2},${ty - 1} ${cx - hw * 0.35},${ty - 3} ${cx},${ty - 2}`,
    `C${cx + hw * 0.35},${ty - 3} ${cx + hw - 2},${ty - 1} ${cx + hw - 1},${ty + h * 0.06}`,
    `C${cx + hw + 1},${ty + h * 0.62} ${cx + g},${gy - h * 0.16} ${cx + g},${gy}`,
    `L${cx - g},${gy}`,
    `C${cx - g},${gy - h * 0.16} ${cx - hw - 1},${ty + h * 0.62} ${cx - hw + 1},${ty + h * 0.06}`,
    'Z',
  ].join(' ')
}

function ClosedMouth() {
  return (
    <svg viewBox="0 0 540 380" className="mx-auto h-full w-full max-w-lg">
      <defs>
        {/* Gum gradients with natural depth */}
        <linearGradient id="gumUp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D87882" />
          <stop offset="35%" stopColor="#E8949C" />
          <stop offset="70%" stopColor="#F0A8AE" />
          <stop offset="100%" stopColor="#F5BFC2" />
        </linearGradient>
        <linearGradient id="gumDn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5BFC2" />
          <stop offset="30%" stopColor="#F0A8AE" />
          <stop offset="65%" stopColor="#E8949C" />
          <stop offset="100%" stopColor="#D87882" />
        </linearGradient>
        {/* 3D tooth fill: light from top-left */}
        <linearGradient id="tFill" x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#F0EBE5" />
          <stop offset="20%" stopColor="#FAFAF8" />
          <stop offset="55%" stopColor="#FFFFFF" />
          <stop offset="85%" stopColor="#F5F2EE" />
          <stop offset="100%" stopColor="#E5E0DA" />
        </linearGradient>
        {/* Incisal edge translucency */}
        <linearGradient id="tEdge" x1="0" y1="0.75" x2="0" y2="1">
          <stop offset="0%" stopColor="#D8E0E6" stopOpacity="0" />
          <stop offset="100%" stopColor="#C0CED8" stopOpacity="0.35" />
        </linearGradient>
        {/* Tooth side shadow */}
        <linearGradient id="tShadeR" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B8A898" stopOpacity="0" />
          <stop offset="60%" stopColor="#B8A898" stopOpacity="0" />
          <stop offset="100%" stopColor="#B8A898" stopOpacity="0.18" />
        </linearGradient>
        {/* Tooth highlight */}
        <linearGradient id="tHi" x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        {/* Soft shadow filter */}
        <filter id="softSh">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#5A3040" floodOpacity="0.12" />
        </filter>
        {/* Skin gradient */}
        <radialGradient id="skinG" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#FDE8E0" />
          <stop offset="80%" stopColor="#F8D5CB" />
          <stop offset="100%" stopColor="#F0C8BC" />
        </radialGradient>
      </defs>

      {/* ─── Skin / face background ─── */}
      <rect x="50" y="5" width="440" height="370" rx="36" fill="url(#skinG)" />

      {/* ─── Upper gum with scalloped margin ─── */}
      <path d={[
        'M76,14 Q76,10 80,10 L460,10 Q464,10 464,14 L464,198',
        // Scalloped bottom edge (right to left)
        `Q 402,192 392,198`,
        `Q 376,186 364,194`,
        `Q 346,168 330,190`,
        `Q 318,180 304,192`,
        `Q 287,174 270,190`,
        `Q 253,174 236,192`,
        `Q 222,180 210,190`,
        `Q 194,168 178,194`,
        `Q 164,186 150,198`,
        `Q 138,192 118,200`,
        'L 76,200 Z',
      ].join(' ')} fill="url(#gumUp)" />

      {/* ─── Lower gum with scalloped margin ─── */}
      <path d={[
        'M76,366 Q76,370 80,370 L460,370 Q464,370 464,366 L464,248',
        // Scalloped top edge (right to left)
        `Q 363,266 352,256`,
        `Q 341,270 330,260`,
        `Q 318,276 306,264`,
        `Q 296,272 286,262`,
        `Q 277,270 270,260`,
        `Q 263,270 254,262`,
        `Q 244,272 234,264`,
        `Q 222,276 210,260`,
        `Q 199,270 190,256`,
        `Q 177,266 164,248`,
        'L 76,248 Z',
      ].join(' ')} fill="url(#gumDn)" />

      {/* ─── Dark interior behind teeth (visible in embrasures) ─── */}
      <rect x="120" y="210" width="300" height="30" rx="8" fill="#2A0A18" opacity="0.25" />

      {/* ─── Lower teeth (behind upper) ─── */}
      <g filter="url(#softSh)">
        {L_TEETH.map((t, i) => (
          <g key={`lt${i}`}>
            <path d={lPath(t)} fill="url(#tFill)" stroke="#DDD6CC" strokeWidth="0.3" />
            <path d={lPath(t)} fill="url(#tShadeR)" />
          </g>
        ))}
      </g>

      {/* Shadows between lower teeth */}
      {L_TEETH.slice(0, -1).map((t, i) => {
        const next = L_TEETH[i + 1]
        const x = Math.round((t.cx + t.hw + next.cx - next.hw) / 2)
        return <line key={`ls${i}`} x1={x} y1={Math.min(t.ty, next.ty) + 6} x2={x} y2={Math.max(t.gy, next.gy) - 6} stroke="#7A5A50" strokeWidth="0.7" opacity="0.2" />
      })}

      {/* ─── Upper teeth (in front, with layered 3D) ─── */}
      <g filter="url(#softSh)">
        {U_TEETH.map((t, i) => (
          <g key={`ut${i}`}>
            {/* Base fill */}
            <path d={uPath(t)} fill="url(#tFill)" stroke="#DDD6CC" strokeWidth="0.3" />
            {/* Incisal translucency */}
            <path d={uPath(t)} fill="url(#tEdge)" />
            {/* Right-side shadow */}
            <path d={uPath(t)} fill="url(#tShadeR)" />
            {/* Left highlight */}
            <path d={uPath(t)} fill="url(#tHi)" />
          </g>
        ))}
      </g>

      {/* Shadows between upper teeth */}
      {U_TEETH.slice(0, -1).map((t, i) => {
        const next = U_TEETH[i + 1]
        const x = Math.round((t.cx + t.hw + next.cx - next.hw) / 2)
        return <line key={`us${i}`} x1={x} y1={Math.min(t.gy, next.gy) + 4} x2={x} y2={Math.max(t.ty, next.ty) - 4} stroke="#7A5A50" strokeWidth="0.8" opacity="0.22" />
      })}

      {/* Bite-line shadow */}
      <path d="M140,228 Q270,234 400,228" fill="none" stroke="#5A3040" strokeWidth="1.5" opacity="0.12" />
      <path d="M150,230 Q270,235 390,230" fill="none" stroke="#5A3040" strokeWidth="0.8" opacity="0.08" />

      {/* ─── Gum detail: subtle stippling texture ─── */}
      <g opacity="0.04">
        {Array.from({ length: 60 }).map((_, i) => (
          <circle key={`d${i}`} cx={120 + (i % 12) * 25 + Math.sin(i) * 8} cy={i < 30 ? 60 + (i % 5) * 28 : 290 + (i % 5) * 16} r="1.2" fill="#8A4050" />
        ))}
      </g>

      {/* ─── Animated pulse ring ─── */}
      <circle cx="270" cy="220" r="150" fill="none" stroke="#7FFFD4" strokeWidth="0.6" opacity="0">
        <animate attributeName="r" from="150" to="200" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.08" to="0" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Hint text */}
      <text x="270" y="348" textAnchor="middle" fill="#6A1B9A" opacity="0.2" fontSize="11" fontFamily="system-ui, sans-serif" fontWeight="500">
        Pasa el cursor para explorar
      </text>
    </svg>
  )
}

/* ── Gum Arch SVG backgrounds ─────────────────────────── */

function UpperGumArch() {
  return (
    <svg viewBox="0 0 520 230" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
      <defs>
        <radialGradient id="gumUpper" cx="50%" cy="100%" r="80%">
          <stop offset="0%" stopColor="#E8A0A5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#D08088" stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <path
        d="M 28,60 C 50,170 150,230 260,240 C 370,230 470,170 492,60 L 450,80 C 430,150 360,200 260,205 C 160,200 90,150 70,80 Z"
        fill="url(#gumUpper)"
      />
    </svg>
  )
}

function LowerGumArch() {
  return (
    <svg viewBox="0 0 520 200" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
      <defs>
        <radialGradient id="gumLower" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#E8A0A5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#D08088" stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <path
        d="M 28,170 C 50,60 150,0 260,-10 C 370,0 470,60 492,170 L 450,150 C 430,80 360,30 260,25 C 160,30 90,80 70,150 Z"
        fill="url(#gumLower)"
      />
    </svg>
  )
}

/* ── Main Odontogram Component ─────────────────────────── */

interface OdontogramProps {
  data: OdontogramData
  onChange: (data: OdontogramData) => void
  onReset: () => void
}

export default function Odontogram({ data, onChange, onReset }: OdontogramProps) {
  const [activeTool, setActiveTool] = useState<Tool | null>(null)
  const [mouthOpen, setMouthOpen] = useState(false)

  const isOpen = mouthOpen || activeTool !== null

  function getToothData(num: number): ToothData {
    return data[num] ?? { surfaces: {} }
  }

  function handleSurfaceClick(num: number, surface: Surface) {
    if (!activeTool || activeTool === 'extraer' || activeTool === 'ausente') return
    const tooth = data[num] ?? { surfaces: {} }
    const newSurfaces = { ...tooth.surfaces }
    if (newSurfaces[surface] === activeTool) {
      delete newSurfaces[surface]
    } else {
      newSurfaces[surface] = activeTool
    }
    onChange({ ...data, [num]: { ...tooth, surfaces: newSurfaces } })
  }

  function handleToothClick(num: number) {
    if (!activeTool || (activeTool !== 'extraer' && activeTool !== 'ausente')) return
    const tooth = data[num] ?? { surfaces: {} }
    const newStatus = tooth.status === activeTool ? undefined : activeTool
    onChange({ ...data, [num]: { ...tooth, status: newStatus } })
  }

  function toggleTool(tool: Tool) {
    setActiveTool((prev) => (prev === tool ? null : tool))
  }

  function renderArchTooth(pos: ArchPos, labelSide: 'outer-upper' | 'outer-lower') {
    const td = getToothData(pos.num)
    return (
      <div
        key={pos.num}
        className="absolute"
        style={{
          left: pos.x,
          top: pos.y,
          transform: `translate(-50%, -50%) rotate(${pos.rot}deg)`,
        }}
      >
        <div className="relative flex flex-col items-center">
          {labelSide === 'outer-lower' && (
            <span
              className="mb-0.5 text-[7px] font-mono font-bold text-omega-dark/50 dark:text-clinical-white/40 sm:text-[8px]"
              style={{ transform: `rotate(${-pos.rot}deg)` }}
            >
              {pos.num}
            </span>
          )}
          <ToothSVG
            toothNum={pos.num}
            data={td}
            activeTool={activeTool}
            onSurfaceClick={handleSurfaceClick}
            onToothClick={handleToothClick}
            size="h-8 w-8 sm:h-9 sm:w-9"
          />
          {labelSide === 'outer-upper' && (
            <span
              className="mt-0.5 text-[7px] font-mono font-bold text-omega-dark/50 dark:text-clinical-white/40 sm:text-[8px]"
              style={{ transform: `rotate(${-pos.rot}deg)` }}
            >
              {pos.num}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="rounded-xl border border-omega-violet/20 bg-white p-4 dark:border-clinical-white/10 dark:bg-omega-surface">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30 sm:text-xs">
            Herramientas
          </span>
          {TOOLS.map((t) => (
            <ToolbarButton key={t} tool={t} isActive={activeTool === t} onClick={() => toggleTool(t)} />
          ))}
          <div className="ml-auto flex gap-2">
            {activeTool && (
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-1.5 rounded-lg border border-omega-violet/20 px-3 py-2 text-xs font-medium text-omega-dark/60 transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/50 dark:hover:bg-clinical-white/5"
              >
                <MousePointer2 size={14} />
                <span className="hidden sm:inline">Deseleccionar</span>
              </button>
            )}
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg border border-alert-red/20 px-3 py-2 text-xs font-medium text-alert-red/70 transition-colors hover:bg-alert-red/5"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mouth / Odontogram chart */}
      <div
        className="relative overflow-hidden rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface"
        onMouseEnter={() => setMouthOpen(true)}
        onMouseLeave={() => setMouthOpen(false)}
      >
        <div className="relative mx-auto overflow-x-auto" style={{ minHeight: 500 }}>

          {/* ── Closed Mouth Overlay ── */}
          <div
            className={`absolute inset-0 z-10 flex items-center justify-center bg-white transition-all duration-700 ease-out dark:bg-omega-surface ${
              isOpen ? 'pointer-events-none scale-105 opacity-0' : 'scale-100 opacity-100'
            }`}
          >
            <ClosedMouth />
          </div>

          {/* ── Open: Dental Arches ── */}
          <div
            className={`relative px-4 py-6 transition-all duration-700 ease-out sm:px-6 ${
              isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            {/* Quadrant labels upper */}
            <div className="mb-1 flex justify-center text-[10px] font-medium text-omega-dark/35 dark:text-clinical-white/25 sm:text-xs">
              <span className="w-[calc(50%-0.5rem)] text-center">Superior Derecho (Q1)</span>
              <span className="w-[calc(50%-0.5rem)] text-center">Superior Izquierdo (Q2)</span>
            </div>

            {/* Upper arch */}
            <div className="relative mx-auto" style={{ width: 520, height: 230 }}>
              <UpperGumArch />
              {UPPER_ARCH.map((pos) => renderArchTooth(pos, 'outer-upper'))}
            </div>

            {/* Occlusion line */}
            <div className="my-2 flex items-center gap-3 sm:my-3">
              <div className="h-px flex-1 bg-omega-violet/20 dark:bg-clinical-white/10" />
              <span className="whitespace-nowrap text-[9px] font-medium uppercase tracking-wider text-omega-dark/25 dark:text-clinical-white/15 sm:text-[10px]">
                Línea de Oclusión
              </span>
              <div className="h-px flex-1 bg-omega-violet/20 dark:bg-clinical-white/10" />
            </div>

            {/* Lower arch */}
            <div className="relative mx-auto" style={{ width: 520, height: 200 }}>
              <LowerGumArch />
              {LOWER_ARCH.map((pos) => renderArchTooth(pos, 'outer-lower'))}
            </div>

            {/* Quadrant labels lower */}
            <div className="mt-1 flex justify-center text-[10px] font-medium text-omega-dark/35 dark:text-clinical-white/25 sm:text-xs">
              <span className="w-[calc(50%-0.5rem)] text-center">Inferior Derecho (Q4)</span>
              <span className="w-[calc(50%-0.5rem)] text-center">Inferior Izquierdo (Q3)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-xl border border-omega-violet/20 bg-white p-4 dark:border-clinical-white/10 dark:bg-omega-surface">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30 sm:text-xs">
          Leyenda
        </p>
        <div className="flex flex-wrap gap-4">
          {TOOLS.map((t) => (
            <div key={t} className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm border border-black/20" style={{ backgroundColor: TOOL_COLORS[t] }} />
              <span className="text-xs text-omega-dark/60 dark:text-clinical-white/50">{TOOL_LABELS[t]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
