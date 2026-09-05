import {Check} from '~/ui/icons'
import {Button} from '../../../../ui/Button/Button'
import Avatar from '../../../Avatar/Avatar'
import TeamPromptLastUpdatedTime from '../../TeamPromptLastUpdatedTime'

interface Props {
  picture: string
  sharedAt: string | null
  updatedAt: string | null
  isEnded: boolean
  onEdit: () => void
}

const TeamPromptOwnUpdateRow = (props: Props) => {
  const {picture, sharedAt, updatedAt, isEnded, onEdit} = props
  return (
    <div className='flex h-[52px] items-center gap-2 border-hairline border-b border-solid bg-surface-card px-3'>
      <Avatar picture={picture} className='h-7 w-7' />
      <h3 className='m-0 font-semibold text-sm'>Your update</h3>
      {sharedAt && (
        <div className='flex min-w-0 items-center gap-1 text-fg-muted text-xs'>
          <Check className='h-4 w-4 shrink-0 text-jade-600' />
          shared{' '}
          <TeamPromptLastUpdatedTime createdAt={sharedAt} updatedAt={updatedAt ?? sharedAt} />
        </div>
      )}
      {!isEnded && (
        <Button
          variant='flat'
          onClick={onEdit}
          className='ml-auto h-11 min-w-11 px-2 font-semibold text-accent text-sm'
        >
          Edit
        </Button>
      )}
    </div>
  )
}

export default TeamPromptOwnUpdateRow
