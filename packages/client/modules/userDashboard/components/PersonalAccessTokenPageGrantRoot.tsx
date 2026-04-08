import {Suspense, useState} from 'react'
import type {PersonalAccessTokenPageGrantQuery} from '../../../__generated__/PersonalAccessTokenPageGrantQuery.graphql'
import query from '../../../__generated__/PersonalAccessTokenPageGrantQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import plural from '../../../utils/plural'
import {Loader} from '../../../utils/relay/renderLoader'
import type {PageResult} from './PageGrant'
import type {GrantModeOption} from './PersonalAccessTokenCreateDialog'
import {PersonalAccessTokenPageGrant} from './PersonalAccessTokenPageGrant'

const buildSummary = (
  selectedPageIds: Set<string>,
  orgGrantMode: GrantModeOption,
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

interface Props {
  selectedPageIds: Set<string>
  selectedPagesMap: Map<string, PageResult>
  togglePage: (page: PageResult) => void
  orgGrantMode: GrantModeOption
  selectedOrgIds: Set<string>
  selectedTeamIds: Set<string>
}

export const PersonalAccessTokenPageGrantRoot = ({
  selectedPageIds,
  selectedPagesMap,
  togglePage,
  orgGrantMode,
  selectedOrgIds,
  selectedTeamIds
}: Props) => {
  const [pageSearch, setPageSearch] = useState('')
  const queryRef = useQueryLoaderNow<PersonalAccessTokenPageGrantQuery>(query, {
    textFilter: pageSearch
  })
  const summary = buildSummary(selectedPageIds, orgGrantMode, selectedOrgIds, selectedTeamIds)

  return (
    <div className='flex flex-col gap-2'>
      <input
        type='text'
        value={pageSearch}
        onChange={(e) => setPageSearch(e.target.value)}
        placeholder='Search pages…'
        className='rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
      />
      <Suspense fallback={<Loader />}>
        {queryRef && (
          <PersonalAccessTokenPageGrant
            queryRef={queryRef}
            hasSearch={pageSearch.length > 0}
            selectedPageIds={selectedPageIds}
            selectedPagesMap={selectedPagesMap}
            togglePage={togglePage}
          />
        )}
      </Suspense>
      {summary && <p className='text-slate-500 text-xs'>{summary}</p>}
    </div>
  )
}
