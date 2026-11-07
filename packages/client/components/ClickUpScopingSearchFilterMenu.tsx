import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import type {ClickUpScopingSearchFilterMenuQuery} from '../__generated__/ClickUpScopingSearchFilterMenuQuery.graphql'
import useSetScopingSearchState from '../hooks/useSetScopingSearchState'
import {getClickUpLists} from '../integrations/clickup/clickUpLists'
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
  const lists = getClickUpLists(data.viewer.teamMember?.services)
  const {filters} = state
  const selectedListIds = searchFiltersByKey(filters, 'listIds')
  const setSearchState = useSetScopingSearchState(meetingId, 'clickup')
  const {query, filteredItems: filteredLists, onQueryChange} = useSearchFilter(lists, getValue)
  const visibleLists = filteredLists.slice(0, MAX_LISTS)

  return (
    <>
      <MenuSearch placeholder='Search ClickUp lists' onChange={onQueryChange} value={query} />
      {visibleLists.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No lists found!</EmptyDropdownMenuItemLabel>
      )}
      {visibleLists.map(({id, name, integrationRepoId}) => {
        const isSelected = selectedListIds.includes(integrationRepoId)
        const toggleListFilter = () => {
          setSearchState({filters: toggleSearchFilter(filters, 'listIds', integrationRepoId)})
        }
        return (
          <MenuItem key={id} onSelect={(e) => e.preventDefault()} onClick={toggleListFilter}>
            <Checkbox className='-ml-2 mr-2' active={isSelected} />
            <TypeAheadLabel query={query} label={name} />
          </MenuItem>
        )
      })}
    </>
  )
}

export default ClickUpScopingSearchFilterMenu
