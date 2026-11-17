import {type RefObject, useRef} from 'react'
import getIsDrag from '../utils/retroGroup/getIsDrag'
import useEventCallback from './useEventCallback'

const makeDrag = () => ({
  isDrag: false,
  startX: 0,
  startWidth: 0,
  width: 0,
  side: 'left'
})
export const useBlockResizer = (
  updateAttributes: (attrs: Record<string, any>) => void,
  maxWidth: number,
  aspectRatioRef?: RefObject<number | null>
) => {
  const withHeight = (nextWidth: number) =>
    aspectRatioRef
      ? {width: nextWidth, height: Math.round(nextWidth / aspectRatioRef.current!)}
      : {width: nextWidth}

  const dragRef = useRef(makeDrag())

  const onPointerMove = useEventCallback((e: PointerEvent) => {
    const {clientX} = e
    const {current: drag} = dragRef
    if (!drag.isDrag) {
      drag.isDrag = getIsDrag(clientX, 0, drag.startX, 0)
      if (!drag.isDrag) return
    }
    const sideCoefficient = drag.side === 'left' ? 1 : -1
    const delta = (drag.startX - clientX) * sideCoefficient
    drag.width = Math.min(maxWidth, Math.max(48, drag.startWidth + delta))
    updateAttributes(withHeight(drag.width))
  })

  const endDrag = useEventCallback(() => {
    if (dragRef.current.isDrag) {
      updateAttributes(withHeight(dragRef.current.width))
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
      const startWidth = handle.parentElement!.getBoundingClientRect().width
      dragRef.current = {isDrag: false, startX: e.clientX, startWidth, width: startWidth, side}
    }
  )
  return {onPointerDown}
}
