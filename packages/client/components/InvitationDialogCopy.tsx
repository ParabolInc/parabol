import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'

const InvitationDialogCopy = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  (props, ref) => {
    const {className, children, ...rest} = props
    return (
      <div ref={ref} className={cn('leading-[1.5]', className)} {...rest}>
        {children}
      </div>
    )
  }
)

export default InvitationDialogCopy
