import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'

const DialogContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>((props, ref) => {
  const {className, children, ...rest} = props
  return (
    <div
      ref={ref}
      className={cn('px-6 pt-4 pb-6 text-fg-primary text-sm leading-[1.5]', className)}
      {...rest}
    >
      {children}
    </div>
  )
})

export default DialogContent
