import React, {useContext, useEffect, useRef} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {DraggableReflectionCard_reflection} from '../../__generated__/DraggableReflectionCard_reflection.graphql'
import styled from '@emotion/styled'
import ReflectionCard from '../ReflectionCard/ReflectionCard'
import {DraggableReflectionCard_meeting} from '__generated__/DraggableReflectionCard_meeting.graphql'
import {ElementWidth, ReflectionStackPerspective, Times} from '../../types/constEnums'
import useEventCallback from '../../hooks/useEventCallback'
import isReactTouch from '../../utils/isReactTouch'
import isNativeTouch from '../../utils/isNativeTouch'
import StartDraggingReflectionMutation from '../../mutations/StartDraggingReflectionMutation'
import useAtmosphere from '../../hooks/useAtmosphere'
import {DraggableReflectionCard_staticReflections} from '__generated__/DraggableReflectionCard_staticReflections.graphql'
import {DragReflectionDropTargetTypeEnum} from '../../types/graphql'
import getIsDrag from '../../utils/retroGroup/getIsDrag'
import getTargetGroupId from '../../utils/retroGroup/getTargetGroupId'
import handleDrop from '../../utils/retroGroup/handleDrop'
import updateClonePosition from '../../utils/retroGroup/updateClonePosition'
import cloneReflection from '../../utils/retroGroup/cloneReflection'
import shortid from 'shortid'
import getBBox from '../RetroReflectPhase/getBBox'
import RemoteReflection from './RemoteReflection'
import UpdateDragLocationMutation from '../../mutations/UpdateDragLocationMutation'
import {BBox, Coords} from '../../types/animations'
import getTargetReference from '../../utils/multiplayerMasonry/getTargetReference'
import {PortalContext} from '../AtmosphereProvider/PortalProvider'

const ReflectionWrapper = styled('div')<{staticIdx: number, staticReflectionCount: number, isDropping: boolean | null}>(
  ({staticIdx, staticReflectionCount, isDropping}): any => {
    const stackOrder = staticReflectionCount - staticIdx - 1
    const isHidden = staticIdx === -1 || isDropping
    const multiple = Math.min(stackOrder, 2)
    const scaleX = (ElementWidth.REFLECTION_CARD - ReflectionStackPerspective.X * multiple * 2) / ElementWidth.REFLECTION_CARD
    const translateY = ReflectionStackPerspective.Y * multiple
    return {
      cursor: stackOrder === 0 && !isHidden ? 'pointer' : undefined,
      position: stackOrder === 0 ? 'relative' : 'absolute',
      bottom: 0,
      left: 0,
      opacity: isHidden ? 0 : undefined,
      transform: `translateY(${translateY}px) scaleX(${scaleX})`,
      zIndex: 3 - multiple,
      transition: isHidden ? undefined : `transform ${Times.REFLECTION_DROP_DURATION}ms`
    }
  }
)

const windowDims = {
  clientHeight: window.innerHeight,
  clientWidth: window.innerWidth,
}

const useRemoteDrag = (reflection: DraggableReflectionCard_reflection, drag: ReflectionDragState, staticIdx: number) => {
  const setPortal = useContext(PortalContext)
  const {remoteDrag, isDropping} = reflection
  const setRemoteCard = () => {
    if (!drag.ref) return
    const bbox = drag.ref.getBoundingClientRect()
    const {left, top} = bbox
    setPortal(`clone-${reflection.id}`, <RemoteReflection initialTransform={`translate(${left}px,${top}px)`}
                                                          reflection={reflection} />)
  }
  // is opening
  useEffect(() => {
    if (remoteDrag) {
      setRemoteCard()
    }
  }, [remoteDrag])

  // is closing
  useEffect(() => {
    if (isDropping && staticIdx !== -1 && remoteDrag) {
      setRemoteCard()
    }
  }, [isDropping, staticIdx, remoteDrag])
}

