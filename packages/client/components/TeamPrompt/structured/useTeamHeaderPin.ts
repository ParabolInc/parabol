import {type RefObject, useEffect, useState} from 'react'

const PIN_TOLERANCE_PX = 13

const useTeamHeaderPin = (
  headerRef: RefObject<HTMLElement | null>,
  scrollContainerRef: RefObject<HTMLElement | null>,
  enabled: boolean
) => {
  const [isPinned, setIsPinned] = useState(false)
  useEffect(() => {
    const container = scrollContainerRef.current
    const header = headerRef.current
    if (!enabled || !container || !header) {
      setIsPinned(false)
      return
    }
    let frame = 0
    const measure = () => {
      frame = 0
      const headerRect = header.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      setIsPinned(headerRect.bottom >= containerRect.bottom - PIN_TOLERANCE_PX)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure)
    }
    measure()
    container.addEventListener('scroll', onScroll, {passive: true})
    window.addEventListener('resize', onScroll)
    return () => {
      container.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [enabled, headerRef, scrollContainerRef])
  return isPinned
}

export default useTeamHeaderPin
