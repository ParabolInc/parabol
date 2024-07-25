import {Trigger} from '@radix-ui/react-tooltip'
import * as React from 'react'
import {forwardRadix} from '../forwardRadix'

export const TooltipTrigger = forwardRadix<typeof Trigger>(
  ({className, children, ...props}, ref) => (
    <Trigger ref={ref} className={className} {...props}>
      {children}
    </Trigger>
  )
)
