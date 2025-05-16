import {CircularProgress} from '@mui/material'
import {LinearProjectOrTeam} from '../hooks/useLinearProjectsAndTeams'
import {MenuProps} from '../hooks/useMenu'
import {getLinearRepoName} from '../utils/getLinearRepoName'
import Checkbox from './Checkbox'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import {SearchMenuItem} from './SearchMenuItem'
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
  menuProps: MenuProps
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
    menuProps,
    isLoading = false,
    placeholder = 'Search items',
    emptyStateMessage = 'No items found!'
  } = props

  const {portalStatus, isDropdown} = menuProps

  return (
    <Menu
      className='max-w-full'
      keepParentFocus
      ariaLabel='Select Linear projects or teams'
      portalStatus={portalStatus}
      isDropdown={isDropdown}
    >
      <SearchMenuItem
        placeholder={placeholder}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        value={searchQuery}
      />
      {items.length === 0 &&
        (isLoading ? (
          <EmptyDropdownMenuItemLabel key='results-loading'>
            <CircularProgress />
          </EmptyDropdownMenuItemLabel>
        ) : (
          <EmptyDropdownMenuItemLabel key='no-results'>
            {emptyStateMessage}
          </EmptyDropdownMenuItemLabel>
        ))}
      {items.map((item) => {
        const itemId = getItemId(item)
        console.log('GEORG itemId', itemId)
        const itemLabel = getItemLabel(item)
        const isSelected = selectedItemIds.includes(itemId)

        const handleClick = () => {
          onSelectItem(itemId, isSelected)
        }

        return (
          <MenuItem
            key={itemId}
            label={
              <MenuItemLabel className=''>
                <Checkbox className='mr-2 -ml-2' active={isSelected} />
                <TypeAheadLabel query={searchQuery} label={itemLabel} />
              </MenuItemLabel>
            }
            onClick={handleClick}
          />
        )
      })}
    </Menu>
  )
}

export default LinearSelectorMenu
