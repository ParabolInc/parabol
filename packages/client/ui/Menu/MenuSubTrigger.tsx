import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {ChevronRight} from '~/ui/icons'
import {cn} from '../cn'
import {forwardRadix} from '../forwardRadix'
import {MENU_ITEM} from './MenuItem'

export const MenuSubTrigger = forwardRadix<typeof DropdownMenu.SubTrigger>(
  ({className, children, ...props}, ref) => {
    return (
      <DropdownMenu.SubTrigger
        ref={ref}
        className={cn(MENU_ITEM, 'cursor-pointer data-[state=open]:bg-surface-hover', className)}
        {...props}
      >
        {children}
        <ChevronRight className='-mr-1 ml-auto text-[20px] text-fg-secondary' />
      </DropdownMenu.SubTrigger>
    )
  }
)
