import {cn} from '../ui/cn'
import Avatar from './Avatar/Avatar'

interface Props {
  isReply: boolean | undefined
  picture: string | null
}

const ThreadedAvatarColumn = (props: Props) => {
  const {picture, isReply} = props
  return (
    <div className={cn('flex pr-2', !isReply && 'pl-3')}>
      <Avatar picture={picture} className='h-8 w-8' />
    </div>
  )
}

export default ThreadedAvatarColumn
