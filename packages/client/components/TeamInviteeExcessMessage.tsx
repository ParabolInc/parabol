import {formatNewTeamInviteeExcess} from '../shared/teamInvitees'
import {Error as ErrorIcon} from '../ui/icons'

interface Props {
  excess: number
}

const TeamInviteeExcessMessage = (props: Props) => {
  const {excess} = props
  return (
    <div role='status'>
      {excess > 0 && (
        <div className='mt-2 flex items-start gap-1 text-fg-error text-xs leading-4'>
          <ErrorIcon className='mt-px shrink-0 text-lg' />
          <span>{formatNewTeamInviteeExcess(excess)}</span>
        </div>
      )}
    </div>
  )
}

export default TeamInviteeExcessMessage
