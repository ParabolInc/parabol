import {ReflectionCard_reflection} from '../../__generated__/ReflectionCard_reflection.graphql'
import {convertToRaw} from 'draft-js'
import React, {useEffect, useRef} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import ReflectionEditorWrapper from '../ReflectionEditorWrapper'
import StyledError from '../StyledError'
import EditReflectionMutation from '../../mutations/EditReflectionMutation'
import RemoveReflectionMutation from '../../mutations/RemoveReflectionMutation'
import UpdateReflectionContentMutation from '../../mutations/UpdateReflectionContentMutation'
import isTempId from '../../utils/relay/isTempId'
import ReflectionCardDeleteButton from './ReflectionCardDeleteButton'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import {NewMeetingPhaseTypeEnum} from '../../types/graphql'
import {ReflectionCard_meeting} from '__generated__/ReflectionCard_meeting.graphql'
import isAndroid from '../../utils/draftjs/isAndroid'
import convertToTaskContent from '../../utils/draftjs/convertToTaskContent'
import ReflectionCardRoot from './ReflectionCardRoot'
import ReflectionCardFooter from './ReflectionCardFooter'
import useEditorState from '../../hooks/useEditorState'
import isPhaseComplete from '../../utils/meetings/isPhaseComplete'
import ReactjiSection from './ReactjiSection'
import AddReactjiToReflectionMutation from 'mutations/AddReactjiToReflectionMutation'

interface Props {
  isClipped?: boolean
  reflection: ReflectionCard_reflection
  meeting: ReflectionCard_meeting | null
  stackCount?: number
  showOriginFooter?: boolean
  showReactji?: boolean
}

const getReadOnly = (
  reflection: {id: string; isViewerCreator: boolean | null; isEditing: boolean | null},
  phaseType: NewMeetingPhaseTypeEnum,
  stackCount: number | undefined,
  phases: any | null
) => {
  const {isViewerCreator, isEditing, id} = reflection
  if (phases && isPhaseComplete(NewMeetingPhaseTypeEnum.group, phases)) return true
  if (!isViewerCreator || isTempId(id)) return true
  if (phaseType === NewMeetingPhaseTypeEnum.reflect) return stackCount && stackCount > 1
  if (phaseType === NewMeetingPhaseTypeEnum.group && isEditing) return false
  return true
}

