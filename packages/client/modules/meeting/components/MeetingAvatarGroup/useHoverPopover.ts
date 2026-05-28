import {useEffect, useRef, useState} from 'react'

const CLOSE_DELAY_MS = 150

export const useHoverPopover = () => {
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(closeTimerRef.current), [])

  const cancelClose = () => clearTimeout(closeTimerRef.current)

  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }

  return {
    open,
    onOpenChange: setOpen,
    hoverTriggerProps: {
      onMouseEnter: () => {
        cancelClose()
        setOpen(true)
      },
      onMouseLeave: scheduleClose
    },
    hoverContentProps: {
      onMouseEnter: cancelClose,
      onMouseLeave: scheduleClose
    }
  }
}
