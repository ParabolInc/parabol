import {ReflectionCard_reflection} from '../../__generated__/ReflectionCard_reflection.graphql'
import {convertFromRaw, convertToRaw, EditorState} from 'draft-js'
import React, {useEffect, useRef} from 'react'
import styled from '@emotion/styled'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import ReflectionEditorWrapper from '../ReflectionEditorWrapper'
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
import {NewMeetingPhaseTypeEnum} from '../../types/graphql'
import {ReflectionCard_meeting} from '__generated__/ReflectionCard_meeting.graphql'

interface Props {
  isClipped?: boolean
  reflection: ReflectionCard_reflection
  meeting?: ReflectionCard_meeting
  stackCount?: number
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

const getReadOnly = (reflection: {id: string, isViewerCreator: boolean | null, isEditing: boolean | null}, phaseType: NewMeetingPhaseTypeEnum, stackCount: number | undefined) => {
  const {isViewerCreator, isEditing, id} = reflection
  if (!isViewerCreator || isTempId(id)) return true
  if (phaseType === NewMeetingPhaseTypeEnum.reflect) return (stackCount && stackCount > 1)
  if (phaseType === NewMeetingPhaseTypeEnum.group && isEditing) return false
  return true
}

const makeEditorState = (content, getEditorState) => {
  const contentState = convertFromRaw(JSON.parse(content))
  return EditorState.createWithContent(contentState, editorDecorators(getEditorState))
}

const ReflectionCard = (props: Props) => {
  const {meeting, reflection, isClipped, stackCount} = props
  const phaseType = meeting ? meeting.localPhase.phaseType : null
  const meetingId = meeting ? meeting.id : null
  const {id: reflectionId, content, retroPhaseItemId, isViewerCreator} = reflection
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
      commitLocalUpdate(atmosphere, (store) => {
        const reflection = store.get(reflectionId)
        if (!reflection) return
        reflection.setValue(true, 'isEditing')
      })
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

  const readOnly = getReadOnly(reflection, phaseType as NewMeetingPhaseTypeEnum, stackCount)
  const userSelect = readOnly ? phaseType === NewMeetingPhaseTypeEnum.discuss ? 'text' : 'none' : undefined
  return (
    <ReflectionCardRoot>
      <ReflectionEditorWrapper
        isClipped={isClipped}
        ariaLabel='Edit this reflection'
        editorRef={editorRef}
        editorState={editorStateRef.current}
        onBlur={handleEditorBlur}
        onFocus={handleEditorFocus}
        handleReturn={handleReturn}
        placeholder={isViewerCreator ? 'My reflection… (press enter to add)' : '*New Reflection*'}
        readOnly={readOnly}
        setEditorState={setEditorState}
        userSelect={userSelect}
      />
      {error && <StyledError>{error.message}</StyledError>}
      {!readOnly && meetingId && (
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
      isEditing
      reflectionGroupId
      retroPhaseItemId
      content
      sortOrder
    }
  `,
  meeting: graphql`
    fragment ReflectionCard_meeting on RetrospectiveMeeting {
      id
      localPhase {
        phaseType
      }
      phases {
        phaseType
      }
    }`
})
