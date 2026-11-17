import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {Check} from '~/ui/icons'
import {cn} from '../cn'
import {forwardRadix} from '../forwardRadix'
import {MENU_ITEM} from './MenuItem'

export const MenuRadioItem = forwardRadix<typeof DropdownMenu.RadioItem>(
  ({className, children, ...props}, ref) => {
    return (
      <DropdownMenu.RadioItem
        ref={ref}
        className={cn(MENU_ITEM, 'cursor-pointer', className)}
        {...props}
      >
        {children}
        <DropdownMenu.ItemIndicator className='ml-auto flex pl-4'>
          <Check className='text-[18px] text-fg-secondary' />
        </DropdownMenu.ItemIndicator>
      </DropdownMenu.RadioItem>
    )
  }
)
