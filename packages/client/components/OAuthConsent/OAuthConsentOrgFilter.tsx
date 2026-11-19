import {Input} from '../../ui/Input/Input'

interface Props {
  orgCount: number
  blockedCount: number
  filter: string
  onFilterChange: (filter: string) => void
}

const OAuthConsentOrgFilter = ({orgCount, blockedCount, filter, onFilterChange}: Props) => (
  <div className='flex items-center gap-3'>
    <span className='whitespace-nowrap text-fg-secondary'>
      {orgCount} organizations
      {blockedCount > 0 && ` · ${blockedCount} block this app`}
    </span>
    <Input
      type='search'
      value={filter}
      onChange={(e) => onFilterChange(e.target.value)}
      placeholder='Filter organizations'
      aria-label='Filter organizations'
      maxLength={100}
      className='ml-auto h-9 w-56 min-w-0'
    />
  </div>
)

export default OAuthConsentOrgFilter
