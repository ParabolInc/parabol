import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

const PhaseHeaderTitle = forwardRef(
  (props: HTMLAttributes<HTMLHeadingElement>, ref: Ref<HTMLHeadingElement>) => {
    const {className, children, ...rest} = props
    return (
      <h1
        {...rest}
        ref={ref}
        className={cn('m-0 p-0 text-[16px] leading-6 xl:text-[20px]', className)}
      >
        {children}
      </h1>
    )
  }
)

export default PhaseHeaderTitle
