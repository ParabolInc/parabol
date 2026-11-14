import {type Dispatch, type SetStateAction, useCallback, useState} from 'react'

const readValue = <T>(key: string, getDefault: () => T): T => {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return getDefault()
    return (JSON.parse(raw) as {v: T}).v
  } catch {
    return getDefault()
  }
}

const useLocalStorageState = <T>(
  key: string,
  defaultValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] => {
  const getDefault = () =>
    typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue
  const [value, setValue] = useState<T>(() => readValue(key, getDefault))
  const setStoredValue = useCallback<Dispatch<SetStateAction<T>>>(
    (action) => {
      setValue((prev) => {
        const next = typeof action === 'function' ? (action as (p: T) => T)(prev) : action
        try {
          localStorage.setItem(key, JSON.stringify({v: next}))
        } catch {}
        return next
      })
    },
    [key]
  )
  return [value, setStoredValue]
}

export default useLocalStorageState
