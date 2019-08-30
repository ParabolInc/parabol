import {ReflectionCardRoot} from '../ReflectionCard/ReflectionCard'
import React, {useEffect, useMemo, useRef} from 'react'
import styled from '@emotion/styled'
import {Elevation} from '../../styles/elevation'
import {BezierCurve, Times, ZIndex} from '../../types/constEnums'
import UserDraggingHeader from '../UserDraggingHeader'
import ReflectionEditorWrapper from '../ReflectionEditorWrapper'
import {convertFromRaw, EditorState} from 'draft-js'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import editorDecorators from '../TaskEditor/decorators'
import ReflectionFooter from '../ReflectionFooter'
import {RemoteReflection_reflection} from '__generated__/RemoteReflection_reflection.graphql'
import getBBox from '../RetroReflectPhase/getBBox'
import useAtmosphere from '../../hooks/useAtmosphere'

const RemoteReflectionModal = styled('div')<{isDropping: boolean | null}>(({isDropping}) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  boxShadow: isDropping ? Elevation.CARD_SHADOW : Elevation.CARD_DRAGGING,
  pointerEvents: 'none',
  transition: `all ${isDropping ? Times.REFLECTION_REMOTE_DROP_DURATION : Times.REFLECTION_DROP_DURATION}ms ${BezierCurve.DECELERATE}`,
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
const getCoords = (remoteDrag: Required<NonNullable<RemoteReflection_reflection['remoteDrag']>>) => {
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
const getTransforms = (remoteDrag: NonNullable<RemoteReflection_reflection['remoteDrag']>, isDropping: boolean | null, initialTransform: string) => {
  const {targetId, clientHeight, clientWidth, clientX, clientY, targetOffsetX, targetOffsetY} = remoteDrag
  if (isDropping || !clientX) return {transform: initialTransform}
  const {left, top} = getCoords(remoteDrag)
  const headerTransformX = left > windowDims.innerWidth ? (windowDims.innerWidth - left - OFFSCREEN_PADDING) : 0
  const headerTransformY = top > windowDims.innerHeight ? (windowDims.innerHeight - top - OFFSCREEN_PADDING) : 0
  return {
    transform: `translate(${left}px,${top}px)`,
    headerTransform: `translate${headerTransformX}px,${headerTransformY}px)`
  }
}

const RemoteReflection = (props: Props) => {
  const {reflection, initialTransform} = props
  const {id: reflectionId, content, remoteDrag, phaseItem, isDropping} = reflection
  const {question} = phaseItem
  const {dragUserId, dragUserName} = remoteDrag!
  const editorState = useMemo(() => {
    const contentState = convertFromRaw(JSON.parse(content))
    return EditorState.createWithContent(contentState, editorDecorators())
  }, [content])

  const {transform, headerTransform} = getTransforms(remoteDrag!, isDropping, initialTransform)
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
    <RemoteReflectionModal style={{transform}} isDropping={isDropping}>
      <ReflectionCardRoot>
        <UserDraggingHeader userId={dragUserId!} name={dragUserName!} style={{transform: headerTransform}} />
        <ReflectionEditorWrapper editorState={editorState} readOnly />
        <ReflectionFooter>{question}</ReflectionFooter>
      </ReflectionCardRoot>
    </RemoteReflectionModal>
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
