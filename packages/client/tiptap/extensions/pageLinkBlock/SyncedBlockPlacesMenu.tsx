import {type ReactNode, useEffect, useState} from 'react'
import {ArrowDropDown} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import menuSectionTitleClass from '../../../ui/Menu/menuSectionTitleClass'
import {syncedBlockBarButtonClass} from './syncedBlockBarButtonClass'

interface Props {
  label: ReactNode
  isViewOnly: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export const SyncedBlockPlacesMenu = (props: Props) => {
  const {label, isViewOnly, onOpenChange, children} = props
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    if (!isOpen) return
    onOpenChange(true)
    return () => onOpenChange(false)
  }, [isOpen, onOpenChange])
  return (
    <Menu
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button className={syncedBlockBarButtonClass(isViewOnly)}>
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