const useLocalDrag = (reflection: DraggableReflectionCard_reflection, drag: ReflectionDragState, staticIdx: number, onMouseMove: any, onMouseUp: any) => {
  const {remoteDrag, isDropping, id: reflectionId, isViewerDragging} = reflection
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (drag.ref && isDropping && staticIdx !== -1 && !remoteDrag) {
      updateClonePosition(drag.ref, reflectionId)
    }
  }, [isDropping, staticIdx, drag, remoteDrag, reflectionId])
  useEffect(() => {
    if (!isViewerDragging && !isDropping && drag.clone) {
      document.body.removeChild(drag.clone)
      drag.clone = null
      document.removeEventListener('touchmove', onMouseMove)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('touchend', onMouseUp)
      document.removeEventListener('mouseup', onMouseUp)
      drag.isDrag = false
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: `reflectionInterception:${reflectionId}`,
        autoDismiss: 5,
        message: `Oh no! ${remoteDrag.dragUserName} stole your reflection!`,
      })
    }
  }, [isViewerDragging, isDropping])
}

const useDroppingDrag = (drag: ReflectionDragState, reflection: DraggableReflectionCard_reflection) => {
  const setPortal = useContext(PortalContext)
  const {remoteDrag, id: reflectionId, isDropping} = reflection
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (isDropping !== drag.wasDropping) {
      drag.wasDropping = isDropping || false
      if (isDropping) {
        drag.timeout = window.setTimeout(() => {
          if (drag.clone) {
            // local
            document.body.removeChild(drag.clone!)
            drag.clone = null
          } else {
            //remote
            setPortal(`clone-${reflectionId}`, null)
          }
          commitLocalUpdate(atmosphere, (store) => {
            store.get(reflectionId)!
              .setValue(false, 'isDropping')
              .setValue(null, 'remoteDrag')
          })
        }, remoteDrag ? Times.REFLECTION_REMOTE_DROP_DURATION : Times.REFLECTION_DROP_DURATION)
      } else {
        // a new drag overrode the old one
        window.clearTimeout(drag.timeout!)
      }
    }
  }, [isDropping])
}

const useDragAndDrop = (drag: ReflectionDragState, reflection: DraggableReflectionCard_reflection, staticIdx: number, teamId: string, reflectionCount: number) => {
  const atmosphere = useAtmosphere()
  const {id: reflectionId, reflectionGroupId, isDropping} = reflection

  const onMouseUp = useEventCallback((e: MouseEvent | TouchEvent) => {
    drag.isDrag = false
    const eventType = isNativeTouch(e) ? 'touchmove' : 'mousemove'
    document.removeEventListener(eventType, onMouseMove)
    const targetGroupId = getTargetGroupId(e)
    const targetType = targetGroupId && reflectionGroupId !== targetGroupId ?
      DragReflectionDropTargetTypeEnum.REFLECTION_GROUP : !targetGroupId && reflectionCount > 0 ?
        DragReflectionDropTargetTypeEnum.REFLECTION_GRID :
        null
    handleDrop(atmosphere, reflectionId, drag, targetType, targetGroupId)
  })

  const announceDragUpdate = (coords: Coords) => {
    if (drag.isBroadcasting) return
    drag.isBroadcasting = true
    const {targetId, targetOffset} = getTargetReference(
      coords,
      drag.cardOffsetX,
      drag.cardOffsetY,
      drag.targets,
      drag.prevTargetId
    )
    drag.prevTargetId = targetId
    const input = {
      ...windowDims,
      id: drag.id,
      coords: {
        x: coords.x - drag.cardOffsetX,
        y: coords.y - drag.cardOffsetY
      },
      sourceId: reflectionId,
      teamId,
      targetId,
      targetOffset
    }
    UpdateDragLocationMutation(atmosphere, {input})
    requestAnimationFrame(() => {
      drag.isBroadcasting = false
    })
  }
  const onMouseMove = useEventCallback((e: MouseEvent | TouchEvent) => {
    const event = isNativeTouch(e) ? e.touches[0] : e
    const {clientX, clientY} = event
    if (!drag.isDrag) {
      drag.isDrag = getIsDrag(clientX, clientY, drag.startX, drag.startY)
      if (!drag.isDrag || !drag.ref) return
      const bbox = drag.ref.getBoundingClientRect()!
      // clip quick drags so the cursor is guaranteed to be inside the card
      drag.cardOffsetX = Math.min(clientX - bbox.left, bbox.width)
      drag.cardOffsetY = Math.min(clientY - bbox.top, bbox.height)
      drag.clone = cloneReflection(drag.ref, reflectionId)
      // can improve performance by starting at the kanban instead of the doc
      const groupEls = document.querySelectorAll('div[data-droppable]')
      groupEls.forEach((el) => {
        const targetId = el.getAttribute('data-droppable')!
        const bbox = getBBox(el)!
        drag.targets.push({
          targetId,
          ...bbox
        })
      })
      drag.id = shortid.generate()
      StartDraggingReflectionMutation(atmosphere, {reflectionId, dragId: drag.id})
    }
    if (!drag.clone) return
    drag.clone.style.transform = `translate(${clientX - drag.cardOffsetX}px,${clientY - drag.cardOffsetY}px)`
    announceDragUpdate({x: clientX, y: clientY})
  })

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isDropping || staticIdx === -1) return
    let event
    if (isReactTouch(e)) {
      document.addEventListener('touchend', onMouseUp, {once: true})
      document.addEventListener('touchmove', onMouseMove)
      event = e.touches[0]
    } else {
      document.addEventListener('mouseup', onMouseUp, {once: true})
      document.addEventListener('mousemove', onMouseMove)
      event = e
    }
    const {clientX, clientY} = event
    drag.startX = clientX
    drag.startY = clientY
    drag.isDrag = false
    drag.ref = e.currentTarget
  }
  return {onMouseDown, onMouseMove, onMouseUp}
}

