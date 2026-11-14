import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'

const RowInfoHeading = forwardRef(
  (props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
    const {className, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn('font-semibold text-base text-fg-primary leading-6', className)}
        {...rest}
      />
    )
  }
)

export default RowInfoHeading
