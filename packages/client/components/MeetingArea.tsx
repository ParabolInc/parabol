import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'

const MeetingArea = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>((props, ref) => {
  const {className, children, ...rest} = props
  return (
    <div ref={ref} className={cn('flex w-full', className)} {...rest}>
      {children}
    </div>
  )
})

export default MeetingArea
