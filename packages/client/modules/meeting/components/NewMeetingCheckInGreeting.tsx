import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {NewMeetingCheckInGreeting_checkInGreeting$key} from '../../../__generated__/NewMeetingCheckInGreeting_checkInGreeting.graphql'
import {NewMeetingCheckInGreeting_user$key} from '../../../__generated__/NewMeetingCheckInGreeting_user.graphql'
import {MenuPosition} from '../../../hooks/useCoords'
import useTooltip from '../../../hooks/useTooltip'

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
  userRef: NewMeetingCheckInGreeting_user$key
  checkInGreetingRef: NewMeetingCheckInGreeting_checkInGreeting$key
}
const NewMeetingCheckInGreeting = (props: Props) => {
  const {userRef, checkInGreetingRef} = props
  const user = useFragment(
    graphql`
      fragment NewMeetingCheckInGreeting_user on User {
        preferredName
      }
    `,
    userRef
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
  const {preferredName} = user
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
