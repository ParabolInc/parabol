import {useEffect, useRef, useState} from 'react'
import {getAuthCookie} from '../utils/authCookie'

export function useAuthCookie(global: Window): string | null {
  const pending = useRef<Promise<void> | null>(null)
  const [value, setValue] = useState<string | null>(null)

  useEffect(() => {
    pending.current = getAuthCookie(global).then(
      (cookie) => {
        setValue(cookie)
        pending.current = null
      },
      (error) => {
        console.error('Error getting auth cookie', error)
        pending.current = null
      }
    )
  }, [global])

  if (pending.current) {
    throw pending.current
  }
  return value
}
