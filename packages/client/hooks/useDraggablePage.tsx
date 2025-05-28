import * as React from 'react'
import {useRef} from 'react'
import {commitLocalUpdate, ConnectionHandler} from 'relay-runtime'
import type {RecordSource} from 'relay-runtime/lib/store/RelayStoreTypes'
import type {PageConnectionKey} from '../components/DashNavList/LeftNavPageLink'
import {
  isPrivatePageConnectionLookup,
  useUpdatePageMutation
} from '../mutations/useUpdatePageMutation'
import {__END__, positionAfter, positionBefore, positionBetween} from '../shared/sortOrder'
import useAtmosphere from './useAtmosphere'
import useEventCallback from './useEventCallback'

const makeDragRef = () => ({
  startY: null as number | null,
  clientY: null as number | null,
  isDrag: false,
  cardOffsetY: null as number | null,
  cardOffsetX: null as number | null,
  waitingForMovement: false,
  startTimer: null as number | null,
  clone: null as HTMLElement | null
})

const getCursor = (source: RecordSource, edgeKey: string | null | undefined) => {
  if (!edgeKey) return null
  return source.get(edgeKey)?.cursor as string
}
const getSortOrder = (source: RecordSource, connectionId: string, idx: number | null) => {
  const edges = (source.get(connectionId)?.edges as {__refs?: string[]})?.__refs
  // Dropping into a page that was never expanded. we don't know what's in it, put it at the end
  if (!edges) return __END__
  // Dropping into a page, but we know the children. Put it after the last
  if (idx === null) {
    const lastEdgeKey = edges.at(-1)
    const lastEdgeSortOrder = getCursor(source, lastEdgeKey)
    return positionAfter(lastEdgeSortOrder || ' ')
  }
  // Dropped on a bar at the top of a list. Put it before the first
  if (idx === -1) {
    // dropped on a bar at the top of the list
    const firstEdgeKey = edges[0]
    const topEdgeSortOrder = getCursor(source, firstEdgeKey)
    return positionBefore(topEdgeSortOrder || ' ')
  }
  // Dropped on a bar in the middle or end. Put it below the bar
  const afterEdgeKey = edges[idx]!
  const beforeEdgeKey = edges[idx + 1]
  const afterEdgeSortOrder = getCursor(source, afterEdgeKey)!
  const beforeEdgeSortOrder = getCursor(source, beforeEdgeKey)
  return beforeEdgeSortOrder
    ? positionBetween(afterEdgeSortOrder, beforeEdgeSortOrder)
    : positionAfter(afterEdgeSortOrder)
}

export const useDraggablePage = (
  pageId: string,
  isPageIdPrivate: boolean,
  sourceParentPageId: string | null,
  _sourceTeamId: string | null | undefined,
  sourceConnectionKey: PageConnectionKey,
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
    const isDropBelow = dropTarget.hasAttribute('data-drop-below')
    const section = dropTarget.closest('[data-pages-connection]')
    if (!section) throw new Error('data-pages-connection not found in DOMTree')
    const topLevelConnectionKey = section.getAttribute('data-pages-connection') as PageConnectionKey
    const targetParentPageId = isDropBelow
      ? dropTarget.getAttribute('data-drop-below') || null
      : dropTarget.getAttribute('data-drop-in')
    const dropIdx = isDropBelow ? Number(dropTarget.getAttribute('data-drop-idx')) : null
    const targetConnectionKey = targetParentPageId ? 'User_pages' : topLevelConnectionKey
    const {viewerId} = atmosphere
    const isPrivate = isPrivatePageConnectionLookup[targetConnectionKey]
    const targetConnectionId = ConnectionHandler.getConnectionID(viewerId, targetConnectionKey, {
      isPrivate,
      parentPageId: targetParentPageId
    })
    const source = atmosphere.getStore().getSource()
    const sortOrder = getSortOrder(source, targetConnectionId, dropIdx)
    execute({
      variables: {
        pageId,
        sortOrder,
        parentPageId: targetParentPageId,
        makePrivate:
          !targetParentPageId &&
          targetConnectionKey === 'User_privatePages' &&
          sourceConnectionKey !== targetConnectionKey
      },
      sourceParentPageId,
      sourceConnectionKey,
      targetConnectionKey
    })
    cleanupDrag()
  })

  const onPointerMove = useEventCallback((e: PointerEvent) => {
    const el = ref.current
    if (!el) return
    if (!drag.waitingForMovement && !drag.isDrag) return

    if (!drag.isDrag) {
      const deltaY = Math.abs(e.clientY - drag.startY!)
      if (deltaY < 3) return
      const bbox = el.getBoundingClientRect()
      // clip quick drags so the cursor is guaranteed to be inside the card
      drag.cardOffsetY = Math.min(e.clientY - bbox.top, bbox.height)
      drag.cardOffsetX = Math.min(bbox.left, bbox.width)

      drag.isDrag = true
      drag.waitingForMovement = false
      startVisualDragImage(e)
      commitLocalUpdate(atmosphere, (store) => {
        store
          .getRoot()
          .getLinkedRecord('viewer')
          ?.setValue(pageId, 'draggingPageId')
          .setValue(isPageIdPrivate, 'draggingPageIsPrivate')
        const parent = sourceParentPageId ? store.get(sourceParentPageId) : null
        console.log('setting isDraggingLastChild', isLastChild, sourceParentPageId)
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
        store
          .getRoot()
          .getLinkedRecord('viewer')
          ?.setValue(null, 'draggingPageId')
          .setValue(null, 'draggingPageIsPrivate')
        const parent = sourceParentPageId ? store.get(sourceParentPageId) : null
        parent?.setValue(null, 'isDraggingFirstChild').setValue(null, 'isDraggingLastChild')
      })
    })
  }

  return {onPointerDown, ref}
}
