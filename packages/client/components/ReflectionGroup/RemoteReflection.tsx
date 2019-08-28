import {ReflectionCardRoot} from '../ReflectionCard/ReflectionCard'
import React, {useMemo, useRef} from 'react'
import styled from '@emotion/styled'
import {Elevation} from '../../styles/elevation'
import {ZIndex} from '../../types/constEnums'
import UserDraggingHeader from '../UserDraggingHeader'
import ReflectionEditorWrapper from '../ReflectionEditorWrapper'
import {convertFromRaw, EditorState} from 'draft-js'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import editorDecorators from '../TaskEditor/decorators'
import ReflectionFooter from '../ReflectionFooter'

const RemoteReflectionModal = styled('div')({
  position: 'absolute',
  left: 0,
  top: 0,
  boxShadow: Elevation.CARD_DRAGGING,
  pointerEvents: 'none',
  zIndex: ZIndex.REFLECTION_IN_FLIGHT
})

interface Props {
  transform: string
  reflection: any
}

const RemoteReflection = (props: Props) => {
  const {reflection, transform} = props
  const {content, remoteDrag, phaseItem} = reflection
  if (!remoteDrag) return null
  const {question} = phaseItem
  const {dragUserId, dragUserName} = remoteDrag
  const contentState = useMemo(() => convertFromRaw(JSON.parse(content)), [content])
  const editorStateRef = useRef<EditorState>()
  const getEditorState = () => {
    return editorStateRef.current
  }
  editorStateRef.current = EditorState.createWithContent(
    contentState,
    editorDecorators(getEditorState)
  )

  return (
    <RemoteReflectionModal style={{transform}}>
      <ReflectionCardRoot>
        <UserDraggingHeader userId={dragUserId} name={dragUserName}/>
        <ReflectionEditorWrapper editorState={editorStateRef.current} readOnly />
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
      content
      remoteDrag {
        dragUserId
        dragUserName
      }
      phaseItem {
        question
      }
    }`
  }
)
