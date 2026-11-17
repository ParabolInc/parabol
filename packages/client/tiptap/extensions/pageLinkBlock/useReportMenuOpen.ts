import {useCallback, useEffect, useRef, useState} from 'react'

export const useReportMenuOpen = (onOpenChange: (open: boolean) => void) => {
  const [isOpen, setIsOpen] = useState(false)
  const isOpenRef = useRef(false)
  const reportRef = useRef(onOpenChange)
  reportRef.current = onOpenChange
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (open === isOpenRef.current) return
    isOpenRef.current = open
    reportRef.current(open)
  }, [])
  useEffect(
    () => () => {
      if (!isOpenRef.current) return
      isOpenRef.current = false
      reportRef.current(false)
    },
    []
  )
  return [isOpen, handleOpenChange] as const
}
