import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {MeetingSeriesManager_user$key} from '../__generated__/MeetingSeriesManager_user.graphql'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import Avatar from './Avatar/Avatar'

interface Props {
  userRef: MeetingSeriesManager_user$key
}

const MeetingSeriesManager = (props: Props) => {
  const {userRef} = props
  const user = useFragment(
    graphql`
      fragment MeetingSeriesManager_user on User {
        preferredName
        picture
      }
    `,
    userRef
  )
  const {preferredName, picture} = user
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className='flex w-fit items-center gap-1 text-fg-muted text-xs'>
          <Avatar picture={picture} alt={preferredName} className='size-5' />
          <span className='truncate'>{preferredName}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side='bottom'>{`${preferredName} manages this meeting series`}</TooltipContent>
    </Tooltip>
  )
}

export default MeetingSeriesManager
