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

const getTransform = (remoteDrag: NonNullable<RemoteReflection_reflection['remoteDrag']>, isDropping: boolean | null, initialTransform: string) => {
  const {targetId, clientHeight, clientWidth, coords, targetOffset} = remoteDrag
  if (isDropping || !coords || !clientWidth || !clientHeight) return initialTransform
  const targetEl = targetId ? document.querySelector(`div[data-droppable='${targetId}']`) : null
  if (targetEl && targetOffset) {
    const targetBBox = getBBox(targetEl)!
    const left = targetBBox.left + targetOffset.x
    const top = targetBBox.top + targetOffset.y
    return `translate(${left}px,${top}px)`
  }
  const left = (coords.x / clientWidth) * window.innerWidth
  const top = (coords.y / clientHeight) * window.innerHeight
  return `translate(${left}px,${top}px)`
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

  const transform = getTransform(remoteDrag!, isDropping, initialTransform)
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
        <UserDraggingHeader userId={dragUserId!} name={dragUserName!} />
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
          coords {
            x
            y
          }
          targetId
          targetOffset {
            x
            y
          }
        }
        phaseItem {
          question
        }
      }`
  }
)
