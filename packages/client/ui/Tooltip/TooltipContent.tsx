import {Content, Portal} from '@radix-ui/react-tooltip'
import {cn} from '../cn'
import {forwardRadix} from '../forwardRadix'

export const TooltipContent = forwardRadix<typeof Content>(
  ({className, children, ...props}, ref) => (
    <Portal>
      <Content
        ref={ref}
        side='top'
        align='center'
        sideOffset={2}
        className={cn(
          'pointer-events-none z-20 animate-scaleIn overflow-hidden whitespace-nowrap rounded-sm bg-slate-700 px-2 py-1 text-center text-xs font-bold text-white',
          className
        )}
        {...props}
      >
        {children}
      </Content>
    </Portal>
  )
)
