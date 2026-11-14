import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingCheckInGreeting_checkInGreeting$key} from '../../../__generated__/NewMeetingCheckInGreeting_checkInGreeting.graphql'
import type {NewMeetingCheckInGreeting_user$key} from '../../../__generated__/NewMeetingCheckInGreeting_user.graphql'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'

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
  return (
    <div className='w-auto break-words text-center text-[1.5rem]'>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <span className='cursor-help border-current border-b border-dashed italic'>
            {content}
          </span>
        </TooltipTrigger>
        <TooltipContent side='bottom'>{`${content} means “hello” in ${language}`}</TooltipContent>
      </Tooltip>
      {`, ${preferredName || 'Unknown user'}:`}
    </div>
  )
}

export default NewMeetingCheckInGreeting
