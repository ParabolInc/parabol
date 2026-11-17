import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'
import InviteDialog from './InviteDialog'

export const AUTH_DIALOG_WIDTH = 356

const AuthenticationDialog = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  (props, ref) => {
    const {className, children, ...rest} = props
    return (
      <InviteDialog ref={ref} className={cn('w-[356px] items-center py-6', className)} {...rest}>
        {children}
      </InviteDialog>
    )
  }
)

export default AuthenticationDialog
