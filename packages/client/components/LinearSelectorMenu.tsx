import styled from '@emotion/styled'
import {LinearProjectOrTeam} from '../hooks/useLinearProjectsAndTeams'
import {MenuProps} from '../hooks/useMenu'
import Checkbox from './Checkbox'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import {SearchMenuItem} from './SearchMenuItem'
import TypeAheadLabel from './TypeAheadLabel'

const StyledCheckBox = styled(Checkbox)({
  marginLeft: -8,
  marginRight: 8
})

const StyledMenuItemLabel = styled(MenuItemLabel)({})

const StyledMenu = styled(Menu)({
  maxWidth: '100%'
})

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
  getItemId: (item: LinearProjectOrTeam) => string
  getItemLabel: (item: LinearProjectOrTeam) => string
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
    emptyStateMessage = 'No items found!',
    getItemId,
    getItemLabel
  } = props

  const {portalStatus, isDropdown} = menuProps

  // TODO: Add loading state indicator if isLoading is true

  return (
    <StyledMenu
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
      {items.length === 0 && !isLoading && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          {emptyStateMessage}
        </EmptyDropdownMenuItemLabel>
      )}
      {items.map((item) => {
        const itemId = getItemId(item)
        const itemLabel = getItemLabel(item)
        const isSelected = selectedItemIds.includes(itemId)

        const handleClick = () => {
          onSelectItem(itemId, isSelected)
        }

        return (
          <MenuItem
            key={itemId}
            label={
              <StyledMenuItemLabel>
                <StyledCheckBox active={isSelected} />
                <TypeAheadLabel query={searchQuery} label={itemLabel} />
              </StyledMenuItemLabel>
            }
            onClick={handleClick}
          />
        )
      })}
    </StyledMenu>
  )
}

export default LinearSelectorMenu
