import {NewMeetingCheckInGreeting_checkInGreeting} from '../../../__generated__/NewMeetingCheckInGreeting_checkInGreeting.graphql'
import {NewMeetingCheckInGreeting_teamMember} from '../../../__generated__/NewMeetingCheckInGreeting_teamMember.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'

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

interface Props {
  teamMember: NewMeetingCheckInGreeting_teamMember
  checkInGreeting: NewMeetingCheckInGreeting_checkInGreeting
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

export default createFragmentContainer(NewMeetingCheckInGreeting, {
  teamMember: graphql`
    fragment NewMeetingCheckInGreeting_teamMember on TeamMember {
      preferredName
    }
  `,
  checkInGreeting: graphql`
    fragment NewMeetingCheckInGreeting_checkInGreeting on MeetingGreeting {
      content
      language
    }
  `
})
