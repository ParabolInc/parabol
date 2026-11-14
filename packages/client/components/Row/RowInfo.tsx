import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'

const RowInfo = forwardRef((props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
  const {className, children, ...rest} = props
  return (
    <div ref={ref} className={cn('flex flex-col justify-center px-4', className)} {...rest}>
      {children}
    </div>
  )
})

export default RowInfo
