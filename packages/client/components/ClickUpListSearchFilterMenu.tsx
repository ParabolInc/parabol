import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import type {ClickUpListSearchFilterMenuQuery} from '../__generated__/ClickUpListSearchFilterMenuQuery.graphql'
import {
  getClickUpLists,
  getUnavailableClickUpListIds,
  getUnavailableClickUpListLabel,
  getVisibleClickUpLists
} from '../integrations/clickup/clickUpLists'
import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import Checkbox from './Checkbox'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import HighlightedText from './HighlightedText'

interface Props {
  queryRef: PreloadedQuery<ClickUpListSearchFilterMenuQuery>
  selectedListIds: string[]
  onToggleList: (listId: string) => void
}

const MAX_LISTS = 10

const getValue = (list: {name: string}) => list.name

const ClickUpListSearchFilterMenu = (props: Props) => {
  const {queryRef, selectedListIds, onToggleList} = props
  const data = usePreloadedQuery<ClickUpListSearchFilterMenuQuery>(
    graphql`
      query ClickUpListSearchFilterMenuQuery($teamId: ID!) {
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
  const {query, filteredItems: filteredLists, onQueryChange} = useSearchFilter(lists, getValue)
  const unavailableListIds = getUnavailableClickUpListIds(lists, selectedListIds)
  const visibleLists = getVisibleClickUpLists(lists, filteredLists, selectedListIds, MAX_LISTS)

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
          onClick={() => onToggleList(listId)}
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
          onClick={() => onToggleList(integrationRepoId)}
        >
          <Checkbox className='-ml-2 mr-2' active={selectedListIds.includes(integrationRepoId)} />
          <HighlightedText query={query} text={name} className='truncate' />
        </MenuItem>
      ))}
    </>
  )
}

export default ClickUpListSearchFilterMenu
