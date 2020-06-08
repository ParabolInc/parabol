import {useCallback, useEffect, useRef, useState} from 'react'
import {Times} from '../types/constEnums'

const useClickConfirmation = () => {
  const [confirmingButton, setConfirmingButton] = useState('')
  const timeoutRef = useRef<number>()
  const setConfirming = useCallback((buttonName: string) => {
    setConfirmingButton(buttonName)
    if (buttonName) {
      timeoutRef.current = window.setTimeout(() => {
        setConfirmingButton('')
      }, Times.MEETING_CONFIRM_DURATION)
    } else {
      window.clearTimeout(timeoutRef.current)
    }
  }, [])
  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [])
  return [confirmingButton, setConfirming] as [typeof confirmingButton, typeof setConfirming]
}

export default useClickConfirmation
