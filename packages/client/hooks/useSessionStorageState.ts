import {type Dispatch, type SetStateAction, useCallback, useState} from 'react'

// Values are wrapped in `{v}` so that a top-level `undefined` round-trips correctly
// (JSON.stringify(undefined) is not valid JSON, but {v: undefined} serializes to "{}").
const readValue = <T>(key: string | null, getDefault: () => T): T => {
  if (!key) return getDefault()
  try {
    const raw = sessionStorage.getItem(key)
    if (raw === null) return getDefault()
    return (JSON.parse(raw) as {v: T}).v
  } catch {
    return getDefault()
  }
}

/**
 * Like useState, but persists the value to sessionStorage under `key`.
 * Pass `key: null` to disable persistence (behaves like plain useState).
 * Keys should be scoped to avoid collisions, e.g. `Inspirations:tab:${meetingId}`.
 */
const useSessionStorageState = <T>(
  key: string | null,
  defaultValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] => {
  const getDefault = () =>
    typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue

  const [value, setValue] = useState<T>(() => readValue(key, getDefault))

  // Re-read when the key changes (e.g. navigating between meetings without a full reload)
  const [prevKey, setPrevKey] = useState(key)
  if (key !== prevKey) {
    setPrevKey(key)
    setValue(readValue(key, getDefault))
  }

  const setStoredValue = useCallback<Dispatch<SetStateAction<T>>>(
    (action) => {
      setValue((prev) => {
        const next = typeof action === 'function' ? (action as (p: T) => T)(prev) : action
        if (key) {
          try {
            sessionStorage.setItem(key, JSON.stringify({v: next}))
          } catch {}
        }
        return next
      })
    },
    [key]
  )

  return [value, setStoredValue]
}

export default useSessionStorageState
