import SearchIcon from '@mui/icons-material/Search'
import {useRef, useState} from 'react'
import type {SearchDateTypeEnum} from '../../__generated__/SearchDialogResultsQuery.graphql'
import {useDebouncedSearch} from '../../hooks/useDebouncedSearch'
import {ModIcon} from '../../utils/platform'
import {DateRange, DateRangeFilter} from './DateRangeFilter'
import {SearchDialogResultsRoot} from './SearchDialogResultsRoot'
import {TeamFilter} from './TeamFilter'

export type ResultsListRefHandler = {onKeyDown: (e: React.KeyboardEvent) => boolean}

interface Props {
  closeSearch: () => void
}

export const SearchDialogContent = (props: Props) => {
  const {closeSearch} = props
  const [dateField, setDateField] = useState<SearchDateTypeEnum>('updatedAt')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [teamIds, setTeamIds] = useState<string[]>([])
  const [inputQuery, setInputQuery] = useState('')
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setInputQuery(value)
  }
  const {debouncedSearch} = useDebouncedSearch(inputQuery)
  const resultsListRef = useRef<ResultsListRefHandler>(null)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    resultsListRef.current?.onKeyDown(e)
  }

  return (
    <>
      <div className='flex items-center px-2 py-2'>
        <SearchIcon
          data-dirty={inputQuery ? '' : undefined}
          className='mr-3 text-slate-500 data-dirty:text-slate-700'
          sx={{fontSize: 22}}
        />{' '}
        <input
          autoFocus
          name='search'
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className='flex-1 bg-transparent font-light text-lg outline-none placeholder:text-slate-500'
          placeholder='Search pages…'
          type='text'
          autoComplete='off'
        />
      </div>
      <div className='space-x-1 px-2 pb-2'>
        <DateRangeFilter
          dateField={dateField}
          setDateField={setDateField}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        <TeamFilter teamIds={teamIds} setTeamIds={setTeamIds} />
      </div>
      {/* Results Area */}
      <div className='max-h-[400px] overflow-y-auto px-2 pb-1' tabIndex={-1}>
        <section className='relative'>
          <SearchDialogResultsRoot
            resultsListRef={resultsListRef}
            searchQuery={debouncedSearch}
            closeSearch={closeSearch}
            dateField={dateField}
            dateRange={dateRange}
            teamIds={teamIds}
          />
        </section>
      </div>
      {/* Footer */}
      <div className='flex items-center justify-between border-slate-100 border-t px-4 py-2.5 text-[11px] text-slate-500'>
        <div className='flex items-center gap-4'>
          <span className='flex items-center gap-1'>
            <ModIcon sx={{fontSize: 12}} /> + Enter to open in new tab
          </span>
          <span className='flex items-center gap-1'>
            <span className='rounded border bg-white px-1'>↑↓</span> to navigate
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='rounded bg-blue-50 px-1.5 py-0.5 font-medium text-blue-600'>
            Hybrid Search
            <span className='align-super font-semibold text-[8px]'>BETA</span>
          </span>
        </div>
      </div>
    </>
  )
}
