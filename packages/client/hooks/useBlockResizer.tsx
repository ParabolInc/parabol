import {type RefObject, useRef} from 'react'
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

  const onPointerMove = useEventCallback((e: PointerEvent) => {
    const {clientX} = e
    const {current: drag} = dragRef
    if (!drag.isDrag) {
      drag.isDrag = getIsDrag(clientX, 0, drag.startX, 0)
      if (!drag.isDrag) return
    }
    const sideCoefficient = drag.side === 'left' ? 1 : -1
    const delta = (drag.lastX - clientX) * sideCoefficient
    drag.lastX = clientX
    const nextWidth = Math.min(maxWidth, Math.max(48, width + delta))
    updateAttributes({
      width: nextWidth,
      height: Math.round(nextWidth / aspectRatioRef.current!)
    })
  })

  const endDrag = useEventCallback(() => {
    if (dragRef.current.isDrag) {
      const aspectRatio = aspectRatioRef.current!
      updateAttributes({width, height: Math.round(width / aspectRatio)})
    }
    dragRef.current = makeDrag()
  })

  const onPointerDown = useEventCallback(
    (side: 'left' | 'right') => (e: React.PointerEvent<HTMLDivElement>) => {
      const handle = e.currentTarget
      // Capture keeps move & release events in this document even when the pointer
      // crosses a live cross-origin iframe, which otherwise swallows them and leaves
      // the block resizing after the button is released
      handle.setPointerCapture(e.pointerId)
      handle.addEventListener('pointermove', onPointerMove)
      handle.addEventListener(
        'lostpointercapture',
        () => {
          handle.removeEventListener('pointermove', onPointerMove)
          endDrag()
        },
        {once: true}
      )
      dragRef.current = {isDrag: false, startX: e.clientX, lastX: e.clientX, side}
    }
  )
  return {onPointerDown}
}
