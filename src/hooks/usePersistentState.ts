import { useState, useEffect, useCallback, useRef } from 'react'

export function usePersistentState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const prevKeyRef = useRef(key)

  useEffect(() => {
    if (prevKeyRef.current !== key) {
      // Key changed → load value for the new key
      prevKeyRef.current = key
      try {
        const stored = localStorage.getItem(key)
        setValue(stored ? (JSON.parse(stored) as T) : defaultValue)
      } catch {
        setValue(defaultValue)
      }
    } else {
      // Same key → persist current value
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch { /* ignore quota */ }
    }
  }, [key, value]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => setValue(defaultValue), [defaultValue])

  return [value, setValue, reset] as const
}
