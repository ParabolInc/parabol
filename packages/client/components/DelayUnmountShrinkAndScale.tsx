import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'

interface Props extends ComponentPropsWithoutRef<'div'> {
  isExiting: boolean
  duration: number
}

const DelayUnmountShrinkAndScale = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {isExiting, duration, className, style, children, ...rest} = props
  return (
    <div
      ref={ref}
      className={cn(
        isExiting ? 'h-0 scale-0 opacity-0' : 'h-auto scale-100 opacity-100',
        className
      )}
      style={{transition: `all ${duration}ms`, ...style}}
      {...rest}
    >
      {children}
    </div>
  )
})

export default DelayUnmountShrinkAndScale
