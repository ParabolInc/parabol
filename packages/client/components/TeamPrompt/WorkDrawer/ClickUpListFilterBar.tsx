import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ExpandMore, FilterList} from '~/ui/icons'
import type {ClickUpListFilterBar_teamMember$key} from '../../../__generated__/ClickUpListFilterBar_teamMember.graphql'
import useSearchFilter from '../../../hooks/useSearchFilter'
import {
  getClickUpLists,
  getUnavailableClickUpListIds,
  getUnavailableClickUpListLabel,
  getVisibleClickUpLists
} from '../../../integrations/clickup/clickUpLists'
import {cn} from '../../../ui/cn'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../ui/Menu/MenuItem'
import {MenuSearch} from '../../../ui/Menu/MenuSearch'
import plural from '../../../utils/plural'
import Checkbox from '../../Checkbox'
import {EmptyDropdownMenuItemLabel} from '../../EmptyDropdownMenuItemLabel'
import TypeAheadLabel from '../../TypeAheadLabel'

interface Props {
  teamMemberRef: ClickUpListFilterBar_teamMember$key
  selectedListIds: string[]
  setSelectedListIds: (listIds: string[]) => void
}

const getListName = (list: {name: string}) => list.name

const MAX_LISTS = 10

const ClickUpListFilterBar = (props: Props) => {
  const {teamMemberRef, selectedListIds, setSelectedListIds} = props
  const teamMember = useFragment(
    graphql`
      fragment ClickUpListFilterBar_teamMember on TeamMember {
        services {
          service
          ...clickUpLists_service @relay(mask: false)
        }
      }
    `,
    teamMemberRef
  )
  const lists = getClickUpLists(teamMember.services)
  const unavailableListLabel = getUnavailableClickUpListLabel(teamMember.services)
  const {query, filteredItems, onQueryChange} = useSearchFilter(lists, getListName)
  const selectedCount = selectedListIds.length
  const unavailableListIds = getUnavailableClickUpListIds(lists, selectedListIds)
  const visibleLists = getVisibleClickUpLists(lists, filteredItems, selectedListIds, MAX_LISTS)
  const toggleList = (listId: string, isSelected: boolean) =>
    setSelectedListIds(
      isSelected
        ? selectedListIds.filter((selectedListId) => selectedListId !== listId)
        : [...selectedListIds, listId]
    )

  return (
    <Menu
      trigger={
        <button
          type='button'
          className='group flex cursor-pointer items-center gap-2 rounded-sm border border-hairline border-solid bg-surface-card px-3 py-0.5 text-left transition hover:border-hairline-strong data-[state=open]:border-accent'
        >
          <FilterList className='h-5 w-5 text-fg-secondary' />
          {selectedCount === 0
            ? 'All lists'
            : `${selectedCount} ${plural(selectedCount, 'list')} selected`}
          <ExpandMore
            className={cn(
              'ml-auto rounded-full transition duration-300 group-data-[state=open]:rotate-180',
              selectedCount > 0 &&
                'group-data-[state=closed]:bg-accent group-data-[state=closed]:text-white'
            )}
          />
        </button>
      }
    >
      <MenuContent align='start' className='max-h-80 w-(--radix-dropdown-menu-trigger-width) pt-2'>
        <MenuSearch placeholder='Search ClickUp lists' onChange={onQueryChange} value={query} />
        {visibleLists.length === 0 && unavailableListIds.length === 0 && (
          <EmptyDropdownMenuItemLabel>No lists found!</EmptyDropdownMenuItemLabel>
        )}
        {unavailableListIds.map((listId) => (
          <MenuItem
            key={`unavailable:${listId}`}
            onSelect={(e) => e.preventDefault()}
            onClick={() => toggleList(listId, true)}
          >
            <Checkbox className='-ml-2 mr-2' active />
            <span className='overflow-hidden text-ellipsis whitespace-nowrap text-fg-secondary'>
              {unavailableListLabel}
            </span>
          </MenuItem>
        ))}
        {visibleLists.map(({id, name, integrationRepoId}) => {
          const isSelected = selectedListIds.includes(integrationRepoId)
          return (
            <MenuItem
              key={id}
              onSelect={(e) => e.preventDefault()}
              onClick={() => toggleList(integrationRepoId, isSelected)}
            >
              <Checkbox className='-ml-2 mr-2' active={isSelected} />
              <TypeAheadLabel query={query} label={name} />
            </MenuItem>
          )
        })}
      </MenuContent>
    </Menu>
  )
}

export default ClickUpListFilterBar
