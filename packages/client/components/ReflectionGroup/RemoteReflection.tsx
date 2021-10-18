import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useEffect, useRef} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '../../hooks/useAtmosphere'
import useEditorState from '../../hooks/useEditorState'
import {Elevation} from '../../styles/elevation'
import {BezierCurve, DragAttribute, ElementWidth, Times, ZIndex} from '../../types/constEnums'
import {DeepNonNullable} from '../../types/generics'
import {getMinTop} from '../../utils/retroGroup/updateClonePosition'
import {keyframes} from '@emotion/core'
import {RemoteReflection_reflection} from '../../__generated__/RemoteReflection_reflection.graphql'
import ReflectionCardRoot from '../ReflectionCard/ReflectionCardRoot'
import ReflectionEditorWrapper from '../ReflectionEditorWrapper'
import getBBox from '../RetroReflectPhase/getBBox'
import UserDraggingHeader, {RemoteReflectionArrow} from '../UserDraggingHeader'

const circleAnimation = (transform?: string) => keyframes`
  0%{
    transform:rotate(0deg)
              translate(-5px)
              rotate(0deg)
              ${transform ?? ''}
  }
  100%{
    transform:rotate(360deg)
              translate(-5px)
              rotate(-360deg)
              ${transform ?? ''}
  }
`

const RemoteReflectionModal = styled('div')<{
  isDropping?: boolean | null
  transform?: string
  isSpotlight?: boolean
}>(({isDropping, transform, isSpotlight}) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  boxShadow: isDropping ? Elevation.CARD_SHADOW : Elevation.CARD_DRAGGING,
  pointerEvents: 'none',
  transition: `all ${
    isDropping ? Times.REFLECTION_REMOTE_DROP_DURATION : Times.REFLECTION_DROP_DURATION
  }ms ${BezierCurve.DECELERATE}`,
  transform,
  animation: isSpotlight ? `${circleAnimation(transform)} 3s ease infinite;` : undefined,
  zIndex: ZIndex.REFLECTION_IN_FLIGHT
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
  if (isSpotlight) return {transform: style.transform}
  if (isDropping || !remoteDrag?.clientX) return {nextStyle: style}
  const {left, top, minTop} = getCoords(remoteDrag as any)
  const {zIndex} = style
  return {nextStyle: {transform: `translate(${left}px,${top}px)`, zIndex}, minTop}
}

interface Props {
  style: React.CSSProperties
  reflection: RemoteReflection_reflection
}

const RemoteReflection = (props: Props) => {
  const {reflection, style} = props
  const {id: reflectionId, content, isDropping} = reflection
  const remoteDrag = reflection.remoteDrag as DeepNonNullable<
    RemoteReflection_reflection['remoteDrag']
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
        transform={transform}
      >
        <ReflectionCardRoot>
          {!headerTransform && <UserDraggingHeader userId={dragUserId} name={dragUserName} />}
          <ReflectionEditorWrapper editorState={editorState} readOnly />
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
        updatedAt
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
