import Avatar from '../../Avatar/Avatar'

const MAX_NAMES = 2

interface Props {
  members: readonly {id: string; preferredName: string; picture: string}[]
  isEnded: boolean
}

const TeamPromptMobileWaitingRow = ({members, isEnded}: Props) => {
  if (members.length === 0) return null
  const names = members.slice(0, MAX_NAMES).map((member) => member.preferredName)
  const otherCount = members.length - names.length
  const subject =
    otherCount > 0
      ? `${names.join(', ')} and ${otherCount} ${otherCount === 1 ? 'other' : 'others'}`
      : names.join(' and ')
  const isSingular = members.length === 1
  const status = isEnded ? "didn't share" : isSingular ? "hasn't shared yet" : "haven't shared yet"
  return (
    <div className='flex items-center gap-2 px-1 text-fg-secondary text-sm'>
      <div className='flex shrink-0'>
        {members.slice(0, 3).map((member) => (
          <Avatar
            key={member.id}
            picture={member.picture}
            className='-ml-2 h-6 w-6 opacity-55 first:ml-0'
          />
        ))}
      </div>
      <span className='min-w-0'>
        {subject} {status}
      </span>
    </div>
  )
}

export default TeamPromptMobileWaitingRow
