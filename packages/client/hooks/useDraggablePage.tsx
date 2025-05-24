import * as React from 'react'
import {useRef} from 'react'
import {commitLocalUpdate, ConnectionHandler} from 'relay-runtime'
import {useUpdatePageMutation} from '../mutations/useUpdatePageMutation'
import {__END__, positionAfter, positionBefore, positionBetween} from '../shared/sortOrder'
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
  isFirstChild: boolean,
  isLastChild: boolean
) => {
  const ref = useRef<HTMLDivElement>(null)
  const dragRef = useRef(makeDragRef())
  const atmosphere = useAtmosphere()
  const [execute] = useUpdatePageMutation()
  const drag = dragRef.current

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = useEventCallback((e) => {
    const el = ref.current
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
    document.addEventListener('pointerup', onPointerUp, {once: true})
    document.addEventListener('pointercancel', () => cleanupDrag(), {once: true})
    window.addEventListener('blur', cleanupDrag, {once: true})
  })

  const onPointerUp = useEventCallback((e: PointerEvent) => {
    e.preventDefault()
    const dropCurrentTarget = document.elementFromPoint(e.clientX, e.clientY)
    const dropTarget = dropCurrentTarget?.closest('[data-drop-below], [data-drop-in]')
    if (!dropTarget) {
      cleanupDrag()
      return
    }
    const source = atmosphere.getStore().getSource()
    const isDropBelow = dropTarget.hasAttribute('data-drop-below')
    if (isDropBelow) {
      const dropTargetBelowPageId = dropTarget.getAttribute('data-drop-below')
      if (!dropTargetBelowPageId) {
        // drop target is the top-level top bar
        const connId = ConnectionHandler.getConnectionID(atmosphere.viewerId, 'User_pages')
        const edges = (source.get(connId)?.edges as {__refs: string[]})?.__refs
        const topEdgeKey = edges[0]
        const topEdgeSortOrder = topEdgeKey ? (source.get(topEdgeKey)?.cursor as string) : null
        const sortOrder = topEdgeSortOrder ? positionBefore(topEdgeSortOrder) : ' '
        execute({
          variables: {
            pageId,
            sortOrder,
            parentPageId: null
          },
          pageId,
          oldParentPageId: parentPageId,
          newParentPageId: null
        })
        cleanupDrag()
        return
      }
      const isExpanded = dropTarget.getAttribute('aria-expanded')
      if (isExpanded === 'true') {
        // when parent is expanded, drop it as the first child
        const connId = ConnectionHandler.getConnectionID(atmosphere.viewerId, 'User_pages', {
          parentPageId: dropTargetBelowPageId
        })
        const firstEdgeId = (source.get(connId)?.edges as {__refs?: string[]})?.__refs?.[0]
        const firstNodeId = firstEdgeId
          ? (source.get(firstEdgeId)?.node as {__ref?: string}).__ref
          : null
        const firstChildSortOrder = firstNodeId
          ? (source.get(firstNodeId)?.sortOrder as string)
          : null
        const sortOrder = firstChildSortOrder ? positionBefore(firstChildSortOrder) : ' '
        execute({
          variables: {
            pageId,
            sortOrder,
            parentPageId: dropTargetBelowPageId
          },
          pageId,
          oldParentPageId: parentPageId,
          newParentPageId: dropTargetBelowPageId
        })
      } else {
        const targetPeerBelow = source.get(dropTargetBelowPageId)
        const targetParentPageId = targetPeerBelow?.parentPageId as string | undefined
        const connId = ConnectionHandler.getConnectionID(atmosphere.viewerId, 'User_pages', {
          parentPageId: targetParentPageId
        })
        const edges = connId ? (source.get(connId)?.edges as {__refs: string[]})?.__refs : []

        const edgeIdx = edges.findIndex((edgeName: string) => {
          const edgeRecord = source.get(edgeName)
          return (edgeRecord?.node as {__ref: string}).__ref === dropTargetBelowPageId
        })!
        const edgeSortOrder = source.get(edges[edgeIdx]!)?.cursor as string
        const nextEdge = edges[edgeIdx + 1]
        const nextEdgeSortOrder = nextEdge ? (source.get(nextEdge)?.cursor as string) : null
        const sortOrder = nextEdgeSortOrder
          ? positionBetween(edgeSortOrder, nextEdgeSortOrder)
          : positionAfter(edgeSortOrder)
        execute({
          variables: {
            pageId,
            sortOrder,
            parentPageId: targetParentPageId
          },
          pageId,
          oldParentPageId: parentPageId,
          newParentPageId: targetParentPageId
        })
      }
    } else {
      const dropTargetInPageId = dropTarget.getAttribute('data-drop-in')
      // if we're dropping in, we put it at the end of the children
      const connId = ConnectionHandler.getConnectionID(atmosphere.viewerId, 'User_pages', {
        parentPageId: dropTargetInPageId
      })
      // edges is null if the target has never been expanded
      const edges = (source.get(connId)?.edges as {__refs: string[]} | null)?.__refs
      const lastEdgeId = edges?.at(-1)
      const lastNodeId = lastEdgeId
        ? (source.get(lastEdgeId)?.node as {__ref?: string}).__ref
        : null
      const lastChildSortOrder = lastNodeId ? (source.get(lastNodeId)?.sortOrder as string) : null
      const sortOrder = lastChildSortOrder
        ? positionAfter(lastChildSortOrder)
        : edges
          ? ' '
          : __END__
      execute({
        variables: {
          pageId,
          sortOrder,
          parentPageId: dropTargetInPageId
        },
        pageId,
        oldParentPageId: parentPageId,
        newParentPageId: dropTargetInPageId
      })
    }
    cleanupDrag()
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
        const parent = parentPageId ? store.get(parentPageId) : null
        parent
          ?.setValue(isFirstChild, 'isDraggingFirstChild')
          .setValue(isLastChild, 'isDraggingLastChild')
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
    removeVisualDragImage()
    window.removeEventListener('blur', cleanupDrag)
    // in a set timeout for the <Link/> onClick handler to fire while draggingPageId is still set
    setTimeout(() => {
      commitLocalUpdate(atmosphere, (store) => {
        store.getRoot().getLinkedRecord('viewer')?.setValue(null, 'draggingPageId')
        const parent = parentPageId ? store.get(parentPageId) : null
        parent?.setValue(null, 'isDraggingFirstChild').setValue(null, 'isDraggingLastChild')
      })
    })
  }

  return {onPointerDown, ref}
}
