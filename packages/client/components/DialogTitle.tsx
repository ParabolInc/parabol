import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'

const DialogTitle = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<'h2'>>((props, ref) => {
  const {className, children, ...rest} = props
  return (
    <h2
      ref={ref}
      className={cn(
        'm-0 flex px-6 pt-5 pb-0 font-semibold text-fg-primary text-xl leading-[1.5]',
        className
      )}
      {...rest}
    >
      {children}
    </h2>
  )
})

export default DialogTitle
