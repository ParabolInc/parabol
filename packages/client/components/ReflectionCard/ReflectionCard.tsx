import {ReflectionCard_reflection} from '../../__generated__/ReflectionCard_reflection.graphql'
import {convertFromRaw, convertToRaw, EditorState} from 'draft-js'
import React, {useEffect, useMemo, useRef} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import ReflectionEditorWrapper from '../ReflectionEditorWrapper'
import ReflectionFooter from '../ReflectionFooter'
import StyledError from '../StyledError'
import editorDecorators from '../TaskEditor/decorators'
import EditReflectionMutation from '../../mutations/EditReflectionMutation'
import RemoveReflectionMutation from '../../mutations/RemoveReflectionMutation'
import UpdateReflectionContentMutation from '../../mutations/UpdateReflectionContentMutation'
import {DECELERATE} from '../../styles/animation'
import {Elevation} from '../../styles/elevation'
import isTempId from '../../utils/relay/isTempId'
import ReflectionCardDeleteButton from './ReflectionCardDeleteButton'
import {cardBackgroundColor, cardBorderRadius} from '../../styles/cards'
import {ElementWidth} from '../../types/constEnums'
import useRefState from '../../hooks/useRefState'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'

interface Props {
  isClipped?: boolean
  className?: string
  handleChange?: () => void
  reflection: ReflectionCard_reflection
  meetingId?: string
  readOnly?: boolean
  setReadOnly?: (readOnly: boolean) => void
  shadow?: string
  showOriginFooter?: boolean
  userSelect?: 'text' | 'none'
  innerRef?: (c: HTMLDivElement | null) => void
}

interface ReflectionCardRootProps {
  isClosing?: boolean | null
  shadow?: string | null
}

export const ReflectionCardRoot = styled('div')<ReflectionCardRootProps>(
  {
    backgroundColor: cardBackgroundColor,
    borderRadius: cardBorderRadius,
    boxShadow: Elevation.CARD_SHADOW,
    // display was 'inline-block' which causes layout issues (TA)
    display: 'block',
    maxWidth: '100%',
    position: 'relative',
    transition: `box-shadow 2000ms ${DECELERATE}`,
    width: ElementWidth.REFLECTION_CARD
  }
)

const makeEditorState = (content, getEditorState) => {
  const contentState = convertFromRaw(JSON.parse(content))
  return EditorState.createWithContent(contentState, editorDecorators(getEditorState))
}

const ReflectionCard = (props: Props) => {
  const {meetingId, reflection, className, innerRef, isClipped, handleChange, readOnly, userSelect, showOriginFooter, setReadOnly} = props
  const {id: reflectionId, content, retroPhaseItemId, phaseItem, isViewerCreator, reflectionGroupId} = reflection
  const {question} = phaseItem
  const atmosphere = useAtmosphere()
  const {onCompleted, submitMutation, error, onError} = useMutationProps()
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [editorStateRef, setEditorState] = useRefState<EditorState>(() =>
    makeEditorState(content, () => editorStateRef.current)
  )
  useEffect(() => {
    setEditorState(makeEditorState(content, () => editorStateRef.current))
  }, [content, editorStateRef, setEditorState])

  const handleEditorFocus = () => {
    if (isTempId(reflectionId)) return
    EditReflectionMutation(atmosphere, {isEditing: true, phaseItemId: retroPhaseItemId})
  }

  useEffect(() => {
    if (isViewerCreator && !editorStateRef.current.getCurrentContent().hasText()) {
      setReadOnly && setReadOnly(false)
    }
  }, [])

  const handleContentUpdate = () => {
    const contentState = editorStateRef.current.getCurrentContent()
    if (contentState.hasText()) {
      const nextContent = JSON.stringify(convertToRaw(contentState))
      if (content === nextContent) return
      submitMutation()
      UpdateReflectionContentMutation(
        atmosphere,
        {content: nextContent, reflectionId},
        {onError, onCompleted}
      )
    } else {
      RemoveReflectionMutation(
        atmosphere,
        {reflectionId},
        {meetingId: meetingId!},
        onError,
        onCompleted
      )
    }
  }

  const handleEditorBlur = () => {
    if (isTempId(reflectionId)) return
    handleContentUpdate()
    EditReflectionMutation(atmosphere, {isEditing: false, phaseItemId: retroPhaseItemId})
  }

  const handleReturn = (e) => {
    if (e.shiftKey) return 'not-handled'
    editorRef.current && editorRef.current.blur()
    return 'handled'
  }

  const isReadOnly = !isViewerCreator || readOnly || isTempId(reflectionId)
  return (
    <ReflectionCardRoot className={className} ref={innerRef}>
      <ReflectionEditorWrapper
        isClipped={isClipped}
        ariaLabel='Edit this reflection'
        editorRef={editorRef}
        editorState={editorStateRef.current}
        onBlur={handleEditorBlur}
        onFocus={handleEditorFocus}
        handleChange={handleChange}
        handleReturn={handleReturn}
        placeholder={isViewerCreator ? 'My reflection… (press enter to add)' : '*New Reflection*'}
        readOnly={isReadOnly}
        setEditorState={setEditorState}
        userSelect={userSelect}
      />
      {error && <StyledError>{error.message}</StyledError>}
      {showOriginFooter && <ReflectionFooter>{question}</ReflectionFooter>}
      {!isReadOnly && meetingId && (
        <ReflectionCardDeleteButton meetingId={meetingId} reflectionId={reflectionId} />
      )}
    </ReflectionCardRoot>
  )
}

export default createFragmentContainer(ReflectionCard, {
  reflection: graphql`
    fragment ReflectionCard_reflection on RetroReflection {
      isViewerCreator
      id
      reflectionGroupId
      retroPhaseItemId
      content
      phaseItem {
        question
      }
      sortOrder
    }
  `
})
