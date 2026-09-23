import {cn} from '../../../ui/cn'
import Avatar from '../../Avatar/Avatar'
import {TEAM_UPDATES_COLUMN} from './teamUpdatesLayout'

interface Props {
  preferredName: string
  picture: string
  isEnded: boolean
  isPhone?: boolean
}

const TeamPromptWaitingCard = (props: Props) => {
  const {preferredName, picture, isEnded, isPhone} = props
  const title = isEnded ? 'No response' : "Hasn't shared yet"
  return (
    <div className={cn(TEAM_UPDATES_COLUMN, 'flex flex-col')}>
      <div className='mb-3 flex items-center gap-2 px-2'>
        <Avatar
          picture={picture}
          className={cn('shrink-0 opacity-55', isPhone ? 'h-9 w-9' : 'h-12 w-12')}
        />
        <h3
          className={cn(
            'm-0 min-w-0 truncate font-semibold',
            isPhone ? 'text-[15px]' : 'text-base'
          )}
        >
          {preferredName}
        </h3>
      </div>
      <div className='flex min-h-[92px] flex-col justify-center gap-1 rounded-card bg-surface-well p-4'>
        <div className='flex items-center gap-2 font-semibold text-sm'>{title}</div>
        {!isEnded && (
          <div className='text-fg-primary text-xs'>
            You'll see {preferredName}'s update when they share it
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamPromptWaitingCard
