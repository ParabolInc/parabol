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

const useHorizontalSwipe = ({onSwipeLeft, onSwipeRight, threshold = 50}: Options) => {
  const startRef = useRef<{x: number; y: number; id: number} | null>(null)
  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    startRef.current = {x: e.clientX, y: e.clientY, id: e.pointerId}
  }
  const onPointerMove = () => {}
  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    const start = startRef.current
    startRef.current = null
    if (!start || start.id !== e.pointerId) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    const direction = resolveSwipe(dx, dy, threshold)
    if (direction === 'left') onSwipeLeft()
    else if (direction === 'right') onSwipeRight()
  }
  const onPointerCancel = () => {
    startRef.current = null
  }
  return {onPointerDown, onPointerMove, onPointerUp, onPointerCancel}
}

export default useHorizontalSwipe
