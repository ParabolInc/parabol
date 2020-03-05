import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useEditorState from 'hooks/useEditorState'
import React, {useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {DiscussionThreadInput_meeting} from '__generated__/DiscussionThreadInput_meeting.graphql'
import Avatar from './Avatar/Avatar'
import CommentSendOrAdd from './CommentSendOrAdd'
import CommentEditor from './TaskEditor/CommentEditor'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const CommentAvatar = styled(Avatar)({
  margin: 12
})

interface Props {
  getMaxSortOrder: () => number
  meeting: DiscussionThreadInput_meeting
  reflectionGroupId: string
}

const DiscussionThreadInput = (props: Props) => {
  const {getMaxSortOrder, meeting, reflectionGroupId} = props
  const {teamId, viewerMeetingMember} = meeting
  const {user} = viewerMeetingMember
  const {picture} = user
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [editorState, setEditorState] = useEditorState()
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
  return (
    <Wrapper>
      <CommentAvatar size={32} picture={picture} onClick={toggleAnonymous} />
      <CommentEditor
        teamId={teamId}
        editorRef={editorRef}
        editorState={editorState}
        setEditorState={setEditorState}
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
      teamId
      viewerMeetingMember {
        user {
          picture
        }
      }
    }
  `
})
