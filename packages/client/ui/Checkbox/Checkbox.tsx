import CheckBoxIcon from '@mui/icons-material/CheckBox'
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import {cn} from '../cn'
import {forwardRadix} from '../forwardRadix'

export const Checkbox = forwardRadix<typeof CheckboxPrimitive.Root>(
  ({className, checked, ...props}, ref) => {
    const MultiIcon = checked === 'indeterminate' ? IndeterminateCheckBoxIcon : CheckBoxIcon
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          'group flex size-4 cursor-pointer appearance-none items-center justify-center rounded-xs border-hairline-strong bg-surface-input outline-none data-[state=unchecked]:border-2',
          className
        )}
        checked={checked}
        {...props}
      >
        <CheckboxPrimitive.Indicator asChild>
          <MultiIcon className='w-5 fill-accent group-disabled:fill-fg-muted' />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    )
  }
)

Checkbox.displayName = CheckboxPrimitive.Root.displayName