const ReflectionCard = (props: Props) => {
  const {showOriginFooter, meeting, reflection, isClipped, stackCount, showReactji} = props
  const {meetingId, phaseItem, reactjis} = reflection
  const {question} = phaseItem
  const phaseType = meeting ? meeting.localPhase.phaseType : null
  const phases = meeting ? meeting.phases : null
  const {id: reflectionId, content, retroPhaseItemId, isViewerCreator} = reflection
  const atmosphere = useAtmosphere()
  const {onCompleted, submitting, submitMutation, error, onError} = useMutationProps()
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [editorState, setEditorState] = useEditorState(content)

  const handleEditorFocus = () => {
    if (isTempId(reflectionId)) return
    EditReflectionMutation(atmosphere, {isEditing: true, meetingId, phaseItemId: retroPhaseItemId})
  }

  useEffect(() => {
    if (isViewerCreator && !editorState.getCurrentContent().hasText()) {
      commitLocalUpdate(atmosphere, (store) => {
        const reflection = store.get(reflectionId)
        if (!reflection) return
        reflection.setValue(true, 'isEditing')
      })
    }
  }, [])

  const handleContentUpdate = () => {
    if (isAndroid) {
      const editorEl = editorRef.current
      if (!editorEl || editorEl.type !== 'textarea') return
      const {value} = editorEl
      if (!value) {
        RemoveReflectionMutation(atmosphere, {reflectionId}, {meetingId, onError, onCompleted})
      } else {
        const initialContentState = editorState.getCurrentContent()
        const initialText = initialContentState.getPlainText()
        if (initialText === value) return
        submitMutation()
        UpdateReflectionContentMutation(
          atmosphere,
          {content: convertToTaskContent(value), reflectionId},
          {onError, onCompleted}
        )
        commitLocalUpdate(atmosphere, (store) => {
          const reflection = store.get(reflectionId)
          if (!reflection) return
          reflection.setValue(false, 'isEditing')
        })
      }
      return
    }
    const contentState = editorState.getCurrentContent()
    if (contentState.hasText()) {
      const nextContent = JSON.stringify(convertToRaw(contentState))
      if (content === nextContent) return
      submitMutation()
      UpdateReflectionContentMutation(
        atmosphere,
        {content: nextContent, reflectionId},
        {onError, onCompleted}
      )
      commitLocalUpdate(atmosphere, (store) => {
        const reflection = store.get(reflectionId)
        if (!reflection) return
        reflection.setValue(false, 'isEditing')
      })
    } else {
      submitMutation()
      RemoveReflectionMutation(atmosphere, {reflectionId}, {meetingId, onError, onCompleted})
    }
  }

  const handleEditorBlur = () => {
    if (isTempId(reflectionId)) return
    handleContentUpdate()
    EditReflectionMutation(atmosphere, {isEditing: false, meetingId, phaseItemId: retroPhaseItemId})
  }

  const handleReturn = (e) => {
    if (e.shiftKey) return 'not-handled'
    editorRef.current && editorRef.current.blur()
    return 'handled'
  }

  const handleKeyDownFallback = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      editorRef.current && editorRef.current.blur()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const {value} = e.currentTarget
      if (!value) return
      editorRef.current && editorRef.current.blur()
    }
  }

  const readOnly = getReadOnly(reflection, phaseType as NewMeetingPhaseTypeEnum, stackCount, phases)
  const userSelect = readOnly
    ? phaseType === NewMeetingPhaseTypeEnum.discuss
      ? 'text'
      : 'none'
    : undefined

  const onToggleReactji = (emojiId: string) => {
    if (submitting) return
    const isRemove = !!reactjis.find((reactji) => {
      return reactji.isViewerReactji && reactji.id.split(':')[1] === emojiId
    })
    submitMutation()
    AddReactjiToReflectionMutation(
      atmosphere,
      {reflectionId, isRemove, reactji: emojiId},
      {onCompleted, onError}
    )
  }

  const clearError = () => {
    onCompleted()
  }
  return (
    <ReflectionCardRoot>
      {showOriginFooter && !isClipped && <ReflectionCardFooter>{question}</ReflectionCardFooter>}
      <ReflectionEditorWrapper
        isClipped={isClipped}
        ariaLabel='Edit this reflection'
        editorRef={editorRef}
        editorState={editorState}
        onBlur={handleEditorBlur}
        onFocus={handleEditorFocus}
        handleReturn={handleReturn}
        handleKeyDownFallback={handleKeyDownFallback}
        placeholder={isViewerCreator ? 'My reflection… (press enter to add)' : '*New Reflection*'}
        readOnly={readOnly}
        setEditorState={setEditorState}
        userSelect={userSelect}
      />
      {error && <StyledError onClick={clearError}>{error.message}</StyledError>}
      {!readOnly && (
        <ReflectionCardDeleteButton meetingId={meetingId} reflectionId={reflectionId} />
      )}
      {showReactji && <ReactjiSection reactjis={reactjis} onToggle={onToggleReactji} />}
    </ReflectionCardRoot>
  )
}

export default createFragmentContainer(ReflectionCard, {
  reflection: graphql`
    fragment ReflectionCard_reflection on RetroReflection {
      isViewerCreator
      id
      isEditing
      meetingId
      reflectionGroupId
      retroPhaseItemId
      content
      phaseItem {
        question
      }
      reactjis {
        ...ReactjiSection_reactjis
        id
        isViewerReactji
      }
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
        stages {
          id
          isComplete
        }
      }
    }
  `
})
