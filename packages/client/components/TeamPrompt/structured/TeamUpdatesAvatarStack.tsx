import {cn} from '../../../ui/cn'
import Avatar from '../../Avatar/Avatar'

export const MAX_SHARED_AVATARS = 4

interface Member {
  id: string
  preferredName: string
  picture: string
}

interface Props {
  members: readonly Member[]
  size?: 'md' | 'sm'
}

const TeamUpdatesAvatarStack = ({members, size = 'md'}: Props) => {
  if (members.length === 0) return null
  const visible = members.slice(0, MAX_SHARED_AVATARS)
  const hidden = members.slice(MAX_SHARED_AVATARS)
  const sizeClassName = size === 'sm' ? 'h-6 w-6' : 'h-7 w-7'
  return (
    <div className='flex items-center'>
      {visible.map((member, idx) => (
        <Avatar
          key={member.id}
          picture={member.picture}
          alt={member.preferredName}
          className={cn(sizeClassName, 'border-2 border-surface-card', idx > 0 && '-ml-2')}
        />
      ))}
      {hidden.length > 0 && (
        <div
          className={cn(
            '-ml-2 flex items-center justify-center rounded-full border-2 border-surface-card bg-surface-well font-semibold text-fg-secondary',
            sizeClassName,
            size === 'sm' ? 'text-[10px]' : 'text-[11px]'
          )}
          title={hidden.map((member) => member.preferredName).join(', ')}
        >
          +{hidden.length}
        </div>
      )}
    </div>
  )
}

export default TeamUpdatesAvatarStack
