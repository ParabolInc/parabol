import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useEffect, useMemo, useRef} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useSpotlightResults from '~/hooks/useSpotlightResults'
import useAtmosphere from '../../hooks/useAtmosphere'
import useEditorState from '../../hooks/useEditorState'
import {Elevation} from '../../styles/elevation'
import {BezierCurve, DragAttribute, ElementWidth, Times, ZIndex} from '../../types/constEnums'
import {DeepNonNullable} from '../../types/generics'
import {VOTE} from '../../utils/constants'
import {getMinTop} from '../../utils/retroGroup/updateClonePosition'
import {RemoteReflection_meeting} from '../../__generated__/RemoteReflection_meeting.graphql'
import {RemoteReflection_reflection} from '../../__generated__/RemoteReflection_reflection.graphql'
import ReflectionCardAuthor from '../ReflectionCard/ReflectionCardAuthor'
import ReflectionCardRoot from '../ReflectionCard/ReflectionCardRoot'
import ReflectionEditorWrapper from '../ReflectionEditorWrapper'
import getBBox from '../RetroReflectPhase/getBBox'
import UserDraggingHeader, {RemoteReflectionArrow} from '../UserDraggingHeader'

const circleAnimation = (transform?: string) => keyframes`
  0%{
    transform:translate(5px)
              rotate(0deg)
              translate(-5px)
              rotate(0deg)
              ${transform ?? ''}
  }
  100%{
    transform:translate(5px)
              rotate(360deg)
              translate(-5px)
              rotate(-360deg)
              ${transform ?? ''}
  }
`

const RemoteReflectionModal = styled('div')<{
  isInViewerSpotlightResults: boolean
  isDropping?: boolean | null
  transform?: string
  isSpotlight?: boolean
  animation?: string
}>(({isInViewerSpotlightResults, isDropping, transform, isSpotlight, animation}) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  boxShadow: isDropping ? Elevation.CARD_SHADOW : Elevation.CARD_DRAGGING,
  pointerEvents: 'none',
  transition: `all ${
    isDropping ? Times.REFLECTION_REMOTE_DROP_DURATION : Times.REFLECTION_DROP_DURATION
  }ms ${BezierCurve.DECELERATE}`,
  transform,
  animation: animation
    ? animation
    : isSpotlight && !isDropping
    ? `${circleAnimation(transform)} 3s ease infinite;`
    : undefined,
  zIndex: isInViewerSpotlightResults
    ? ZIndex.REFLECTION_IN_FLIGHT_SPOTLIGHT
    : ZIndex.REFLECTION_IN_FLIGHT
}))

const HeaderModal = styled('div')({
  position: 'absolute',
  left: 0,
  top: 0,
  pointerEvents: 'none',
  width: ElementWidth.REFLECTION_CARD
})

const windowDims = {
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight
}

