import {ReflectionCardRoot} from '../ReflectionCard/ReflectionCard'
import React, {RefObject, useEffect, useMemo, useRef} from 'react'
import styled from '@emotion/styled'
import {Elevation} from '../../styles/elevation'
import {BezierCurve, ElementWidth, Times, ZIndex} from '../../types/constEnums'
import UserDraggingHeader, {RemoteReflectionArrow} from '../UserDraggingHeader'
import ReflectionEditorWrapper from '../ReflectionEditorWrapper'
import {convertFromRaw, EditorState} from 'draft-js'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import editorDecorators from '../TaskEditor/decorators'
import ReflectionFooter from '../ReflectionFooter'
import {RemoteReflection_reflection} from '__generated__/RemoteReflection_reflection.graphql'
import getBBox from '../RetroReflectPhase/getBBox'
import useAtmosphere from '../../hooks/useAtmosphere'
import {DeepNonNullable} from '../../types/generics'

const RemoteReflectionModal = styled('div')<{isDropping?: boolean | null, isHeader?: boolean}>(({isDropping, isHeader}) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  boxShadow: isDropping ? Elevation.CARD_SHADOW : Elevation.CARD_DRAGGING,
  pointerEvents: 'none',
  transition: isHeader ? undefined : `all ${isDropping ? Times.REFLECTION_REMOTE_DROP_DURATION : Times.REFLECTION_DROP_DURATION}ms ${BezierCurve.DECELERATE}`,
  width: isHeader ? ElementWidth.REFLECTION_CARD : undefined,
  zIndex: ZIndex.REFLECTION_IN_FLIGHT
}))

interface Props {
  initialTransform: string
  reflection: RemoteReflection_reflection
}

const windowDims = {
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight
}

const OFFSCREEN_PADDING = 16
const getCoords = (remoteDrag: DeepNonNullable<NonNullable<RemoteReflection_reflection['remoteDrag']>>) => {
  const {targetId, clientHeight, clientWidth, clientX, clientY, targetOffsetX, targetOffsetY} = remoteDrag
  const targetEl = targetId ? document.querySelector(`div[data-droppable='${targetId}']`) : null
  if (targetEl && targetOffsetX && targetOffsetY) {
    const targetBBox = getBBox(targetEl)!
    return {
      left: targetBBox.left + targetOffsetX,
      top: targetBBox.top + targetOffsetY
    }
  }
  return {
    left: clientX / clientWidth * windowDims.innerWidth,
    top: clientY / clientHeight * windowDims.innerHeight
  }
}

const getHeaderTransform = (ref: RefObject<HTMLDivElement>) => {
  if (!ref.current) return {}
  const bbox = ref.current.getBoundingClientRect()
  const minLeft = -ElementWidth.REFLECTION_CARD + OFFSCREEN_PADDING * 8
  const minTop = OFFSCREEN_PADDING + 18 // lineheight of the header
  const maxLeft = windowDims.innerWidth - ElementWidth.REFLECTION_CARD - OFFSCREEN_PADDING
  const maxTop = windowDims.innerHeight - OFFSCREEN_PADDING
  const headerLeft = Math.max(minLeft, Math.min(maxLeft, bbox.left))
  const headerTop = Math.max(minTop, Math.min(maxTop, bbox.top))
  const isFloatingHeader = headerLeft !== bbox.left || headerTop !== bbox.top
  if (!isFloatingHeader) return {}
  const arrow = headerTop === maxTop ? 'arrow_downward' :
    headerLeft === maxLeft ? 'arrow_forward' :
      headerLeft === minLeft ? 'arrow_back' :
        'arrow_upward' as RemoteReflectionArrow
  return {
    arrow,
    headerTransform: `translate(${headerLeft}px,${headerTop}px)`
  }
}

const getTransforms = (remoteDrag: RemoteReflection_reflection['remoteDrag'], isDropping: boolean | null, initialTransform: string) => {
  if (isDropping || !remoteDrag || !remoteDrag.clientX) return initialTransform
  const {left, top} = getCoords(remoteDrag as any)
  return `translate(${left}px,${top}px)`
}

const RemoteReflection = (props: Props) => {
  const {reflection, initialTransform} = props
  const {id: reflectionId, content, phaseItem, isDropping} = reflection
  const remoteDrag = reflection.remoteDrag as DeepNonNullable<NonNullable<RemoteReflection_reflection['remoteDrag']>>
  const {question} = phaseItem
  const {dragUserId, dragUserName} = remoteDrag
  const ref = useRef<HTMLDivElement>(null)
  const editorState = useMemo(() => {
    const contentState = convertFromRaw(JSON.parse(content))
    return EditorState.createWithContent(contentState, editorDecorators())
  }, [content])

  const transform = getTransforms(remoteDrag!, isDropping, initialTransform)
  const {headerTransform, arrow} = getHeaderTransform(ref)
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

  return (
    <>
      <RemoteReflectionModal ref={ref} style={{transform}} isDropping={isDropping}>
        <ReflectionCardRoot>
          {!headerTransform && <UserDraggingHeader userId={dragUserId} name={dragUserName} />}
          <ReflectionEditorWrapper editorState={editorState} readOnly />
          <ReflectionFooter>{question}</ReflectionFooter>
        </ReflectionCardRoot>
      </RemoteReflectionModal>
      {headerTransform &&
      <RemoteReflectionModal isHeader>
        <UserDraggingHeader userId={dragUserId} name={dragUserName} style={{transform: headerTransform}}
                            arrow={arrow} />
      </RemoteReflectionModal>
      }
    </>
  )
}

export default createFragmentContainer(
  RemoteReflection,
  {
    reflection: graphql`
      fragment RemoteReflection_reflection on RetroReflection {
        id
        content
        isDropping
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
        phaseItem {
          question
        }
      }`
  }
)
