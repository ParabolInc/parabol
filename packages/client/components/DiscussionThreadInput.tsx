import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {DiscussionThreadList_threadables} from '__generated__/DiscussionThreadList_threadables.graphql'
import Avatar from './Avatar/Avatar'
import CommentEditor from './TaskEditor/CommentEditor'
import useEditorState from 'hooks/useEditorState'

const Wrapper = styled('div')({})

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
  return (
    <Wrapper>
      <Avatar size={24} picture={picture} onClick={toggleAnonymous} />
      <CommentEditor
        teamId={teamId}
        editorRef={editorRef}
        editorState={editorState}
        setEditorState={setEditorState}
        placeholder={placeholder}
      />
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
