import {useRef, type RefObject} from 'react'
import getIsDrag from '../utils/retroGroup/getIsDrag'
import useEventCallback from './useEventCallback'

const makeDrag = () => ({
  isDrag: false,
  startX: 0,
  lastX: 0,
  side: 'left'
})
export const useBlockResizer = (
  width: number,
  updateAttributes: (attrs: Record<string, any>) => void,
  aspectRatioRef: RefObject<number>,
  maxWidth: number
) => {
  const dragRef = useRef(makeDrag())
  const onMouseUp = useEventCallback((e: MouseEvent | TouchEvent) => {
    if (e.type === 'touchend') {
      document.removeEventListener('touchmove', onMouseMove)
    } else {
      document.removeEventListener('mousemove', onMouseMove)
    }
    const aspectRatio = aspectRatioRef.current!
    updateAttributes({width, height: Math.round(width / aspectRatio)})
    dragRef.current = makeDrag()
  })

  const onMouseMove = useEventCallback((e: MouseEvent | TouchEvent) => {
    // required to prevent address bar scrolling & other strange browser things on mobile view
    e.preventDefault()
    const isTouchMove = e.type === 'touchmove'
    const {clientX} = isTouchMove ? (e as TouchEvent).touches[0]! : (e as MouseEvent)
    const {current: drag} = dragRef
    const wasDrag = drag.isDrag
    if (!wasDrag) {
      const isDrag = getIsDrag(clientX, 0, drag.startX, 0)
      drag.isDrag = isDrag
      if (!drag.isDrag) return
    }
    const sideCoefficient = drag.side === 'left' ? 1 : -1
    const delta = (drag.lastX - clientX) * sideCoefficient
    drag.lastX = clientX
    const nextWidth = Math.min(maxWidth, Math.max(48, width + delta))
    updateAttributes({width: nextWidth, height: Math.round(nextWidth / aspectRatioRef.current!)})
  })

  const onMouseDown = useEventCallback(
    (side: 'left' | 'right') =>
      (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const isTouchStart = e.type === 'touchstart'
        if (isTouchStart) {
          document.addEventListener('touchmove', onMouseMove)
          document.addEventListener('touchend', onMouseUp, {once: true})
        } else {
          document.addEventListener('mousemove', onMouseMove)
          document.addEventListener('mouseup', onMouseUp, {once: true})
        }
        const {clientX} = isTouchStart
          ? (e as React.TouchEvent<HTMLDivElement>).touches[0]!
          : (e as React.MouseEvent<HTMLDivElement>)
        dragRef.current.side = side
        dragRef.current.startX = clientX
        dragRef.current.lastX = clientX
        dragRef.current.isDrag = false
      }
  )
  return {onMouseDown, onMouseMove, onMouseUp, width}
}
