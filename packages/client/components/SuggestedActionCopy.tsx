import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

const SuggestedActionCopy = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, ...rest} = props
    return (
      <div
        {...rest}
        ref={ref}
        className={cn('px-2 pt-6 pb-4 text-center text-[14px]', className)}
      />
    )
  }
)

export default SuggestedActionCopy
