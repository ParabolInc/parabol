import type {LinearProjectOrTeam} from '../hooks/useLinearProjectsAndTeams'
import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import {Spinner} from '../ui/Spinner/Spinner'
import {getLinearRepoName} from '../utils/getLinearRepoName'
import Checkbox from './Checkbox'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TypeAheadLabel from './TypeAheadLabel'

const getItemId = (item: LinearProjectOrTeam): string => {
  const typeName = item.__typename ?? 'UnknownType'
  return `${typeName}:${item.id}`
}

const getItemLabel = (item: LinearProjectOrTeam): string => {
  if ('teams' in item && item.teams !== undefined) {
    return getLinearRepoName(item)
  }
  return item.name || 'Unknown Team'
}
export interface LinearSelectorMenuProps {
  items: ReadonlyArray<LinearProjectOrTeam>
  selectedItemIds: ReadonlyArray<string>
  onSelectItem: (itemId: string, currentSelectedState: boolean) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  isLoading?: boolean
  placeholder?: string
  emptyStateMessage?: string
}

const LinearSelectorMenu = (props: LinearSelectorMenuProps) => {
  const {
    items,
    selectedItemIds,
    onSelectItem,
    searchQuery,
    onSearchQueryChange,
    isLoading = false,
    placeholder = 'Search items',
    emptyStateMessage = 'No items found!'
  } = props

  return (
    <>
      <MenuSearch
        placeholder={placeholder}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        value={searchQuery}
      />
      {items.length === 0 &&
        (isLoading ? (
          <EmptyDropdownMenuItemLabel key='results-loading'>
            <Spinner />
          </EmptyDropdownMenuItemLabel>
        ) : (
          <EmptyDropdownMenuItemLabel key='no-results'>
            {emptyStateMessage}
          </EmptyDropdownMenuItemLabel>
        ))}
      {items.map((item) => {
        const itemId = getItemId(item)
        const itemLabel = getItemLabel(item)
        const isSelected = selectedItemIds.includes(itemId)

        const handleClick = () => {
          onSelectItem(itemId, isSelected)
        }

        return (
          <MenuItem key={itemId} onSelect={(e) => e.preventDefault()} onClick={handleClick}>
            <Checkbox className='-ml-2 mr-2' active={isSelected} />
            <TypeAheadLabel query={searchQuery} label={itemLabel} />
          </MenuItem>
        )
      })}
    </>
  )
}

export default LinearSelectorMenu
