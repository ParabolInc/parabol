import {type PointerEvent, useRef} from 'react'

interface Options {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  threshold?: number
}

export type SwipeDirection = 'left' | 'right' | null

export const resolveSwipe = (dx: number, dy: number, threshold: number): SwipeDirection => {
  if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return null
  return dx < 0 ? 'left' : 'right'
}

export const shouldCapturePointer = (
  hasCapture: boolean,
  dx: number,
  dy: number,
  threshold: number
) => !hasCapture && resolveSwipe(dx, dy, threshold) !== null

const releaseCapture = (e: PointerEvent<HTMLElement>) => {
  if (e.currentTarget.hasPointerCapture(e.pointerId)) {
    e.currentTarget.releasePointerCapture(e.pointerId)
  }
}

const useHorizontalSwipe = ({onSwipeLeft, onSwipeRight, threshold = 50}: Options) => {
  const startRef = useRef<{x: number; y: number; id: number} | null>(null)
  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    startRef.current = {x: e.clientX, y: e.clientY, id: e.pointerId}
  }
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const start = startRef.current
    if (!start || start.id !== e.pointerId) return
    const hasCapture = e.currentTarget.hasPointerCapture(e.pointerId)
    if (!shouldCapturePointer(hasCapture, e.clientX - start.x, e.clientY - start.y, threshold))
      return
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    const start = startRef.current
    startRef.current = null
    releaseCapture(e)
    if (!start || start.id !== e.pointerId) return
    const direction = resolveSwipe(e.clientX - start.x, e.clientY - start.y, threshold)
    if (direction === 'left') onSwipeLeft()
    else if (direction === 'right') onSwipeRight()
  }
  const onPointerCancel = (e: PointerEvent<HTMLElement>) => {
    startRef.current = null
    releaseCapture(e)
  }
  return {onPointerDown, onPointerMove, onPointerUp, onPointerCancel}
}

export default useHorizontalSwipe
