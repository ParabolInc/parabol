import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'

const RowInfoHeader = forwardRef(
  (props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
    const {className, ...rest} = props
    return <div ref={ref} className={cn('flex items-center', className)} {...rest} />
  }
)

export default RowInfoHeader
