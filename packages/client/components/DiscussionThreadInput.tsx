import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {EditorState} from 'draft-js'
import useAtmosphere from 'hooks/useAtmosphere'
import useEditorState from 'hooks/useEditorState'
import useMutationProps from 'hooks/useMutationProps'
import AddCommentMutation from 'mutations/AddCommentMutation'
import React, {forwardRef, RefObject, useState} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import {Elevation} from 'styles/elevation'
import {ThreadSourceEnum} from 'types/graphql'
import {SORT_STEP} from 'utils/constants'
import dndNoise from 'utils/dndNoise'
import convertToTaskContent from 'utils/draftjs/convertToTaskContent'
import {DiscussionThreadInput_meeting} from '__generated__/DiscussionThreadInput_meeting.graphql'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import Avatar from './Avatar/Avatar'
import CommentSendOrAdd from './CommentSendOrAdd'
import CommentEditor from './TaskEditor/CommentEditor'

const Wrapper = styled('div')<{isReply: boolean; isDisabled: boolean}>(({isDisabled, isReply}) => ({
  alignItems: 'center',
  borderRadius: isReply ? '4px 0 0 4px' : undefined,
  display: 'flex',
  boxShadow: isReply ? Elevation.Z2 : Elevation.DISCUSSION_INPUT,
  opacity: isDisabled ? 0.5 : undefined,
  pointerEvents: isDisabled ? 'none' : undefined,
  // required for the shadow to overlay draft-js in the task cards
  zIndex: 0
}))

const CommentAvatar = styled(Avatar)({
  margin: 12,
  transition: 'all 150ms'
})

interface Props {
  editorRef: RefObject<HTMLTextAreaElement>
  getMaxSortOrder: () => number
  meeting: DiscussionThreadInput_meeting
  onSubmit: () => void
  reflectionGroupId: string
  isReply?: boolean
  isDisabled?: boolean
}

const DiscussionThreadInput = forwardRef((props: Props, ref: any) => {
  const {editorRef, getMaxSortOrder, meeting, onSubmit, reflectionGroupId} = props
  const isReply = !!props.isReply
  const isDisabled = !!props.isDisabled
  const {id: meetingId, isAnonymousComment, teamId, viewerMeetingMember} = meeting
  const {user} = viewerMeetingMember
  const {picture} = user

  const [editorState, setEditorState] = useEditorState()
  const atmosphere = useAtmosphere()
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()
  const placeholder = isAnonymousComment ? 'Comment anonymously' : 'Comment publically'
  const toggleAnonymous = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      meeting.setValue(!meeting.getValue('isAnonymousComment'), 'isAnonymousComment')
    })
  }
  const [canCollapse, setCanCollapse] = useState(isReply)
  const hasText = editorState.getCurrentContent().hasText()
  const commentSubmitState = hasText ? 'send' : canCollapse ? 'add' : 'addExpanded'
  const collapseAddTask = () => {
    if (!canCollapse) {
      setCanCollapse(true)
    }
  }

  const submitComment = (rawContent: string) => {
    if (submitting) return
    submitMutation()
    const comment = {
      content: rawContent,
      isAnonymousComment,
      meetingId,
      threadId: reflectionGroupId,
      threadSource: ThreadSourceEnum.REFLECTION_GROUP,
      threadSortOrder: getMaxSortOrder() + SORT_STEP + dndNoise()
    }
    AddCommentMutation(atmosphere, {comment}, {onError, onCompleted})
    // move focus to end is very important! otherwise ghost chars appear
    setEditorState(EditorState.moveFocusToEnd(EditorState.createEmpty()))
    onSubmit()
  }

  const handleSubmitFallback = () => {
    const editorEl = editorRef.current
    if (!editorEl || editorEl.type !== 'textarea') return
    const {value} = editorEl
    if (!value) return
    submitComment(convertToTaskContent(value))
  }

  const avatar = isAnonymousComment ? anonymousAvatar : picture
  return (
    <Wrapper ref={ref} isReply={isReply} isDisabled={isDisabled}>
      <CommentAvatar size={32} picture={avatar} onClick={toggleAnonymous} />
      <CommentEditor
        teamId={teamId}
        editorRef={editorRef}
        editorState={editorState}
        handleSubmitFallback={handleSubmitFallback}
        setEditorState={setEditorState}
        submitComment={submitComment}
        placeholder={placeholder}
        onFocus={collapseAddTask}
      />
      <CommentSendOrAdd
        getMaxSortOrder={getMaxSortOrder}
        commentSubmitState={commentSubmitState}
        meeting={meeting}
        reflectionGroupId={reflectionGroupId}
        collapseAddTask={collapseAddTask}
      />
    </Wrapper>
  )
})

export default createFragmentContainer(DiscussionThreadInput, {
  meeting: graphql`
    fragment DiscussionThreadInput_meeting on RetrospectiveMeeting {
      ...CommentSendOrAdd_meeting
      id
      isAnonymousComment
      teamId
      viewerMeetingMember {
        user {
          picture
        }
      }
    }
  `
})
