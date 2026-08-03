import CheckBoxIcon from '@mui/icons-material/CheckBox'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {forwardRadix} from '../forwardRadix'

export const MenuItemCheckbox = forwardRadix<typeof DropdownMenu.CheckboxItem>(
  ({checked, children, ...props}, ref) => {
    return (
      <DropdownMenu.CheckboxItem
        asChild
        ref={ref}
        {...props}
        onSelect={(e) => {
          e.preventDefault()
        }}
        checked={checked}
      >
        <div className='mx-1 flex outline-none'>
          <div
            data-highlighted={checked ? '' : undefined}
            className={
              'flex w-full cursor-pointer items-center space-x-2 rounded-md in-data-highlighted:bg-surface-raised px-3 py-2 in-data-highlighted:text-fg-primary text-fg-primary text-sm leading-8 outline-hidden hover:bg-surface-well! hover:text-fg-primary focus:bg-surface-well'
            }
          >
            <div className='flex size-4 cursor-pointer appearance-none items-center justify-center rounded-xs border-hairline-strong in-data-[state=unchecked]:border-2 bg-surface-input outline-none'>
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
