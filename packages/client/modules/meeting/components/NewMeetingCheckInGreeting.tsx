import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingCheckInGreeting_checkInGreeting$key} from '../../../__generated__/NewMeetingCheckInGreeting_checkInGreeting.graphql'
import type {NewMeetingCheckInGreeting_user$key} from '../../../__generated__/NewMeetingCheckInGreeting_user.graphql'
import {MenuPosition} from '../../../hooks/useCoords'
import useTooltip from '../../../hooks/useTooltip'

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
    <div className='w-auto break-words text-center text-[1.5rem]'>
      <span
        className='cursor-help border-current border-b border-dashed italic'
        ref={originRef}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
      >
        {content}
      </span>
      {`, ${preferredName || 'Unknown user'}:`}
      {tooltipPortal(<div>{`${content} means “hello” in ${language}`}</div>)}
    </div>
  )
}

export default NewMeetingCheckInGreeting
