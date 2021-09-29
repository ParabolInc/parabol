import ReflectionCardRoot from '../ReflectionCard/ReflectionCardRoot'
import React, {RefObject, useEffect, useRef} from 'react'
import styled from '@emotion/styled'
import {Elevation} from '../../styles/elevation'
import {BezierCurve, DragAttribute, ElementWidth, Times, ZIndex} from '../../types/constEnums'
import UserDraggingHeader, {RemoteReflectionArrow} from '../UserDraggingHeader'
import ReflectionEditorWrapper from '../ReflectionEditorWrapper'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import {RemoteReflection_reflection} from '../../__generated__/RemoteReflection_reflection.graphql'
import getBBox from '../RetroReflectPhase/getBBox'
import useAtmosphere from '../../hooks/useAtmosphere'
import {DeepNonNullable} from '../../types/generics'
import {getMinTop} from '../../utils/retroGroup/updateClonePosition'
import useEditorState from '../../hooks/useEditorState'
import Atmosphere from '~/Atmosphere'

const RemoteReflectionModal = styled('div')<{
  isDropping?: boolean | null
}>(({isDropping}) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  boxShadow: isDropping ? Elevation.CARD_SHADOW : Elevation.CARD_DRAGGING,
  pointerEvents: 'none',
  transition: `all ${
    isDropping ? Times.REFLECTION_REMOTE_DROP_DURATION : Times.REFLECTION_DROP_DURATION
  }ms ${BezierCurve.DECELERATE}`
}))

const HeaderModal = styled('div')<{showAboveSpotlight: boolean}>(({showAboveSpotlight}) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  pointerEvents: 'none',
  width: ElementWidth.REFLECTION_CARD,
  zIndex: showAboveSpotlight ? ZIndex.REFLECTION_IN_FLIGHT_SPOTLIGHT : ZIndex.REFLECTION_IN_FLIGHT
}))

const windowDims = {
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight
}

const OFFSCREEN_PADDING = 16
const getCoords = (
  remoteDrag: DeepNonNullable<NonNullable<RemoteReflection_reflection['remoteDrag']>>,
  showAboveSpotlight: boolean
) => {
  const {
    targetId,
    clientHeight,
    clientWidth,
    clientX,
    clientY,
    targetOffsetX,
    targetOffsetY
  } = remoteDrag
  const targetEl = targetId
    ? (document.querySelector(
        `div[${
          showAboveSpotlight ? DragAttribute.DROPPABLE_SPOTLIGHT : DragAttribute.DROPPABLE
        }='${targetId}']`
      ) as HTMLElement)
    : null
  if (targetEl) {
    const targetBBox = getBBox(targetEl)!
    const minTop = getMinTop(-1, targetEl)
    return {
      left: targetBBox.left + targetOffsetX,
      top: targetBBox.top + targetOffsetY,
      minTop
    }
  }
  return {
    left: (clientX / clientWidth) * windowDims.innerWidth,
    top: (clientY / clientHeight) * windowDims.innerHeight
  }
}

const getHeaderTransform = (ref: RefObject<HTMLDivElement>, topPadding = 18) => {
  if (!ref.current) return {}
  const bbox = ref.current.getBoundingClientRect()
  const minLeft = -ElementWidth.REFLECTION_CARD + OFFSCREEN_PADDING * 8
  const minTop = OFFSCREEN_PADDING + topPadding
  const maxLeft = windowDims.innerWidth - ElementWidth.REFLECTION_CARD - OFFSCREEN_PADDING
  const maxTop = windowDims.innerHeight - OFFSCREEN_PADDING
  const headerLeft = Math.max(minLeft, Math.min(maxLeft, bbox.left))
  const headerTop = Math.max(minTop, Math.min(maxTop, bbox.top))
  const isFloatingHeader = headerLeft !== bbox.left || headerTop !== bbox.top
  if (!isFloatingHeader) return {}
  const arrow =
    headerTop === maxTop
      ? 'arrow_downward'
      : headerLeft === maxLeft
      ? 'arrow_forward'
      : headerLeft === minLeft
      ? 'arrow_back'
      : ('arrow_upward' as RemoteReflectionArrow)
  return {
    arrow,
    headerTransform: `translate(${headerLeft}px,${headerTop}px)`
  }
}

