import {useEffect, useRef, useState} from 'react'

const OPEN_DELAY_MS = 700
const CLOSE_DELAY_MS = 150

export const useHoverPopover = () => {
  const [open, setOpen] = useState(false)
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(
    () => () => {
      clearTimeout(openTimerRef.current)
      clearTimeout(closeTimerRef.current)
    },
    []
  )

  const cancelOpen = () => clearTimeout(openTimerRef.current)
  const cancelClose = () => clearTimeout(closeTimerRef.current)

  const scheduleOpen = () => {
    cancelClose()
    openTimerRef.current = setTimeout(() => setOpen(true), OPEN_DELAY_MS)
  }

  const scheduleClose = () => {
    cancelOpen()
    closeTimerRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }

  return {
    open,
    onOpenChange: setOpen,
    hoverTriggerProps: {
      onMouseEnter: scheduleOpen,
      onMouseLeave: scheduleClose
    },
    hoverContentProps: {
      onMouseEnter: cancelClose,
      onMouseLeave: scheduleClose
    }
  }
}
