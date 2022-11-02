import styled from '@emotion/styled'
import React, {MouseEvent} from 'react'
import {MenuProps} from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import IconButton from './IconButton'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'

const Filter = styled('span')({
  color: PALETTE.SLATE_600
})

const StyledMenuItemLabel = styled(MenuItemLabel)({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center'
})

const StyledMenuItemContent = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
})

const DeleteIconButton = styled(IconButton)({
  fontSize: ICON_SIZE.MD18,
  transition: 'opacity .1s ease-in',
  margin: 4
})

export interface SearchQueries {
  id: string
  labelFirstLine: string
  labelSecondLine?: string
  onClick: () => void
  onDelete: () => void
}

interface Props {
  menuProps: MenuProps
  searchQueries: SearchQueries[]
}

const ScopingSearchHistoryMenu = (props: Props) => {
  const {menuProps, searchQueries} = props
  const {portalStatus, isDropdown, closePortal} = menuProps

  return (
    <Menu
      ariaLabel={'Select a search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      closePortal={closePortal}
    >
      {searchQueries.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No saved queries yet!
        </EmptyDropdownMenuItemLabel>
      )}
      {searchQueries.map(({id, labelFirstLine, labelSecondLine, onClick, onDelete}) => {
        const handleDelete = (event: MouseEvent) => {
          if (searchQueries.length === 1) {
            closePortal()
          }
          event.stopPropagation()
          onDelete()
        }

        return (
          <MenuItem
            key={id}
            label={
              <StyledMenuItemLabel>
                <StyledMenuItemContent>
                  <Filter>{labelFirstLine}</Filter>
                  {labelSecondLine && <Filter>{labelSecondLine}</Filter>}
                </StyledMenuItemContent>
                <DeleteIconButton
                  aria-label={'Remove this search query'}
                  icon='cancel'
                  onClick={handleDelete}
                  palette='midGray'
                />
              </StyledMenuItemLabel>
            }
            onClick={onClick}
          />
        )
      })}
    </Menu>
  )
}

export default ScopingSearchHistoryMenu
