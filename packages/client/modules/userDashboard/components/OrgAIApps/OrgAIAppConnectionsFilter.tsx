import {Input} from '../../../../ui/Input/Input'
import plural from '../../../../utils/plural'

interface Props {
  connectionCount: number
  memberCount: number
  filter: string
  onFilterChange: (filter: string) => void
}

const OrgAIAppConnectionsFilter = (props: Props) => {
  const {connectionCount, memberCount, filter, onFilterChange} = props
  return (
    <div className='flex items-center gap-3'>
      <span className='whitespace-nowrap text-fg-secondary'>
        {connectionCount} {plural(connectionCount, 'connection')} · {memberCount}{' '}
        {plural(memberCount, 'member')}
      </span>
      <Input
        type='search'
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder='Filter by member or app'
        aria-label='Filter by member or app'
        maxLength={100}
        className='h-9 w-56 min-w-0'
      />
    </div>
  )
}

export default OrgAIAppConnectionsFilter
