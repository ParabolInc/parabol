import {Trigger} from '@radix-ui/react-tooltip'
import {forwardRadix} from '../forwardRadix'

export const TooltipTrigger = forwardRadix<typeof Trigger>(
  ({className, children, ...props}, ref) => (
    <Trigger ref={ref} className={className} {...props}>
      {children}
    </Trigger>
  )
)
