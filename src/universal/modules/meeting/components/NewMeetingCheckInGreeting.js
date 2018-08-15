// @flow
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import styled from 'react-emotion'

import type {NewMeetingCheckInGreeting_teamMember as TeamMember} from './__generated__/NewMeetingCheckInGreeting_teamMember.graphql'
// eslint-disable-next-line max-len
import type {NewMeetingCheckInGreeting_checkInGreeting as CheckInGreeting} from './__generated__/NewMeetingCheckInGreeting_checkInGreeting.graphql'

const GreetingBlock = styled('div')({
  fontSize: '1.5rem',
  textAlign: 'center'
})

const GreetingSpan = styled('span')({
  borderBottom: '.0625rem dashed currentColor',
  color: 'inherit',
  cursor: 'help',
  fontStyle: 'italic'
})

type Props = {
  teamMember: TeamMember,
  checkInGreeting: CheckInGreeting
}
const NewMeetingCheckInGreeting = (props: Props) => {
  const {teamMember, checkInGreeting} = props
  const {content, language} = checkInGreeting
  const {preferredName} = teamMember
  return (
    <GreetingBlock>
      <GreetingSpan title={`${content} means “hello” in ${language}`}>{content}</GreetingSpan>
      {`, ${preferredName || 'Unknown user'}:`}
    </GreetingBlock>
  )
}

export default createFragmentContainer(
  NewMeetingCheckInGreeting,
  graphql`
    fragment NewMeetingCheckInGreeting_teamMember on TeamMember {
      preferredName
    }

    fragment NewMeetingCheckInGreeting_checkInGreeting on MeetingGreeting {
      content
      language
    }
  `
)
