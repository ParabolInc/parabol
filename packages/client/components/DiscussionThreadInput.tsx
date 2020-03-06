import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {EditorState} from 'draft-js'
import useAtmosphere from 'hooks/useAtmosphere'
import useEditorState from 'hooks/useEditorState'
import useMutationProps from 'hooks/useMutationProps'
import AddCommentMutation from 'mutations/AddCommentMutation'
import React, {useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ThreadSourceEnum} from 'types/graphql'
import {SORT_STEP} from 'utils/constants'
import dndNoise from 'utils/dndNoise'
import convertToTaskContent from 'utils/draftjs/convertToTaskContent'
import {DiscussionThreadInput_meeting} from '__generated__/DiscussionThreadInput_meeting.graphql'
import Avatar from './Avatar/Avatar'
import CommentSendOrAdd from './CommentSendOrAdd'
import CommentEditor from './TaskEditor/CommentEditor'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const CommentAvatar = styled(Avatar)({
  margin: 12,
  transition: 'all 150ms'
})

interface Props {
  getMaxSortOrder: () => number
  meeting: DiscussionThreadInput_meeting
  onSubmit: () => void
  reflectionGroupId: string
}

const DiscussionThreadInput = (props: Props) => {
  const {getMaxSortOrder, meeting, onSubmit, reflectionGroupId} = props
  const {id: meetingId, teamId, viewerMeetingMember} = meeting
  const {user} = viewerMeetingMember
  const {picture} = user
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [editorState, setEditorState] = useEditorState()
  const atmosphere = useAtmosphere()
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()
  const placeholder = isAnonymous ? 'Comment anonymously' : 'Comment publically'
  const toggleAnonymous = () => {
    setIsAnonymous(!isAnonymous)
  }
  const [canCollapse, setCanCollapse] = useState(false)
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
      isAnonymous,
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

  const avatar = isAnonymous ? anonymousAvatar : picture
  return (
    <Wrapper>
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
}

export default createFragmentContainer(DiscussionThreadInput, {
  meeting: graphql`
    fragment DiscussionThreadInput_meeting on RetrospectiveMeeting {
      ...CommentSendOrAdd_meeting
      id
      teamId
      viewerMeetingMember {
        user {
          picture
        }
      }
    }
  `
})
