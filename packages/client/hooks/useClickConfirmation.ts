import {useCallback, useEffect, useRef, useState} from 'react'

const CONFIRMATION_DELAY = 3000

const useClickConfirmation = () => {
  const [isConfirming, setIsConfirming] = useState(false)
  const timeoutRef = useRef<number>()
  const setConfirming = useCallback((start: boolean) => {
    setIsConfirming(start)
    if (start) {
      timeoutRef.current = window.setTimeout(() => {
        setIsConfirming(false)
      }, CONFIRMATION_DELAY)
    } else {
      window.clearTimeout(timeoutRef.current)
    }
  }, [])
  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [])
  return [isConfirming, setConfirming] as [typeof isConfirming, typeof setConfirming]
}

export default useClickConfirmation
