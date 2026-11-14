import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'

interface Props extends ComponentPropsWithoutRef<'div'> {
  isReply: boolean
}

const ThreadedItemWrapper = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {isReply, className, children, ...rest} = props
  return (
    <div ref={ref} className={cn('flex w-full shrink-0', isReply && 'mt-2', className)} {...rest}>
      {children}
    </div>
  )
})

export default ThreadedItemWrapper
