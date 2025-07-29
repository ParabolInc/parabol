import {Content, Portal} from '@radix-ui/react-tooltip'
import {cn} from '../cn'
import {forwardRadix} from '../forwardRadix'

export const TooltipContent = forwardRadix<typeof Content>(
  ({className, children, side, ...props}, ref) => (
    <Portal>
      <Content
        ref={ref}
        side={side || 'top'}
        align='center'
        sideOffset={2}
        className={cn(
          'pointer-events-none z-20 animate-scale-in overflow-hidden whitespace-nowrap rounded-xs bg-slate-700 px-2 py-1 text-center font-bold text-white text-xs',
          className
        )}
        {...props}
      >
        {children}
      </Content>
    </Portal>
  )
)
