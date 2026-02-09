import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { loadCIE10, searchCIE10, type CIE10Entry } from '../../data/cie10'

interface CIE10AutocompleteProps {
  selectedCodes: { codigo: string; descripcion: string }[]
  onCodesChange: (codes: { codigo: string; descripcion: string }[]) => void
  maxCodes?: number
  className?: string
}

export default function CIE10Autocomplete({
  selectedCodes,
  onCodesChange,
  maxCodes = 10,
  className = '',
}: CIE10AutocompleteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CIE10Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const [data, setData] = useState<CIE10Entry[] | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Load CIE-10 data on first interaction
  const ensureData = useCallback(async () => {
    if (data) return data
    setLoading(true)
    try {
      const loaded = await loadCIE10()
      setData(loaded)
      return loaded
    } finally {
      setLoading(false)
    }
  }, [data])

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const d = await ensureData()
      if (!d) return
      const found = searchCIE10(d, query, 20)
      setResults(found)
      setOpen(found.length > 0)
      setHighlightIdx(-1)
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [query, ensureData])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(entry: CIE10Entry) {
    if (selectedCodes.length >= maxCodes) return
    if (selectedCodes.some(c => c.codigo === entry.c)) return
    onCodesChange([...selectedCodes, { codigo: entry.c, descripcion: entry.d }])
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleRemove(codigo: string) {
    onCodesChange(selectedCodes.filter(c => c.codigo !== codigo))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault()
      handleSelect(results[highlightIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected codes as chips */}
      {selectedCodes.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedCodes.map(code => (
            <span
              key={code.codigo}
              className="inline-flex items-center gap-1 rounded-lg bg-omega-violet/15 px-2.5 py-1 text-xs font-medium text-omega-violet dark:bg-omega-violet/25 dark:text-beta-mint"
            >
              <span className="font-bold">{code.codigo}</span>
              <span className="max-w-[180px] truncate opacity-70">{code.descripcion}</span>
              <button
                type="button"
                onClick={() => handleRemove(code.codigo)}
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-omega-violet/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-beta-mint/50" />
          ) : (
            <Search className="h-4 w-4 text-clinical-white/30" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => ensureData()}
          onKeyDown={handleKeyDown}
          placeholder="Buscar código CIE-10 o diagnóstico..."
          disabled={selectedCodes.length >= maxCodes}
          className="w-full rounded-lg border border-clinical-white/10 bg-omega-abyss py-2.5 pl-10 pr-3 text-sm text-clinical-white outline-none transition-all placeholder:text-clinical-white/30 focus:border-beta-mint/30 focus:ring-2 focus:ring-beta-mint/10 disabled:opacity-50"
        />
      </div>

      {/* Dropdown results */}
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-clinical-white/10 bg-omega-surface shadow-xl">
          {results.map((entry, i) => {
            const isSelected = selectedCodes.some(c => c.codigo === entry.c)
            return (
              <button
                key={entry.c}
                type="button"
                onClick={() => handleSelect(entry)}
                disabled={isSelected}
                className={`flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors ${
                  i === highlightIdx
                    ? 'bg-beta-mint/10 text-clinical-white'
                    : isSelected
                      ? 'cursor-not-allowed opacity-40'
                      : 'text-clinical-white/80 hover:bg-clinical-white/5'
                }`}
              >
                <span className="shrink-0 rounded bg-omega-violet/20 px-1.5 py-0.5 text-xs font-bold text-beta-mint">
                  {entry.c}
                </span>
                <span className="line-clamp-2 text-xs">{entry.d}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Helper text */}
      {selectedCodes.length >= maxCodes && (
        <p className="mt-1 text-xs text-clinical-white/30">
          Máximo {maxCodes} diagnósticos alcanzado
        </p>
      )}
    </div>
  )
}
