import * as RadixSelect from '@radix-ui/react-select'
import {cn} from '../cn'
import {forwardRadix} from '../forwardRadix'

export const SelectSeparator = forwardRadix<typeof RadixSelect.Separator>(
  ({className, ...props}, ref) => {
    return (
      <RadixSelect.Separator
        ref={ref}
        className={cn('my-2 h-px bg-hairline-strong', className)}
        {...props}
      />
    )
  }
)
