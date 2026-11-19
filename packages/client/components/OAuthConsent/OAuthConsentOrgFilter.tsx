import {Search} from '../../ui/icons'

interface Props {
  orgCount: number
  blockedCount: number
  filter: string
  onFilterChange: (filter: string) => void
}

const OAuthConsentOrgFilter = ({orgCount, blockedCount, filter, onFilterChange}: Props) => (
  <div className='mt-2 flex items-center gap-3'>
    <span className='whitespace-nowrap text-[13px] text-fg-secondary leading-[18px]'>
      {orgCount} organizations
      {blockedCount > 0 && ` · ${blockedCount} block this app`}
    </span>
    <label className='ml-auto flex h-9 w-[220px] min-w-0 shrink items-center gap-1.5 rounded-md border border-hairline-field bg-surface-input px-2.5 text-fg-muted focus-within:border-accent'>
      <Search className='text-lg' />
      <input
        type='search'
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder='Filter organizations'
        aria-label='Filter organizations'
        maxLength={100}
        className='min-w-0 flex-1 border-0 bg-transparent text-fg-primary text-sm outline-0 placeholder:text-fg-muted'
      />
    </label>
  </div>
)

export default OAuthConsentOrgFilter
