import React, {useContext, useEffect, useRef, useState} from 'react'
import {commitLocalUpdate} from 'relay-runtime'
import SendClientSegmentEventMutation from '~/mutations/SendClientSegmentEventMutation'
import {DraggableReflectionCard_meeting$data} from '~/__generated__/DraggableReflectionCard_meeting.graphql'
import {DragReflectionDropTargetTypeEnum} from '~/__generated__/EndDraggingReflectionMutation_meeting.graphql'
import {PortalContext, SetPortal} from '../components/AtmosphereProvider/PortalProvider'
import {SwipeColumn} from '../components/GroupingKanban'
import {ReflectionDragState} from '../components/ReflectionGroup/DraggableReflectionCard'
import RemoteReflection from '../components/ReflectionGroup/RemoteReflection'
import StartDraggingReflectionMutation from '../mutations/StartDraggingReflectionMutation'
import UpdateDragLocationMutation from '../mutations/UpdateDragLocationMutation'
import {Times} from '../types/constEnums'
import findDropZoneFromEvent from '../utils/findDropZoneFromEvent'
import maybeStartReflectionScroll from '../utils/maybeStartReflectionScroll'
import measureDroppableReflections from '../utils/measureDroppableReflections'
import getTargetReference from '../utils/multiplayerMasonry/getTargetReference'
import clientTempId from '../utils/relay/clientTempId'
import cloneReflection from '../utils/retroGroup/cloneReflection'
import getIsDrag from '../utils/retroGroup/getIsDrag'
import getTargetGroupId from '../utils/retroGroup/getTargetGroupId'
import handleDrop from '../utils/retroGroup/handleDrop'
import updateClonePosition, {
  getDroppingStyles,
  getSpotlightAnimation
} from '../utils/retroGroup/updateClonePosition'
import {DraggableReflectionCard_reflection$data} from '../__generated__/DraggableReflectionCard_reflection.graphql'
import useAtmosphere from './useAtmosphere'
import useEventCallback from './useEventCallback'
import useSpotlightResults from './useSpotlightResults'

const windowDims = {
  clientHeight: window.innerHeight,
  clientWidth: window.innerWidth
}

// Adds the remotely dragged card substitute, does not hide the local card or collapse anything
const useRemotelyDraggedCard = (
  meeting: DraggableReflectionCard_meeting$data,
  reflection: DraggableReflectionCard_reflection$data,
  drag: ReflectionDragState,
  staticIdx: number
) => {
  const setPortal = useContext(PortalContext)
  const {remoteDrag, isDropping} = reflection
  const [lastZIndex, setLastZIndex] = useState<number | undefined>()
  const {spotlightGroup} = meeting
  const spotlightGroupId = spotlightGroup?.id ?? ''
  const spotlightResultGroups = useSpotlightResults(meeting)
  const groupIdsInSpotlight = spotlightResultGroups
    ? [...spotlightResultGroups.map(({id}) => id), spotlightGroupId]
    : []
  const spotlightAnimRef = useRef<number | null>(null)
  const setRemoteCard = (
    isClose: boolean,
    timeRemaining: number,
    lastTop?: number,
    isSpotlight?: boolean
  ) => {
    if (!drag.ref || timeRemaining <= 0) return
    const beforeFrame = Date.now()
    const bbox = drag.ref.getBoundingClientRect()
    if (bbox.top !== lastTop) {
      const targetId = remoteDrag?.targetId
      // performance only
      const style = getDroppingStyles(
        drag.ref,
        bbox,
        windowDims.clientHeight,
        timeRemaining,
        targetId,
        groupIdsInSpotlight
      )

      const animation = getSpotlightAnimation(
        drag.ref,
        targetId,
        groupIdsInSpotlight,
        isClose,
        lastZIndex
      )

      setLastZIndex(style.zIndex)

      setPortal(
        `clone-${reflection.id}`,
        <RemoteReflection
          style={
            isClose
              ? style
              : {
                  transform: style.transform,
                  zIndex: style.zIndex
                }
          }
          animation={animation}
          reflection={reflection}
          meeting={meeting}
        />
      )
    }
    if (isClose) {
      // the target may be moving, so update every frame
      requestAnimationFrame(() => {
        const newTimeRemaining = timeRemaining - (Date.now() - beforeFrame)
        setRemoteCard(isClose, newTimeRemaining, bbox.top)
      })
    } else if (isSpotlight) {
      // move animating remote Spotlight when other kanban reflections move
      spotlightAnimRef.current = requestAnimationFrame(() => {
        const newTimeRemaining = timeRemaining - (Date.now() - beforeFrame)
        setRemoteCard(isClose, newTimeRemaining, bbox.top, isSpotlight)
      })
    }
  }

  // is animating remote Spotlight
  useEffect(() => {
    if (remoteDrag?.isSpotlight) {
      setRemoteCard(false, Times.REFLECTION_SPOTLIGHT_DRAG_STALE_TIMEOUT, undefined, true)
    } else if (spotlightAnimRef.current !== null) {
      cancelAnimationFrame(spotlightAnimRef.current)
    }
  }, [remoteDrag?.isSpotlight])

  // is opening
  useEffect(() => {
    if (remoteDrag) {
      setRemoteCard(false, Times.REFLECTION_REMOTE_DROP_DURATION)
    }
  }, [remoteDrag])

  // is closing
  useEffect(() => {
    if (isDropping && staticIdx !== -1 && remoteDrag) {
      setRemoteCard(true, Times.REFLECTION_REMOTE_DROP_DURATION)
    }
  }, [isDropping, staticIdx, remoteDrag])
}

