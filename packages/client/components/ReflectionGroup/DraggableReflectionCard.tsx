import React, {RefObject, useEffect, useRef} from 'react'
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
import usePortal from '../../hooks/usePortal'
import shortid from 'shortid'
import getBBox from '../RetroReflectPhase/getBBox'
import RemoteReflection from './RemoteReflection'

const ReflectionWrapper = styled('div')<{staticIdx: number, staticReflectionCount: number, isDropping: boolean | null}>(
  ({staticIdx, staticReflectionCount, isDropping}): any => {
    const stackOrder = staticReflectionCount - staticIdx - 1
    const isHidden = staticIdx === -1 || isDropping
    const multiple = Math.min(stackOrder, 2)
    const scaleX = (ElementWidth.REFLECTION_CARD - ReflectionStackPerspective.X * multiple * 2) / ElementWidth.REFLECTION_CARD
    const translateY = ReflectionStackPerspective.Y * multiple
    return {
      cursor: stackOrder === 0 && !isDropping ? 'pointer' : undefined,
      position: stackOrder === 0 ? 'relative' : 'absolute',
      bottom: 0,
      left: 0,
      opacity: isHidden ? 0 : undefined,
      transform: `translateY(${translateY}px) scaleX(${scaleX})`,
      zIndex: 3 - multiple,
      transition: isDropping ? undefined : `transform ${Times.REFLECTION_DROP_DURATION}ms`
    }
  }
)


const useStartRemoteDrag = (remoteDrag: any, openPortal: () => void, reflectionRef: RefObject<HTMLDivElement>) => {
  const transformRef = useRef('')
  useEffect(() => {
    if (remoteDrag) {
      const bbox = getBBox(reflectionRef.current)
      if (!bbox) return
      const {top, left} = bbox
      transformRef.current = `translate(${left}px,${top}px)`
      openPortal()
    }
  }, [remoteDrag])
  return transformRef.current
}

interface Props {
  isDraggable: boolean
  meeting: DraggableReflectionCard_meeting
  reflection: DraggableReflectionCard_reflection
  staticIdx: number
  staticReflections: DraggableReflectionCard_staticReflections
}

const DraggableReflectionCard = (props: Props) => {
  const {reflection, staticIdx, staticReflections} = props
  const {id: reflectionId, reflectionGroupId, isDropping, remoteDrag} = reflection
  const atmosphere = useAtmosphere()
  const ref = useRef<HTMLDivElement>(null)
  const {portal, openPortal, closePortal, terminatePortal} = usePortal({
    allowScroll: true,
    noClose: true,
    id: `clone-${reflectionId}`
  })
  const dragRef = useRef({
    cardOffsetX: 0,
    cardOffsetY: 0,
    clone: null as null | HTMLDivElement,
    isDrag: false,
    ref: null as null | HTMLDivElement,
    startX: 0,
    startY: 0,
    wasDropping: false
  })
  const {current: drag} = dragRef
  const transform = useStartRemoteDrag(remoteDrag, openPortal, ref)

  useEffect(() => {
    if (ref.current && isDropping && staticIdx !== -1) {
      updateClonePosition(ref.current, reflectionId)
    }
  }, [isDropping, staticIdx, ref])

  useEffect(() => {
    if (isDropping !== drag.wasDropping) {
      drag.wasDropping = isDropping || false
      if (isDropping) {
        setTimeout(() => {
          commitLocalUpdate(atmosphere, (store) => {
            store.get(reflectionId)!
              .setValue(false, 'isDropping')
              .setValue(null, 'remoteDrag')
          })
          if (drag.clone) {
            // local
            document.body.removeChild(drag.clone!)
            drag.clone = null
          } else {
            //remote
            terminatePortal()
          }
        }, Times.REFLECTION_DROP_DURATION)
      }
    }
  }, [isDropping])

  const onMouseUp = useEventCallback((e: MouseEvent | TouchEvent) => {
    const eventType = isNativeTouch(e) ? 'touchmove' : 'mousemove'
    drag.isDrag = false
    document.removeEventListener(eventType, onMouseMove)
    const targetGroupId = getTargetGroupId(e)
    const targetType = targetGroupId && reflectionGroupId !== targetGroupId ?
      DragReflectionDropTargetTypeEnum.REFLECTION_GROUP : staticReflections.length > 0 ?
        DragReflectionDropTargetTypeEnum.REFLECTION_GRID :
        null
    handleDrop(atmosphere, reflectionId, drag, targetType, targetGroupId)
  })

  const onMouseMove = useEventCallback((e: MouseEvent | TouchEvent) => {
    const event = isNativeTouch(e) ? e.touches[0] : e
    const {clientX, clientY} = event
    if (!drag.isDrag) {
      drag.isDrag = getIsDrag(clientX, clientY, drag.startX, drag.startY)
      if (!drag.isDrag || !drag.ref) return
      const bbox = drag.ref.getBoundingClientRect()!
      drag.cardOffsetX = clientX - bbox.left
      drag.cardOffsetY = clientY - bbox.top
      drag.clone = cloneReflection(drag.ref, reflectionId)
      StartDraggingReflectionMutation(atmosphere, {reflectionId, dragId: shortid.generate()})
    }
    if (drag.clone) {
      drag.clone.style.transform = `translate(${clientX - drag.cardOffsetX}px,${clientY - drag.cardOffsetY}px)`
    }
  })

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isDropping) return
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
  return (
    <ReflectionWrapper ref={ref} key={reflectionId}
                       staticReflectionCount={staticReflections.length} staticIdx={staticIdx} isDropping={isDropping}
                       onMouseDown={onMouseDown}>
      <ReflectionCard readOnly userSelect='none' reflection={reflection} showOriginFooter
                      isClipped={staticReflections.length - 1 !== staticIdx} />
      {portal(<RemoteReflection transform={transform} reflection={reflection}/>)}
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
        }
      }
    `,
    meeting: graphql`
      fragment DraggableReflectionCard_meeting on RetrospectiveMeeting {
        id
      }`
  }
)
