import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '../../../hooks/useCoords'
import useTooltip from '../../../hooks/useTooltip'
import {NewMeetingCheckInGreeting_checkInGreeting$key} from '../../../__generated__/NewMeetingCheckInGreeting_checkInGreeting.graphql'
import {NewMeetingCheckInGreeting_teamMember$key} from '../../../__generated__/NewMeetingCheckInGreeting_teamMember.graphql'

const GreetingBlock = styled('div')({
  fontSize: '1.5rem',
  textAlign: 'center',
  overflowWrap: 'break-word',
  width: 'auto'
})

const GreetingSpan = styled('span')({
  borderBottom: '.0625rem dashed currentColor',
  color: 'inherit',
  cursor: 'help',
  fontStyle: 'italic'
})

interface Props {
  teamMember: NewMeetingCheckInGreeting_teamMember$key
  checkInGreeting: NewMeetingCheckInGreeting_checkInGreeting$key
}
const NewMeetingCheckInGreeting = (props: Props) => {
  const {teamMember: teamMemberRef, checkInGreeting: checkInGreetingRef} = props
  const teamMember = useFragment(
    graphql`
      fragment NewMeetingCheckInGreeting_teamMember on TeamMember {
        preferredName
      }
    `,
    teamMemberRef
  )
  const checkInGreeting = useFragment(
    graphql`
      fragment NewMeetingCheckInGreeting_checkInGreeting on MeetingGreeting {
        content
        language
      }
    `,
    checkInGreetingRef
  )
  const {content, language} = checkInGreeting
  const {preferredName} = teamMember
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip(
    MenuPosition.UPPER_CENTER,
    {delay: 0}
  )
  return (
    <GreetingBlock>
      <GreetingSpan ref={originRef} onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
        {content}
      </GreetingSpan>
      {`, ${preferredName || 'Unknown user'}:`}
      {tooltipPortal(<div>{`${content} means “hello” in ${language}`}</div>)}
    </GreetingBlock>
  )
}

export default NewMeetingCheckInGreeting
