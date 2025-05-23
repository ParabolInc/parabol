import * as React from 'react'
import {useRef} from 'react'
import {commitLocalUpdate} from 'relay-runtime'
import useAtmosphere from './useAtmosphere'
import useEventCallback from './useEventCallback'

const makeDragRef = () => ({
  startY: null as number | null,
  clientY: null as number | null,
  isDrag: false,
  // pointerId: null as number | null,
  cardOffsetY: null as number | null,
  cardOffsetX: null as number | null,
  waitingForMovement: false,
  startTimer: null as number | null,
  clone: null as HTMLElement | null
})

export const useDraggablePage = (
  pageId: string,
  parentPageId: string | null | undefined,
  isFirstChild: boolean
) => {
  const ref = useRef<HTMLDivElement>(null)
  const dragRef = useRef(makeDragRef())
  const atmosphere = useAtmosphere()
  const drag = dragRef.current
  const el = ref.current

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = useEventCallback((e) => {
    if (e.button !== 0) return
    if (!el) return
    e.preventDefault()
    drag.startY = e.clientY
    if (e.pointerType === 'touch') {
      drag.startTimer = window.setTimeout(() => {
        drag.waitingForMovement = true
      }, 120)
    } else {
      drag.waitingForMovement = true
    }
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener(
      'pointerup',
      (e) => {
        cleanupDrag()
        e.preventDefault()
      },
      {once: true}
    )
    document.addEventListener('pointercancel', () => cleanupDrag(), {once: true})
  })

  const onPointerMove = useEventCallback((e: PointerEvent) => {
    const el = ref.current
    if (!el) return
    if (!drag.waitingForMovement && !drag.isDrag) return

    if (!drag.isDrag) {
      const deltaY = Math.abs(e.clientY - drag.startY!)
      if (deltaY < 3) return
      // el.setPointerCapture(drag.pointerId!)
      const bbox = el.getBoundingClientRect()
      // clip quick drags so the cursor is guaranteed to be inside the card
      drag.cardOffsetY = Math.min(e.clientY - bbox.top, bbox.height)
      drag.cardOffsetX = Math.min(bbox.left, bbox.width)

      drag.isDrag = true
      drag.waitingForMovement = false
      startVisualDragImage(e)
      commitLocalUpdate(atmosphere, (store) => {
        store.getRoot().getLinkedRecord('viewer')?.setValue(pageId, 'draggingPageId')
        if (isFirstChild && parentPageId) {
          store.get(parentPageId)?.setValue(true, 'isDraggingFirstChild')
        }
      })
    }
    if (!drag.clone) return
    drag.clientY = e.clientY
    drag.clone.style.transform = `translateY(${drag.clientY - drag.cardOffsetY!}px)`
    updateVisualDragImage(e)
  })

  function startVisualDragImage(e: PointerEvent) {
    const el = ref.current
    if (!el) return
    drag.clone = el.cloneNode(true) as HTMLElement
    drag.clone.style.position = 'absolute'
    drag.clone.style.pointerEvents = 'none'
    drag.clone.style.opacity = '0.5'
    drag.clone.style.transform = `translateY(0px)`
    drag.clone.style.top = `${e.clientY - drag.cardOffsetY!}px`
    drag.clone.style.left = `${drag.cardOffsetX}px`
    drag.clone.style.width = `${el.offsetWidth}px`
    drag.clone.style.height = `${el.offsetHeight}px`
    drag.clone.style.zIndex = '10'
    document.body.appendChild(drag.clone)
  }

  function updateVisualDragImage(e: PointerEvent) {
    if (!drag.clone) return
    const deltaY = e.clientY - drag.startY!
    drag.clone.style.transform = `translateY(${deltaY}px)`
  }

  function removeVisualDragImage() {
    if (drag.clone) {
      drag.clone.remove()
      drag.clone = null
    }
  }

  function cleanupDrag() {
    if (drag.startTimer !== null) {
      clearTimeout(drag.startTimer)
      drag.startTimer = null
    }
    drag.isDrag = false
    drag.waitingForMovement = false
    commitLocalUpdate(atmosphere, (store) => {
      store.getRoot().getLinkedRecord('viewer')?.setValue(null, 'draggingPageId')
      parentPageId && store.get(parentPageId)?.setValue(null, 'isDraggingFirstChild')
    })
    removeVisualDragImage()
  }

  return {onPointerDown, ref}
}
