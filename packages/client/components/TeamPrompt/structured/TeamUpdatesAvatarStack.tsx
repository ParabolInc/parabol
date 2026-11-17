import Avatar from '../../Avatar/Avatar'

export const MAX_SHARED_AVATARS = 4

interface Member {
  id: string
  preferredName: string
  picture: string
}

interface Props {
  members: readonly Member[]
}

const TeamUpdatesAvatarStack = ({members}: Props) => {
  if (members.length === 0) return null
  const visible = members.slice(0, MAX_SHARED_AVATARS)
  const hidden = members.slice(MAX_SHARED_AVATARS)
  return (
    <div className='flex items-center'>
      {visible.map((member, idx) => (
        <Avatar
          key={member.id}
          picture={member.picture}
          alt={member.preferredName}
          className={
            idx === 0
              ? 'h-7 w-7 border-2 border-surface-card'
              : '-ml-2 h-7 w-7 border-2 border-surface-card'
          }
        />
      ))}
      {hidden.length > 0 && (
        <div
          className='-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface-card bg-surface-well font-semibold text-[11px] text-fg-secondary'
          title={hidden.map((member) => member.preferredName).join(', ')}
        >
          +{hidden.length}
        </div>
      )}
    </div>
  )
}

export default TeamUpdatesAvatarStack