const getInlineStyle = (
  remoteDrag: RemoteReflection_reflection['remoteDrag'],
  isDropping: boolean | null,
  style: React.CSSProperties,
  showAboveSpotlight: boolean
) => {
  if (isDropping || !remoteDrag || !remoteDrag.clientX) return {nextStyle: style}
  const {left, top, minTop} = getCoords(remoteDrag as any, showAboveSpotlight)
  const zIndex = showAboveSpotlight ? ZIndex.REFLECTION_IN_FLIGHT_SPOTLIGHT : style.zIndex
  return {nextStyle: {transform: `translate(${left}px,${top}px)`, zIndex}, minTop}
}

const getTarget = (meetingId: string, targetId: string, atmosphere: Atmosphere) => {
  let isTargetInSpotlight = false
  commitLocalUpdate(atmosphere, (store) => {
    const meeting = store.get(meetingId)
    const spotlightReflection = meeting?.getLinkedRecord('spotlightReflection')
    const spotlightReflectionId = spotlightReflection?.getValue('id')
    const viewer = store.getRoot().getLinkedRecord('viewer')
    if (!viewer || !spotlightReflectionId) return
    const similarReflectionGroups = viewer.getLinkedRecords('similarReflectionGroups', {
      reflectionId: spotlightReflectionId,
      searchQuery: ''
    })
    const groupIds = similarReflectionGroups?.map((group) => group.getValue('id')) as string[]
    isTargetInSpotlight = groupIds?.includes(targetId)
  })
  return isTargetInSpotlight
}

interface Props {
  style: React.CSSProperties
  reflection: RemoteReflection_reflection
}

const RemoteReflection = (props: Props) => {
  const {reflection, style} = props
  const {id: reflectionId, content, isDropping, meetingId, reflectionGroupId} = reflection
  const remoteDrag = reflection.remoteDrag as DeepNonNullable<
    NonNullable<RemoteReflection_reflection['remoteDrag']>
  >
  const ref = useRef<HTMLDivElement>(null)
  const [editorState] = useEditorState(content)
  const timeoutRef = useRef(0)
  const atmosphere = useAtmosphere()
  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      commitLocalUpdate(atmosphere, (store) => {
        const reflection = store.get(reflectionId)!
        reflection.setValue(true, 'isDropping')
      })
    }, Times.REFLECTION_STALE_LIMIT)
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [remoteDrag])

  if (!remoteDrag) return null
  const {dragUserId, dragUserName, targetId} = remoteDrag
  const isTargetInSpotlight = getTarget(meetingId, targetId, atmosphere)
  const spotlightGroup = document.querySelector(
    `div[${DragAttribute.DROPPABLE_SPOTLIGHT}='${reflectionGroupId}']`
  )
  const kanbanGroup = document.querySelector(
    `div[${DragAttribute.DROPPABLE}='${reflectionGroupId}']`
  )
  const isInSpotlight = !!(spotlightGroup && kanbanGroup)
  const showAboveSpotlight = isInSpotlight || isTargetInSpotlight

  const {nextStyle, minTop} = getInlineStyle(remoteDrag, isDropping, style, showAboveSpotlight)
  const {headerTransform, arrow} = getHeaderTransform(ref, minTop)
  return (
    <>
      <RemoteReflectionModal ref={ref} style={nextStyle} isDropping={isDropping}>
        <ReflectionCardRoot>
          {!headerTransform && <UserDraggingHeader userId={dragUserId} name={dragUserName} />}
          <ReflectionEditorWrapper editorState={editorState} readOnly />
        </ReflectionCardRoot>
      </RemoteReflectionModal>
      {headerTransform && (
        <HeaderModal showAboveSpotlight={showAboveSpotlight}>
          <UserDraggingHeader
            userId={dragUserId}
            name={dragUserName}
            style={{transform: headerTransform}}
            arrow={arrow}
          />
        </HeaderModal>
      )}
    </>
  )
}

export default createFragmentContainer(RemoteReflection, {
  reflection: graphql`
    fragment RemoteReflection_reflection on RetroReflection {
      id
      content
      isDropping
      meetingId
      reflectionGroupId
      remoteDrag {
        dragUserId
        dragUserName
        clientHeight
        clientWidth
        clientX
        clientY
        targetId
        targetOffsetX
        targetOffsetY
      }
    }
  `
})
