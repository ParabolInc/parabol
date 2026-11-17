import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../../ui/cn'

const DashSectionControls = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, ...rest} = props
    return (
      <div
        {...rest}
        ref={ref}
        className={cn(
          'flex w-full max-w-full flex-1 items-center justify-between overflow-auto',
          className
        )}
      />
    )
  }
)

export default DashSectionControls