const useLocalDrag = (
  reflection: DraggableReflectionCard_reflection$data,
  drag: ReflectionDragState,
  staticIdx: number,
  onMouseMove: any,
  onMouseUp: any
) => {
  const {remoteDrag, isDropping, id: reflectionId, isViewerDragging} = reflection
  const atmosphere = useAtmosphere()
  // handle drag end
  useEffect(() => {
    if (drag.ref && isDropping && staticIdx !== -1 && !remoteDrag) {
      updateClonePosition(drag.ref, reflectionId, windowDims.clientHeight)
    }
  }, [isDropping, staticIdx, drag, remoteDrag, reflectionId])

  // handle drag conflicts
  useEffect(() => {
    if (!isViewerDragging && !isDropping && drag.clone) {
      if (document.body.contains(drag.clone)) {
        document.body.removeChild(drag.clone)
      }
      drag.clone = null
      const el = drag.ref!
      el.removeEventListener('touchmove', onMouseMove)
      el.removeEventListener('touchend', onMouseUp)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      drag.isDrag = false
      // there is some edge case where this can be null
      if (remoteDrag) {
        atmosphere.eventEmitter.emit('addSnackbar', {
          key: `reflectionInterception:${reflectionId}`,
          autoDismiss: 5,
          message: `Oh no! ${remoteDrag.dragUserName} stole your reflection!`
        })
      }
    }
  }, [isViewerDragging, isDropping])
}

const removeClone = (reflectionId: string, setPortal: SetPortal) => {
  setPortal(`clone-${reflectionId}`, null)
  // shouldn't always be necessary, but do it to prevent sticky cards
  const el = document.getElementById(`clone-${reflectionId}`)
  if (el) {
    try {
      el.parentElement!.removeChild(el)
    } catch (e) {
      // already removed
    }
  }
}

const useDroppingDrag = (
  drag: ReflectionDragState,
  reflection: DraggableReflectionCard_reflection$data
) => {
  const setPortal = useContext(PortalContext)
  const {remoteDrag, id: reflectionId, isDropping} = reflection
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (isDropping !== drag.wasDropping) {
      drag.wasDropping = isDropping || false
      if (isDropping) {
        drag.timeout = window.setTimeout(
          () => {
            if (drag.clone) {
              // local
              if (document.body.contains(drag.clone)) {
                document.body.removeChild(drag.clone!)
              }
              drag.clone = null
            } else {
              //remote
              removeClone(reflectionId, setPortal)
            }
            commitLocalUpdate(atmosphere, (store) => {
              store.get(reflectionId)!.setValue(false, 'isDropping').setValue(null, 'remoteDrag')
            })
          },
          remoteDrag ? Times.REFLECTION_REMOTE_DROP_DURATION : Times.REFLECTION_DROP_DURATION
        )
      } else {
        // a new drag overrode the old one
        window.clearTimeout(drag.timeout!)
      }
    }
  }, [isDropping])
}

