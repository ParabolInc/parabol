import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import plural from '~/utils/plural'
import {Checkbox} from '../../../ui/Checkbox/Checkbox'
import {cn} from '../../../ui/cn'
import {RadioGroup, RadioGroupItem} from '../../../ui/RadioGroup/RadioGroup'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'

export interface PageResult {
  id: string
  title: string | null
}

interface Props {
  enabled: boolean
  pageGrantMode: 'all' | 'custom'
  setPageGrantMode: (mode: 'all' | 'custom') => void
  pageSearch: string
  setPageSearch: (search: string) => void
  pageResults: PageResult[]
  selectedPageIds: Set<string>
  selectedPagesMap: Map<string, PageResult>
  togglePage: (page: PageResult) => void
  orgGrantMode: 'all' | 'custom'
  selectedOrgIds: Set<string>
  selectedTeamIds: Set<string>
}

const buildSummary = (
  selectedPageIds: Set<string>,
  orgGrantMode: 'all' | 'custom',
  selectedOrgIds: Set<string>,
  selectedTeamIds: Set<string>
): string | null => {
  const parts: string[] = []
  if (selectedPageIds.size > 0) {
    parts.push(`${selectedPageIds.size} ${plural(selectedPageIds.size, 'page')} selected`)
  }
  if (orgGrantMode === 'all') {
    parts.push('all pages under all orgs and teams')
  } else if (selectedOrgIds.size > 0 || selectedTeamIds.size > 0) {
    const grantParts: string[] = []
    if (selectedOrgIds.size > 0)
      grantParts.push(`${selectedOrgIds.size} ${plural(selectedOrgIds.size, 'org')}`)
    if (selectedTeamIds.size > 0)
      grantParts.push(`${selectedTeamIds.size} ${plural(selectedTeamIds.size, 'team')}`)
    parts.push(`all pages under ${grantParts.join(' and ')}`)
  }
  return parts.length > 0 ? parts.join(' + ') : null
}

export const PageGrant = ({
  enabled,
  pageGrantMode,
  setPageGrantMode,
  pageSearch,
  setPageSearch,
  pageResults,
  selectedPageIds,
  selectedPagesMap,
  togglePage,
  orgGrantMode,
  selectedOrgIds,
  selectedTeamIds
}: Props) => {
  const summary = buildSummary(selectedPageIds, orgGrantMode, selectedOrgIds, selectedTeamIds)

  const resultsById = new Map(pageResults.map((p) => [p.id, p]))
  const selectedNotInResults = [...selectedPagesMap.values()].filter((p) => !resultsById.has(p.id))
  const sortedResults = [...pageResults].sort((a, b) => {
    return (selectedPageIds.has(a.id) ? 0 : 1) - (selectedPageIds.has(b.id) ? 0 : 1)
  })
  const displayList = [...selectedNotInResults, ...sortedResults]

  return (
    <Tooltip>
      {!enabled && (
        <TooltipTrigger asChild>
          <InfoOutlinedIcon
            className='pointer-events-auto cursor-default text-slate-400 opacity-100'
            style={{fontSize: 16}}
          />
        </TooltipTrigger>
      )}
      <div className={cn('flex flex-col gap-2', !enabled && 'pointer-events-none opacity-40')}>
        <div className='flex items-center gap-2'>
          <span className='font-medium text-slate-700 text-sm'>Pages</span>
          <RadioGroup
            value={pageGrantMode}
            onValueChange={(v) => setPageGrantMode(v as 'all' | 'custom')}
            className='flex flex-row gap-3'
          >
            <label className='flex cursor-pointer select-none items-center gap-1 text-slate-600 text-xs'>
              <RadioGroupItem value='all' />
              All
            </label>
            <label className='flex cursor-pointer select-none items-center gap-1 text-slate-600 text-xs'>
              <RadioGroupItem value='custom' />
              Custom
            </label>
          </RadioGroup>
        </div>
        {pageGrantMode === 'custom' && (
          <div className='flex flex-col gap-2'>
            <input
              type='text'
              value={pageSearch}
              onChange={(e) => setPageSearch(e.target.value)}
              placeholder='Search pages…'
              className='rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
            />
            <div className='max-h-40 overflow-y-auto rounded-md border border-slate-200'>
              {displayList.length === 0 ? (
                <p className='p-3 text-slate-500 text-sm'>
                  {pageSearch ? 'No pages found' : 'Type to search pages'}
                </p>
              ) : (
                displayList.map((page) => (
                  <label
                    key={page.id}
                    className='flex cursor-pointer select-none items-center gap-2 border-slate-100 border-b px-3 py-2 last:border-0 hover:bg-slate-50'
                  >
                    <Checkbox
                      checked={selectedPageIds.has(page.id)}
                      onCheckedChange={() => togglePage(page)}
                    />
                    <span className='text-slate-700 text-sm'>{page.title ?? '(Untitled)'}</span>
                  </label>
                ))
              )}
            </div>
            {summary && <p className='text-slate-500 text-xs'>{summary}</p>}
          </div>
        )}
      </div>
      {!enabled && <TooltipContent>Select a Pages scope to restrict by page</TooltipContent>}
    </Tooltip>
  )
}
