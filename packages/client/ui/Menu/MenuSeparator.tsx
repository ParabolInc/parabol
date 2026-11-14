import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {cn} from '../cn'
import {forwardRadix} from '../forwardRadix'

export const MenuSeparator = forwardRadix<typeof DropdownMenu.Separator>(
  ({className, ...props}, ref) => {
    return (
      <DropdownMenu.Separator
        ref={ref}
        className={cn('my-2 h-px bg-hairline-strong', className)}
        {...props}
      />
    )
  }
)