const useDragAndDrop = (
  drag: ReflectionDragState,
  reflection: DraggableReflectionCard_reflection$data,
  staticIdx: number,
  meeting: DraggableReflectionCard_meeting$data,
  teamId: string,
  reflectionCount: number,
  swipeColumn?: SwipeColumn
) => {
  const atmosphere = useAtmosphere()
  const {id: meetingId, spotlightGroup, spotlightSearchQuery} = meeting
  const spotlightResultGroups = useSpotlightResults(meeting)
  const {id: reflectionId, reflectionGroupId, isDropping, isEditing} = reflection

  const onMouseUp = useEventCallback((e: MouseEvent | TouchEvent) => {
    if (e.type === 'touchend' && drag.ref) {
      drag.ref.removeEventListener('touchmove', onMouseMove)
      window.clearTimeout(drag.longpressTimeout)
    } else {
      document.removeEventListener('mousemove', onMouseMove)
    }
    if (!drag.isDrag) return
    drag.isDrag = false
    drag.targets.length = 0
    drag.prevTargetId = ''
    const targetGroupId = getTargetGroupId(e)
    const isReflectionInSpotlightResults = !!spotlightResultGroups?.find(
      ({id}) => id === reflectionGroupId
    )
    const targetType: DragReflectionDropTargetTypeEnum | null =
      targetGroupId && reflectionGroupId !== targetGroupId
        ? 'REFLECTION_GROUP'
        : !targetGroupId && reflectionCount > 0 && !isReflectionInSpotlightResults
        ? 'REFLECTION_GRID'
        : null
    handleDrop(atmosphere, reflectionId, drag, targetType, targetGroupId)
    if (spotlightGroup?.id) {
      const event = isReflectionInSpotlightResults
        ? `Spotlight result to ${targetType === 'REFLECTION_GROUP' ? 'source' : 'result'}`
        : `Spotlight source to ${targetType === 'REFLECTION_GROUP' ? 'result' : 'grid'}`
      SendClientSegmentEventMutation(atmosphere, event, {
        reflectionId,
        meetingId,
        spotlightSearchQuery
      })
    }
  })

  const announceDragUpdate = (cursorX: number, cursorY: number) => {
    if (drag.isBroadcasting) return
    drag.isBroadcasting = true
    const {targetId, targetOffsetX, targetOffsetY} = getTargetReference(
      cursorX,
      cursorY,
      drag.cardOffsetX,
      drag.cardOffsetY,
      drag.targets,
      drag.prevTargetId
    )
    drag.prevTargetId = targetId
    const input = {
      ...windowDims,
      id: drag.id,
      clientX: cursorX - drag.cardOffsetX,
      clientY: cursorY - drag.cardOffsetY,
      sourceId: reflectionId,
      meetingId,
      teamId,
      targetId,
      targetOffsetX,
      targetOffsetY
    }
    UpdateDragLocationMutation(atmosphere, {input})
    requestAnimationFrame(() => {
      drag.isBroadcasting = false
    })
  }

  const onMouseMove = useEventCallback((e: MouseEvent | TouchEvent) => {
    // required to prevent address bar scrolling & other strange browser things on mobile view
    e.preventDefault()
    const isTouchMove = e.type === 'touchmove'
    const {clientX, clientY} = isTouchMove ? (e as TouchEvent).touches[0]! : (e as MouseEvent)
    const wasDrag = drag.isDrag
    if (!wasDrag) {
      const isDrag = getIsDrag(clientX, clientY, drag.startX, drag.startY)
      if (isDrag && isTouchMove && !drag.longpressed) {
        //they don't really want to drag
        window.clearTimeout(drag.longpressTimeout)
        drag.ref?.removeEventListener('touchmove', onMouseMove)
        drag.ref?.removeEventListener('touchend', onMouseUp)
        return
      }
      drag.isDrag = isDrag
      if (!drag.isDrag || !drag.ref) return
      const eventName = isTouchMove ? 'touchend' : 'mouseup'
      document.addEventListener(eventName, onMouseUp, {once: true})
      const bbox = drag.ref.getBoundingClientRect()!
      // clip quick drags so the cursor is guaranteed to be inside the card
      drag.cardOffsetX = Math.min(clientX - bbox.left, bbox.width)
      drag.cardOffsetY = Math.min(clientY - bbox.top, bbox.height)
      drag.id = clientTempId()
      // There are some constraints here.
      // We want to clone the reflection card after the properties were set correctly, especially isDragging, thus the mutation needs to run first.
      // in some cases, e.g. moving a card out of a reflection group, the component tree is shuffled which will set the drag.ref to null.
      const dragRef = drag.ref
      StartDraggingReflectionMutation(atmosphere, {reflectionId, dragId: drag.id})
      drag.clone = cloneReflection(dragRef, reflectionId)
    }
    if (!drag.clone) return
    drag.clientY = clientY
    drag.clone.style.transform = `translate(${clientX - drag.cardOffsetX}px,${
      clientY - drag.cardOffsetY
    }px)`
    const dropZoneEl = findDropZoneFromEvent(e)
    if (dropZoneEl !== drag.dropZoneEl) {
      drag.dropZoneEl = dropZoneEl
      if (dropZoneEl) {
        drag.dropZoneBBox = dropZoneEl.getBoundingClientRect()
        drag.targets = measureDroppableReflections(dropZoneEl, drag.dropZoneBBox)
        maybeStartReflectionScroll(drag)
      }
    }
    if (isTouchMove && swipeColumn) {
      const {clientX} = (e as TouchEvent).touches[0]!
      const minThresh = windowDims.clientWidth * 0.1
      if (clientX <= minThresh) {
        swipeColumn(-1)
      } else if (clientX >= windowDims.clientWidth - minThresh) {
        swipeColumn(1)
      }
    }
    announceDragUpdate(clientX, clientY)
  })

  const onMouseDown = useEventCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (isDropping || staticIdx === -1 || isEditing) return
      const isTouchStart = e.type === 'touchstart'
      if (isTouchStart) {
        // https://stackoverflow.com/questions/33298828/touch-move-event-dont-fire-after-touch-start-target-is-removed
        if (!drag.ref) return
        drag.ref.addEventListener('touchmove', onMouseMove)
        drag.ref.addEventListener('touchend', onMouseUp)
        drag.longpressed = false
        drag.longpressTimeout = window.setTimeout(() => {
          drag.longpressed = true
        }, Times.TOUCH_LONGPRESS)
      } else {
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }
      const {clientX, clientY} = isTouchStart
        ? (e as React.TouchEvent<HTMLDivElement>).touches[0]!
        : (e as React.MouseEvent<HTMLDivElement>)
      drag.startX = clientX
      drag.startY = clientY
      drag.isDrag = false
    }
  )

  return {onMouseDown, onMouseMove, onMouseUp}
}