const OFFSCREEN_PADDING = 16
const getCoords = (
  remoteDrag: DeepNonNullable<NonNullable<RemoteReflection_reflection['remoteDrag']>>
) => {
  const {targetId, clientHeight, clientWidth, clientX, clientY, targetOffsetX, targetOffsetY} =
    remoteDrag
  const targetEl = targetId
    ? (document.querySelector(`div[${DragAttribute.DROPPABLE}='${targetId}']`) as HTMLElement)
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

/*
  Having the dragging transform in inline style results in a smoother motion.
  Animations don't work in inline style but these still need to have the correct
  transform applied, thus switch between applying the transformation in inline style
  and in the styled component depending on situation
*/
const getStyle = (
  remoteDrag: RemoteReflection_reflection['remoteDrag'],
  isDropping: boolean | null,
  isSpotlight: boolean,
  style: React.CSSProperties
) => {
  if (isSpotlight && !isDropping) return {transform: style.transform}
  if (isDropping || !remoteDrag?.clientX) return {nextStyle: style}
  const {left, top, minTop} = getCoords(remoteDrag as any)
  const {zIndex} = style
  return {
    nextStyle: {
      transform: `translate(${left}px,${top}px)`,
      zIndex
    },
    minTop
  }
}

interface Props {
  style: React.CSSProperties
  animation: string | undefined
  reflection: RemoteReflection_reflection
  meeting: RemoteReflection_meeting
}

const RemoteReflection = (props: Props) => {
  const {meeting, reflection, style, animation} = props
  const {id: reflectionId, content, isDropping, reflectionGroupId, creator} = reflection
  const {meetingMembers, localPhase, disableAnonymity} = meeting
  const remoteDrag = reflection.remoteDrag as DeepNonNullable<
    RemoteReflection_reflection['remoteDrag']
  >
  const ref = useRef<HTMLDivElement>(null)
  const [editorState] = useEditorState(content)
  const timeoutRef = useRef(0)
  const atmosphere = useAtmosphere()
  const spotlightResultGroups = useSpotlightResults(meeting)
  const isInViewerSpotlightResults = useMemo(
    () => !!spotlightResultGroups?.find(({id}) => id === reflectionGroupId),
    [spotlightResultGroups]
  )

  useEffect(() => {
    timeoutRef.current = window.setTimeout(
      () => {
        commitLocalUpdate(atmosphere, (store) => {
          const reflection = store.get(reflectionId)!
          reflection.setValue(true, 'isDropping')
        })
      },
      remoteDrag?.isSpotlight
        ? Times.REFLECTION_SPOTLIGHT_DRAG_STALE_TIMEOUT
        : localPhase.phaseType === VOTE
        ? 0
        : Times.REFLECTION_DRAG_STALE_TIMEOUT
    )
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [remoteDrag, localPhase.phaseType])

  useEffect(() => {
    if (!remoteDrag || !meeting) return
    const remoteDragUser = meetingMembers.find((user) => user.userId === remoteDrag.dragUserId)
    if (!remoteDragUser || !remoteDragUser.user.isConnected) {
      commitLocalUpdate(atmosphere, (store) => {
        const reflection = store.get(reflectionId)!
        reflection.setValue(true, 'isDropping')
      })
    }
  }, [remoteDrag, meetingMembers])

  if (!remoteDrag) return null
  const {dragUserId, dragUserName, isSpotlight} = remoteDrag

  const {nextStyle, transform, minTop} = getStyle(remoteDrag, isDropping, isSpotlight, style)
  const {headerTransform, arrow} = getHeaderTransform(ref, minTop)
  return (
    <>
      <RemoteReflectionModal
        ref={ref}
        style={nextStyle}
        isDropping={isDropping}
        isSpotlight={isSpotlight}
        isInViewerSpotlightResults={isInViewerSpotlightResults}
        transform={transform}
        animation={animation}
      >
        <ReflectionCardRoot>
          {!headerTransform && <UserDraggingHeader userId={dragUserId} name={dragUserName} />}
          <ReflectionEditorWrapper
            editorState={editorState}
            readOnly
            disableAnonymity={disableAnonymity}
          />
          {disableAnonymity && (
            <ReflectionCardAuthor>{creator?.preferredName}</ReflectionCardAuthor>
          )}
        </ReflectionCardRoot>
      </RemoteReflectionModal>
      {headerTransform && (
        <HeaderModal>
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
      reflectionGroupId
      remoteDrag {
        dragUserId
        dragUserName
        isSpotlight
        clientHeight
        clientWidth
        clientX
        clientY
        targetId
        targetOffsetX
        targetOffsetY
      }
      creator {
        preferredName
      }
    }
  `,
  meeting: graphql`
    fragment RemoteReflection_meeting on RetrospectiveMeeting {
      ...useSpotlightResults_meeting
      id
      disableAnonymity
      localPhase {
        phaseType
      }
      meetingMembers {
        userId
        user {
          isConnected
        }
      }
    }
  `
})
