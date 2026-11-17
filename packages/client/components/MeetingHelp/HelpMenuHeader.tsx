import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../../ui/cn'

const HelpMenuHeader = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<'h3'>>(
  (props, ref) => {
    const {className, children, ...rest} = props
    return (
      <h3 ref={ref} className={cn('m-0 mb-[1em] font-semibold text-[1em]', className)} {...rest}>
        {children}
      </h3>
    )
  }
)

export default HelpMenuHeader
