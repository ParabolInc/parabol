import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {PersonalAccessTokenPageGrantQuery} from '../../../__generated__/PersonalAccessTokenPageGrantQuery.graphql'
import {Checkbox} from '../../../ui/Checkbox/Checkbox'
import type {PageResult} from './PageGrant'

const query = graphql`
  query PersonalAccessTokenPageGrantQuery($textFilter: String!) {
    viewer {
      pages(first: 20, textFilter: $textFilter) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<PersonalAccessTokenPageGrantQuery>
  hasSearch: boolean
  selectedPageIds: Set<string>
  selectedPagesMap: Map<string, PageResult>
  togglePage: (page: PageResult) => void
}

export const PersonalAccessTokenPageGrant = ({
  queryRef,
  hasSearch,
  selectedPageIds,
  selectedPagesMap,
  togglePage
}: Props) => {
  const data = usePreloadedQuery<PersonalAccessTokenPageGrantQuery>(query, queryRef)
  const pageResults = (data.viewer?.pages?.edges ?? [])
    .map((e) => e?.node)
    .filter((n): n is PageResult => n != null)

  const resultsById = new Map(pageResults.map((p) => [p.id, p]))
  const selectedNotInResults = [...selectedPagesMap.values()].filter((p) => !resultsById.has(p.id))
  const sortedResults = [...pageResults].sort(
    (a, b) => (selectedPageIds.has(a.id) ? 0 : 1) - (selectedPageIds.has(b.id) ? 0 : 1)
  )
  const displayList = [...selectedNotInResults, ...sortedResults]

  return (
    <div className='max-h-40 overflow-y-auto rounded-md border border-hairline'>
      {displayList.length === 0 ? (
        <p className='p-3 text-fg-muted text-sm'>
          {hasSearch ? 'No pages found' : 'Type to search pages'}
        </p>
      ) : (
        displayList.map((page) => (
          <label
            key={page.id}
            className='flex cursor-pointer select-none items-center gap-2 border-hairline border-b px-3 py-2 last:border-0 hover:bg-surface-hover'
          >
            <Checkbox
              checked={selectedPageIds.has(page.id)}
              onCheckedChange={() => togglePage(page)}
            />
            <span className='text-fg-primary text-sm'>{page.title ?? '(Untitled)'}</span>
          </label>
        ))
      )}
    </div>
  )
}
