import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {DiscussionThreadList_threadables} from '__generated__/DiscussionThreadList_threadables.graphql'
import Avatar from './Avatar/Avatar'

const Wrapper = styled('div')({})

interface Props {
  threadables: DiscussionThreadList_threadables
}

const DiscussionThreadInput = (props: Props) => {
  const {meeting} = props
  const {viewerMeetingMember} = meeting
  const {user} = viewerMeetingMember
  const {picture} = user
  // const [isAnonymous] = useState(false)
  // const value = ''
  // const placeholder = isAnonymous ? 'Comment anonymously' : 'Comment publically'
  return (
    <Wrapper>
      <Avatar src={picture} />
    </Wrapper>
  )
}

export default createFragmentContainer(DiscussionThreadInput, {
  meeting: graphql`
    fragment DiscussionThreadInput_meeting on RetrospectiveMeeting {
      viewerMeetingMember {
        user {
          picture
        }
      }
    }
  `
})
