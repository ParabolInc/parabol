import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useEditorState from 'hooks/useEditorState'
import React, {useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {DiscussionThreadList_threadables} from '__generated__/DiscussionThreadList_threadables.graphql'
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
  threadables: DiscussionThreadList_threadables
}

const DiscussionThreadInput = (props: Props) => {
  const {meeting} = props
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
  const hasText = editorState.getCurrentContent().hasText()
  const commentSubmitState = hasText ? 'send' : 'add'
  return (
    <Wrapper>
      <CommentAvatar size={32} picture={picture} onClick={toggleAnonymous} />
      <CommentEditor
        teamId={teamId}
        editorRef={editorRef}
        editorState={editorState}
        setEditorState={setEditorState}
        placeholder={placeholder}
      />
      <CommentSendOrAdd commentSubmitState={commentSubmitState} />
    </Wrapper>
  )
}

export default createFragmentContainer(DiscussionThreadInput, {
  meeting: graphql`
    fragment DiscussionThreadInput_meeting on RetrospectiveMeeting {
      teamId
      viewerMeetingMember {
        user {
          picture
        }
      }
    }
  `
})
