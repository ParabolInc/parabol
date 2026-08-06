import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../ui/cn'

const RetroPrompt = forwardRef(
  (props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
    const {className, children, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn('flex items-center font-semibold text-[18px] leading-6', className)}
        {...rest}
      >
        {children}
      </div>
    )
  }
)

export default RetroPrompt
