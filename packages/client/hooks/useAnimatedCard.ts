import {useEffect, useRef} from 'react'
import requestDoubleAnimationFrame from '../components/RetroReflectPhase/requestDoubleAnimationFrame'
import {BezierCurve} from '../types/constEnums'
import {TransitionStatus} from './useTransition'

const useAnimatedCard = (displayIdx: number, status: TransitionStatus) => {
  const ref = useRef<HTMLDivElement>(null)
  const lastIdxRef = useRef(displayIdx)
  const lastRectRef = useRef({left: 0, top: 0})
  // standard FLIP animation
  useEffect(() => {
    const idx = lastIdxRef.current
    const rect = lastRectRef.current
    const el = ref.current
    if (!el) return
    // offset measurements are taken after a DOM paint
    const {offsetTop, offsetLeft, style} = el
    if (idx !== displayIdx) {
      // interpolate last - first in FLIP
      const diffLeft = rect.left - offsetLeft
      const diffTop = rect.top - offsetTop
      const duration = 350
      // move it back where it was
      style.transform = `translate(${diffLeft}px,${diffTop}px)`
      requestDoubleAnimationFrame(() => {
        // now tell it to go to where it should be, but slowly
        style.transition = `transform ${duration}ms ${BezierCurve.DECELERATE}`
        style.transform = ''
        setTimeout(() => {
          // reset so it's ready to go again
          style.transition = ''
        }, duration)
      })
    }
    if (status === TransitionStatus.EXITING) {
      // if exiting, keep it where it is, but don't let it take up space
      el.style.position = 'absolute'
      el.style.transform = `translate(${offsetLeft - 8}px,${offsetTop - 8}px)`
    }
    lastIdxRef.current = displayIdx
    lastRectRef.current = {top: offsetTop, left: offsetLeft}
  })
  return ref
}

export default useAnimatedCard
