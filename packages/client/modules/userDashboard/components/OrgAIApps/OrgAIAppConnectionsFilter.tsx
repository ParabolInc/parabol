import filterPillClass from '../../../../ui/filterPillClass'
import {Input} from '../../../../ui/Input/Input'

export type AIAppStatusFilter = 'all' | 'verified' | 'unverified'

const OPTIONS = [
  {value: 'all', label: 'All'},
  {value: 'verified', label: 'Verified'},
  {value: 'unverified', label: 'Unverified'}
] as const

interface Props {
  counts: Record<AIAppStatusFilter, number>
  status: AIAppStatusFilter
  onStatusChange: (status: AIAppStatusFilter) => void
  filter: string
  onFilterChange: (filter: string) => void
}

const OrgAIAppConnectionsFilter = (props: Props) => {
  const {counts, status, onStatusChange, filter, onFilterChange} = props
  return (
    <div className='flex flex-wrap items-center gap-2 border-hairline border-t px-4 py-2'>
      <div role='group' aria-label='Show connections' className='flex items-center gap-2'>
        {OPTIONS.map(({value, label}) => (
          <button
            key={value}
            type='button'
            aria-pressed={status === value}
            onClick={() => onStatusChange(value)}
            className={filterPillClass}
          >
            {label} · {counts[value]}
          </button>
        ))}
      </div>
      <Input
        type='search'
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder='Filter by member or app'
        aria-label='Filter by member or app'
        maxLength={100}
        className='ml-auto h-8 w-56 min-w-0'
      />
    </div>
  )
}

export default OrgAIAppConnectionsFilter
