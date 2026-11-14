import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {CheckBox as CheckBoxIcon} from '~/ui/icons'
import {cn} from '../cn'
import {forwardRadix} from '../forwardRadix'

export const MenuItemCheckbox = forwardRadix<typeof DropdownMenu.CheckboxItem>(
  ({checked, children, disabled, ...props}, ref) => {
    return (
      <DropdownMenu.CheckboxItem
        asChild
        ref={ref}
        disabled={disabled}
        {...props}
        onSelect={(e) => {
          e.preventDefault()
        }}
        checked={checked}
      >
        <div className={cn('mx-1 flex outline-none', disabled && 'opacity-50')}>
          <div
            data-highlighted={checked ? '' : undefined}
            className={cn(
              'flex w-full cursor-pointer items-center space-x-2 rounded-md in-data-highlighted:bg-surface-hover px-3 py-2 in-data-highlighted:text-fg-primary text-fg-primary text-sm outline-hidden hover:bg-surface-hover! hover:text-fg-primary focus:bg-surface-hover',
              disabled && 'cursor-default hover:bg-transparent!'
            )}
          >
            <div
              className={cn(
                'flex size-4 cursor-pointer appearance-none items-center justify-center rounded-xs border-hairline-strong in-data-[state=unchecked]:border-2 bg-surface-input outline-none',
                disabled && 'cursor-default'
              )}
            >
              <DropdownMenu.ItemIndicator className='flex items-center justify-center'>
                <CheckBoxIcon className='w-5 fill-accent' />
              </DropdownMenu.ItemIndicator>
            </div>
            <div className='flex select-none flex-col text-sm'>{children}</div>
          </div>
        </div>
      </DropdownMenu.CheckboxItem>
    )
  }
)
