// Styled component for useTooltip
import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../ui/cn'

const TooltipStyled = forwardRef(
  (props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
    const {className, children, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn(
          'w-full overflow-hidden whitespace-nowrap rounded-[2px] bg-slate-700 px-2 py-1 text-center font-semibold text-[11px] text-white leading-4',
          className
        )}
        {...rest}
      >
        {children}
      </div>
    )
  }
)

export default TooltipStyled