const DRAG_STATE = {
  id: '',
  cardOffsetX: 0,
  cardOffsetY: 0,
  clone: null as null | HTMLDivElement,
  isDrag: false,
  ref: null as null | HTMLDivElement,
  startX: 0,
  startY: 0,
  wasDropping: false,
  targets: [] as TargetBBox[],
  prevTargetId: '',
  isBroadcasting: false,
  timeout: null as null | number
}

export type ReflectionDragState = typeof DRAG_STATE
interface Props {
  isDraggable: boolean
  meeting: DraggableReflectionCard_meeting
  reflection: DraggableReflectionCard_reflection
  staticIdx: number
  staticReflections: DraggableReflectionCard_staticReflections
}

export type TargetBBox = BBox & {targetId: string}

const DraggableReflectionCard = (props: Props) => {
  const {reflection, staticIdx, staticReflections, meeting} = props
  const {id: reflectionId, isDropping} = reflection
  const {teamId} = meeting
  const dragRef = useRef({...DRAG_STATE})
  const {current: drag} = dragRef
  const staticReflectionCount = staticReflections.length
  useRemoteDrag(reflection, drag, staticIdx)
  useDroppingDrag(drag, reflection)
  const {onMouseDown, onMouseUp, onMouseMove} = useDragAndDrop(drag, reflection, staticIdx, teamId, staticReflectionCount)
  useLocalDrag(reflection, drag, staticIdx, onMouseMove, onMouseUp)
  return (
    <ReflectionWrapper ref={(c) => drag.ref = c} key={reflectionId}
                       staticReflectionCount={staticReflectionCount} staticIdx={staticIdx} isDropping={isDropping}
                       onMouseDown={onMouseDown} onTouchStart={onMouseDown}>
      <ReflectionCard readOnly userSelect='none' reflection={reflection} showOriginFooter
                      isClipped={staticReflectionCount - 1 !== staticIdx} />
    </ReflectionWrapper>
  )
}

export default createFragmentContainer(DraggableReflectionCard,
  {
    staticReflections: graphql`
      fragment DraggableReflectionCard_staticReflections on RetroReflection @relay(plural: true) {
        id
        reflectionGroupId
      }
    `,
    reflection: graphql`
      fragment DraggableReflectionCard_reflection on RetroReflection {
        ...ReflectionCard_reflection
        ...RemoteReflection_reflection
        id
        reflectionGroupId
        retroPhaseItemId
        isViewerDragging
        isDropping
        remoteDrag {
          dragUserId
          dragUserName
        }
      }
    `,
    meeting: graphql`
      fragment DraggableReflectionCard_meeting on RetrospectiveMeeting {
        id
        teamId
      }`
  }
)
