import {Search} from '../../ui/icons'

interface Props {
  query: string
  onQueryChange: (query: string) => void
}

const RetroTemplateSearch = ({query, onQueryChange}: Props) => (
  <div className='shrink-0 border-hairline border-b px-4 py-3'>
    <label className='flex h-9 items-center gap-2 rounded-md border border-hairline-field bg-surface-input px-2.5 text-fg-muted focus-within:border-accent'>
      <Search className='size-4 shrink-0' />
      <input
        type='search'
        aria-label='Search templates and prompts'
        placeholder='Search templates and prompts'
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        className='min-w-0 flex-1 border-none bg-transparent font-sans text-fg-primary text-sm outline-none placeholder:text-fg-muted'
      />
    </label>
  </div>
)

export default RetroTemplateSearch
