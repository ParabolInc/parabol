import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'

const RowInfoCopy = forwardRef(
  (props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
    const {className, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn('text-[13px] text-fg-secondary leading-[18px]', className)}
        {...rest}
      />
    )
  }
)

export default RowInfoCopy
