import type {ReactNode} from 'react'
import {ArrowDropDown} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import menuSectionTitleClass from '../../../ui/Menu/menuSectionTitleClass'
import {syncedBlockBarButtonClass} from './syncedBlockBarButtonClass'
import {useReportMenuOpen} from './useReportMenuOpen'

interface Props {
  label: ReactNode
  isViewOnly: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export const SyncedBlockPlacesMenu = (props: Props) => {
  const {label, isViewOnly, onOpenChange, children} = props
  const [isOpen, handleOpenChange] = useReportMenuOpen(onOpenChange)
  return (
    <Menu
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={
        <Button
          className={cn(
            syncedBlockBarButtonClass(isViewOnly),
            isViewOnly && 'hover:text-fg-primary'
          )}
        >
          <span>{label}</span>
          <ArrowDropDown className='text-[16px]' />
        </Button>
      }
    >
      <MenuContent align='end' sideOffset={4} className='max-h-80 w-[280px]'>
        <div className={menuSectionTitleClass}>This block appears on</div>
        {children}
      </MenuContent>
    </Menu>
  )
}
