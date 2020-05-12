import {useCallback, useEffect, useRef, useState} from 'react'

const CONFIRMATION_DELAY = 3000

const useClickConfirmation = () => {
  const [isConfirming, setIsConfirming] = useState(false)
  const timeoutRef = useRef<number>()
  const startConfirming = useCallback(() => {
    setIsConfirming(true)
    timeoutRef.current = window.setTimeout(() => {
      setIsConfirming(false)
    }, CONFIRMATION_DELAY)
  }, [])
  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [])
  return [isConfirming, startConfirming] as [boolean, () => void]
}

export default useClickConfirmation
