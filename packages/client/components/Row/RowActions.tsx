import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'

const RowActions = forwardRef(
  (props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
    const {className, children, ...rest} = props
    return (
      <div ref={ref} className={cn('flex flex-1 items-center justify-end', className)} {...rest}>
        {children}
      </div>
    )
  }
)

export default RowActions
