import React, {useEffect, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
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

interface Props {
  isDraggable: boolean
  meeting: DraggableReflectionCard_meeting
  reflection: DraggableReflectionCard_reflection
  staticIdx: number
  staticReflections: DraggableReflectionCard_staticReflections
}

const DraggableReflectionCard = (props: Props) => {
  const {reflection, staticIdx, staticReflections} = props
  const {id: reflectionId, reflectionGroupId, isDropping} = reflection
  const atmosphere = useAtmosphere()
  const ref = useRef<HTMLDivElement>(null)
  const dragRef = useRef({
    cardOffsetX: 0,
    cardOffsetY: 0,
    clone: null as null | HTMLDivElement,
    isDrag: false,
    ref: null as null | HTMLDivElement,
    startX: 0,
    startY: 0,
  })
  const {current: drag} = dragRef

  useEffect(() => {
    if (ref.current && isDropping && staticIdx !== -1) {
      updateClonePosition(ref.current, reflectionId)
    }
  }, [isDropping, staticIdx, ref])

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
      StartDraggingReflectionMutation(atmosphere, {reflectionId})
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

  console.log("isDrop", staticIdx, isDropping)
  return (
    <ReflectionWrapper ref={ref} key={reflectionId}
                       staticReflectionCount={staticReflections.length} staticIdx={staticIdx} isDropping={isDropping}
                       onMouseDown={onMouseDown}>
      <ReflectionCard readOnly userSelect='none' reflection={reflection} showOriginFooter isClipped={staticReflections.length - 1 !== staticIdx}/>
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
        id
        reflectionGroupId
        retroPhaseItemId
        isViewerDragging
        isDropping
      }
    `,
    meeting: graphql`
      fragment DraggableReflectionCard_meeting on RetrospectiveMeeting {
        id
      }`
  }
)
