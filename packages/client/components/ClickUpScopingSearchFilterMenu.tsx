import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import type {ClickUpScopingSearchFilterMenuQuery} from '../__generated__/ClickUpScopingSearchFilterMenuQuery.graphql'
import useSetScopingSearchState from '../hooks/useSetScopingSearchState'
import {
  getClickUpLists,
  getUnavailableClickUpListIds,
  getUnavailableClickUpListLabel,
  getVisibleClickUpLists
} from '../integrations/clickup/clickUpLists'
import {
  searchFiltersByKey,
  toggleSearchFilter
} from '../integrations/platform/IntegrationSearchFilter'
import type {ScopingSearchState} from '../integrations/platform/ScopingSearchState'
import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import Checkbox from './Checkbox'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  meetingId: string
  state: ScopingSearchState
  queryRef: PreloadedQuery<ClickUpScopingSearchFilterMenuQuery>
}

const MAX_LISTS = 10

const getValue = (list: {name: string}) => list.name

const ClickUpScopingSearchFilterMenu = (props: Props) => {
  const {meetingId, state, queryRef} = props
  const data = usePreloadedQuery<ClickUpScopingSearchFilterMenuQuery>(
    graphql`
      query ClickUpScopingSearchFilterMenuQuery($teamId: ID!) {
        viewer {
          teamMember(teamId: $teamId) {
            services {
              service
              ...clickUpLists_service @relay(mask: false)
            }
          }
        }
      }
    `,
    queryRef
  )
  const services = data.viewer.teamMember?.services
  const lists = getClickUpLists(services)
  const unavailableListLabel = getUnavailableClickUpListLabel(services)
  const {filters} = state
  const selectedListIds = searchFiltersByKey(filters, 'listIds')
  const setSearchState = useSetScopingSearchState(meetingId, 'clickup')
  const {query, filteredItems: filteredLists, onQueryChange} = useSearchFilter(lists, getValue)
  const unavailableListIds = getUnavailableClickUpListIds(lists, selectedListIds)
  const visibleLists = getVisibleClickUpLists(lists, filteredLists, selectedListIds, MAX_LISTS)
  const toggleListFilter = (listId: string) => {
    setSearchState({filters: toggleSearchFilter(filters, 'listIds', listId)})
  }

  return (
    <>
      <MenuSearch placeholder='Search ClickUp lists' onChange={onQueryChange} value={query} />
      {visibleLists.length === 0 && unavailableListIds.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No lists found!</EmptyDropdownMenuItemLabel>
      )}
      {unavailableListIds.map((listId) => (
        <MenuItem
          key={`unavailable:${listId}`}
          onSelect={(e) => e.preventDefault()}
          onClick={() => toggleListFilter(listId)}
        >
          <Checkbox className='-ml-2 mr-2' active />
          <span className='overflow-hidden text-ellipsis whitespace-nowrap text-fg-secondary'>
            {unavailableListLabel}
          </span>
        </MenuItem>
      ))}
      {visibleLists.map(({id, name, integrationRepoId}) => (
        <MenuItem
          key={id}
          onSelect={(e) => e.preventDefault()}
          onClick={() => toggleListFilter(integrationRepoId)}
        >
          <Checkbox className='-ml-2 mr-2' active={selectedListIds.includes(integrationRepoId)} />
          <TypeAheadLabel query={query} label={name} />
        </MenuItem>
      ))}
    </>
  )
}

export default ClickUpScopingSearchFilterMenu