// Collapse the position of the card in the list if necessary
const useCollapsePlaceholder = (
  reflection: DraggableReflectionCard_reflection$data,
  drag: ReflectionDragState,
  staticIdx: number,
  staticReflectionCount: number
) => {
  useEffect(() => {
    const {ref} = drag
    if (!ref) return
    const {style, scrollHeight} = ref
    if (staticIdx === -1) {
      // the card has been picked up
      if (staticReflectionCount > 0) return
      // the card is the only one in the group, shrink the group!
      style.height = scrollHeight + 'px'
      style.transition = `height ${Times.REFLECTION_DROP_DURATION}ms`
      const {remoteDrag} = reflection
      // do not collapse if remote opened spotlight
      if (remoteDrag?.isSpotlight) return
      requestAnimationFrame(() => {
        style.height = '0'
      })
    } else if (reflection.isDropping) {
      const reset = () => {
        style.height = ''
        style.transition = ''
      }
      if (staticReflectionCount === 1) {
        // the card has created a new group, grow a space for it
        style.height = '0'
        style.transition = `height ${Times.REFLECTION_DROP_DURATION}ms`
        requestAnimationFrame(() => {
          style.height = scrollHeight + 'px'
          setTimeout(reset, Times.REFLECTION_DROP_DURATION)
        })
      } else {
        // the card landed on an existing group
        reset()
      }
    }
  }, [staticIdx === -1])
}

const useDraggableReflectionCard = (
  meeting: DraggableReflectionCard_meeting$data,
  reflection: DraggableReflectionCard_reflection$data,
  drag: ReflectionDragState,
  staticIdx: number,
  teamId: string,
  staticReflectionCount: number,
  swipeColumn?: SwipeColumn
) => {
  useRemotelyDraggedCard(meeting, reflection, drag, staticIdx)
  useDroppingDrag(drag, reflection)
  useCollapsePlaceholder(reflection, drag, staticIdx, staticReflectionCount)
  const {onMouseDown, onMouseUp, onMouseMove} = useDragAndDrop(
    drag,
    reflection,
    staticIdx,
    meeting,
    teamId,
    staticReflectionCount,
    swipeColumn
  )
  useLocalDrag(reflection, drag, staticIdx, onMouseMove, onMouseUp)
  return {onMouseDown}
}

export default useDraggableReflectionCard
