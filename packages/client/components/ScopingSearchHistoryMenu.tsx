import type {MouseEvent} from 'react'
import type {MenuProps} from '../hooks/useMenu'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import IconButton from './IconButton'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'

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
      keepParentFocus
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
              <MenuItemLabel className='justify-center'>
                <div className='flex flex-1 flex-col items-start'>
                  <span className='text-fg-secondary'>{labelFirstLine}</span>
                  {labelSecondLine && <span className='text-fg-secondary'>{labelSecondLine}</span>}
                </div>
                <IconButton
                  className='m-1'
                  // transition conflicts with BaseButton's un-layered box-shadow
                  // transition; inline style guarantees it wins the cascade
                  style={{transition: 'opacity .1s ease-in'}}
                  aria-label={'Remove this search query'}
                  icon='cancel'
                  onClick={handleDelete}
                  palette='midGray'
                />
              </MenuItemLabel>
            }
            onClick={onClick}
          />
        )
      })}
    </Menu>
  )
}

export default ScopingSearchHistoryMenu
