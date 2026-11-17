import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

const DashHeaderTitle = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, ...rest} = props
    return (
      <div
        {...rest}
        ref={ref}
        className={cn('mr-8 font-semibold text-fg-primary text-xl leading-[1.5]', className)}
      />
    )
  }
)

export default DashHeaderTitle
