import {Content, Portal} from '@radix-ui/react-tooltip'
import * as React from 'react'
import {twMerge} from 'tailwind-merge'
import {forwardRadix} from '../forwardRadix'

export const TooltipContent = forwardRadix<typeof Content>(
  ({className, children, ...props}, ref) => (
    <Portal>
      <Content
        ref={ref}
        side='top'
        align='center'
        sideOffset={2}
        className={twMerge(
          'pointer-events-none z-20 animate-scaleIn overflow-hidden whitespace-nowrap rounded-sm bg-slate-700 py-1 px-2 text-center text-xs font-bold text-white',
          className
        )}
        {...props}
      >
        {children}
      </Content>
    </Portal>
  )
)
